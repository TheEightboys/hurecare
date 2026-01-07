export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          confirmation_attempts: number | null
          confirmation_indicator:
            | Database["public"]["Enums"]["confirmation_indicator"]
            | null
          confirmation_method: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          last_confirmation_attempt: string | null
          notes: string | null
          patient_id: string
          provider_id: string
          reason_for_visit: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          confirmation_attempts?: number | null
          confirmation_indicator?:
            | Database["public"]["Enums"]["confirmation_indicator"]
            | null
          confirmation_method?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          last_confirmation_attempt?: string | null
          notes?: string | null
          patient_id: string
          provider_id: string
          reason_for_visit?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          booking_type?: Database["public"]["Enums"]["booking_type"]
          confirmation_attempts?: number | null
          confirmation_indicator?:
            | Database["public"]["Enums"]["confirmation_indicator"]
            | null
          confirmation_method?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          last_confirmation_attempt?: string | null
          notes?: string | null
          patient_id?: string
          provider_id?: string
          reason_for_visit?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing: {
        Row: {
          amount_paid: number | null
          appointment_id: string | null
          balance: number | null
          created_at: string
          id: string
          paid_at: string | null
          patient_id: string
          payer_type: string | null
          provider_id: string
          services: Json | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          appointment_id?: string | null
          balance?: number | null
          created_at?: string
          id?: string
          paid_at?: string | null
          patient_id: string
          payer_type?: string | null
          provider_id: string
          services?: Json | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          appointment_id?: string | null
          balance?: number | null
          created_at?: string
          id?: string
          paid_at?: string | null
          patient_id?: string
          payer_type?: string | null
          provider_id?: string
          services?: Json | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          appointment_id: string | null
          assessment: string | null
          created_at: string
          icd10_codes: Json | null
          id: string
          last_accessed_at: string | null
          last_edited_by: string | null
          objective: string | null
          patient_id: string
          plan: string | null
          provider_id: string
          signed_at: string | null
          signed_by: string | null
          single_note: string | null
          source_type: Database["public"]["Enums"]["note_source_type"]
          status: Database["public"]["Enums"]["note_status"] | null
          subjective: string | null
          transcript: string | null
          transcript_reviewed: boolean | null
          transcript_reviewed_at: string | null
          transcript_reviewed_by: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assessment?: string | null
          created_at?: string
          icd10_codes?: Json | null
          id?: string
          last_accessed_at?: string | null
          last_edited_by?: string | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          provider_id: string
          signed_at?: string | null
          signed_by?: string | null
          single_note?: string | null
          source_type?: Database["public"]["Enums"]["note_source_type"]
          status?: Database["public"]["Enums"]["note_status"] | null
          subjective?: string | null
          transcript?: string | null
          transcript_reviewed?: boolean | null
          transcript_reviewed_at?: string | null
          transcript_reviewed_by?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assessment?: string | null
          created_at?: string
          icd10_codes?: Json | null
          id?: string
          last_accessed_at?: string | null
          last_edited_by?: string | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          provider_id?: string
          signed_at?: string | null
          signed_by?: string | null
          single_note?: string | null
          source_type?: Database["public"]["Enums"]["note_source_type"]
          status?: Database["public"]["Enums"]["note_status"] | null
          subjective?: string | null
          transcript?: string | null
          transcript_reviewed?: boolean | null
          transcript_reviewed_at?: string | null
          transcript_reviewed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          attachments: Json | null
          billing_id: string
          created_at: string
          icd10_codes: Json | null
          id: string
          insurance_snapshot: Json
          paid_at: string | null
          patient_id: string
          rejection_reason: string | null
          services: Json | null
          status: Database["public"]["Enums"]["claim_status"] | null
          submitted_at: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          billing_id: string
          created_at?: string
          icd10_codes?: Json | null
          id?: string
          insurance_snapshot: Json
          paid_at?: string | null
          patient_id: string
          rejection_reason?: string | null
          services?: Json | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          submitted_at?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          billing_id?: string
          created_at?: string
          icd10_codes?: Json | null
          id?: string
          insurance_snapshot?: Json
          paid_at?: string | null
          patient_id?: string
          rejection_reason?: string | null
          services?: Json | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_billing_id_fkey"
            columns: ["billing_id"]
            isOneToOne: false
            referencedRelation: "billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          answers: Json | null
          appointment_id: string | null
          created_at: string
          expires_at: string
          form_type: string
          id: string
          patient_id: string
          pdf_url: string | null
          phone_last_4: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["intake_form_status"] | null
          token: string
          verification_attempts: number | null
          verified_at: string | null
        }
        Insert: {
          answers?: Json | null
          appointment_id?: string | null
          created_at?: string
          expires_at: string
          form_type: string
          id?: string
          patient_id: string
          pdf_url?: string | null
          phone_last_4: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["intake_form_status"] | null
          token: string
          verification_attempts?: number | null
          verified_at?: string | null
        }
        Update: {
          answers?: Json | null
          appointment_id?: string | null
          created_at?: string
          expires_at?: string
          form_type?: string
          id?: string
          patient_id?: string
          pdf_url?: string | null
          phone_last_4?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["intake_form_status"] | null
          token?: string
          verification_attempts?: number | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_submissions: {
        Row: {
          id: string
          patient_id: string
          submitted_data: Json
          status: Database["public"]["Enums"]["insurance_submission_status"]
          token: string
          phone_last_4: string
          verification_attempts: number | null
          expires_at: string
          submitted_at: string
          verified_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          audit_pdf_url: string | null
          applied_snapshot: Json | null
          applied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          submitted_data: Json
          status?: Database["public"]["Enums"]["insurance_submission_status"]
          token: string
          phone_last_4: string
          verification_attempts?: number | null
          expires_at: string
          submitted_at?: string
          verified_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          audit_pdf_url?: string | null
          applied_snapshot?: Json | null
          applied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          submitted_data?: Json
          status?: Database["public"]["Enums"]["insurance_submission_status"]
          token?: string
          phone_last_4?: string
          verification_attempts?: number | null
          expires_at?: string
          submitted_at?: string
          verified_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          audit_pdf_url?: string | null
          applied_snapshot?: Json | null
          applied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_submissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_type: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_group_number: string | null
          insurance_holder_name: string | null
          insurance_holder_relationship: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          insurance_valid_until: string | null
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_group_number?: string | null
          insurance_holder_name?: string | null
          insurance_holder_relationship?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_valid_until?: string | null
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_group_number?: string | null
          insurance_holder_name?: string | null
          insurance_holder_relationship?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_valid_until?: string | null
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          facility_address: string | null
          facility_name: string | null
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          role: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          facility_address?: string | null
          facility_name?: string | null
          full_name: string
          id?: string
          license_number?: string | null
          phone?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          facility_address?: string | null
          facility_name?: string | null
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_notes: {
        Row: {
          allergies: string | null
          clinical_summary: string | null
          created_at: string
          id: string
          investigations: string | null
          medications: string | null
          patient_id: string
          pdf_url: string | null
          provider_id: string
          reason_for_referral: string
          receiving_facility: string | null
          requested_action: string | null
          signed_at: string | null
          signed_by: string | null
          source_clinical_note_id: string | null
          status: Database["public"]["Enums"]["note_status"] | null
          treatment_given: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          allergies?: string | null
          clinical_summary?: string | null
          created_at?: string
          id?: string
          investigations?: string | null
          medications?: string | null
          patient_id: string
          pdf_url?: string | null
          provider_id: string
          reason_for_referral: string
          receiving_facility?: string | null
          requested_action?: string | null
          signed_at?: string | null
          signed_by?: string | null
          source_clinical_note_id?: string | null
          status?: Database["public"]["Enums"]["note_status"] | null
          treatment_given?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          allergies?: string | null
          clinical_summary?: string | null
          created_at?: string
          id?: string
          investigations?: string | null
          medications?: string | null
          patient_id?: string
          pdf_url?: string | null
          provider_id?: string
          reason_for_referral?: string
          receiving_facility?: string | null
          requested_action?: string | null
          signed_at?: string | null
          signed_by?: string | null
          source_clinical_note_id?: string | null
          status?: Database["public"]["Enums"]["note_status"] | null
          treatment_given?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_notes_source_clinical_note_id_fkey"
            columns: ["source_clinical_note_id"]
            isOneToOne: false
            referencedRelation: "clinical_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "billing_staff" | "receptionist"
      appointment_status:
        | "SCHEDULED"
        | "IN_SESSION"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW"
      booking_type: "SAME_DAY" | "ADVANCE"
      claim_status: "DRAFT" | "READY" | "SUBMITTED_MANUAL" | "PAID" | "REJECTED"
      confirmation_indicator: "C" | "NC" | "LM"
      insurance_submission_status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED"
      intake_form_status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED"
      note_source_type: "AUDIO" | "TEXT"
      note_status: "DRAFT" | "SIGNED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "provider", "billing_staff", "receptionist"],
      appointment_status: [
        "SCHEDULED",
        "IN_SESSION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      booking_type: ["SAME_DAY", "ADVANCE"],
      claim_status: ["DRAFT", "READY", "SUBMITTED_MANUAL", "PAID", "REJECTED"],
      confirmation_indicator: ["C", "NC", "LM"],
      insurance_submission_status: ["PENDING_REVIEW", "ACCEPTED", "REJECTED"],
      intake_form_status: ["PENDING_REVIEW", "ACCEPTED", "REJECTED"],
      note_source_type: ["AUDIO", "TEXT"],
      note_status: ["DRAFT", "SIGNED"],
    },
  },
} as const
