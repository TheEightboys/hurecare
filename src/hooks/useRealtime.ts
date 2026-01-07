import { useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

type TableName = 'patients' | 'appointments' | 'clinical_notes' | 'claims' | 'intake_submissions' | 'referral_notes';

interface RealtimeSubscriptionOptions<T> {
  table: TableName;
  schema?: string;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old: T }) => void;
  enabled?: boolean;
}

/**
 * Hook for real-time Supabase subscriptions
 * Automatically handles cleanup and reconnection
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: RealtimeSubscriptionOptions<T>) {
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T);
          break;
        case 'UPDATE':
          onUpdate?.(payload.new as T);
          break;
        case 'DELETE':
          onDelete?.({ old: payload.old as T });
          break;
      }
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    if (!enabled) return;

    const channelName = `${table}-changes-${Date.now()}`;
    
    const channelConfig: any = {
      event: '*',
      schema,
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        channelConfig,
        handlePayload
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime: Subscribed to ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime: Error subscribing to ${table}`);
          toast({
            title: 'Connection Error',
            description: 'Real-time updates may be delayed. Retrying...',
            variant: 'destructive',
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, filter, enabled, handlePayload, toast]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { unsubscribe };
}

/**
 * Hook for real-time patient updates
 */
export function useRealtimePatients(callbacks: {
  onInsert?: (patient: any) => void;
  onUpdate?: (patient: any) => void;
  onDelete?: (payload: { old: any }) => void;
}) {
  return useRealtimeSubscription({
    table: 'patients',
    ...callbacks,
  });
}

/**
 * Hook for real-time appointment updates
 */
export function useRealtimeAppointments(callbacks: {
  onInsert?: (appointment: any) => void;
  onUpdate?: (appointment: any) => void;
  onDelete?: (payload: { old: any }) => void;
}) {
  return useRealtimeSubscription({
    table: 'appointments',
    ...callbacks,
  });
}

/**
 * Hook for real-time clinical notes updates
 */
export function useRealtimeClinicalNotes(callbacks: {
  onInsert?: (note: any) => void;
  onUpdate?: (note: any) => void;
  onDelete?: (payload: { old: any }) => void;
}) {
  return useRealtimeSubscription({
    table: 'clinical_notes',
    ...callbacks,
  });
}

/**
 * Hook for real-time claims updates
 */
export function useRealtimeClaims(callbacks: {
  onInsert?: (claim: any) => void;
  onUpdate?: (claim: any) => void;
  onDelete?: (payload: { old: any }) => void;
}) {
  return useRealtimeSubscription({
    table: 'claims',
    ...callbacks,
  });
}

/**
 * Presence tracking for collaborative features
 */
export function usePresence(roomName: string, userInfo: { id: string; name: string }) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    const channel = supabase.channel(roomName, {
      config: {
        presence: {
          key: userInfo.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        presenceRef.current = new Map(Object.entries(state));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomName, userInfo.id, userInfo.name]);

  return {
    getPresence: () => presenceRef.current,
  };
}
