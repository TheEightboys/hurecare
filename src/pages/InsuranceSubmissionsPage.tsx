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
} from '@/components/ui/dialog';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInsuranceSubmissions, usePatients } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Phone,
    Link as LinkIcon,
    Copy,
    Eye,
    FileText,
    Shield,
    AlertTriangle,
    Calendar,
    CreditCard
} from 'lucide-react';
import { format, differenceInHours } from 'date-fns';

export default function InsuranceSubmissionsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { 
        getSubmissions, 
        createSubmission, 
        reviewSubmission, 
        loading 
    } = useInsuranceSubmissions();
    const { getPatients } = usePatients();

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
    const [searchTerm, setSearchTerm] = useState('');

    // Create link dialog
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [createdLink, setCreatedLink] = useState<string | null>(null);

    // Review dialog
    const [reviewingSubmission, setReviewingSubmission] = useState<any | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    // Reject confirmation
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            gsap.from('.submission-row', { opacity: 0, x: -20, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [submissions]);

    const loadData = async () => {
        const [submissionsData, patientsData] = await Promise.all([
            getSubmissions(statusFilter),
            getPatients(),
        ]);
        setSubmissions(submissionsData || []);
        setPatients(patientsData || []);
    };

    const handleCreateLink = async () => {
        if (!selectedPatientId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a patient' });
            return;
        }

        try {
            const submission = await createSubmission(selectedPatientId);
            const link = `${window.location.origin}/insurance-submit/${submission.token}`;
            setCreatedLink(link);
            toast({ title: 'Link created', description: 'Secure link generated (expires in 24 hours)' });
            loadData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };

    const handleCopyLink = () => {
        if (createdLink) {
            navigator.clipboard.writeText(createdLink);
            toast({ title: 'Copied', description: 'Link copied to clipboard' });
        }
    };

    const handleOpenReview = (submission: any) => {
        setReviewingSubmission(submission);
        setShowReviewDialog(true);
    };

    const handleAccept = async () => {
        if (!reviewingSubmission) return;

        try {
            await reviewSubmission(reviewingSubmission.id, 'accept');
            toast({ 
                title: 'Insurance Accepted', 
                description: 'Patient demographics have been updated with the submitted insurance information.' 
            });
            setShowReviewDialog(false);
            setReviewingSubmission(null);
            loadData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };

    const handleReject = async () => {
        if (!reviewingSubmission) return;

        try {
            await reviewSubmission(reviewingSubmission.id, 'reject', rejectionReason);
            toast({ 
                title: 'Insurance Rejected', 
                description: 'Submission has been rejected. Patient demographics were NOT modified.' 
            });
            setShowRejectConfirm(false);
            setShowReviewDialog(false);
            setReviewingSubmission(null);
            setRejectionReason('');
            loadData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        const patientName = `${s.patients?.first_name || ''} ${s.patients?.last_name || ''}`.toLowerCase();
        return patientName.includes(searchTerm.toLowerCase());
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

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const stats = {
        pending: submissions.filter(s => s.status === 'PENDING_REVIEW').length,
        accepted: submissions.filter(s => s.status === 'ACCEPTED').length,
        rejected: submissions.filter(s => s.status === 'REJECTED').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Insurance Submissions</h1>
                        <p className="text-muted-foreground">Review and approve patient-submitted insurance information</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Submission Link
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-sm text-muted-foreground">Pending Review</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.accepted}</p>
                                <p className="text-sm text-muted-foreground">Accepted</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-error" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                        </div>
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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Submissions</SelectItem>
                            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Insurance Provider</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSubmissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No submissions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubmissions.map((submission) => {
                                    const submittedData = submission.submitted_data as Record<string, any> || {};
                                    return (
                                        <TableRow key={submission.id} className="submission-row">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {submission.patients?.first_name} {submission.patients?.last_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {submission.patients?.phone || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                                    <span>{submittedData.insuranceProvider || 'Not submitted yet'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {submission.submitted_at ? (
                                                        <>
                                                            <p>{format(new Date(submission.submitted_at), 'MMM d, yyyy')}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(new Date(submission.submitted_at), 'h:mm a')}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            {isExpired(submission.expires_at) ? (
                                                                <span className="text-error">Expired</span>
                                                            ) : (
                                                                'Awaiting submission'
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                            <TableCell>
                                                {submission.status === 'PENDING_REVIEW' && submittedData.insuranceProvider && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenReview(submission)}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Review
                                                    </Button>
                                                )}
                                                {submission.status === 'ACCEPTED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenReview(submission)}
                                                        className="gap-1"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View
                                                    </Button>
                                                )}
                                                {submission.status === 'REJECTED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenReview(submission)}
                                                        className="gap-1 text-error"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Create Link Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                    setShowCreateDialog(open);
                    if (!open) {
                        setSelectedPatientId('');
                        setCreatedLink(null);
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Insurance Submission Link</DialogTitle>
                            <DialogDescription>
                                Generate a secure link for the patient to submit their insurance information.
                                The link expires in 24 hours.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {!createdLink ? (
                                <div className="space-y-2">
                                    <Label>Select Patient</Label>
                                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.first_name} {p.last_name} - {p.phone || 'No phone'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Patient must have a phone number for verification
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                        <span className="text-success font-medium">Link created successfully!</span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Secure Link</Label>
                                        <div className="flex gap-2">
                                            <Input value={createdLink} readOnly className="font-mono text-xs" />
                                            <Button variant="outline" onClick={handleCopyLink}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Send this link to the patient. They will need to verify with the last 4 digits of their phone number.
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                        <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-warning">Expires in 24 hours</p>
                                            <p className="text-muted-foreground">Link will be invalid after expiration</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {!createdLink ? (
                                <>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateLink} disabled={!selectedPatientId}>
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Generate Link
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setShowCreateDialog(false)}>
                                    Done
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Insurance Submission Review
                            </DialogTitle>
                            <DialogDescription>
                                Review the submitted insurance information before accepting or rejecting.
                            </DialogDescription>
                        </DialogHeader>

                        {reviewingSubmission && (
                            <div className="space-y-6 py-4">
                                {/* Patient Info */}
                                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {reviewingSubmission.patients?.first_name} {reviewingSubmission.patients?.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Phone: {reviewingSubmission.patients?.phone}
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        {getStatusBadge(reviewingSubmission.status)}
                                    </div>
                                </div>

                                {/* Submitted Insurance Info */}
                                {(() => {
                                    const data = reviewingSubmission.submitted_data as Record<string, any> || {};
                                    return (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Submitted Insurance Information
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Insurance Provider</Label>
                                                    <p className="font-medium">{data.insuranceProvider || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Policy Number</Label>
                                                    <p className="font-medium font-mono">{data.policyNumber || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Group Number</Label>
                                                    <p className="font-medium font-mono">{data.groupNumber || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Policy Holder</Label>
                                                    <p className="font-medium">{data.holderName || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Relationship</Label>
                                                    <p className="font-medium">{data.holderRelationship || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Valid Until</Label>
                                                    <p className="font-medium">
                                                        {data.validUntil ? format(new Date(data.validUntil), 'MMM d, yyyy') : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {data.additionalNotes && (
                                                <div className="space-y-1">
                                                    <Label className="text-muted-foreground">Additional Notes</Label>
                                                    <p className="text-sm p-2 bg-muted rounded">{data.additionalNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Current Demographics (for comparison) */}
                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                                    <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="w-4 h-4" />
                                        Current Insurance in Demographics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Provider: </span>
                                            <span>{reviewingSubmission.patients?.insurance_provider || 'None'}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Policy #: </span>
                                            <span>{reviewingSubmission.patients?.insurance_policy_number || 'None'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rejection Reason (if rejected) */}
                                {reviewingSubmission.status === 'REJECTED' && reviewingSubmission.rejection_reason && (
                                    <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                                        <p className="font-medium text-error mb-1">Rejection Reason:</p>
                                        <p className="text-sm">{reviewingSubmission.rejection_reason}</p>
                                    </div>
                                )}

                                {/* Audit Info */}
                                <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                                    <p>Submitted: {format(new Date(reviewingSubmission.submitted_at || reviewingSubmission.created_at), 'MMM d, yyyy h:mm a')}</p>
                                    {reviewingSubmission.reviewed_at && (
                                        <p>Reviewed: {format(new Date(reviewingSubmission.reviewed_at), 'MMM d, yyyy h:mm a')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            {reviewingSubmission?.status === 'PENDING_REVIEW' ? (
                                <>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowRejectConfirm(true)}
                                        className="text-error hover:text-error"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button onClick={handleAccept} className="bg-success hover:bg-success/90">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Accept & Update Demographics
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Confirmation */}
                <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Insurance Submission</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will reject the submission. Patient demographics will NOT be modified.
                                Please provide a reason for rejection.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label>Rejection Reason *</Label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Invalid policy number, expired coverage, missing information..."
                                rows={3}
                                className="mt-2"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="bg-error hover:bg-error/90"
                            >
                                Confirm Rejection
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
