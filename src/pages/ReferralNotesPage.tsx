import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useReferralNotes } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    FileText,
    CheckCircle2,
    Clock,
    Building2,
    AlertTriangle,
    Download,
    Printer,
    User,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReferralNotesPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getReferralNotes, loading } = useReferralNotes();

    const [referrals, setReferrals] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadReferrals();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            gsap.from('.referral-row', { opacity: 0, x: -20, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [referrals]);

    const loadReferrals = async () => {
        const data = await getReferralNotes();
        setReferrals(data || []);
    };

    const filteredReferrals = referrals.filter(ref => {
        const patientName = `${ref.patients?.first_name || ''} ${ref.patients?.last_name || ''}`.toLowerCase();
        const matchesSearch = patientName.includes(searchTerm.toLowerCase()) ||
            ref.receiving_facility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.reason_for_referral?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
        const matchesUrgency = urgencyFilter === 'all' || ref.urgency === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SIGNED':
                return <Badge className="badge-signed"><CheckCircle2 className="w-3 h-3 mr-1" />Signed</Badge>;
            case 'DRAFT':
                return <Badge className="badge-draft"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'Emergency':
                return <Badge className="bg-error/10 text-error border-error/30"><AlertTriangle className="w-3 h-3 mr-1" />Emergency</Badge>;
            case 'Urgent':
                return <Badge className="bg-warning/10 text-warning border-warning/30">Urgent</Badge>;
            case 'Routine':
            default:
                return <Badge className="bg-info/10 text-info border-info/30">Routine</Badge>;
        }
    };

    const stats = {
        total: referrals.length,
        signed: referrals.filter(r => r.status === 'SIGNED').length,
        draft: referrals.filter(r => r.status === 'DRAFT').length,
        emergency: referrals.filter(r => r.urgency === 'Emergency').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Referral Notes</h1>
                        <p className="text-muted-foreground">AI-assisted referral letter generation</p>
                    </div>

                    <Button className="gap-2" onClick={() => navigate('/referral-notes/new')}>
                        <Plus className="w-4 h-4" />
                        New Referral
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.signed}</p>
                                <p className="text-xs text-muted-foreground">Signed</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.draft}</p>
                                <p className="text-xs text-muted-foreground">Drafts</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-error" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.emergency}</p>
                                <p className="text-xs text-muted-foreground">Emergency</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patient, facility, reason..."
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
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SIGNED">Signed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Urgency</SelectItem>
                            <SelectItem value="Routine">Routine</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Receiving Facility</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Urgency</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredReferrals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No referral notes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReferrals.map((ref) => (
                                    <TableRow key={ref.id} className="referral-row cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/referral-notes/${ref.id}`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-medium">
                                                    {ref.patients?.first_name} {ref.patients?.last_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                {ref.receiving_facility || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {ref.reason_for_referral || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {ref.source_visit_date ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(ref.source_visit_date), 'MMM d, yyyy')}
                                                    <Badge variant="outline" className="text-xs ml-1">
                                                        {ref.source_note_status || 'Unknown'}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Manual</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getUrgencyBadge(ref.urgency)}</TableCell>
                                        <TableCell>{getStatusBadge(ref.status)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(ref.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                {ref.status === 'SIGNED' && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Printer className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainLayout>
    );
}
