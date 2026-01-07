import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    Shield,
    Building2,
    User,
    Phone,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    CreditCard,
    Loader2,
    Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Kenya/East Africa Insurance Providers
const INSURANCE_PROVIDERS = [
    'NHIF',
    'Jubilee Insurance',
    'AAR Insurance',
    'Britam Insurance',
    'CIC Insurance',
    'Madison Insurance',
    'Resolution Insurance',
    'APA Insurance',
    'UAP Old Mutual',
    'Sanlam Insurance',
    'Heritage Insurance',
    'First Assurance',
    'Other',
];

export default function InsuranceSubmitPublic() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Verification state
    const [step, setStep] = useState<'verify' | 'form' | 'success' | 'error'>('verify');
    const [phoneLast4, setPhoneLast4] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Form state
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        insuranceProvider: '',
        otherProvider: '',
        policyNumber: '',
        groupNumber: '',
        holderName: '',
        holderRelationship: 'SELF',
        holderDob: '',
        validFrom: '',
        validUntil: '',
        additionalNotes: '',
    });

    useEffect(() => {
        // Check if token exists
        if (!token) {
            setStep('error');
            setErrorMessage('Invalid link. Please request a new submission link from the clinic.');
        }
    }, [token]);

    const handleVerify = async () => {
        if (phoneLast4.length !== 4) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter the last 4 digits of your phone number' });
            return;
        }

        setVerifying(true);
        try {
            // Check submission
            const { data: submission, error } = await supabase
                .from('insurance_submissions')
                .select('*')
                .eq('token', token)
                .single();

            if (error || !submission) {
                throw new Error('Submission not found. Please request a new link.');
            }

            // Check expiration
            if (new Date(submission.expires_at) < new Date()) {
                throw new Error('This link has expired (24 hour limit). Please request a new link from the clinic.');
            }

            // Verify phone
            if (submission.phone_last_4 !== phoneLast4) {
                // Increment verification attempts
                await supabase
                    .from('insurance_submissions')
                    .update({ verification_attempts: (submission.verification_attempts || 0) + 1 })
                    .eq('id', submission.id);

                throw new Error('Incorrect verification code. Please try again.');
            }

            // Mark as verified
            await supabase
                .from('insurance_submissions')
                .update({ verified_at: new Date().toISOString() })
                .eq('id', submission.id);

            setSubmissionId(submission.id);
            setStep('form');
            toast({ title: 'Verified', description: 'You can now submit your insurance information' });

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: err.message });
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.insuranceProvider) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select an insurance provider' });
            return;
        }
        if (formData.insuranceProvider === 'Other' && !formData.otherProvider) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter the insurance provider name' });
            return;
        }
        if (!formData.policyNumber) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter your policy number' });
            return;
        }
        if (!formData.holderName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter the policy holder name' });
            return;
        }

        setSubmitting(true);
        try {
            const submittedData = {
                ...formData,
                insuranceProvider: formData.insuranceProvider === 'Other' ? formData.otherProvider : formData.insuranceProvider,
            };

            const { error } = await supabase
                .from('insurance_submissions')
                .update({
                    submitted_data: submittedData,
                    submitted_at: new Date().toISOString(),
                })
                .eq('id', submissionId);

            if (error) throw error;

            setStep('success');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const updateForm = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Error State
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-error" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Link Invalid</h1>
                    <p className="text-muted-foreground mb-6">{errorMessage}</p>
                    <p className="text-sm text-muted-foreground">
                        Please contact the clinic to request a new insurance submission link.
                    </p>
                </div>
            </div>
        );
    }

    // Success State
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Submission Received</h1>
                    <p className="text-muted-foreground mb-6">
                        Thank you! Your insurance information has been submitted successfully. 
                        The clinic staff will review and verify your details.
                    </p>
                    <div className="p-4 bg-info/10 border border-info/30 rounded-lg text-sm text-left">
                        <p className="font-medium text-info mb-2">What happens next?</p>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>• Staff will review your submission</li>
                            <li>• If approved, your insurance will be linked to your record</li>
                            <li>• The clinic will contact you if more information is needed</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Verification Step
    if (step === 'verify') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Verify Your Identity</h1>
                        <p className="text-muted-foreground mt-2">
                            For your security, please enter the last 4 digits of your phone number registered with the clinic.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneLast4">Last 4 Digits of Phone Number</Label>
                            <Input
                                id="phoneLast4"
                                type="text"
                                maxLength={4}
                                value={phoneLast4}
                                onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                                placeholder="e.g., 1234"
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>

                        <Button 
                            onClick={handleVerify} 
                            disabled={phoneLast4.length !== 4 || verifying}
                            className="w-full"
                        >
                            {verifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Continue'
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-6">
                        This secure form is provided by HURE Care. Your information is encrypted and protected.
                    </p>
                </div>
            </div>
        );
    }

    // Insurance Form Step
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Insurance Information</h1>
                        <p className="text-muted-foreground mt-2">
                            Please enter your insurance details below. This information will be reviewed by clinic staff.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Insurance Provider */}
                        <div className="space-y-2">
                            <Label htmlFor="provider">Insurance Provider *</Label>
                            <Select 
                                value={formData.insuranceProvider} 
                                onValueChange={(v) => updateForm('insuranceProvider', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your insurance provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INSURANCE_PROVIDERS.map(provider => (
                                        <SelectItem key={provider} value={provider}>
                                            {provider}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.insuranceProvider === 'Other' && (
                            <div className="space-y-2">
                                <Label htmlFor="otherProvider">Provider Name *</Label>
                                <Input
                                    id="otherProvider"
                                    value={formData.otherProvider}
                                    onChange={(e) => updateForm('otherProvider', e.target.value)}
                                    placeholder="Enter insurance provider name"
                                />
                            </div>
                        )}

                        {/* Policy Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="policyNumber">Policy Number *</Label>
                                <Input
                                    id="policyNumber"
                                    value={formData.policyNumber}
                                    onChange={(e) => updateForm('policyNumber', e.target.value)}
                                    placeholder="e.g., POL-123456"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="groupNumber">Group Number (if applicable)</Label>
                                <Input
                                    id="groupNumber"
                                    value={formData.groupNumber}
                                    onChange={(e) => updateForm('groupNumber', e.target.value)}
                                    placeholder="e.g., GRP-789"
                                />
                            </div>
                        </div>

                        {/* Policy Holder */}
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                            <h3 className="font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Policy Holder Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="holderName">Policy Holder Name *</Label>
                                    <Input
                                        id="holderName"
                                        value={formData.holderName}
                                        onChange={(e) => updateForm('holderName', e.target.value)}
                                        placeholder="Full name on policy"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="holderRelationship">Relationship to Patient *</Label>
                                    <Select 
                                        value={formData.holderRelationship} 
                                        onValueChange={(v) => updateForm('holderRelationship', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SELF">Self</SelectItem>
                                            <SelectItem value="SPOUSE">Spouse</SelectItem>
                                            <SelectItem value="PARENT">Parent</SelectItem>
                                            <SelectItem value="CHILD">Child</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Validity Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="validFrom">Coverage Start Date</Label>
                                <Input
                                    id="validFrom"
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => updateForm('validFrom', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validUntil">Coverage End Date</Label>
                                <Input
                                    id="validUntil"
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => updateForm('validUntil', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.additionalNotes}
                                onChange={(e) => updateForm('additionalNotes', e.target.value)}
                                placeholder="Any additional information about your coverage..."
                                rows={3}
                            />
                        </div>

                        {/* Privacy Notice */}
                        <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/30 rounded-lg">
                            <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-info">Privacy Notice</p>
                                <p className="text-muted-foreground mt-1">
                                    Your information is securely transmitted and will only be used for processing 
                                    insurance claims related to your healthcare at this facility.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="w-full"
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit Insurance Information
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-6">
                    Powered by HURE Care • Secure Healthcare Platform
                </p>
            </div>
        </div>
    );
}
