import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppointments, usePatients, useClinicalNotes } from '@/hooks/useSupabase';
import { VisitBillingTab } from '@/components/billing/VisitBillingTab';
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    FileText,
    Activity,
    Pill,
    FileCheck,
    CreditCard,
    Heart,
    Stethoscope,
    Plus,
    Share2,
    Send,
    Download,
    Printer,
    ClipboardList,
    AlertCircle,
    Building2,
    Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PatientVisitPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { getAppointments } = useAppointments();
    const { getPatient } = usePatients();
    const { getNotes } = useClinicalNotes();

    const [appointment, setAppointment] = useState<any>(null);
    const [patient, setPatient] = useState<any>(null);
    const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clinical-notes');

    // Referral form state
    const [referralForm, setReferralForm] = useState({
        referTo: '',
        reasonForReferral: '',
        diagnosis: '',
        keyFindings: '',
        medications: '',
        urgency: 'routine' as 'routine' | 'urgent' | 'emergency',
        includeAISummary: false
    });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [savingReferral, setSavingReferral] = useState(false);

    useEffect(() => {
        if (appointmentId) {
            loadVisitData();
        }
    }, [appointmentId]);

    const loadVisitData = async () => {
        setLoading(true);
        try {
            // Load appointments and find the specific one
            const allAppointments = await getAppointments({});
            const aptData = allAppointments.find((apt: any) => apt.id === appointmentId);

            if (!aptData) {
                toast.error('Appointment not found');
                setLoading(false);
                return;
            }

            setAppointment(aptData);

            // Load patient
            if (aptData?.patient_id) {
                const patientData = await getPatient(aptData.patient_id);
                setPatient(patientData);

                // Load clinical notes for this patient
                const notes = await getNotes();
                const patientNotes = notes.filter((note: any) => note.patient_id === aptData.patient_id);
                setClinicalNotes(patientNotes);
            }
        } catch (error: any) {
            toast.error('Failed to load visit data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    if (!appointment || !patient) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Visit Not Found</h2>
                    <p className="text-muted-foreground mb-4">The appointment you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/appointments')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Appointments
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/appointments')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {appointment.appointment_time}
                                </span>
                                <Badge variant="outline">{appointment.status?.replace('_', ' ')}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Reason for Visit</p>
                        <p className="font-medium">{appointment.reason_for_visit || 'General Checkup'}</p>
                    </div>
                </div>

                {/* Visit Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="glass-card rounded-xl p-2 overflow-x-auto">
                        <TabsList className="flex w-full gap-2 min-w-max">
                            <TabsTrigger value="demographics" className="gap-2">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Demographics</span>
                            </TabsTrigger>
                            <TabsTrigger value="allergies" className="gap-2">
                                <Heart className="w-4 h-4" />
                                <span className="hidden sm:inline">Allergies</span>
                            </TabsTrigger>
                            <TabsTrigger value="triage" className="gap-2">
                                <Activity className="w-4 h-4" />
                                <span className="hidden sm:inline">Triage</span>
                            </TabsTrigger>
                            <TabsTrigger value="clinical-notes" className="gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Clinical Notes</span>
                            </TabsTrigger>
                            <TabsTrigger value="discharge" className="gap-2">
                                <FileCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Discharge</span>
                            </TabsTrigger>
                            <TabsTrigger value="referral" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Referral</span>
                            </TabsTrigger>
                            <TabsTrigger value="investigation" className="gap-2">
                                <Stethoscope className="w-4 h-4" />
                                <span className="hidden sm:inline">Investigation</span>
                            </TabsTrigger>
                            <TabsTrigger value="prescriptions" className="gap-2">
                                <Pill className="w-4 h-4" />
                                <span className="hidden sm:inline">Prescriptions</span>
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span className="hidden sm:inline">Billing</span>
                            </TabsTrigger>
                            <TabsTrigger value="intake" className="gap-2">
                                <ClipboardList className="w-4 h-4" />
                                <span className="hidden sm:inline">Intake Form</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Demographics Tab */}
                    <TabsContent value="demographics" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">
                                        {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM d, yyyy') : 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{patient.gender || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{patient.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{patient.email || 'Not provided'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{patient.address || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Insurance Information - Master Record */}
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Insurance Information</h3>
                                    <Badge variant="outline" className="text-xs">Master Record</Badge>
                                </div>
                                {patient.insurance_provider && (
                                    <Badge className={
                                        patient.insurance_valid_until && new Date(patient.insurance_valid_until) > new Date()
                                            ? 'bg-success/10 text-success border-success/30'
                                            : 'bg-amber-100 text-amber-700 border-amber-300'
                                    }>
                                        {patient.insurance_valid_until && new Date(patient.insurance_valid_until) > new Date() ? 'Active' : 'Verify Coverage'}
                                    </Badge>
                                )}
                            </div>
                            
                            {patient.insurance_provider ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance Provider</p>
                                        <p className="font-medium">{patient.insurance_provider}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member / Policy Number</p>
                                        <p className="font-medium font-mono">{patient.insurance_policy_number || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Group Number</p>
                                        <p className="font-medium">{patient.insurance_group_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Valid Until</p>
                                        <p className="font-medium">
                                            {patient.insurance_valid_until 
                                                ? format(new Date(patient.insurance_valid_until), 'MMM d, yyyy') 
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Policy Holder Name</p>
                                        <p className="font-medium">{patient.insurance_holder_name || 'Self'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Relationship to Holder</p>
                                        <p className="font-medium">{patient.insurance_holder_relationship || 'Self'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No insurance information on file</p>
                                    <p className="text-sm text-muted-foreground mt-1">Update patient record to add insurance details</p>
                                    <Link to={`/patients?edit=${patient.id}`}>
                                        <Button variant="outline" className="mt-3">
                                            Update Patient Demographics
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            
                            <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Insurance details here are used by Billing for claim submission. Update here to change all future claims.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Allergies Tab */}
                    <TabsContent value="allergies" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Allergies & Medical Conditions</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Known Allergies</p>
                                    {patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {patient.allergies.map((allergy: string, idx: number) => (
                                                <Badge key={idx} variant="destructive">{allergy}</Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No known allergies</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Blood Type</p>
                                    <Badge variant="outline">{patient.blood_type || 'Unknown'}</Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Triage Tab */}
                    <TabsContent value="triage" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Triage & Vital Signs</h3>
                            <p className="text-muted-foreground">Vital signs recording coming soon...</p>
                        </div>
                    </TabsContent>

                    {/* Clinical Notes Tab - Link to Editor */}
                    <TabsContent value="clinical-notes" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Clinical Notes (SOAP)</h3>
                                <Link to={`/clinical-notes/new?patientId=${patient?.id}&appointmentId=${appointmentId}`}>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        New Clinical Note
                                    </Button>
                                </Link>
                            </div>

                            {clinicalNotes.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No clinical notes for this visit yet</p>
                                    <Link to={`/clinical-notes/new?patientId=${patient?.id}&appointmentId=${appointmentId}`}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Clinical Note
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {clinicalNotes.map((note: any) => (
                                        <Link
                                            key={note.id}
                                            to={`/clinical-notes/${note.id}`}
                                            className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant={note.status === 'SIGNED' ? 'default' : 'secondary'}>
                                                            {note.status}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {note.source_type === 'AUDIO' ? 'Audio' : 'Text'}
                                                        </Badge>
                                                    </div>
                                                    {note.subjective && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {note.subjective.substring(0, 100)}...
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(note.created_at), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Discharge Tab */}
                    <TabsContent value="discharge" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Discharge Summary</h3>
                            <p className="text-muted-foreground">Discharge documentation coming soon...</p>
                        </div>
                    </TabsContent>

                    {/* Referral Tab */}
                    <TabsContent value="referral" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Create Referral</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Auto-filled patient info */}
                                <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Patient</p>
                                    <p className="font-medium">{patient?.first_name} {patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground mt-2 mb-1">Visit Date</p>
                                    <p className="font-medium">{format(new Date(appointment?.appointment_date), 'MMM d, yyyy')}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referTo">Refer To (Specialist/Facility)</Label>
                                    <Input
                                        id="referTo"
                                        placeholder="e.g., Dr. John Smith, Cardiology"
                                        value={referralForm.referTo}
                                        onChange={(e) => setReferralForm({ ...referralForm, referTo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="urgency">Urgency</Label>
                                    <Select
                                        value={referralForm.urgency}
                                        onValueChange={(value: 'routine' | 'urgent' | 'emergency') =>
                                            setReferralForm({ ...referralForm, urgency: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="routine">Routine</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="reasonForReferral">Reason for Referral</Label>
                                    <Textarea
                                        id="reasonForReferral"
                                        placeholder="Brief reason for this referral..."
                                        rows={2}
                                        value={referralForm.reasonForReferral}
                                        onChange={(e) => setReferralForm({ ...referralForm, reasonForReferral: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnosis/Assessment</Label>
                                    <Textarea
                                        id="diagnosis"
                                        placeholder="Primary diagnosis..."
                                        rows={2}
                                        value={referralForm.diagnosis}
                                        onChange={(e) => setReferralForm({ ...referralForm, diagnosis: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keyFindings">Key Findings</Label>
                                    <Textarea
                                        id="keyFindings"
                                        placeholder="Relevant exam findings, test results..."
                                        rows={2}
                                        value={referralForm.keyFindings}
                                        onChange={(e) => setReferralForm({ ...referralForm, keyFindings: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="medications">Current Medications</Label>
                                    <Textarea
                                        id="medications"
                                        placeholder="List current medications..."
                                        rows={2}
                                        value={referralForm.medications}
                                        onChange={(e) => setReferralForm({ ...referralForm, medications: e.target.value })}
                                    />
                                </div>

                                {/* AI Summary option */}
                                <div className="md:col-span-2 flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Checkbox
                                        id="includeAISummary"
                                        checked={referralForm.includeAISummary}
                                        onCheckedChange={(checked) =>
                                            setReferralForm({ ...referralForm, includeAISummary: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="includeAISummary" className="text-sm cursor-pointer">
                                        Include AI-generated summary from clinical notes (optional)
                                    </Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" className="gap-2">
                                    <Printer className="w-4 h-4" />
                                    Print
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </Button>
                                <Button className="gap-2" disabled={savingReferral}>
                                    <Send className="w-4 h-4" />
                                    Save Referral
                                </Button>
                            </div>

                            {/* Referral History */}
                            {referrals.length > 0 && (
                                <div className="mt-8 pt-6 border-t">
                                    <h4 className="font-semibold mb-4">Referral History</h4>
                                    <div className="space-y-3">
                                        {referrals.map((ref: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="font-medium">{ref.referTo}</p>
                                                <p className="text-sm text-muted-foreground">{ref.reasonForReferral}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Investigation Tab */}
                    <TabsContent value="investigation" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Investigations & Lab Orders</h3>
                            <p className="text-muted-foreground">Lab orders and results coming soon...</p>
                        </div>
                    </TabsContent>

                    {/* Prescriptions Tab */}
                    <TabsContent value="prescriptions" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Prescriptions</h3>
                            <p className="text-muted-foreground">Prescription management coming soon...</p>
                        </div>
                    </TabsContent>

                    {/* Billing Tab - Full Workflow */}
                    <TabsContent value="billing" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Billing & Charges
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Create charges, record payments, and submit insurance claims
                                    </p>
                                </div>
                            </div>

                            <VisitBillingTab
                                patientId={patient?.id}
                                appointmentId={appointmentId || ''}
                                patient={patient}
                                clinicalNotes={clinicalNotes}
                                onRefresh={loadVisitData}
                            />
                        </div>
                    </TabsContent>

                    {/* Intake Form Tab */}
                    <TabsContent value="intake" className="space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Intake Forms</h3>
                                <Button className="gap-2">
                                    <Send className="w-4 h-4" />
                                    Send Form to Patient
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">New Patient Intake</h4>
                                            <p className="text-xs text-muted-foreground">Full onboarding form</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Complete medical history, demographics, insurance, and consent forms for new patients.</p>
                                </div>

                                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Existing Patient Update</h4>
                                            <p className="text-xs text-muted-foreground">Medical history update</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Update medical history, medications, allergies, and insurance changes.</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t">
                                <h4 className="font-medium mb-3">Form Status</h4>
                                <p className="text-muted-foreground text-sm">No intake forms sent for this visit yet.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
