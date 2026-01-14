import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBilling, usePatients, useInsuranceClaims, useClinicalNotes } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    CreditCard,
    FileText,
    User,
    DollarSign,
    Trash2,
    Download,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Stethoscope,
    AlertCircle,
    Send,
    XCircle,
    Eye,
    Printer,
    Receipt
} from 'lucide-react';
import { format } from 'date-fns';

export default function BillingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { getBills, createBill, loading } = useBilling();
    const { getPatients } = usePatients();
    const { createClaim, getClaims } = useInsuranceClaims();
    const { getNotes } = useClinicalNotes();

    const [activeTab, setActiveTab] = useState<'invoices' | 'claims'>('invoices');
    const [bills, setBills] = useState<any[]>([]);
    const [claims, setClaims] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [claimStatusFilter, setClaimStatusFilter] = useState<string>('all');
    const [showNewDialog, setShowNewDialog] = useState(false);

    // New bill form
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [payerType, setPayerType] = useState<'Patient' | 'Insurance'>('Patient');
    const [services, setServices] = useState<Array<{ description: string; code: string; qty: number; price: number }>>([
        { description: '', code: '', qty: 1, price: 0 }
    ]);
    const [creating, setCreating] = useState(false);
    
    // Claim preparation dialog
    const [showClaimDialog, setShowClaimDialog] = useState(false);
    const [claimBillId, setClaimBillId] = useState<string | null>(null);
    const [claimPatientId, setClaimPatientId] = useState<string | null>(null);
    const [patientNotes, setPatientNotes] = useState<any[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string>('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [creatingClaim, setCreatingClaim] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
        // Check if URL has a tab parameter
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'claims') {
            setActiveTab('claims');
        }
    }, [location.search]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            gsap.from('.bill-row', { opacity: 0, x: -20, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [bills, claims, activeTab]);

    const loadData = async () => {
        const [billsData, patientsData, claimsData] = await Promise.all([
            getBills(),
            getPatients(),
            getClaims(),
        ]);
        setBills(billsData || []);
        setPatients(patientsData || []);
        setClaims(claimsData || []);
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const addServiceLine = () => {
        setServices([...services, { description: '', code: '', qty: 1, price: 0 }]);
    };

    const removeServiceLine = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const updateService = (index: number, field: string, value: any) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const subtotal = services.reduce((sum, s) => sum + (s.qty * s.price), 0);
    const tax = subtotal * 0.16; // 16% VAT Kenya
    const total = subtotal + tax;

    const handleCreateBill = async () => {
        if (!selectedPatientId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a patient' });
            return;
        }

        const validServices = services.filter(s => s.description && s.price > 0);
        if (validServices.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Add at least one service' });
            return;
        }

        setCreating(true);
        try {
            await createBill({
                patient_id: selectedPatientId,
                payer_type: payerType,
                services: validServices,
                subtotal,
                tax,
                total,
                balance: total,
                status: 'PENDING',
            });

            toast({ title: 'Bill created' });
            setShowNewDialog(false);
            resetForm();
            loadData();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create bill' });
        } finally {
            setCreating(false);
        }
    };

    const resetForm = () => {
        setSelectedPatientId('');
        setPayerType('Patient');
        setServices([{ description: '', code: '', qty: 1, price: 0 }]);
    };

    const openClaimDialog = async (bill: any) => {
        setClaimBillId(bill.id);
        setClaimPatientId(bill.patient_id);
        setSelectedNoteId('');
        setShowClaimDialog(true);
        
        // Load patient's signed clinical notes
        setLoadingNotes(true);
        try {
            const notes = await getNotes({ patientId: bill.patient_id, status: 'SIGNED' });
            setPatientNotes(notes || []);
        } catch (err) {
            console.error('Error loading notes:', err);
            setPatientNotes([]);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleCreateClaim = async () => {
        if (!claimBillId) return;
        
        setCreatingClaim(true);
        try {
            await createClaim(claimBillId, selectedNoteId || undefined);
            toast({ 
                title: 'Claim draft created', 
                description: selectedNoteId 
                    ? 'Clinical note attached. View in Claims tab to complete and download.' 
                    : 'View in Claims tab to complete and download. Consider attaching a clinical note for ICD-10 codes.'
            });
            setShowClaimDialog(false);
            setActiveTab('claims');
            loadData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setCreatingClaim(false);
        }
    };

    const handlePrepareClaimClick = async (bill: any) => {
        openClaimDialog(bill);
    };

    const filteredBills = bills.filter(bill => {
        const patientName = `${bill.patients?.first_name || ''} ${bill.patients?.last_name || ''}`.toLowerCase();
        const matchesSearch = patientName.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredClaims = claims.filter((claim: any) => {
        return claimStatusFilter === 'all' || claim.status === claimStatusFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-warning/10 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'PAID':
                return <Badge className="bg-success/10 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'PARTIAL':
                return <Badge className="bg-info/10 text-info border-info/30">Partial</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getClaimStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge className="bg-muted text-muted-foreground border-border"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
            case 'READY':
                return <Badge className="bg-info/10 text-info border-info/30"><CheckCircle2 className="w-3 h-3 mr-1" />Ready</Badge>;
            case 'SUBMITTED_MANUAL':
                return <Badge className="bg-primary/10 text-primary border-primary/30"><Send className="w-3 h-3 mr-1" />Submitted</Badge>;
            case 'PAID':
                return <Badge className="bg-success/10 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'REJECTED':
                return <Badge className="bg-error/10 text-error border-error/30"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Stats
    const billStats = {
        total: bills.length,
        pending: bills.filter(b => b.status === 'PENDING').length,
        paid: bills.filter(b => b.status === 'PAID').length,
        totalAmount: bills.reduce((sum, b) => sum + (b.total || 0), 0),
        totalBalance: bills.reduce((sum, b) => sum + (b.balance || 0), 0),
    };

    const claimStats = {
        total: claims.length,
        draft: claims.filter((c: any) => c.status === 'DRAFT').length,
        submitted: claims.filter((c: any) => c.status === 'SUBMITTED_MANUAL').length,
        paid: claims.filter((c: any) => c.status === 'PAID').length,
        rejected: claims.filter((c: any) => c.status === 'REJECTED').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Billing & Claims</h1>
                        <p className="text-muted-foreground">Manage invoices, payments, and insurance claims</p>
                    </div>

                    <div className="flex gap-3">
                        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    New Invoice
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Invoice</DialogTitle>
                                    <DialogDescription>Create a new billing invoice for a patient</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    {/* Patient & Payer */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Patient *</Label>
                                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.first_name} {p.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payer Type *</Label>
                                            <Select value={payerType} onValueChange={(v) => setPayerType(v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Patient">Patient (Cash)</SelectItem>
                                                    <SelectItem value="Insurance">Insurance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Insurance Info (read-only) */}
                                    {payerType === 'Insurance' && selectedPatient && (
                                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Building2 className="w-5 h-5 text-primary" />
                                                <span className="font-semibold">Insurance Information</span>
                                                <span className="text-xs text-muted-foreground">(from Demographics - read only)</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Provider:</span>
                                                    <span className="ml-2 font-medium">{selectedPatient.insurance_provider || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Policy #:</span>
                                                    <span className="ml-2 font-medium">{selectedPatient.insurance_policy_number || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Group #:</span>
                                                    <span className="ml-2 font-medium">{selectedPatient.insurance_group_number || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Valid Until:</span>
                                                    <span className="ml-2 font-medium">{selectedPatient.insurance_valid_until || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Lines */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Services</Label>
                                            <Button variant="outline" size="sm" onClick={addServiceLine}>
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Line
                                            </Button>
                                        </div>

                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[40%]">Description</TableHead>
                                                        <TableHead>Code</TableHead>
                                                        <TableHead className="w-[60px]">Qty</TableHead>
                                                        <TableHead>Price (KES)</TableHead>
                                                        <TableHead className="w-[40px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {services.map((service, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>
                                                                <Input
                                                                    placeholder="Service description"
                                                                    value={service.description}
                                                                    onChange={(e) => updateService(idx, 'description', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    placeholder="D0120"
                                                                    value={service.code}
                                                                    onChange={(e) => updateService(idx, 'code', e.target.value)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={service.qty}
                                                                    onChange={(e) => updateService(idx, 'qty', parseInt(e.target.value) || 1)}
                                                                    className="w-16"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={service.price || ''}
                                                                    onChange={(e) => updateService(idx, 'price', parseFloat(e.target.value) || 0)}
                                                                    className="w-28"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {services.length > 1 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeServiceLine(idx)}
                                                                        className="text-error hover:text-error"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>KES {subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">VAT (16%):</span>
                                                <span>KES {tax.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                                                <span>Total:</span>
                                                <span>KES {total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                                    <Button onClick={handleCreateBill} disabled={creating}>
                                        {creating ? 'Creating...' : 'Create Invoice'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Tabs for Invoices and Claims */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'invoices' | 'claims')} className="space-y-6">
                    <div className="glass-card rounded-xl p-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="invoices" className="gap-2">
                                <Receipt className="w-4 h-4" />
                                Invoices
                                <Badge variant="secondary" className="ml-1">{billStats.total}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="claims" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Insurance Claims
                                <Badge variant="secondary" className="ml-1">{claimStats.total}</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Invoices Tab */}
                    <TabsContent value="invoices" className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold">{billStats.total}</p>
                                <p className="text-xs text-muted-foreground">Total Invoices</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-warning">{billStats.pending}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-success">{billStats.paid}</p>
                                <p className="text-xs text-muted-foreground">Paid</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-error">KES {billStats.totalBalance.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                            </div>
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
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                {/* Bills Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Payer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No invoices found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBills.map((bill) => (
                                    <TableRow key={bill.id} className="bill-row">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-medium">{bill.patients?.first_name} {bill.patients?.last_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(bill.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {bill.payer_type === 'Insurance' ? (
                                                    <><Building2 className="w-3 h-3 mr-1" />Insurance</>
                                                ) : (
                                                    <><User className="w-3 h-3 mr-1" />Patient</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            KES {(bill.total || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            KES {(bill.balance || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(bill.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {bill.payer_type === 'Insurance' && !bill.insurance_claim_id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePrepareClaimClick(bill)}
                                                    >
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        Prepare Claim
                                                    </Button>
                                                )}
                                                {bill.insurance_claim_id && (
                                                    <Badge variant="outline" className="text-success">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Claim Created
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="icon">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                    </TabsContent>

                    {/* Claims Tab */}
                    <TabsContent value="claims" className="space-y-6">
                        {/* Claims Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold">{claimStats.total}</p>
                                <p className="text-xs text-muted-foreground">Total Claims</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-muted-foreground">{claimStats.draft}</p>
                                <p className="text-xs text-muted-foreground">Drafts</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-primary">{claimStats.submitted}</p>
                                <p className="text-xs text-muted-foreground">Submitted</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-success">{claimStats.paid}</p>
                                <p className="text-xs text-muted-foreground">Paid</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-error">{claimStats.rejected}</p>
                                <p className="text-xs text-muted-foreground">Rejected</p>
                            </div>
                        </div>

                        {/* Claims Filter */}
                        <div className="flex justify-end">
                            <Select value={claimStatusFilter} onValueChange={setClaimStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Claims</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="READY">Ready</SelectItem>
                                    <SelectItem value="SUBMITTED_MANUAL">Submitted</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Claims Table */}
                        <div className="glass-card rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Claim ID</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Insurer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredClaims.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-muted-foreground">No claims found</p>
                                                <p className="text-sm text-muted-foreground mt-1">Create a claim from an invoice with Insurance payer type</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClaims.map((claim: any) => (
                                            <TableRow key={claim.id} className="bill-row">
                                                <TableCell className="font-mono text-sm">
                                                    {claim.id.substring(0, 8)}...
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {claim.patients?.first_name} {claim.patients?.last_name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {(claim.insurance_snapshot as any)?.provider || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    KES {claim.total_amount?.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {format(new Date(claim.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {getClaimStatusBadge(claim.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate('/claims')}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => navigate('/claims')}>
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Info Box */}
                        <div className="glass-card rounded-xl p-4 border-info/30 bg-info/5">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Insurance Claim Workflow</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        <strong>Draft</strong> → <strong>Ready</strong> → <strong>Submitted (Manual)</strong> → <strong>Paid/Rejected</strong><br />
                                        Download the Claim Pack PDF for manual submission to insurers. Full claim status tracking available in the Claims page.
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/claims')}>
                                        Open Full Claims Manager
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Prepare Claim Dialog */}
            <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Prepare Insurance Claim
                        </DialogTitle>
                        <DialogDescription>
                            Link a clinical note to include ICD-10 diagnosis codes in the claim.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Clinical Notes Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                Link Clinical Note (Optional but Recommended)
                            </Label>
                            
                            {loadingNotes ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : patientNotes.length === 0 ? (
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No signed clinical notes found for this patient.</p>
                                    <p className="text-xs text-muted-foreground mt-1">You can still create the claim without a note.</p>
                                </div>
                            ) : (
                                <RadioGroup value={selectedNoteId} onValueChange={setSelectedNoteId}>
                                    <ScrollArea className="max-h-[200px]">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="" id="no-note" />
                                                <Label htmlFor="no-note" className="flex-1 cursor-pointer text-muted-foreground">
                                                    No clinical note (create claim without ICD-10 codes)
                                                </Label>
                                            </div>
                                            {patientNotes.map((note) => (
                                                <div 
                                                    key={note.id} 
                                                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <RadioGroupItem value={note.id} id={note.id} />
                                                    <Label htmlFor={note.id} className="flex-1 cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">
                                                                {note.appointments?.reason_for_visit || 'Clinical Note'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(note.created_at), 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                        {(note.icd10_codes as any[])?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {(note.icd10_codes as any[]).slice(0, 3).map((code: any, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs font-mono">
                                                                        {code.code}
                                                                    </Badge>
                                                                ))}
                                                                {(note.icd10_codes as any[]).length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{(note.icd10_codes as any[]).length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </RadioGroup>
                            )}
                        </div>
                        
                        {/* Info */}
                        <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Tip:</strong> Linking a clinical note will automatically include ICD-10 diagnosis codes 
                                and clinical summary in the claim pack, making insurance submission faster.
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClaimDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateClaim} disabled={creatingClaim}>
                            {creatingClaim ? 'Creating...' : 'Create Claim Draft'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
