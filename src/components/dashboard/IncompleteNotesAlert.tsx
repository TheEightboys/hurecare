import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface IncompleteNotesAlertProps {
    notes: Array<{
        id: string;
        patients?: { first_name: string; last_name: string };
        appointments?: { appointment_date: string };
        created_at: string;
    }>;
}

export function IncompleteNotesAlert({ notes }: IncompleteNotesAlertProps) {
    if (notes.length === 0) return null;

    return (
        <div className="glass-card rounded-xl p-4 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Incomplete Notes Reminder</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        You have {notes.length} incomplete clinical note{notes.length > 1 ? 's' : ''} from today. Complete them before signing off.
                    </p>

                    {/* List of incomplete notes */}
                    <div className="mt-3 space-y-2">
                        {notes.slice(0, 3).map((note) => (
                            <Link
                                key={note.id}
                                to={`/clinical-notes/${note.id}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-warning/10 transition-colors group"
                            >
                                <FileText className="w-4 h-4 text-warning" />
                                <span className="text-sm font-medium text-foreground flex-1 truncate">
                                    {note.patients?.first_name} {note.patients?.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {note.appointments?.appointment_date || format(new Date(note.created_at), 'MMM d')}
                                </span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-warning transition-colors" />
                            </Link>
                        ))}
                    </div>

                    {notes.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            and {notes.length - 3} more...
                        </p>
                    )}
                </div>

                <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                    <Link to="/clinical-notes?status=draft">Review All</Link>
                </Button>
            </div>
        </div>
    );
}
