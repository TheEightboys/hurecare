import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBilling, useInsuranceClaims, useClinicalNotes } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    CreditCard,
    FileText,
    DollarSign,
    Trash2,
    Download,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Send,
    Printer,
    Receipt,
    Banknote,
    Smartphone,
    Landmark,
    FileCheck,
    Eye,
    XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

// Service categories for billing
const SERVICE_CATEGORIES = {
    consultation: { label: 'Consultation', icon: '🩺' },
    investigation: { label: 'Investigation/Lab', icon: '🔬' },
    procedure: { label: 'Services/Procedures', icon: '💉' },
    pharmacy: { label: 'Pharmacy', icon: '💊' },
};

// Payment methods
const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'eft', label: 'EFT/Bank Transfer', icon: Landmark },
    { value: 'cheque', label: 'Cheque', icon: FileCheck },
];

interface ServiceLine {
    id: string;
    category: keyof typeof SERVICE_CATEGORIES;
    description: string;
    code: string;
    qty: number;
    price: number;
}

interface VisitBillingTabProps {
    patientId: string;
    appointmentId: string;
    patient: any;
    clinicalNotes: any[];
    onRefresh?: () => void;
}

export function VisitBillingTab({ patientId, appointmentId, patient, clinicalNotes, onRefresh }: VisitBillingTabProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getBills, createBill, updateBill, loading: billingLoading } = useBilling();
    const { createClaim, getClaims } = useInsuranceClaims();

    // Bill state
    const [visitBill, setVisitBill] = useState<any | null>(null);
    const [services, setServices] = useState<ServiceLine[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modals
    const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showClaimDialog, setShowClaimDialog] = useState(false);
    const [showClaimSuccessDialog, setShowClaimSuccessDialog] = useState(false);
    const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);

    // Add service form
    const [newService, setNewService] = useState<Partial<ServiceLine>>({
        category: 'consultation',
        description: '',
        code: '',
        qty: 1,
        price: 0,
    });

    // Payment form
    const [paymentForm, setPaymentForm] = useState({
        payer: 'patient' as 'patient' | 'insurance',
        method: 'cash',
        amount: 0,
        reference: '',
        notes: '',
    });

    // Claim form
    const [selectedNoteId, setSelectedNoteId] = useState<string>('');
    const [creatingClaim, setCreatingClaim] = useState(false);

    useEffect(() => {
        loadBillingData();
    }, [patientId, appointmentId]);

    const loadBillingData = async () => {
        setLoading(true);
        try {
            // Load bills for this patient
            const bills = await getBills(patientId);
            // Find bill associated with this appointment/visit
            const currentBill = bills.find((b: any) => 
                b.appointment_id === appointmentId || 
                (b.patient_id === patientId && format(new Date(b.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
            );
            
            if (currentBill) {
                setVisitBill(currentBill);
                // Cast services from Json to ServiceLine[]
                const billServices = (currentBill.services as any[]) || [];
                setServices(billServices.map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    category: s.category || 'consultation',
                    description: s.description || '',
                    code: s.code || '',
                    qty: s.qty || 1,
                    price: s.price || 0,
                })));
                // Get payments from bill (stored in a payments field or separate)
                const billPayments = (currentBill as any).payments || [];
                setPayments(billPayments);
            }

            // Load claims for this patient
            const allClaims = await getClaims();
            const patientClaims = allClaims?.filter((c: any) => c.patient_id === patientId) || [];
            setClaims(patientClaims);
        } catch (err) {
            console.error('Error loading billing data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const subtotal = services.reduce((sum, s) => sum + (s.qty * s.price), 0);
    const tax = subtotal * 0.16; // 16% VAT Kenya
    const total = subtotal + tax;
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = total - totalPaid;

    // Check if patient has active insurance
    const hasInsurance = patient?.insurance_provider && patient?.insurance_policy_number;
    const insuranceValid = patient?.insurance_valid_until 
        ? new Date(patient.insurance_valid_until) > new Date() 
        : true;

    // Get signed clinical notes with ICD-10 codes
    const signedNotes = clinicalNotes.filter(n => n.status === 'SIGNED');

    const handleAddService = async () => {
        if (!newService.description || !newService.price) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter description and price' });
            return;
        }

        const serviceToAdd: ServiceLine = {
            id: crypto.randomUUID(),
            category: newService.category || 'consultation',
            description: newService.description!,
            code: newService.code || '',
            qty: newService.qty || 1,
            price: newService.price!,
        };

        const updatedServices = [...services, serviceToAdd];
        setServices(updatedServices);

        // Convert to plain objects for JSON storage
        const servicesForDb = updatedServices.map(s => ({
            id: s.id,
            category: s.category,
            description: s.description,
            code: s.code,
            qty: s.qty,
            price: s.price,
        }));

        try {
            setSaving(true);
            if (visitBill) {
                // Update existing bill
                await updateBill(visitBill.id, { 
                    services: servicesForDb as any,
                    subtotal: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0),
                    tax: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 0.16,
                    total: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16,
                    balance: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16 - totalPaid,
                });
            } else {
                // Create new bill
                const newBill = await createBill({
                    patient_id: patientId,
                    appointment_id: appointmentId,
                    payer_type: 'Patient',
                    services: servicesForDb as any,
                    subtotal: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0),
                    tax: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 0.16,
                    total: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16,
                    balance: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16,
                    status: 'PENDING',
                    provider_id: '',
                });
                setVisitBill(newBill);
            }
            toast({ title: 'Service added' });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save service' });
        } finally {
            setSaving(false);
        }

        setShowAddServiceDialog(false);
        setNewService({ category: 'consultation', description: '', code: '', qty: 1, price: 0 });
    };

    const handleRemoveService = async (serviceId: string) => {
        const updatedServices = services.filter(s => s.id !== serviceId);
        setServices(updatedServices);

        // Convert to plain objects for JSON storage
        const servicesForDb = updatedServices.map(s => ({
            id: s.id,
            category: s.category,
            description: s.description,
            code: s.code,
            qty: s.qty,
            price: s.price,
        }));

        if (visitBill) {
            try {
                await updateBill(visitBill.id, { 
                    services: servicesForDb as any,
                    subtotal: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0),
                    tax: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 0.16,
                    total: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16,
                    balance: updatedServices.reduce((sum, s) => sum + (s.qty * s.price), 0) * 1.16 - totalPaid,
                });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove service' });
            }
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentForm.amount || paymentForm.amount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid amount' });
            return;
        }

        const newPayment = {
            id: crypto.randomUUID(),
            payer: paymentForm.payer,
            method: paymentForm.method,
            amount: paymentForm.amount,
            reference: paymentForm.reference,
            notes: paymentForm.notes,
            date: new Date().toISOString(),
        };

        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);

        if (visitBill) {
            try {
                const newTotalPaid = updatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const newBalance = total - newTotalPaid;
                await updateBill(visitBill.id, { 
                    payments: updatedPayments,
                    balance: newBalance,
                    status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
                    payer_type: paymentForm.payer === 'insurance' ? 'Insurance' : 'Patient',
                });
                toast({ title: 'Payment recorded', description: `KES ${paymentForm.amount.toLocaleString()} received` });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to record payment' });
            }
        }

        setShowPaymentDialog(false);
        setPaymentForm({ payer: 'patient', method: 'cash', amount: 0, reference: '', notes: '' });
    };

    const handlePrepareInsuranceClaim = async () => {
        if (!visitBill) {
            toast({ variant: 'destructive', title: 'Error', description: 'No bill to submit. Add charges first.' });
            return;
        }

        if (!hasInsurance) {
            toast({ variant: 'destructive', title: 'Error', description: 'Patient has no insurance on file. Update Demographics first.' });
            return;
        }

        if (!insuranceValid) {
            toast({ variant: 'destructive', title: 'Warning', description: 'Patient insurance may be expired. Verify coverage.' });
        }

        setCreatingClaim(true);
        try {
            const claim = await createClaim(visitBill.id, selectedNoteId || undefined);
            setCreatedClaimId(claim.id);
            toast({ title: 'Claim draft created', description: 'You can now download the claim pack for submission.' });
            setShowClaimDialog(false);
            setShowClaimSuccessDialog(true);
            loadBillingData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to create claim' });
        } finally {
            setCreatingClaim(false);
        }
    };

    const handleDownloadClaimPack = (claimId: string) => {
        // Navigate to claims page or generate PDF
        navigate(`/claims?highlight=${claimId}`);
    };

    const handlePrintBill = () => {
        // Generate printable bill
        const billContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${visitBill?.id?.substring(0, 8) || 'New'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #2563eb; }
        .section { margin-bottom: 20px; }
        .section h3 { background: #f0f4f8; padding: 10px; margin: 0 0 10px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f4f8; }
        .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HURE Care Medical Center</h1>
        <h2>Invoice</h2>
        <p>Date: ${format(new Date(), 'MMMM d, yyyy')}</p>
    </div>
    
    <div class="section">
        <h3>Patient Information</h3>
        <div class="row"><span>Name:</span><span>${patient?.first_name} ${patient?.last_name}</span></div>
        <div class="row"><span>Phone:</span><span>${patient?.phone || 'N/A'}</span></div>
    </div>
    
    <div class="section">
        <h3>Services</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Code</th>
                    <th>Qty</th>
                    <th>Price (KES)</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${services.map(s => `
                    <tr>
                        <td>${s.description}</td>
                        <td>${s.code || '-'}</td>
                        <td>${s.qty}</td>
                        <td>${s.price.toLocaleString()}</td>
                        <td>${(s.qty * s.price).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="total">
        <div class="row"><span>Subtotal:</span><span>KES ${subtotal.toLocaleString()}</span></div>
        <div class="row"><span>VAT (16%):</span><span>KES ${tax.toLocaleString()}</span></div>
        <div class="row"><span>Total:</span><span>KES ${total.toLocaleString()}</span></div>
        <div class="row"><span>Paid:</span><span>KES ${totalPaid.toLocaleString()}</span></div>
        <div class="row" style="color: ${balance > 0 ? '#dc2626' : '#16a34a'}"><span>Balance:</span><span>KES ${balance.toLocaleString()}</span></div>
    </div>
    
    <div class="footer">
        <p>Thank you for choosing HURE Care Medical Center</p>
    </div>
</body>
</html>`;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(billContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                    Complete clinical documentation before adding charges. ICD-10 codes from Clinical Notes are used for insurance claims.
                </p>
            </div>

            {/* Insurance Info (Read-Only from Demographics) */}
            {hasInsurance && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Insurance on File</span>
                            <Badge variant="outline" className="text-xs">from Demographics - read only</Badge>
                        </div>
                        {insuranceValid ? (
                            <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                        ) : (
                            <Badge className="bg-error/10 text-error border-error/30">Possibly Expired</Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="ml-2 font-medium">{patient.insurance_provider}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Member #:</span>
                            <span className="ml-2 font-medium">{patient.insurance_policy_number}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Group #:</span>
                            <span className="ml-2 font-medium">{patient.insurance_group_number || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Valid Until:</span>
                            <span className="ml-2 font-medium">{patient.insurance_valid_until ? format(new Date(patient.insurance_valid_until), 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Service Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(SERVICE_CATEGORIES).map(([key, { label, icon }]) => (
                    <Button
                        key={key}
                        variant="outline"
                        className="h-auto py-4 flex flex-col gap-2 hover:border-primary/50"
                        onClick={() => {
                            setNewService({ ...newService, category: key as keyof typeof SERVICE_CATEGORIES });
                            setShowAddServiceDialog(true);
                        }}
                    >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-xs">Add {label}</span>
                    </Button>
                ))}
            </div>

            {/* Services Table */}
            {services.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {SERVICE_CATEGORIES[service.category]?.icon} {SERVICE_CATEGORIES[service.category]?.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{service.description}</TableCell>
                                    <TableCell className="font-mono text-sm">{service.code || '-'}</TableCell>
                                    <TableCell className="text-center">{service.qty}</TableCell>
                                    <TableCell className="text-right">KES {service.price.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-semibold">KES {(service.qty * service.price).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-error hover:text-error"
                                            onClick={() => handleRemoveService(service.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Totals */}
                    <div className="p-4 bg-muted/50 border-t">
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
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total:</span>
                                    <span>KES {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-success">
                                    <span>Paid:</span>
                                    <span>KES {totalPaid.toLocaleString()}</span>
                                </div>
                                <div className={`flex justify-between font-bold ${balance > 0 ? 'text-error' : 'text-success'}`}>
                                    <span>Balance Due:</span>
                                    <span>KES {balance.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No charges added yet</p>
                    <p className="text-sm">Add charges above to generate a bill</p>
                </div>
            )}

            {/* Action Buttons */}
            {services.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setShowPaymentDialog(true)} className="gap-2">
                        <DollarSign className="w-4 h-4" />
                        Record Payment
                    </Button>
                    
                    {balance <= 0 && (
                        <Button variant="outline" className="gap-2 text-success border-success/30 bg-success/5">
                            <CheckCircle2 className="w-4 h-4" />
                            Fully Paid
                        </Button>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={() => setShowClaimDialog(true)}
                                    disabled={!hasInsurance}
                                >
                                    <Send className="w-4 h-4" />
                                    Prepare Insurance Claim
                                </Button>
                            </TooltipTrigger>
                            {!hasInsurance && (
                                <TooltipContent>
                                    <p>No insurance on file. Update patient Demographics first.</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <Button variant="outline" className="gap-2" onClick={handlePrintBill}>
                        <Printer className="w-4 h-4" />
                        Print Bill
                    </Button>
                </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Payment History
                    </h4>
                    <div className="space-y-2">
                        {payments.map((payment: any) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">
                                        {payment.payer === 'insurance' ? 'Insurance' : 'Patient'}
                                    </Badge>
                                    <span className="text-sm capitalize">{payment.method}</span>
                                    {payment.reference && (
                                        <span className="text-xs text-muted-foreground">Ref: {payment.reference}</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold text-success">KES {payment.amount.toLocaleString()}</span>
                                    <p className="text-xs text-muted-foreground">{format(new Date(payment.date), 'MMM d, yyyy h:mm a')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Claims Status */}
            {claims.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Insurance Claims
                    </h4>
                    <div className="space-y-2">
                        {claims.map((claim: any) => (
                            <div key={claim.id} className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm">{claim.id.substring(0, 8)}...</span>
                                    <Badge variant={
                                        claim.status === 'PAID' ? 'default' :
                                        claim.status === 'REJECTED' ? 'destructive' :
                                        claim.status === 'SUBMITTED_MANUAL' ? 'secondary' :
                                        'outline'
                                    }>
                                        {claim.status === 'SUBMITTED_MANUAL' ? 'Submitted' : claim.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">KES {claim.total_amount?.toLocaleString()}</span>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/claims')}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Service Dialog */}
            <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Add {SERVICE_CATEGORIES[newService.category as keyof typeof SERVICE_CATEGORIES]?.label || 'Service'}
                        </DialogTitle>
                        <DialogDescription>
                            Add a billable service to this visit
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select 
                                value={newService.category} 
                                onValueChange={(v) => setNewService({ ...newService, category: v as keyof typeof SERVICE_CATEGORIES })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(SERVICE_CATEGORIES).map(([key, { label, icon }]) => (
                                        <SelectItem key={key} value={key}>
                                            {icon} {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input
                                placeholder="e.g., General Consultation, Blood Test, etc."
                                value={newService.description}
                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Service Code</Label>
                                <Input
                                    placeholder="e.g., CPT code"
                                    value={newService.code}
                                    onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={newService.qty}
                                    onChange={(e) => setNewService({ ...newService, qty: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Price (KES) *</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={newService.price || ''}
                                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddService} disabled={saving}>
                            {saving ? 'Adding...' : 'Add Service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-success" />
                            Record Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record a payment for this bill. Balance due: KES {balance.toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Payer Selection */}
                        <div className="space-y-3">
                            <Label>Payer</Label>
                            <RadioGroup 
                                value={paymentForm.payer} 
                                onValueChange={(v) => setPaymentForm({ ...paymentForm, payer: v as 'patient' | 'insurance' })}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="patient" id="payer-patient" />
                                    <Label htmlFor="payer-patient" className="cursor-pointer">Patient</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="insurance" id="payer-insurance" disabled={!hasInsurance} />
                                    <Label htmlFor="payer-insurance" className={`cursor-pointer ${!hasInsurance ? 'text-muted-foreground' : ''}`}>
                                        Insurance {!hasInsurance && '(not on file)'}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        {/* Payment Method */}
                        <div className="space-y-3">
                            <Label>Payment Method</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        variant={paymentForm.method === value ? 'default' : 'outline'}
                                        className="h-auto py-3 flex flex-col gap-1"
                                        onClick={() => setPaymentForm({ ...paymentForm, method: value })}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-xs">{label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label>Amount (KES) *</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={paymentForm.amount || ''}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPaymentForm({ ...paymentForm, amount: balance })}
                                >
                                    Full Balance (KES {balance.toLocaleString()})
                                </Button>
                            </div>
                        </div>
                        
                        {/* Reference */}
                        <div className="space-y-2">
                            <Label>Reference / Transaction ID</Label>
                            <Input
                                placeholder="e.g., M-Pesa code, Bank ref, etc."
                                value={paymentForm.reference}
                                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                            />
                        </div>
                        
                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Optional payment notes..."
                                rows={2}
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                        <Button onClick={handleRecordPayment} className="bg-success hover:bg-success/90">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Record Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Prepare Claim Dialog */}
            <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Prepare Insurance Claim
                        </DialogTitle>
                        <DialogDescription>
                            Create a claim draft for submission to {patient?.insurance_provider}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Insurance Summary */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-semibold">Insurance Details (Snapshot)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-muted-foreground">Provider:</span> <span className="font-medium">{patient?.insurance_provider}</span></div>
                                <div><span className="text-muted-foreground">Member #:</span> <span className="font-medium">{patient?.insurance_policy_number}</span></div>
                                <div><span className="text-muted-foreground">Group #:</span> <span className="font-medium">{patient?.insurance_group_number || 'N/A'}</span></div>
                                <div><span className="text-muted-foreground">Holder:</span> <span className="font-medium">{patient?.insurance_holder_name || 'Self'}</span></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">This information will be snapshotted and locked in the claim.</p>
                        </div>

                        {/* Claim Amount */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Claim Amount:</span>
                                <span className="text-xl font-bold">KES {total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{services.length} service(s) itemized</p>
                        </div>

                        {/* Link Clinical Note */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Link Clinical Note (for ICD-10 codes)
                            </Label>
                            
                            {signedNotes.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-amber-700 font-medium">No signed clinical notes found</p>
                                            <p className="text-xs text-amber-600 mt-1">ICD-10 codes from clinical notes are recommended for claims. You can still create the claim without a note.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <RadioGroup value={selectedNoteId} onValueChange={setSelectedNoteId}>
                                    <ScrollArea className="max-h-[200px]">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                                                <RadioGroupItem value="" id="no-note" />
                                                <Label htmlFor="no-note" className="flex-1 cursor-pointer text-muted-foreground">
                                                    No clinical note (proceed without ICD-10)
                                                </Label>
                                            </div>
                                            {signedNotes.map((note) => (
                                                <div key={note.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                                                    <RadioGroupItem value={note.id} id={note.id} />
                                                    <Label htmlFor={note.id} className="flex-1 cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{note.appointments?.reason_for_visit || 'Clinical Note'}</span>
                                                            <span className="text-xs text-muted-foreground">{format(new Date(note.created_at), 'MMM d')}</span>
                                                        </div>
                                                        {(note.icd10_codes as any[])?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {(note.icd10_codes as any[]).slice(0, 3).map((code: any, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs font-mono">
                                                                        {code.code}
                                                                    </Badge>
                                                                ))}
                                                                {(note.icd10_codes as any[]).length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">+{(note.icd10_codes as any[]).length - 3}</Badge>
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
                                <strong>Next steps:</strong> After creating the claim draft, you can download the Claim Pack PDF for manual submission to the insurer.
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClaimDialog(false)}>Cancel</Button>
                        <Button onClick={handlePrepareInsuranceClaim} disabled={creatingClaim}>
                            {creatingClaim ? 'Creating...' : 'Create Claim Draft'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Claim Success Dialog */}
            <Dialog open={showClaimSuccessDialog} onOpenChange={setShowClaimSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="w-5 h-5" />
                            Claim Draft Created
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                            <FileCheck className="w-8 h-8 text-success" />
                        </div>
                        <div>
                            <p className="font-semibold">Insurance claim has been prepared</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Status: <Badge>Draft</Badge>
                            </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm text-left">
                            <p className="font-medium mb-2">Next steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Download the Claim Pack PDF</li>
                                <li>Submit to {patient?.insurance_provider} manually</li>
                                <li>Mark claim as "Submitted" in the Claims list</li>
                                <li>Track status: Paid or Rejected</li>
                            </ol>
                        </div>
                    </div>
                    
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowClaimSuccessDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={() => navigate('/claims')}>
                            <Download className="w-4 h-4 mr-2" />
                            Go to Claims & Download Pack
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
