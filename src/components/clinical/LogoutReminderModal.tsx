import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, FileText, ArrowRight, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IncompleteNote {
    id: string;
    patient_name: string;
    created_at: string;
}

interface LogoutReminderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmLogout: () => void;
}

export function LogoutReminderModal({
    open,
    onOpenChange,
    onConfirmLogout
}: LogoutReminderModalProps) {
    const navigate = useNavigate();
    const [incompleteNotes, setIncompleteNotes] = useState<IncompleteNote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            fetchIncompleteNotes();
        }
    }, [open]);

    const fetchIncompleteNotes = async () => {
        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get today's draft notes for this provider
            const { data } = await supabase
                .from('clinical_notes')
                .select(`
                    id,
                    created_at,
                    patients (first_name, last_name)
                `)
                .eq('status', 'DRAFT')
                .eq('provider_id', user.id)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false });

            if (data) {
                const notes: IncompleteNote[] = data.map((note: any) => ({
                    id: note.id,
                    patient_name: `${note.patients?.first_name || ''} ${note.patients?.last_name || ''}`.trim() || 'Unknown',
                    created_at: note.created_at
                }));
                setIncompleteNotes(notes);
            }

            // Log reminder shown
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: 'LOGOUT_REMINDER_SHOWN',
                entity_type: 'clinical_notes',
                details: { noteCount: data?.length || 0 }
            });
        } catch (err) {
            console.error('Error fetching incomplete notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToNotes = () => {
        onOpenChange(false);
        navigate('/clinical-notes?status=draft');
    };

    const handleDismissAndLogout = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('audit_logs').insert({
                    user_id: user.id,
                    action: 'LOGOUT_REMINDER_DISMISSED',
                    entity_type: 'clinical_notes',
                    details: { incompleteCount: incompleteNotes.length }
                });
            }
        } catch (err) {
            console.error('Error logging dismissal:', err);
        }
        onConfirmLogout();
    };

    if (loading) {
        return null;
    }

    // If no incomplete notes, don't show the modal - just confirm logout
    if (incompleteNotes.length === 0) {
        if (open) {
            onConfirmLogout();
        }
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <AlertDialogTitle>Incomplete Notes</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                                You have {incompleteNotes.length} unsigned note{incompleteNotes.length > 1 ? 's' : ''} from today
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                        Complete your clinical documentation before signing off:
                    </p>

                    <ScrollArea className="max-h-[200px]">
                        <div className="space-y-2">
                            {incompleteNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                    onClick={() => {
                                        onOpenChange(false);
                                        navigate(`/clinical-notes/${note.id}`);
                                    }}
                                >
                                    <FileText className="w-4 h-4 text-warning flex-shrink-0" />
                                    <span className="text-sm font-medium flex-1 truncate">
                                        {note.patient_name}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="default"
                        onClick={handleGoToNotes}
                        className="w-full sm:w-auto"
                    >
                        Complete Notes
                    </Button>
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            onClick={handleDismissAndLogout}
                            className="w-full sm:w-auto gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout Anyway
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
