import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useIntakeForms, usePatients } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    FileText,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Phone,
    Link as LinkIcon,
    Copy,
    Eye
} from 'lucide-react';
import { format } from 'date-fns';

export default function IntakeFormsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getIntakeForms, createIntakeForm, reviewIntakeForm, loading } = useIntakeForms();
    const { getPatients } = usePatients();

    const [forms, setForms] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [formType, setFormType] = useState<'MEDICAL_HISTORY' | 'INSURANCE'>('MEDICAL_HISTORY');
    const [sending, setSending] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            gsap.from('.form-card', { opacity: 0, y: 20, duration: 0.4, stagger: 0.08, delay: 0.2, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [forms]);

    const loadData = async () => {
        const [formsData, patientsData] = await Promise.all([
            getIntakeForms(),
            getPatients(),
        ]);
        setForms(formsData || []);
        setPatients(patientsData || []);
    };

    const handleSendForm = async () => {
        if (!selectedPatientId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a patient' });
            return;
        }

        setSending(true);
        try {
            const form = await createIntakeForm(selectedPatientId, formType);
            const link = `${window.location.origin}/intake/${form.token}`;
            setGeneratedLink(link);
            toast({ title: 'Form link generated', description: 'Copy and share the link with the patient' });
            loadData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setSending(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        toast({ title: 'Link copied', description: 'Form link copied to clipboard' });
    };

    const handleReview = async (id: string, action: 'accept' | 'reject') => {
        try {
            await reviewIntakeForm(id, action);
            toast({
                title: action === 'accept' ? 'Form accepted' : 'Form rejected',
                description: action === 'accept' ? 'Patient information has been updated' : 'Form has been rejected',
            });
            loadData();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process form' });
        }
    };

    const filteredForms = forms.filter(form => {
        const patientName = `${form.patients?.first_name || ''} ${form.patients?.last_name || ''}`.toLowerCase();
        const matchesSearch = patientName.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return <Badge className="bg-warning/10 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
            case 'ACCEPTED':
                return <Badge className="bg-success/10 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'REJECTED':
                return <Badge className="bg-error/10 text-error border-error/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Patient Intake Forms</h1>
                        <p className="text-muted-foreground">Medical history & insurance forms</p>
                    </div>

                    <Dialog open={showSendDialog} onOpenChange={(open) => {
                        setShowSendDialog(open);
                        if (!open) {
                            setGeneratedLink('');
                            setSelectedPatientId('');
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Send className="w-4 h-4" />
                                Send Form
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Send Intake Form</DialogTitle>
                                <DialogDescription>Generate a secure link for patient to fill their intake form</DialogDescription>
                            </DialogHeader>

                            {!generatedLink ? (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Patient</Label>
                                        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select patient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.first_name} {p.last_name}
                                                        {p.phone && <span className="text-muted-foreground ml-2">({p.phone})</span>}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Form Type</Label>
                                        <Select value={formType} onValueChange={(v) => setFormType(v as any)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MEDICAL_HISTORY">Medical History</SelectItem>
                                                <SelectItem value="INSURANCE">Dental Insurance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                                        <p>• Link expires in 24 hours</p>
                                        <p>• Patient verifies identity with last 4 digits of phone</p>
                                        <p>• Submission requires your review before updating records</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-success mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-semibold">Form link generated!</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Share this link with the patient via SMS, WhatsApp, or email.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input value={generatedLink} readOnly className="text-sm" />
                                        <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                {!generatedLink ? (
                                    <>
                                        <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
                                        <Button onClick={handleSendForm} disabled={sending || !selectedPatientId}>
                                            {sending ? 'Generating...' : 'Generate Link'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setShowSendDialog(false)}>Done</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Forms</SelectItem>
                            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Forms List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredForms.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No intake forms</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No forms match your filters'
                                    : 'Send your first intake form to get started'}
                            </p>
                            <Button onClick={() => setShowSendDialog(true)}>
                                <Send className="w-4 h-4 mr-2" />
                                Send Form
                            </Button>
                        </div>
                    ) : (
                        filteredForms.map((form) => (
                            <div key={form.id} className="form-card glass-card-hover rounded-xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    {form.patients?.first_name} {form.patients?.last_name}
                                                </h3>
                                                {form.patients?.phone && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{form.patients.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            {getStatusBadge(form.status)}
                                            <Badge variant="outline">
                                                {form.form_type === 'MEDICAL_HISTORY' ? 'Medical History' : 'Insurance'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Created {format(new Date(form.created_at), 'MMM d, yyyy')}
                                            </span>
                                            {new Date(form.expires_at) < new Date() && (
                                                <Badge variant="destructive">Expired</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {form.status === 'PENDING_REVIEW' && form.answers && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReview(form.id, 'reject')}
                                                    className="text-error hover:text-error"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReview(form.id, 'accept')}
                                                    className="bg-success hover:bg-success/90"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                            </>
                                        )}
                                        {!form.answers && form.status === 'PENDING_REVIEW' && (
                                            <span className="text-sm text-muted-foreground">Awaiting patient submission</span>
                                        )}
                                    </div>
                                </div>

                                {/* Answers Preview */}
                                {form.answers && form.status === 'PENDING_REVIEW' && (
                                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium mb-2">Submitted Answers Preview:</p>
                                        <div className="text-sm text-muted-foreground">
                                            {Object.entries(form.answers as Record<string, any>).slice(0, 3).map(([key, value]) => (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                    <span>{String(value)}</span>
                                                </div>
                                            ))}
                                            {Object.keys(form.answers as object).length > 3 && (
                                                <p className="text-xs mt-1">...and {Object.keys(form.answers as object).length - 3} more fields</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
