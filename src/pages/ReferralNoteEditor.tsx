import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReferralNotes, useClinicalNotes, usePatients } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    FileText,
    Save,
    CheckCircle2,
    Download,
    Printer,
    Copy,
    Sparkles,
    AlertTriangle,
    Calendar,
    Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Helper to log referral audit events
async function logReferralAudit(action: string, referralId: string | undefined, details: Record<string, any> = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
            user_id: user?.id,
            action,
            entity_type: 'referral_note',
            entity_id: referralId,
            details,
        });
    } catch (err) {
        console.error('Failed to log referral audit:', err);
    }
}

import { generateReferralContent } from '@/lib/aiService';

// AI referral generation using centralized service

export default function ReferralNoteEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getReferralNote, createReferralNote, updateReferralNote, signReferralNote } = useReferralNotes();
    const { getNotes, getNote } = useClinicalNotes();
    const { getPatients, getPatient } = usePatients();

    const [isNew, setIsNew] = useState(!id || id === 'new');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Data
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string>('');
    const [selectedNoteInfo, setSelectedNoteInfo] = useState<string>('');

    // Referral Fields
    const [receivingFacility, setReceivingFacility] = useState('');
    const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
    const [reasonForReferral, setReasonForReferral] = useState('');
    const [clinicalSummary, setClinicalSummary] = useState('');
    const [investigations, setInvestigations] = useState('');
    const [treatmentGiven, setTreatmentGiven] = useState('');
    const [medications, setMedications] = useState('');
    const [allergies, setAllergies] = useState('');
    const [requestedAction, setRequestedAction] = useState('');

    // Status
    const [status, setStatus] = useState<'DRAFT' | 'SIGNED'>('DRAFT');
    const [showSignConfirm, setShowSignConfirm] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadPatients();
        if (id && id !== 'new') {
            loadReferral(id);
        }
    }, [id]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.editor-section', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (selectedPatientId) {
            loadPatientClinicalNotes(selectedPatientId);
            loadPatientAllergies(selectedPatientId);
        }
    }, [selectedPatientId]);

    const loadPatients = async () => {
        const data = await getPatients();
        setPatients(data);
    };

    const loadReferral = async (refId: string) => {
        setLoading(true);
        try {
            const ref = await getReferralNote(refId);
            if (ref) {
                setIsNew(false);
                setSelectedPatientId(ref.patient_id);
                setSelectedNoteId(ref.source_clinical_note_id || '');
                setReceivingFacility(ref.receiving_facility || '');
                setUrgency(ref.urgency as any || 'Routine');
                setReasonForReferral(ref.reason_for_referral || '');
                setClinicalSummary(ref.clinical_summary || '');
                setInvestigations(ref.investigations || '');
                setTreatmentGiven(ref.treatment_given || '');
                setMedications(ref.medications || '');
                setAllergies(ref.allergies || '');
                setRequestedAction(ref.requested_action || '');
                setStatus(ref.status || 'DRAFT');
            }
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load referral note.' });
        } finally {
            setLoading(false);
        }
    };

    const loadPatientClinicalNotes = async (patientId: string) => {
        const notes = await getNotes();
        const patientNotes = notes.filter(n => n.patient_id === patientId);

        // Sort: signed first, then by date
        patientNotes.sort((a, b) => {
            if (a.status === 'SIGNED' && b.status !== 'SIGNED') return -1;
            if (b.status === 'SIGNED' && a.status !== 'SIGNED') return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setClinicalNotes(patientNotes);

        // Auto-select most recent signed note
        const signedNote = patientNotes.find(n => n.status === 'SIGNED');
        if (signedNote && !selectedNoteId) {
            setSelectedNoteId(signedNote.id);
            setSelectedNoteInfo(`${format(new Date(signedNote.created_at), 'MMM d, yyyy')} - Signed`);
        } else if (patientNotes.length > 0 && !selectedNoteId) {
            setSelectedNoteId(patientNotes[0].id);
            setSelectedNoteInfo(`${format(new Date(patientNotes[0].created_at), 'MMM d, yyyy')} - Draft (Warning)`);
        }
    };

    const loadPatientAllergies = async (patientId: string) => {
        const patient = await getPatient(patientId);
        if (patient?.allergies) {
            setAllergies(patient.allergies.join(', '));
        }
    };

    const handleNoteSelection = async (noteId: string) => {
        setSelectedNoteId(noteId);
        const note = clinicalNotes.find(n => n.id === noteId);
        if (note) {
            const dateStr = format(new Date(note.created_at), 'MMM d, yyyy');
            const statusStr = note.status === 'SIGNED' ? 'Signed' : 'Draft';
            setSelectedNoteInfo(`${dateStr} - ${statusStr}`);
        }
    };

    const handleGenerateFromNote = async () => {
        if (!selectedNoteId) {
            toast({ variant: 'destructive', title: 'No source note', description: 'Please select a source clinical note.' });
            return;
        }

        setGenerating(true);
        try {
            const note = await getNote(selectedNoteId);
            const result = await generateReferralContent({
                subjective: note.subjective,
                objective: note.objective,
                assessment: note.assessment,
                plan: note.plan,
                single_note: note.single_note,
            });
            setClinicalSummary(result.clinicalSummary);
            setInvestigations(result.investigations);
            setTreatmentGiven(result.treatmentGiven);
            setMedications(result.medications);
            setRequestedAction(result.requestedAction);

            // Log referral generation
            await logReferralAudit('REFERRAL_AI_GENERATED', id, {
                sourceNoteId: selectedNoteId,
                sourceNoteStatus: note.status,
            });

            toast({ title: 'Generated', description: 'Referral content generated from clinical note. Please review before signing.' });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate referral content.' });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async (andSign = false) => {
        if (!selectedPatientId) {
            toast({ variant: 'destructive', title: 'Patient required', description: 'Please select a patient.' });
            return;
        }
        if (!reasonForReferral) {
            toast({ variant: 'destructive', title: 'Reason required', description: 'Please enter a reason for referral.' });
            return;
        }

        if (andSign) {
            setShowSignConfirm(true);
            return;
        }

        await performSave(false);
    };

    const performSave = async (sign: boolean) => {
        setSaving(true);
        try {
            const data = {
                patient_id: selectedPatientId,
                source_clinical_note_id: selectedNoteId || null,
                receiving_facility: receivingFacility,
                urgency,
                reason_for_referral: reasonForReferral,
                clinical_summary: clinicalSummary,
                investigations,
                treatment_given: treatmentGiven,
                medications,
                allergies,
                requested_action: requestedAction,
                provider_id: '', // Overwritten by hook
            };

            if (isNew) {
                const created = await createReferralNote(data);
                if (sign) {
                    await signReferralNote(created.id);
                }
                toast({ title: sign ? 'Signed' : 'Saved', description: 'Referral note saved.' });
                navigate(`/referral-notes/${created.id}`);
            } else if (id) {
                await updateReferralNote(id, data);
                if (sign) {
                    await signReferralNote(id);
                    setStatus('SIGNED');
                }
                toast({ title: sign ? 'Signed' : 'Saved', description: 'Referral note updated.' });
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setSaving(false);
            setShowSignConfirm(false);
        }
    };

    const generateReferralDocument = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please allow popups to generate PDF.' });
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Referral Note - ${selectedPatient?.first_name} ${selectedPatient?.last_name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
                    .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .logo-text { font-size: 24px; font-weight: bold; color: #0d9488; }
                    .meta-info { text-align: right; font-size: 14px; color: #666; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: bold; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .field-label { font-weight: 600; font-size: 13px; color: #64748b; margin-bottom: 2px; }
                    .field-value { font-size: 15px; }
                    .patient-banner { background: #f0fdfa; border: 1px solid #ccfbf1; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
                    .urgency-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
                    .urgency-Routine { background: #dbeafe; color: #1e40af; }
                    .urgency-Urgent { background: #ffedd5; color: #9a3412; }
                    .urgency-Emergency { background: #fee2e2; color: #991b1b; }
                    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
                    .signature-box { margin-top: 40px; margin-bottom: 10px; width: 200px; border-bottom: 1px solid #000; }
                    @media print {
                        body { padding: 20px; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-text">HURE Care</div>
                    <div class="meta-info">
                        <p>Date: ${format(new Date(), 'MMMM d, yyyy')}</p>
                        <p>Ref ID: ${id || 'NEW'}</p>
                    </div>
                </div>

                <div class="patient-banner">
                    <div class="grid">
                        <div>
                            <div class="field-label">PATIENT NAME</div>
                            <div class="field-value"><strong>${selectedPatient?.first_name} ${selectedPatient?.last_name}</strong></div>
                        </div>
                        <div>
                            <div class="field-label">DATE OF BIRTH</div>
                            <div class="field-value">${selectedPatient?.date_of_birth ? format(new Date(selectedPatient.date_of_birth), 'MMM d, yyyy') : 'N/A'}</div>
                        </div>
                        <div>
                            <div class="field-label">GENDER</div>
                            <div class="field-value">${selectedPatient?.gender || 'N/A'}</div>
                        </div>
                        <div>
                            <div class="field-label">PHONE</div>
                            <div class="field-value">${selectedPatient?.phone || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="grid">
                        <div>
                            <div class="section-title">Referral To</div>
                            <div class="field-value">${receivingFacility || 'Not specified'}</div>
                        </div>
                        <div>
                            <div class="section-title">Priority</div>
                            <div><span class="urgency-badge urgency-${urgency}">${urgency}</span></div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Reason for Referral</div>
                    <div class="field-value">${reasonForReferral || 'None provided'}</div>
                </div>

                ${clinicalSummary ? `
                <div class="section">
                    <div class="section-title">Clinical Summary</div>
                    <div class="field-value">${clinicalSummary.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                ${investigations ? `
                <div class="section">
                    <div class="section-title">Investigations / Labs</div>
                    <div class="field-value">${investigations.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                ${treatmentGiven ? `
                <div class="section">
                    <div class="section-title">Treatment Given</div>
                    <div class="field-value">${treatmentGiven.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                ${medications ? `
                <div class="section">
                    <div class="section-title">Current Medications</div>
                    <div class="field-value">${medications.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                ${allergies ? `
                <div class="section">
                    <div class="section-title">Allergies</div>
                    <div class="field-value">${allergies.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                ${requestedAction ? `
                <div class="section">
                    <div class="section-title">Requested Action</div>
                    <div class="field-value">${requestedAction.replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                <div class="section" style="margin-top: 40px;">
                    <div class="grid">
                        <div>
                            <div class="signature-box"></div>
                            <div class="field-label">Referring Provider Signature</div>
                        </div>
                        <div>
                            <div class="field-value" style="margin-top: 40px;">${format(new Date(), 'MMM d, yyyy h:mm a')}</div>
                            <div class="field-label">Date & Time</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div>Generated by HURE Care EHR</div>
                    <div>Page 1 of 1</div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handleDownloadPDF = () => {
        logReferralAudit('REFERRAL_DOWNLOADED', id, { format: 'PDF' });
        generateReferralDocument();
    };

    const handlePrint = () => {
        logReferralAudit('REFERRAL_PRINTED', id, { format: 'PRINT' });
        generateReferralDocument();
    };

    const handleCopyEmail = () => {
        const emailText = `
REFERRAL NOTE

To: ${receivingFacility}
Urgency: ${urgency}

Reason for Referral: ${reasonForReferral}

Clinical Summary:
${clinicalSummary}

Investigations:
${investigations}

Treatment Given:
${treatmentGiven}

Current Medications:
${medications}

Allergies:
${allergies}

Requested Action:
${requestedAction}

Thank you for your attention to this patient.
        `.trim();

        navigator.clipboard.writeText(emailText);
        logReferralAudit('REFERRAL_COPIED', id, { format: 'EMAIL_TEXT' });
        toast({ title: 'Copied', description: 'Referral text copied to clipboard.' });
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const sourceNote = clinicalNotes.find(n => n.id === selectedNoteId);
    const isUsingDraft = sourceNote?.status === 'DRAFT';

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div ref={containerRef} className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="editor-section flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/referral-notes')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-display font-bold">
                                {isNew ? 'New Referral Note' : 'Edit Referral Note'}
                            </h1>
                            {selectedPatient && (
                                <p className="text-muted-foreground">
                                    {selectedPatient.first_name} {selectedPatient.last_name}
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge className={status === 'SIGNED' ? 'badge-signed' : 'badge-draft'}>
                        {status === 'SIGNED' ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Signed</>
                        ) : (
                            <><FileText className="w-3 h-3 mr-1" /> Draft</>
                        )}
                    </Badge>
                </div>

                {/* Patient & Source Selection */}
                <div className="editor-section glass-card rounded-xl p-6 space-y-4">
                    {isNew && (
                        <div>
                            <Label className="text-base font-semibold mb-3 block">Select Patient</Label>
                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue placeholder="Choose a patient..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.first_name} {patient.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedPatientId && clinicalNotes.length > 0 && (
                        <div>
                            <Label className="text-base font-semibold mb-3 block">Source Clinical Note</Label>
                            <div className="flex items-center gap-3">
                                <Select value={selectedNoteId} onValueChange={handleNoteSelection}>
                                    <SelectTrigger className="flex-1 max-w-md">
                                        <SelectValue placeholder="Select source visit..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clinicalNotes.map((note) => (
                                            <SelectItem key={note.id} value={note.id}>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(note.created_at), 'MMM d, yyyy')}
                                                    <Badge variant="outline" className="text-xs">
                                                        {note.status}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateFromNote}
                                    disabled={generating || !selectedNoteId}
                                    className="gap-2"
                                >
                                    {generating ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Generate
                                </Button>
                            </div>
                            {selectedNoteInfo && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Source: {selectedNoteInfo}
                                </p>
                            )}
                            {isUsingDraft && (
                                <div className="flex items-center gap-2 mt-2 p-2 bg-warning/10 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-warning" />
                                    <span className="text-sm text-warning">
                                        Using draft note - consider using a signed note for referrals
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Referral Details */}
                <div className="editor-section glass-card rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Receiving Facility</Label>
                            <div className="relative mt-2">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={receivingFacility}
                                    onChange={(e) => setReceivingFacility(e.target.value)}
                                    placeholder="Hospital or clinic name"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Urgency</Label>
                            <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Routine">Routine</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Reason for Referral *</Label>
                        <Textarea
                            value={reasonForReferral}
                            onChange={(e) => setReasonForReferral(e.target.value)}
                            rows={3}
                            placeholder="Primary reason for this referral..."
                            className="mt-2"
                        />
                    </div>
                </div>

                {/* Clinical Information */}
                <div className="editor-section glass-card rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Clinical Information</h3>

                    <div>
                        <Label>Clinical Summary</Label>
                        <Textarea
                            value={clinicalSummary}
                            onChange={(e) => setClinicalSummary(e.target.value)}
                            rows={4}
                            placeholder="Summary of patient's condition and relevant history..."
                            className="mt-2"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Investigations</Label>
                            <Textarea
                                value={investigations}
                                onChange={(e) => setInvestigations(e.target.value)}
                                rows={3}
                                placeholder="Lab results, imaging findings..."
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Treatment Given</Label>
                            <Textarea
                                value={treatmentGiven}
                                onChange={(e) => setTreatmentGiven(e.target.value)}
                                rows={3}
                                placeholder="Treatment provided so far..."
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Current Medications</Label>
                            <Textarea
                                value={medications}
                                onChange={(e) => setMedications(e.target.value)}
                                rows={3}
                                placeholder="Current medication list..."
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Known Allergies</Label>
                            <Textarea
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                rows={3}
                                placeholder="Allergies and reactions..."
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Requested Action</Label>
                        <Textarea
                            value={requestedAction}
                            onChange={(e) => setRequestedAction(e.target.value)}
                            rows={3}
                            placeholder="What you are requesting from the receiving facility..."
                            className="mt-2"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="editor-section flex flex-wrap items-center justify-between gap-4 pb-8">
                    <div className="flex gap-2">
                        {status === 'SIGNED' && (
                            <>
                                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                                    <Download className="w-4 h-4" /> Download PDF
                                </Button>
                                <Button variant="outline" onClick={handlePrint} className="gap-2">
                                    <Printer className="w-4 h-4" /> Print
                                </Button>
                                <Button variant="outline" onClick={handleCopyEmail} className="gap-2">
                                    <Copy className="w-4 h-4" /> Copy Email
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate('/referral-notes')}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSave(false)}
                            disabled={saving || status === 'SIGNED'}
                        >
                            {saving && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />}
                            <Save className="w-4 h-4 mr-2" /> Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSave(true)}
                            disabled={saving || status === 'SIGNED'}
                        >
                            {saving && <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />}
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Save & Sign
                        </Button>
                    </div>
                </div>

                {/* Sign Confirmation */}
                <AlertDialog open={showSignConfirm} onOpenChange={setShowSignConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sign Referral Note</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to sign this referral note? Once signed, it will be locked for editing.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => performSave(true)}>
                                Sign Note
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
