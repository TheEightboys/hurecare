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
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, FileCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface LegalSafeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAcknowledge: () => void;
}

export function LegalSafeModal({ open, onOpenChange, onAcknowledge }: LegalSafeModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);

    const handleAcknowledge = () => {
        if (acknowledged) {
            onAcknowledge();
            setAcknowledged(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl">Legal Acknowledgement</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <p className="text-foreground">
                                By signing this clinical note, you acknowledge and agree to the following:
                            </p>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p>
                                        <strong>Accuracy:</strong> The information contained in this note is accurate and complete to the best of your knowledge.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p>
                                        <strong>AI Assistance:</strong> Any AI-generated content has been reviewed, verified, and approved by you as the clinician responsible for this documentation.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p>
                                        <strong>Medical Record:</strong> This signed note becomes part of the patient's permanent medical record and may be used for continuity of care, billing, and legal purposes.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                                    <p>
                                        <strong>Audit Trail:</strong> All edits made after signing will be logged and tracked in the audit trail.
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer pt-2">
                                <Checkbox
                                    checked={acknowledged}
                                    onCheckedChange={(checked) => setAcknowledged(checked === true)}
                                    className="mt-0.5"
                                />
                                <span className="text-sm">
                                    I have read and understand these terms. I confirm that I am the healthcare provider responsible for this clinical documentation.
                                </span>
                            </label>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAcknowledged(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAcknowledge}
                        disabled={!acknowledged}
                    >
                        I Acknowledge & Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
