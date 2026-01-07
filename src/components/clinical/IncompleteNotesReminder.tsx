import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    FileText,
    Clock,
    ArrowRight,
    X,
    ChevronDown,
    ChevronUp,
    AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, differenceInHours } from 'date-fns';

interface IncompleteNote {
    id: string;
    patient_name: string;
    appointment_date: string;
    status: 'NO_NOTE' | 'DRAFT';
    hours_old: number;
    aging_bucket: '0-24h' | '24-48h' | '48-72h' | '72h+';
}

interface IncompleteNotesReminderProps {
    className?: string;
    variant?: 'banner' | 'compact';
    showAgingBuckets?: boolean;
}

export function IncompleteNotesReminder({
    className = '',
    variant = 'banner'
}: IncompleteNotesReminderProps) {
    const navigate = useNavigate();
    const [notes, setNotes] = useState<IncompleteNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchIncompleteNotes();
    }, []);

    const fetchIncompleteNotes = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get today's appointments that don't have signed notes
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    patient_id,
                    patients (first_name, last_name)
                `)
                .eq('provider_id', user.id)
                .in('status', ['COMPLETED', 'IN_SESSION'])
                .gte('appointment_date', format(today, 'yyyy-MM-dd'))
                .order('appointment_date', { ascending: true });

            if (!appointments) return;

            // Check which appointments have incomplete notes
            const incompleteNotes: IncompleteNote[] = [];

            for (const apt of appointments) {
                const { data: clinicalNote } = await supabase
                    .from('clinical_notes')
                    .select('id, status')
                    .eq('appointment_id', apt.id)
                    .single();

                const patient = apt.patients as { first_name: string; last_name: string } | null;
                const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                const hoursOld = differenceInHours(new Date(), aptDateTime);

                // Calculate aging bucket
                const getAgingBucket = (hours: number): '0-24h' | '24-48h' | '48-72h' | '72h+' => {
                    if (hours < 24) return '0-24h';
                    if (hours < 48) return '24-48h';
                    if (hours < 72) return '48-72h';
                    return '72h+';
                };
                const aging_bucket = getAgingBucket(hoursOld);

                if (!clinicalNote) {
                    incompleteNotes.push({
                        id: apt.id,
                        patient_name: `${patient.first_name} ${patient.last_name}`,
                        appointment_date: apt.appointment_date,
                        status: 'NO_NOTE',
                        hours_old: hoursOld,
                        aging_bucket,
                    });
                } else if (clinicalNote.status === 'DRAFT') {
                    incompleteNotes.push({
                        id: clinicalNote.id,
                        patient_name: `${patient.first_name} ${patient.last_name}`,
                        appointment_date: apt.appointment_date,
                        status: 'DRAFT',
                        hours_old: hoursOld,
                        aging_bucket,
                    });
                }
            }

            setNotes(incompleteNotes);
        } catch (err) {
            console.error('Error fetching incomplete notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        // Log dismissal for audit
        supabase.from('audit_logs').insert({
            action: 'REMINDER_DISMISSED',
            entity_type: 'INCOMPLETE_NOTES',
            details: { count: notes.length },
        });
    };

    const handleOpenNote = (note: IncompleteNote) => {
        if (note.status === 'DRAFT') {
            navigate(`/clinical-notes/${note.id}`);
        } else {
            navigate(`/clinical-notes/new?appointmentId=${note.id}`);
        }
    };

    if (loading || dismissed || notes.length === 0) {
        return null;
    }

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {notes.length} incomplete
                </Badge>
            </div>
        );
    }

    return (
        <div className={`bg-warning/5 border border-warning/20 rounded-xl p-4 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {notes.length} Incomplete {notes.length === 1 ? 'Note' : 'Notes'} Today
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete your clinical documentation before end of day
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="gap-1"
                    >
                        {expanded ? (
                            <>Hide <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>View <ChevronDown className="w-4 h-4" /></>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-2 pt-4 border-t border-warning/10">
                    {notes.slice(0, 5).map((note) => (
                        <div
                            key={note.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">{note.patient_name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {isToday(new Date(note.appointment_date))
                                                ? 'Today'
                                                : format(new Date(note.appointment_date), 'MMM d')
                                            }
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={note.status === 'DRAFT' ? 'badge-draft' : 'badge-not-confirmed'}
                                        >
                                            {note.status === 'DRAFT' ? 'Draft' : 'No Note'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenNote(note)}
                                className="gap-1"
                            >
                                Complete <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {notes.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                            +{notes.length - 5} more incomplete notes
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
