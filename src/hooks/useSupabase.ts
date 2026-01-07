import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// ============ PATIENTS ============
export function usePatients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPatients = useCallback(async (includeDeleted = false) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter out soft-deleted patients by default
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatient = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createPatient = useCallback(async (patient: TablesInsert<'patients'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('patients')
      .insert({ ...patient, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  const updatePatient = useCallback(async (id: string, updates: TablesUpdate<'patients'>) => {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  return { getPatients, getPatient, createPatient, updatePatient, loading, error };
}

// ============ APPOINTMENTS ============
export function useAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAppointments = useCallback(async (filters?: { date?: string; providerId?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('appointments')
        .select(`*, patients(first_name, last_name, phone)`)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (filters?.date) {
        query = query.eq('appointment_date', filters.date);
      }
      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTodayAppointments = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointments({ date: today });
  }, [getAppointments]);

  const createAppointment = useCallback(async (appointment: Omit<TablesInsert<'appointments'>, 'booking_type'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingType = appointmentDate.toDateString() === today.toDateString() ? 'SAME_DAY' : 'ADVANCE';

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointment,
        booking_type: bookingType,
        provider_id: appointment.provider_id || user?.id || '',
      })
      .select()
      .single();
    if (error) throw error;

    await createAuditLog('APPOINTMENT_CREATED', 'appointments', data.id, { bookingType });
    return data;
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: status as any })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('APPOINTMENT_STATUS_CHANGED', 'appointments', id, { newStatus: status });
    return data;
  }, []);

  const updateConfirmation = useCallback(async (id: string, indicator: 'C' | 'NC' | 'LM', method?: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        confirmation_indicator: indicator,
        confirmation_method: method,
        confirmation_attempts: supabase.rpc('increment_confirmation_attempts', { row_id: id }) as any,
        last_confirmation_attempt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('CONFIRMATION_UPDATED', 'appointments', id, { indicator, method });
    return data;
  }, []);

  return { getAppointments, getTodayAppointments, createAppointment, updateAppointmentStatus, updateConfirmation, loading, error };
}

// ============ CLINICAL NOTES ============
export function useClinicalNotes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotes = useCallback(async (filters?: { patientId?: string; status?: string }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('clinical_notes')
        .select(`*, patients(first_name, last_name), appointments(appointment_date, reason_for_visit)`)
        .order('created_at', { ascending: false });

      if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getNote = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('clinical_notes')
      .select(`*, patients(first_name, last_name, allergies), appointments(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;

    // Update last accessed
    await supabase.from('clinical_notes').update({ last_accessed_at: new Date().toISOString() }).eq('id', id);
    return data;
  }, []);

  const createNote = useCallback(async (note: TablesInsert<'clinical_notes'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('clinical_notes')
      .insert({ ...note, provider_id: user?.id || '' })
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('NOTE_CREATED', 'clinical_notes', data.id, { sourceType: note.source_type });
    return data;
  }, []);

  const updateNote = useCallback(async (id: string, updates: TablesUpdate<'clinical_notes'>) => {
    const { data: { user } } = await supabase.auth.getUser();

    // IMMUTABILITY CHECK: Prevent editing signed notes
    const { data: existingNote } = await supabase
      .from('clinical_notes')
      .select('status')
      .eq('id', id)
      .single();

    // Block edits to signed notes (snapshot is created by DB trigger)
    if (existingNote?.status === 'SIGNED') {
      // Log the attempted edit for audit trail
      await createAuditLog('EDIT_BLOCKED_IMMUTABLE', 'clinical_notes', id, {
        attempted_changes: Object.keys(updates),
        reason: 'Note is signed and immutable',
      });
      throw new Error('Signed clinical notes are immutable and cannot be edited. The signed version is preserved for legal/audit purposes.');
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .update({ ...updates, last_edited_by: user?.id })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('NOTE_EDITED', 'clinical_notes', id, updates);
    return data;
  }, []);

  const markTranscriptReviewed = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('clinical_notes')
      .update({
        transcript_reviewed: true,
        transcript_reviewed_at: new Date().toISOString(),
        transcript_reviewed_by: user?.id,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('TRANSCRIPT_REVIEWED', 'clinical_notes', id, {});
    return data;
  }, []);

  const signNote = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    // Check if transcript was reviewed (if audio source)
    const { data: note } = await supabase
      .from('clinical_notes')
      .select('source_type, transcript_reviewed')
      .eq('id', id)
      .single();

    if (note?.source_type === 'AUDIO' && !note?.transcript_reviewed) {
      throw new Error('Transcript must be reviewed before signing');
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .update({
        status: 'SIGNED',
        signed_at: new Date().toISOString(),
        signed_by: user?.id,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('NOTE_SIGNED', 'clinical_notes', id, {});
    return data;
  }, []);

  const getIncompleteNotes = useCallback(async (providerId: string, forAdmin = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    let query = supabase
      .from('clinical_notes')
      .select(`*, patients(first_name, last_name), appointments(appointment_date)`)
      .eq('status', 'DRAFT')
      .order('created_at', { ascending: false });

    if (!forAdmin) {
      // Provider sees same-day only
      query = query.gte('created_at', today.toISOString());
    } else {
      // Admin sees 24h+ only
      query = query.lt('created_at', oneDayAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }, []);

  return { getNotes, getNote, createNote, updateNote, markTranscriptReviewed, signNote, getIncompleteNotes, loading, error };
}

// ============ REFERRAL NOTES ============
export function useReferralNotes() {
  const [loading, setLoading] = useState(false);

  const getReferralNotes = useCallback(async (patientId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('referral_notes')
        .select(`*, patients(first_name, last_name), clinical_notes(subjective, assessment, plan)`)
        .order('created_at', { ascending: false });

      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReferralNote = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('referral_notes')
      .select(`*, patients(first_name, last_name, allergies), clinical_notes(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createReferralNote = useCallback(async (note: TablesInsert<'referral_notes'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('referral_notes')
      .insert({ ...note, provider_id: user?.id || '' })
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('REFERRAL_CREATED', 'referral_notes', data.id, { sourceNoteId: note.source_clinical_note_id });
    return data;
  }, []);

  const updateReferralNote = useCallback(async (id: string, updates: TablesUpdate<'referral_notes'>) => {
    const { data, error } = await supabase
      .from('referral_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('REFERRAL_UPDATED', 'referral_notes', id, updates);
    return data;
  }, []);

  const signReferralNote = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('referral_notes')
      .update({
        status: 'SIGNED',
        signed_at: new Date().toISOString(),
        signed_by: user?.id,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('REFERRAL_SIGNED', 'referral_notes', id, {});
    return data;
  }, []);

  return { getReferralNotes, getReferralNote, createReferralNote, updateReferralNote, signReferralNote, loading };
}

// ============ BILLING ============
export function useBilling() {
  const [loading, setLoading] = useState(false);

  const getBills = useCallback(async (patientId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('billing')
        .select(`*, patients(first_name, last_name, insurance_provider, insurance_policy_number)`)
        .order('created_at', { ascending: false });

      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBill = useCallback(async (bill: TablesInsert<'billing'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('billing')
      .insert({ ...bill, provider_id: user?.id || '' })
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('BILL_CREATED', 'billing', data.id, {});
    return data;
  }, []);

  const updateBill = useCallback(async (id: string, updates: TablesUpdate<'billing'>) => {
    const { data, error } = await supabase
      .from('billing')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  return { getBills, createBill, updateBill, loading };
}

// ============ INSURANCE CLAIMS ============
export function useInsuranceClaims() {
  const [loading, setLoading] = useState(false);

  const getClaims = useCallback(async (statusFilter?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('insurance_claims')
        .select(`*, billing(*), patients(first_name, last_name)`)
        .order('created_at', { ascending: false });
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClaim = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select(`*, billing(*), patients(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createClaim = useCallback(async (billingId: string, clinicalNoteId?: string) => {
    // Get billing and patient info for snapshot
    const { data: billing } = await supabase
      .from('billing')
      .select(`*, patients(*)`)
      .eq('id', billingId)
      .single();

    if (!billing) throw new Error('Billing record not found');

    // Get provider info for snapshot
    const { data: { user } } = await supabase.auth.getUser();
    const { data: provider } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id || billing.provider_id)
      .single();

    // Get clinical note if provided (for ICD-10 codes)
    let clinicalNote = null;
    if (clinicalNoteId) {
      const { data } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('id', clinicalNoteId)
        .single();
      clinicalNote = data;
    }

    // Build immutable snapshots
    const insuranceSnapshot = {
      provider: billing.patients?.insurance_provider,
      policyNumber: billing.patients?.insurance_policy_number,
      groupNumber: billing.patients?.insurance_group_number,
      holderName: billing.patients?.insurance_holder_name,
      holderRelationship: billing.patients?.insurance_holder_relationship,
      validFrom: billing.patients?.insurance_valid_from,
      validUntil: billing.patients?.insurance_valid_until,
      snapshotDate: new Date().toISOString(),
    };

    const patientSnapshot = {
      name: `${billing.patients?.first_name} ${billing.patients?.last_name}`,
      firstName: billing.patients?.first_name,
      lastName: billing.patients?.last_name,
      dob: billing.patients?.date_of_birth,
      gender: billing.patients?.gender,
      phone: billing.patients?.phone,
      email: billing.patients?.email,
      address: billing.patients?.address,
      snapshotDate: new Date().toISOString(),
    };

    const providerSnapshot = {
      name: provider?.full_name,
      licenseNumber: provider?.license_number,
      specialty: provider?.specialty,
      facility: provider?.facility_name,
      address: provider?.facility_address,
      snapshotDate: new Date().toISOString(),
    };

    const clinicalNotesSnapshot = clinicalNote ? {
      id: clinicalNote.id,
      subjective: clinicalNote.subjective,
      objective: clinicalNote.objective,
      assessment: clinicalNote.assessment,
      plan: clinicalNote.plan,
      singleNote: clinicalNote.single_note,
      icd10Codes: clinicalNote.icd10_codes,
      signedAt: clinicalNote.signed_at,
      snapshotDate: new Date().toISOString(),
    } : null;

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        billing_id: billingId,
        patient_id: billing.patient_id,
        insurance_snapshot: insuranceSnapshot,
        patient_snapshot: patientSnapshot,
        provider_snapshot: providerSnapshot,
        services_snapshot: billing.services,
        services: billing.services,
        clinical_notes_snapshot: clinicalNotesSnapshot,
        diagnosis_codes: clinicalNote?.icd10_codes || [],
        total_amount: billing.total || 0,
        status: 'DRAFT',
        attachments: [],
      })
      .select()
      .single();
    if (error) throw error;

    // Link claim to billing
    await supabase
      .from('billing')
      .update({ insurance_claim_id: data.id })
      .eq('id', billingId);

    await createAuditLog('CLAIM_CREATED', 'insurance_claims', data.id, { 
      billingId, 
      clinicalNoteId,
      hasInsuranceSnapshot: !!insuranceSnapshot.provider,
      hasClinicalNote: !!clinicalNote,
    });
    return data;
  }, []);

  const updateClaim = useCallback(async (id: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('CLAIM_UPDATED', 'insurance_claims', id, { updatedFields: Object.keys(updates) });
    return data;
  }, []);

  const addAttachment = useCallback(async (id: string, attachment: { type: string; name: string; url: string }) => {
    const { data: claim } = await supabase
      .from('insurance_claims')
      .select('attachments')
      .eq('id', id)
      .single();

    const currentAttachments = (claim?.attachments as any[]) || [];
    const newAttachment = { ...attachment, addedAt: new Date().toISOString() };

    const { data, error } = await supabase
      .from('insurance_claims')
      .update({ attachments: [...currentAttachments, newAttachment] })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('CLAIM_ATTACHMENT_ADDED', 'insurance_claims', id, { attachmentType: attachment.type });
    return data;
  }, []);

  const updateClaimStatus = useCallback(async (
    id: string, 
    status: string, 
    additionalData?: { 
      claimReferenceNumber?: string; 
      paidAmount?: number; 
      rejectionReason?: string;
      submittedMethod?: 'MANUAL' | 'PORTAL' | 'API';
    }
  ) => {
    const updatePayload: Record<string, any> = {
      status: status as any,
    };

    // Add status-specific fields
    if (status === 'SUBMITTED_MANUAL' || status === 'READY') {
      updatePayload.submitted_at = new Date().toISOString();
      if (additionalData?.submittedMethod) {
        updatePayload.submitted_method = additionalData.submittedMethod;
      }
      if (additionalData?.claimReferenceNumber) {
        updatePayload.claim_reference_number = additionalData.claimReferenceNumber;
      }
    }
    if (status === 'PAID') {
      updatePayload.paid_at = new Date().toISOString();
      if (additionalData?.paidAmount !== undefined) {
        updatePayload.paid_amount = additionalData.paidAmount;
      }
    }
    if (status === 'REJECTED' && additionalData?.rejectionReason) {
      updatePayload.rejection_reason = additionalData.rejectionReason;
    }

    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('CLAIM_STATUS_CHANGED', 'insurance_claims', id, { 
      newStatus: status,
      ...additionalData 
    });
    return data;
  }, []);

  return { getClaims, getClaim, createClaim, updateClaim, addAttachment, updateClaimStatus, loading };
}

// ============ INTAKE FORMS ============
export function useIntakeForms() {
  const [loading, setLoading] = useState(false);

  const getIntakeForms = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('intake_forms')
        .select(`*, patients(first_name, last_name, phone)`)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createIntakeForm = useCallback(async (patientId: string, formType: 'MEDICAL_HISTORY' | 'INSURANCE', appointmentId?: string) => {
    // Get patient phone for verification
    const { data: patient } = await supabase
      .from('patients')
      .select('phone')
      .eq('id', patientId)
      .single();

    if (!patient?.phone) throw new Error('Patient must have a phone number');

    const phoneLast4 = patient.phone.slice(-4);
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase
      .from('intake_forms')
      .insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        form_type: formType,
        token,
        phone_last_4: phoneLast4,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('INTAKE_FORM_SENT', 'intake_forms', data.id, { formType });
    return data;
  }, []);

  const verifyAndGetForm = useCallback(async (token: string, phoneLast4: string) => {
    const { data: form, error } = await supabase
      .from('intake_forms')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !form) throw new Error('Form not found');
    if (new Date(form.expires_at) < new Date()) throw new Error('Form has expired');
    if (form.phone_last_4 !== phoneLast4) {
      await supabase
        .from('intake_forms')
        .update({ verification_attempts: (form.verification_attempts || 0) + 1 })
        .eq('id', form.id);
      throw new Error('Incorrect verification code');
    }

    await supabase
      .from('intake_forms')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', form.id);

    return form;
  }, []);

  const submitIntakeForm = useCallback(async (id: string, answers: Record<string, any>) => {
    const { data, error } = await supabase
      .from('intake_forms')
      .update({ answers, status: 'PENDING_REVIEW' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('INTAKE_FORM_SUBMITTED', 'intake_forms', id, {});
    return data;
  }, []);

  const reviewIntakeForm = useCallback(async (id: string, action: 'accept' | 'reject') => {
    const { data: { user } } = await supabase.auth.getUser();

    if (action === 'accept') {
      // Get the form and update patient demographics
      const { data: form } = await supabase
        .from('intake_forms')
        .select('*, patients(*)')
        .eq('id', id)
        .single();

      if (form?.answers && form.form_type === 'INSURANCE') {
        const answers = form.answers as Record<string, any>;
        await supabase
          .from('patients')
          .update({
            insurance_provider: answers.insuranceProvider,
            insurance_policy_number: answers.policyNumber,
            insurance_group_number: answers.groupNumber,
            insurance_holder_name: answers.holderName,
            insurance_holder_relationship: answers.relationship,
          })
          .eq('id', form.patient_id);
      }
    }

    const { data, error } = await supabase
      .from('intake_forms')
      .update({
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog(`INTAKE_FORM_${action.toUpperCase()}ED`, 'intake_forms', id, {});
    return data;
  }, []);

  return { getIntakeForms, createIntakeForm, verifyAndGetForm, submitIntakeForm, reviewIntakeForm, loading };
}

// ============ AUDIT LOG ============
async function createAuditLog(action: string, entityType: string, entityId: string, details: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('audit_logs').insert({
    user_id: user?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

export function useAuditLog() {
  const getAuditLogs = useCallback(async (entityType?: string, entityId?: string) => {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }, []);

  return { getAuditLogs, createAuditLog };
}

// ============ INSURANCE SUBMISSIONS ============
export function useInsuranceSubmissions() {
  const [loading, setLoading] = useState(false);

  const getSubmissions = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('insurance_submissions')
        .select(`*, patients(first_name, last_name, phone)`)
        .order('submitted_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubmission = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('insurance_submissions')
      .select(`*, patients(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createSubmission = useCallback(async (patientId: string) => {
    // Get patient phone for verification
    const { data: patient } = await supabase
      .from('patients')
      .select('phone')
      .eq('id', patientId)
      .single();

    if (!patient?.phone) throw new Error('Patient must have a phone number');

    const phoneLast4 = patient.phone.slice(-4);
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase
      .from('insurance_submissions')
      .insert({
        patient_id: patientId,
        token,
        phone_last_4: phoneLast4,
        expires_at: expiresAt.toISOString(),
        submitted_data: {},
        status: 'PENDING_REVIEW',
      })
      .select()
      .single();
    if (error) throw error;
    
    await createAuditLog('INSURANCE_SUBMISSION_LINK_CREATED', 'insurance_submissions', data.id, { patientId });
    return data;
  }, []);

  const verifyAndGetSubmission = useCallback(async (token: string, phoneLast4: string) => {
    const { data: submission, error } = await supabase
      .from('insurance_submissions')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !submission) throw new Error('Submission not found');
    if (new Date(submission.expires_at) < new Date()) throw new Error('Link has expired (24 hour limit)');
    if (submission.phone_last_4 !== phoneLast4) {
      await supabase
        .from('insurance_submissions')
        .update({ verification_attempts: (submission.verification_attempts || 0) + 1 })
        .eq('id', submission.id);
      throw new Error('Incorrect verification code');
    }

    await supabase
      .from('insurance_submissions')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', submission.id);

    return submission;
  }, []);

  const submitInsuranceData = useCallback(async (id: string, submittedData: Record<string, any>) => {
    const { data, error } = await supabase
      .from('insurance_submissions')
      .update({ 
        submitted_data: submittedData, 
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await createAuditLog('INSURANCE_SUBMISSION_COMPLETED', 'insurance_submissions', id, { 
      provider: submittedData.insuranceProvider 
    });
    return data;
  }, []);

  const reviewSubmission = useCallback(async (
    id: string, 
    action: 'accept' | 'reject', 
    rejectionReason?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();

    // Get existing submission for before/after audit
    const { data: existingSubmission } = await supabase
      .from('insurance_submissions')
      .select('*, patients(*)')
      .eq('id', id)
      .single();

    const beforeSnapshot = existingSubmission?.patients ? {
      insurance_provider: existingSubmission.patients.insurance_provider,
      insurance_policy_number: existingSubmission.patients.insurance_policy_number,
      insurance_group_number: existingSubmission.patients.insurance_group_number,
      insurance_holder_name: existingSubmission.patients.insurance_holder_name,
    } : null;

    const updateData: Record<string, any> = {
      status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    // If accepting, also update patient demographics (trigger handles this, but we do audit)
    if (action === 'accept' && existingSubmission?.submitted_data) {
      const submittedData = existingSubmission.submitted_data as Record<string, any>;
      updateData.applied_snapshot = submittedData;
      updateData.applied_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('insurance_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Create detailed audit log
    await createAuditLog(
      action === 'accept' ? 'INSURANCE_SUBMISSION_ACCEPTED' : 'INSURANCE_SUBMISSION_REJECTED',
      'insurance_submissions',
      id,
      {
        action,
        rejectionReason: rejectionReason || null,
        beforeSnapshot,
        afterSnapshot: action === 'accept' ? existingSubmission?.submitted_data : null,
        patientId: existingSubmission?.patient_id,
        reviewedBy: user?.id,
      }
    );

    return data;
  }, []);

  return { 
    getSubmissions, 
    getSubmission, 
    createSubmission, 
    verifyAndGetSubmission, 
    submitInsuranceData, 
    reviewSubmission, 
    loading 
  };
}

// ============ DASHBOARD STATS ============
export function useDashboardStats() {
  const [loading, setLoading] = useState(false);

  const getStats = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's appointments count
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get pending notes
      const { count: pendingNotes } = await supabase
        .from('clinical_notes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'DRAFT');

      // Get today's revenue
      const { data: todayBilling } = await supabase
        .from('billing')
        .select('total')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const todayRevenue = todayBilling?.reduce((sum, bill) => sum + (bill.total || 0), 0) || 0;

      return {
        todayAppointments: todayAppointments || 0,
        totalPatients: totalPatients || 0,
        pendingNotes: pendingNotes || 0,
        todayRevenue,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getStats, loading };
}
