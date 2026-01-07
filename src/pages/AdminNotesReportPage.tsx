import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Search,
    FileText,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours } from 'date-fns';

interface IncompleteNoteReport {
    id: string;
    provider_name: string;
    provider_id: string;
    patient_name: string;
    appointment_date: string;
    status: 'NO_NOTE' | 'DRAFT';
    hours_old: number;
    aging_bucket: '24-48h' | '48-72h' | '72h+';
}

export default function AdminNotesReportPage() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState<IncompleteNoteReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [agingFilter, setAgingFilter] = useState<string>('all');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchIncompleteNotes();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            const ctx = gsap.context(() => {
                gsap.from('.report-section', {
                    opacity: 0,
                    y: 20,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out',
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    const fetchIncompleteNotes = async () => {
        setLoading(true);
        try {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            oneDayAgo.setHours(0, 0, 0, 0);

            // Get appointments older than 24h that don't have signed notes
            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    provider_id,
                    patient_id,
                    patients (first_name, last_name),
                    profiles:provider_id (full_name)
                `)
                .in('status', ['COMPLETED', 'IN_SESSION'])
                .lt('appointment_date', format(oneDayAgo, 'yyyy-MM-dd'))
                .order('appointment_date', { ascending: true });

            if (!appointments) {
                setNotes([]);
                return;
            }

            const incompleteNotes: IncompleteNoteReport[] = [];

            for (const apt of appointments) {
                // Check if there's a signed clinical note for this appointment
                const { data: clinicalNote } = await supabase
                    .from('clinical_notes')
                    .select('id, status')
                    .eq('appointment_id', apt.id)
                    .single();

                const patient = apt.patients as any;
                const provider = apt.profiles as any;
                const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time || '00:00:00'}`);
                const hoursOld = differenceInHours(new Date(), aptDateTime);

                // Determine aging bucket
                let agingBucket: '24-48h' | '48-72h' | '72h+';
                if (hoursOld < 48) {
                    agingBucket = '24-48h';
                } else if (hoursOld < 72) {
                    agingBucket = '48-72h';
                } else {
                    agingBucket = '72h+';
                }

                // Only include if no note or draft note (admin sees 24h+ only)
                if (!clinicalNote) {
                    incompleteNotes.push({
                        id: apt.id,
                        provider_name: provider?.full_name || 'Unknown Provider',
                        provider_id: apt.provider_id,
                        patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() || 'Unknown',
                        appointment_date: apt.appointment_date,
                        status: 'NO_NOTE',
                        hours_old: hoursOld,
                        aging_bucket: agingBucket,
                    });
                } else if (clinicalNote.status === 'DRAFT') {
                    incompleteNotes.push({
                        id: clinicalNote.id,
                        provider_name: provider?.full_name || 'Unknown Provider',
                        provider_id: apt.provider_id,
                        patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() || 'Unknown',
                        appointment_date: apt.appointment_date,
                        status: 'DRAFT',
                        hours_old: hoursOld,
                        aging_bucket: agingBucket,
                    });
                }
            }

            setNotes(incompleteNotes);
        } catch (err) {
            console.error('Error fetching incomplete notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const getAgingBadge = (bucket: string) => {
        switch (bucket) {
            case '24-48h':
                return <Badge variant="outline" className="border-warning text-warning">24-48h</Badge>;
            case '48-72h':
                return <Badge variant="outline" className="border-orange-500 text-orange-500">48-72h</Badge>;
            case '72h+':
                return <Badge variant="destructive">72h+</Badge>;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'DRAFT') {
            return <Badge variant="outline" className="border-blue-500 text-blue-500">Draft Exists</Badge>;
        }
        return <Badge variant="outline" className="border-red-500 text-red-500">No Note</Badge>;
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            note.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAging = agingFilter === 'all' || note.aging_bucket === agingFilter;
        return matchesSearch && matchesAging;
    });

    const stats = {
        total: notes.length,
        bucket24to48: notes.filter(n => n.aging_bucket === '24-48h').length,
        bucket48to72: notes.filter(n => n.aging_bucket === '48-72h').length,
        bucket72plus: notes.filter(n => n.aging_bucket === '72h+').length,
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div ref={containerRef} className="space-y-6">
                {/* Header */}
                <div className="report-section flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-display font-bold">Incomplete Notes Report</h1>
                            <p className="text-muted-foreground">
                                View incomplete clinical documentation after 24-hour grace period
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={fetchIncompleteNotes} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="report-section grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Incomplete</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.bucket24to48}</p>
                                <p className="text-sm text-muted-foreground">24-48 Hours</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.bucket48to72}</p>
                                <p className="text-sm text-muted-foreground">48-72 Hours</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.bucket72plus}</p>
                                <p className="text-sm text-muted-foreground">72+ Hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="report-section glass-card rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by provider or patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Tabs value={agingFilter} onValueChange={setAgingFilter}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="24-48h">24-48h</TabsTrigger>
                                <TabsTrigger value="48-72h">48-72h</TabsTrigger>
                                <TabsTrigger value="72h+">72h+</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Notes Table */}
                <div className="report-section glass-card rounded-xl overflow-hidden">
                    {filteredNotes.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Incomplete Notes</h3>
                            <p className="text-muted-foreground">
                                All clinical notes are up to date. Great work!
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Encounter Date</TableHead>
                                    <TableHead>Note Status</TableHead>
                                    <TableHead>Aging</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotes.map((note) => (
                                    <TableRow key={note.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{note.provider_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{note.patient_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {format(new Date(note.appointment_date), 'MMM d, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(note.status)}</TableCell>
                                        <TableCell>{getAgingBadge(note.aging_bucket)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Notice */}
                <div className="report-section p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
                    <p>
                        <strong>Privacy Notice:</strong> This report shows completion status only.
                        Note content is not visible to employers. Providers see same-day reminders only.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
