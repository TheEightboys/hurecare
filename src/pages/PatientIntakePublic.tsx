import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useIntakeForms } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Heart,
    Shield,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    Ban
} from 'lucide-react';

const MAX_VERIFICATION_ATTEMPTS = 3;

export default function PatientIntakePublic() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { verifyAndGetForm, submitIntakeForm } = useIntakeForms();

    const [step, setStep] = useState<'verify' | 'form' | 'success' | 'error' | 'blocked'>('verify');
    const [phoneLast4, setPhoneLast4] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [formType, setFormType] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
    const [verificationAttempts, setVerificationAttempts] = useState(0);

    // Form answers
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const handleVerify = async () => {
        if (phoneLast4.length !== 4) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter 4 digits' });
            return;
        }

        // Check if already at max attempts
        if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
            setStep('blocked');
            return;
        }

        setVerifying(true);
        try {
            const form = await verifyAndGetForm(token!, phoneLast4);
            setFormData(form);
            setFormType(form.form_type);
            setStep('form');
        } catch (err: any) {
            setVerificationAttempts(prev => prev + 1);
            const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (verificationAttempts + 1);

            if (remainingAttempts <= 0) {
                setStep('blocked');
                setErrorMessage('Maximum verification attempts exceeded. Please contact your healthcare provider.');
            } else if (err.message.includes('expired')) {
                setStep('error');
                setErrorMessage(err.message);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Verification failed',
                    description: `${err.message}. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
                });
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitIntakeForm(formData.id, answers);
            setStep('success');
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit form' });
        } finally {
            setSubmitting(false);
        }
    };

    const updateAnswer = (key: string, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
                            <Heart className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold">HURE Care</h1>
                            <p className="text-xs text-muted-foreground">Patient Intake Form</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-lg">
                {/* Verification Step */}
                {step === 'verify' && (
                    <div className="glass-card rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-display font-bold">Verify Your Identity</h2>
                            <p className="text-muted-foreground mt-2">
                                Enter the last 4 digits of your phone number to access your intake form
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Last 4 digits of phone number</Label>
                                <Input
                                    type="tel"
                                    maxLength={4}
                                    placeholder="••••"
                                    value={phoneLast4}
                                    onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>

                            <Button
                                onClick={handleVerify}
                                disabled={verifying || phoneLast4.length !== 4}
                                className="w-full"
                                size="lg"
                            >
                                {verifying ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            This link is secure and expires after 24 hours
                        </p>
                    </div>
                )}

                {/* Form Step */}
                {step === 'form' && (
                    <div className="glass-card rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-display font-bold">
                                {formType === 'MEDICAL_HISTORY' ? 'Medical History' : 'Insurance Information'}
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Please fill out the information below
                            </p>
                        </div>

                        {formType === 'MEDICAL_HISTORY' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Medications</Label>
                                    <Textarea
                                        value={answers.currentMedications || ''}
                                        onChange={(e) => updateAnswer('currentMedications', e.target.value)}
                                        placeholder="List any medications you are currently taking..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Allergies</Label>
                                    <Textarea
                                        value={answers.allergies || ''}
                                        onChange={(e) => updateAnswer('allergies', e.target.value)}
                                        placeholder="List any known allergies..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Past Medical History</Label>
                                    <Textarea
                                        value={answers.medicalHistory || ''}
                                        onChange={(e) => updateAnswer('medicalHistory', e.target.value)}
                                        placeholder="Previous surgeries, hospitalizations, chronic conditions..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Family Medical History</Label>
                                    <Textarea
                                        value={answers.familyHistory || ''}
                                        onChange={(e) => updateAnswer('familyHistory', e.target.value)}
                                        placeholder="Any relevant family medical history..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="pregnant"
                                        checked={answers.isPregnant}
                                        onCheckedChange={(checked) => updateAnswer('isPregnant', checked)}
                                    />
                                    <Label htmlFor="pregnant" className="text-sm">
                                        Are you currently pregnant or breastfeeding?
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Insurance Provider *</Label>
                                    <Input
                                        value={answers.insuranceProvider || ''}
                                        onChange={(e) => updateAnswer('insuranceProvider', e.target.value)}
                                        placeholder="e.g., NHIF, Jubilee, AAR"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Policy Number *</Label>
                                    <Input
                                        value={answers.policyNumber || ''}
                                        onChange={(e) => updateAnswer('policyNumber', e.target.value)}
                                        placeholder="Your policy/member number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Group Number</Label>
                                    <Input
                                        value={answers.groupNumber || ''}
                                        onChange={(e) => updateAnswer('groupNumber', e.target.value)}
                                        placeholder="If applicable"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Policy Holder Name</Label>
                                    <Input
                                        value={answers.holderName || ''}
                                        onChange={(e) => updateAnswer('holderName', e.target.value)}
                                        placeholder="Name of primary policyholder"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Relationship to Policyholder</Label>
                                    <Input
                                        value={answers.relationship || ''}
                                        onChange={(e) => updateAnswer('relationship', e.target.value)}
                                        placeholder="e.g., Self, Spouse, Dependent"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep('verify')}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Submit Form'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="glass-card rounded-2xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-success" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-success">Form Submitted!</h2>
                            <p className="text-muted-foreground mt-2">
                                Thank you for completing your intake form. Your healthcare provider will review your information before your appointment.
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You may now close this page.
                        </p>
                    </div>
                )}

                {/* Error Step */}
                {step === 'error' && (
                    <div className="glass-card rounded-2xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-error/10 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-error" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-error">Form Unavailable</h2>
                            <p className="text-muted-foreground mt-2">
                                {errorMessage || 'This form link has expired or is invalid. Please contact your healthcare provider for a new link.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Blocked Step - Max Verification Attempts Exceeded */}
                {step === 'blocked' && (
                    <div className="glass-card rounded-2xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-error/10 flex items-center justify-center">
                            <Ban className="w-10 h-10 text-error" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-error">Access Blocked</h2>
                            <p className="text-muted-foreground mt-2">
                                Maximum verification attempts exceeded. For security reasons, this form is now locked.
                            </p>
                            <p className="text-muted-foreground mt-4">
                                Please contact your healthcare provider to request a new form link.
                            </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                            <p>For your security, we limit verification attempts to prevent unauthorized access to your medical information.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 mt-auto">
                <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>© 2024 HURE Care. Your information is secure and protected.</p>
                </div>
            </footer>
        </div>
    );
}
