import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useInsuranceClaims } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    FileText,
    Download,
    User,
    Building2,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Eye,
    Stethoscope,
    AlertTriangle,
    DollarSign,
    FileCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function ClaimsPage() {
    const { toast } = useToast();
    const { getClaims, updateClaimStatus, loading } = useInsuranceClaims();

    const [claims, setClaims] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // View details dialog
    const [viewingClaim, setViewingClaim] = useState<any | null>(null);
    const [showViewDialog, setShowViewDialog] = useState(false);
    
    // Rejection dialog
    const [rejectingClaim, setRejectingClaim] = useState<any | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Payment dialog
    const [payingClaim, setPayingClaim] = useState<any | null>(null);
    const [showPayDialog, setShowPayDialog] = useState(false);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [claimReferenceNumber, setClaimReferenceNumber] = useState('');

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadClaims();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            gsap.from('.claim-row', { opacity: 0, x: -20, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [claims]);

    const loadClaims = async () => {
        const data = await getClaims();
        setClaims(data || []);
    };

    const handleStatusUpdate = async (id: string, status: string, additionalData?: any) => {
        try {
            await updateClaimStatus(id, status, additionalData);
            toast({ title: 'Claim updated', description: `Status changed to ${status}` });
            loadClaims();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update claim' });
        }
    };
    
    const handleReject = async () => {
        if (!rejectingClaim || !rejectionReason.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a rejection reason' });
            return;
        }
        await handleStatusUpdate(rejectingClaim.id, 'REJECTED', { rejectionReason });
        setShowRejectDialog(false);
        setRejectingClaim(null);
        setRejectionReason('');
    };
    
    const handleMarkPaid = async () => {
        if (!payingClaim) return;
        await handleStatusUpdate(payingClaim.id, 'PAID', { 
            paidAmount: paidAmount || payingClaim.total_amount,
            claimReferenceNumber 
        });
        setShowPayDialog(false);
        setPayingClaim(null);
        setPaidAmount(0);
        setClaimReferenceNumber('');
    };
    
    const openRejectDialog = (claim: any) => {
        setRejectingClaim(claim);
        setShowRejectDialog(true);
    };
    
    const openPayDialog = (claim: any) => {
        setPayingClaim(claim);
        setPaidAmount(claim.total_amount);
        setShowPayDialog(true);
    };
    
    const openViewDialog = (claim: any) => {
        setViewingClaim(claim);
        setShowViewDialog(true);
    };

    const handleDownloadClaimPack = (claim: any) => {
        // Generate comprehensive claim pack as HTML (can be printed/saved as PDF)
        const patient = claim.patients ? `${claim.patients.first_name} ${claim.patients.last_name}` : 'N/A';
        const patientSnapshot = claim.patient_snapshot as any || {};
        const insurance = claim.insurance_snapshot as any;
        const providerSnapshot = claim.provider_snapshot as any || {};
        const services = claim.services as any[] || [];
        const diagnosisCodes = claim.diagnosis_codes as any[] || [];
        const clinicalNotes = claim.clinical_notes_snapshot as any;
        const attachments = claim.attachments as any[] || [];

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Insurance Claim Pack - ${claim.id.substring(0, 8)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #2563eb; }
        .header h2 { margin: 10px 0 5px 0; }
        .claim-info { display: flex; justify-content: space-between; margin-top: 10px; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section h3 { background: #2563eb; color: white; padding: 10px; margin: 0 0 15px 0; font-size: 14px; }
        .row { display: flex; margin-bottom: 8px; border-bottom: 1px dotted #ddd; padding-bottom: 5px; }
        .label { font-weight: bold; width: 200px; color: #555; }
        .value { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f4f8; font-weight: bold; }
        .total { font-weight: bold; font-size: 1.3em; text-align: right; margin-top: 20px; padding: 15px; background: #f0f4f8; }
        .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .icd-codes { display: flex; flex-wrap: wrap; gap: 8px; }
        .icd-badge { background: #dbeafe; border: 1px solid #3b82f6; padding: 4px 10px; border-radius: 4px; font-size: 11px; }
        .clinical-note { background: #fafafa; border: 1px solid #ddd; padding: 15px; margin-top: 10px; }
        .clinical-note h4 { margin: 0 0 10px 0; color: #2563eb; }
        .clinical-note p { margin: 8px 0; line-height: 1.5; }
        .signature-box { border: 1px solid #333; padding: 30px; margin-top: 20px; text-align: center; }
        .watermark { position: fixed; bottom: 20px; right: 20px; opacity: 0.1; font-size: 60px; transform: rotate(-45deg); }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="watermark">HURE Care</div>
    
    <div class="header">
        <h1>HURE Care Medical Center</h1>
        <h2>Insurance Claim Pack</h2>
        <div class="claim-info">
            <div><strong>Claim ID:</strong> ${claim.id}</div>
            <div><strong>Status:</strong> ${claim.status}</div>
            <div><strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy h:mm a')}</div>
        </div>
    </div>
    
    <div class="section">
        <h3>Patient Information</h3>
        <div class="row"><span class="label">Full Name:</span><span class="value">${patientSnapshot.name || patient}</span></div>
        <div class="row"><span class="label">Date of Birth:</span><span class="value">${patientSnapshot.dob ? format(new Date(patientSnapshot.dob), 'MMMM d, yyyy') : 'N/A'}</span></div>
        <div class="row"><span class="label">Gender:</span><span class="value">${patientSnapshot.gender || 'N/A'}</span></div>
        <div class="row"><span class="label">Phone:</span><span class="value">${patientSnapshot.phone || 'N/A'}</span></div>
        <div class="row"><span class="label">Address:</span><span class="value">${patientSnapshot.address || 'N/A'}</span></div>
    </div>
    
    <div class="section">
        <h3>Insurance Information (Immutable Snapshot at Claim Creation)</h3>
        <div class="row"><span class="label">Insurance Provider:</span><span class="value">${insurance?.provider || 'N/A'}</span></div>
        <div class="row"><span class="label">Policy Number:</span><span class="value">${insurance?.policyNumber || 'N/A'}</span></div>
        <div class="row"><span class="label">Group Number:</span><span class="value">${insurance?.groupNumber || 'N/A'}</span></div>
        <div class="row"><span class="label">Policy Holder:</span><span class="value">${insurance?.holderName || 'N/A'}</span></div>
        <div class="row"><span class="label">Relationship:</span><span class="value">${insurance?.holderRelationship || 'N/A'}</span></div>
        <div class="row"><span class="label">Valid Until:</span><span class="value">${insurance?.validUntil ? format(new Date(insurance.validUntil), 'MMM d, yyyy') : 'N/A'}</span></div>
        <div class="row"><span class="label">Snapshot Date:</span><span class="value">${insurance?.snapshotDate ? format(new Date(insurance.snapshotDate), 'MMM d, yyyy h:mm a') : 'N/A'}</span></div>
    </div>
    
    <div class="section">
        <h3>Healthcare Provider</h3>
        <div class="row"><span class="label">Provider Name:</span><span class="value">${providerSnapshot.name || 'N/A'}</span></div>
        <div class="row"><span class="label">License Number:</span><span class="value">${providerSnapshot.licenseNumber || 'N/A'}</span></div>
        <div class="row"><span class="label">Specialty:</span><span class="value">${providerSnapshot.specialty || 'N/A'}</span></div>
        <div class="row"><span class="label">Facility:</span><span class="value">${providerSnapshot.facility || 'HURE Care Medical Center'}</span></div>
    </div>
    
    ${diagnosisCodes.length > 0 ? `
    <div class="section">
        <h3>Diagnosis Codes (ICD-10)</h3>
        <div class="icd-codes">
            ${diagnosisCodes.map((code: any) => `
                <span class="icd-badge"><strong>${code.code}</strong> - ${code.description || ''}</span>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="section">
        <h3>Services Rendered</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>CPT/Service Code</th>
                    <th>Quantity</th>
                    <th>Unit Price (KES)</th>
                    <th>Total (KES)</th>
                </tr>
            </thead>
            <tbody>
                ${services.map(s => `
                    <tr>
                        <td>${s.description || 'Service'}</td>
                        <td>${s.code || '-'}</td>
                        <td>${s.qty || s.quantity || 1}</td>
                        <td>${(s.price || s.unitPrice || 0).toLocaleString()}</td>
                        <td>${((s.price || s.unitPrice || 0) * (s.qty || s.quantity || 1)).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p class="total">Total Claim Amount: KES ${claim.total_amount?.toLocaleString()}</p>
    </div>
    
    ${clinicalNotes ? `
    <div class="section">
        <h3>Clinical Notes (SOAP)</h3>
        <div class="clinical-note">
            ${clinicalNotes.subjective ? `<div><h4>Subjective</h4><p>${clinicalNotes.subjective}</p></div>` : ''}
            ${clinicalNotes.objective ? `<div><h4>Objective</h4><p>${clinicalNotes.objective}</p></div>` : ''}
            ${clinicalNotes.assessment ? `<div><h4>Assessment</h4><p>${clinicalNotes.assessment}</p></div>` : ''}
            ${clinicalNotes.plan ? `<div><h4>Plan</h4><p>${clinicalNotes.plan}</p></div>` : ''}
            ${clinicalNotes.singleNote ? `<div><h4>Clinical Notes</h4><p>${clinicalNotes.singleNote}</p></div>` : ''}
            <p style="font-size: 10px; color: #666; margin-top: 15px;">
                Note ID: ${clinicalNotes.id} | Signed: ${clinicalNotes.signedAt ? format(new Date(clinicalNotes.signedAt), 'MMM d, yyyy h:mm a') : 'Not signed'}
            </p>
        </div>
    </div>
    ` : ''}
    
    <div class="section">
        <h3>Attachments Checklist</h3>
        <table>
            <thead>
                <tr><th>Document</th><th>Status</th><th>Notes</th></tr>
            </thead>
            <tbody>
                <tr><td>Clinical Notes (SOAP)</td><td>${clinicalNotes ? '✓ Attached' : '□ Required'}</td><td>${clinicalNotes ? 'Included above' : 'Attach separately'}</td></tr>
                <tr><td>Lab Results</td><td>${attachments.some((a: any) => a.type === 'lab') ? '✓ Attached' : '□ If applicable'}</td><td></td></tr>
                <tr><td>Prescription Records</td><td>${attachments.some((a: any) => a.type === 'prescription') ? '✓ Attached' : '□ If applicable'}</td><td></td></tr>
                <tr><td>Referral Letter</td><td>${attachments.some((a: any) => a.type === 'referral') ? '✓ Attached' : '□ If applicable'}</td><td></td></tr>
                <tr><td>Patient ID Copy</td><td>${attachments.some((a: any) => a.type === 'id') ? '✓ Attached' : '□ Required'}</td><td></td></tr>
                <tr><td>Insurance Card Copy</td><td>${attachments.some((a: any) => a.type === 'insurance_card') ? '✓ Attached' : '□ Required'}</td><td></td></tr>
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h3>Authorization & Signature</h3>
        <div class="signature-box">
            <p>I certify that the information provided above is accurate and complete to the best of my knowledge.</p>
            <br/><br/>
            <div style="display: flex; justify-content: space-around;">
                <div>
                    <div style="border-bottom: 1px solid #333; width: 200px; margin-bottom: 5px;"></div>
                    <span>Provider Signature</span>
                </div>
                <div>
                    <div style="border-bottom: 1px solid #333; width: 150px; margin-bottom: 5px;"></div>
                    <span>Date</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>HURE Care EHR System</strong> - Claim Pack Generated Automatically</p>
        <p>This document is an immutable record. Insurance snapshot data reflects the patient's insurance information at the time of claim creation.</p>
        <p>For queries: support@hurecare.com | Claim Reference: ${claim.claim_reference_number || claim.id.substring(0, 8)}</p>
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `claim-pack-${claim.id.substring(0, 8)}.html`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: 'Claim pack downloaded', description: 'Open the HTML file and print to PDF for manual submission' });
    };

    const filteredClaims = claims.filter(claim => {
        return statusFilter === 'all' || claim.status === statusFilter;
    });

    const getStatusBadge = (status: string) => {
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
                return <Badge className="bg-error/10 text-error border-error/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const stats = {
        total: claims.length,
        draft: claims.filter(c => c.status === 'DRAFT').length,
        submitted: claims.filter(c => c.status === 'SUBMITTED_MANUAL').length,
        paid: claims.filter(c => c.status === 'PAID').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef}>
                    <h1 className="text-2xl font-display font-bold">Insurance Claims</h1>
                    <p className="text-muted-foreground">Manage and track insurance claim submissions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total Claims</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">{stats.draft}</p>
                        <p className="text-xs text-muted-foreground">Drafts</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{stats.submitted}</p>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-success">{stats.paid}</p>
                        <p className="text-xs text-muted-foreground">Paid</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex justify-end">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                                        <p className="text-sm text-muted-foreground mt-1">Create a claim from the Billing page</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClaims.map((claim) => (
                                    <TableRow key={claim.id} className="claim-row">
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
                                            {getStatusBadge(claim.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {claim.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(claim.id, 'READY')}
                                                    >
                                                        Mark Ready
                                                    </Button>
                                                )}
                                                {claim.status === 'READY' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(claim.id, 'SUBMITTED_MANUAL')}
                                                    >
                                                        <Send className="w-4 h-4 mr-1" />
                                                        Mark Submitted
                                                    </Button>
                                                )}
                                                {claim.status === 'SUBMITTED_MANUAL' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openPayDialog(claim)}
                                                            className="text-success"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Paid
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openRejectDialog(claim)}
                                                            className="text-error"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Rejected
                                                        </Button>
                                                    </>
                                                )}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openViewDialog(claim)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View Details</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownloadClaimPack(claim)}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Download Claim Pack</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
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
                            <h3 className="font-semibold text-foreground">Insurance Connector Status</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Direct API submission is not yet configured. Download the Claim Pack for manual submission to insurers.
                                Future integration will enable one-click submission, eligibility checks, and automatic remittance tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* View Claim Details Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-primary" />
                            Claim Details
                        </DialogTitle>
                        <DialogDescription>
                            Claim ID: {viewingClaim?.id?.substring(0, 8)}...
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewingClaim && (
                        <div className="space-y-6 py-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                {getStatusBadge(viewingClaim.status)}
                            </div>
                            
                            {/* Rejection Reason */}
                            {viewingClaim.status === 'REJECTED' && viewingClaim.rejection_reason && (
                                <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-error">Rejection Reason</p>
                                            <p className="text-sm text-muted-foreground mt-1">{viewingClaim.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Payment Info */}
                            {viewingClaim.status === 'PAID' && (
                                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <DollarSign className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-success">Payment Received</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Amount: KES {viewingClaim.paid_amount?.toLocaleString() || viewingClaim.total_amount?.toLocaleString()}
                                                {viewingClaim.paid_at && ` • Paid: ${format(new Date(viewingClaim.paid_at), 'MMM d, yyyy')}`}
                                                {viewingClaim.claim_reference_number && ` • Ref: ${viewingClaim.claim_reference_number}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Patient & Insurance Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4" /> Patient
                                    </h4>
                                    <p className="text-sm">{viewingClaim.patients?.first_name} {viewingClaim.patients?.last_name}</p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Insurance
                                    </h4>
                                    <p className="text-sm">{(viewingClaim.insurance_snapshot as any)?.provider || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">Policy: {(viewingClaim.insurance_snapshot as any)?.policyNumber || 'N/A'}</p>
                                </div>
                            </div>
                            
                            {/* ICD-10 Codes */}
                            {(viewingClaim.diagnosis_codes as any[])?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Diagnosis Codes (ICD-10)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(viewingClaim.diagnosis_codes as any[]).map((code: any, idx: number) => (
                                            <Badge key={idx} variant="outline" className="font-mono">
                                                {code.code} - {code.description}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Services */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Services</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(viewingClaim.services as any[])?.map((service: any, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{service.description}</TableCell>
                                                    <TableCell className="font-mono text-sm">{service.code || '-'}</TableCell>
                                                    <TableCell className="text-right">KES {((service.price || service.unitPrice || 0) * (service.qty || service.quantity || 1)).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <p className="text-right font-bold">Total: KES {viewingClaim.total_amount?.toLocaleString()}</p>
                            </div>
                            
                            {/* Attachments */}
                            {(viewingClaim.attachments as any[])?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Attachments</h4>
                                    <div className="space-y-2">
                                        {(viewingClaim.attachments as any[]).map((att: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">{att.name}</span>
                                                <Badge variant="outline" className="text-xs">{att.type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                        <Button onClick={() => viewingClaim && handleDownloadClaimPack(viewingClaim)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Claim Pack
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Rejection Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-error">
                            <XCircle className="w-5 h-5" />
                            Reject Claim
                        </DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this claim. This will be recorded for audit purposes.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason *</Label>
                            <Textarea
                                placeholder="e.g., Missing documentation, Invalid policy number, Pre-authorization required..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                            <p className="text-muted-foreground">
                                Claim: {rejectingClaim?.id?.substring(0, 8)}... • 
                                Patient: {rejectingClaim?.patients?.first_name} {rejectingClaim?.patients?.last_name} • 
                                Amount: KES {rejectingClaim?.total_amount?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                            Reject Claim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Payment Dialog */}
            <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-success">
                            <DollarSign className="w-5 h-5" />
                            Record Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record the payment received for this claim.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Paid Amount (KES) *</Label>
                                <Input
                                    type="number"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Claim amount: KES {payingClaim?.total_amount?.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Claim Reference Number</Label>
                                <Input
                                    placeholder="e.g., INS-2026-001234"
                                    value={claimReferenceNumber}
                                    onChange={(e) => setClaimReferenceNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                            <p className="text-muted-foreground">
                                Patient: {payingClaim?.patients?.first_name} {payingClaim?.patients?.last_name} • 
                                Insurer: {(payingClaim?.insurance_snapshot as any)?.provider || 'N/A'}
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPayDialog(false)}>Cancel</Button>
                        <Button className="bg-success hover:bg-success/90" onClick={handleMarkPaid}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Record Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
