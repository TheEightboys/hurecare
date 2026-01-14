/**
 * React Query Hooks for HURE Care
 * 
 * Provides optimized data fetching with caching, pagination,
 * and automatic background updates for production scalability.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys for cache management
export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  appointments: (date?: string) => ['appointments', date] as const,
  clinicalNotes: (filters?: any) => ['clinical-notes', filters] as const,
  clinicalNote: (id: string) => ['clinical-notes', id] as const,
  dashboardStats: ['dashboard-stats'] as const,
  intakeForms: ['intake-forms'] as const,
  billing: ['billing'] as const,
  claims: ['claims'] as const,
  auditLogs: (entityType?: string, entityId?: string) => ['audit-logs', entityType, entityId] as const,
};

// ============ PATIENTS HOOKS ============

interface PatientsQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  includeDeleted?: boolean;
}

export function usePatientsQuery(options: PatientsQueryOptions = {}) {
  const { page = 1, pageSize = 20, search = '', includeDeleted = false } = options;
  
  return useQuery({
    queryKey: [...queryKeys.patients, { page, pageSize, search, includeDeleted }],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      // Only filter by deleted_at if column exists (graceful handling)
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }
      
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      
      let { data, error, count } = await query;
      
      // If error (possibly missing deleted_at column), retry without that filter
      if (error && !includeDeleted) {
        console.warn('Query with deleted_at failed, retrying without filter:', error.message);
        let fallbackQuery = supabase
          .from('patients')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);
        
        if (search) {
          fallbackQuery = fallbackQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        
        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
        count = fallbackResult.count;
      }
      
      if (error) throw error;
      
      return {
        patients: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

export function usePatientQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patient: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('patients')
        .insert({ ...patient, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
    },
  });
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update specific patient in cache
      queryClient.setQueryData(queryKeys.patient(data.id), data);
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
    },
  });
}

// ============ APPOINTMENTS HOOKS ============

export function useAppointmentsQuery(date?: string) {
  return useQuery({
    queryKey: queryKeys.appointments(date),
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`*, patients(first_name, last_name, phone)`)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (date) {
        query = query.eq('appointment_date', date);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTodayAppointmentsQuery() {
  const today = new Date().toISOString().split('T')[0];
  return useAppointmentsQuery(today);
}

// ============ DASHBOARD STATS HOOK ============

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Parallel queries for better performance
      const [appointmentsResult, patientsResult, notesResult, billingResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today),
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('clinical_notes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'DRAFT'),
        supabase
          .from('billing')
          .select('total')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`),
      ]);
      
      const todayRevenue = billingResult.data?.reduce((sum, bill) => sum + (bill.total || 0), 0) || 0;
      
      return {
        todayAppointments: appointmentsResult.count || 0,
        totalPatients: patientsResult.count || 0,
        pendingNotes: notesResult.count || 0,
        todayRevenue,
      };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// ============ CLINICAL NOTES HOOKS ============

interface ClinicalNotesQueryOptions {
  patientId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useClinicalNotesQuery(options: ClinicalNotesQueryOptions = {}) {
  const { patientId, status, page = 1, pageSize = 20 } = options;
  
  return useQuery({
    queryKey: [...queryKeys.clinicalNotes(options)],
    queryFn: async () => {
      let query = supabase
        .from('clinical_notes')
        .select(`*, patients(first_name, last_name), appointments(appointment_date, reason_for_visit)`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      if (status) {
        query = query.eq('status', status as 'DRAFT' | 'SIGNED');
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        notes: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useClinicalNoteQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.clinicalNote(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select(`*, patients(first_name, last_name, allergies), appointments(*)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      
      // Update last accessed
      await supabase.from('clinical_notes').update({ last_accessed_at: new Date().toISOString() }).eq('id', id);
      
      return data;
    },
    enabled: !!id && id !== 'new',
    staleTime: 60 * 1000,
  });
}

// ============ INFINITE SCROLL HOOKS ============

export function usePatientsInfiniteQuery(search: string = '') {
  return useInfiniteQuery({
    queryKey: [...queryKeys.patients, 'infinite', search],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);
      
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        patients: data || [],
        nextPage: data && data.length === pageSize ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 30 * 1000,
  });
}

// ============ REAL-TIME SUBSCRIPTIONS ============

export function useRealtimeAppointments(date: string, callback: (payload: any) => void) {
  const queryClient = useQueryClient();
  
  // Subscribe to real-time changes
  const channel = supabase
    .channel('appointments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `appointment_date=eq.${date}`,
      },
      (payload) => {
        callback(payload);
        // Invalidate query to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments(date) });
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

// ============ PREFETCH UTILITIES ============

export function usePrefetchPatient() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.patient(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data;
      },
      staleTime: 60 * 1000,
    });
  };
}
