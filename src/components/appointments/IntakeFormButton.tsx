import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useIntakeForms } from '@/hooks/useSupabase';
import { Send, Copy, Check, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface IntakeFormButtonProps {
    patientId: string;
    appointmentId?: string;
    patientPhone?: string;
}

export function IntakeFormButton({ patientId, appointmentId, patientPhone }: IntakeFormButtonProps) {
    const { createIntakeForm } = useIntakeForms();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [intakeLink, setIntakeLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSendIntakeForm = async () => {
        if (!patientPhone) {
            toast.error('Patient must have a phone number to send intake forms');
            return;
        }

        setLoading(true);
        try {
            // Create intake form for medical history/insurance
            const form = await createIntakeForm(patientId, 'INSURANCE', appointmentId);

            // Generate the public link
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/intake/${form.token}`;
            setIntakeLink(link);

            toast.success('Intake form link generated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create intake form');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (intakeLink) {
            await navigator.clipboard.writeText(intakeLink);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const openWhatsApp = () => {
        if (intakeLink && patientPhone) {
            const message = encodeURIComponent(
                `Hello! Please complete your patient intake form using this link: ${intakeLink}\n\nThis link is valid for 24 hours.`
            );
            const cleanPhone = patientPhone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        }
    };

    const openSMS = () => {
        if (intakeLink && patientPhone) {
            const message = encodeURIComponent(
                `Please complete your patient intake form: ${intakeLink} (Valid for 24 hours)`
            );
            window.open(`sms:${patientPhone}?body=${message}`, '_blank');
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setOpen(true);
                    if (!intakeLink) {
                        handleSendIntakeForm();
                    }
                }}
                disabled={!patientPhone}
            >
                <Send className="w-4 h-4 mr-2" />
                Send Intake Forms
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Send Patient Intake Forms</DialogTitle>
                        <DialogDescription>
                            Share this link with the patient to complete their demographics and payment information.
                        </DialogDescription>
                    </DialogHeader>

                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!loading && intakeLink && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">Intake Form Link</p>
                                <p className="text-sm font-mono break-all">{intakeLink}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex-1"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={openWhatsApp}
                                    className="flex-1"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={openSMS}
                                    className="flex-1"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    SMS
                                </Button>
                            </div>

                            <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                                <p className="text-xs text-info">
                                    <strong>Note:</strong> This link is valid for 24 hours. The patient will need to verify using the last 4 digits of their phone number ({patientPhone?.slice(-4)}).
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
