import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useClinicalNotes } from '@/hooks/useSupabase';
import {
    Plus,
    Search,
    FileText,
    Mic,
    Edit3,
    Calendar,
    User,
    Clock,
    Filter,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function ClinicalNotesPage() {
    const navigate = useNavigate();
    const { getNotes, loading } = useClinicalNotes();
    const [notes, setNotes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const headerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotes();
    }, []);

    useEffect(() => {
        // GSAP animations
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.from('.note-card', {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.08,
                delay: 0.3,
                ease: 'power3.out',
            });
        });

        return () => ctx.revert();
    }, [notes]);

    const loadNotes = async () => {
        const data = await getNotes();
        setNotes(data);
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            note.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Clinical Notes</h1>
                        <p className="text-muted-foreground">SOAP notes with AI assistance</p>
                    </div>
                    <Button onClick={() => navigate('/clinical-notes/new')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Clinical Note
                    </Button>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-xl p-4">
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
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Notes</SelectItem>
                                <SelectItem value="DRAFT">Drafts</SelectItem>
                                <SelectItem value="SIGNED">Signed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Notes List */}
                <div ref={listRef} className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No clinical notes found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first clinical note to get started'}
                            </p>
                            <Button onClick={() => navigate('/clinical-notes/new')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Note
                            </Button>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <Link
                                key={note.id}
                                to={`/clinical-notes/${note.id}`}
                                className="note-card glass-card-hover rounded-xl p-5 block"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Patient & Source */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    {note.patients?.first_name} {note.patients?.last_name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDateTime(note.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {note.subjective && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ml-13">
                                                {note.subjective.substring(0, 150)}...
                                            </p>
                                        )}

                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-2 ml-13">
                                            {/* Status */}
                                            <Badge
                                                variant={note.status === 'SIGNED' ? 'default' : 'secondary'}
                                                className={note.status === 'SIGNED' ? 'badge-signed' : 'badge-draft'}
                                            >
                                                {note.status === 'SIGNED' ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Signed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit3 className="w-3 h-3 mr-1" />
                                                        Draft
                                                    </>
                                                )}
                                            </Badge>

                                            {/* Source Type */}
                                            <Badge variant="outline" className="gap-1">
                                                {note.source_type === 'AUDIO' ? (
                                                    <>
                                                        <Mic className="w-3 h-3" />
                                                        Audio
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit3 className="w-3 h-3" />
                                                        Text
                                                    </>
                                                )}
                                            </Badge>

                                            {/* Transcript Review Warning */}
                                            {note.source_type === 'AUDIO' && !note.transcript_reviewed && (
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Transcript not reviewed
                                                </Badge>
                                            )}

                                            {/* ICD-10 Codes */}
                                            {note.icd10_codes && (note.icd10_codes as any[]).length > 0 && (
                                                <Badge variant="outline">
                                                    {(note.icd10_codes as any[]).length} ICD-10 codes
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Appointment info if linked */}
                                    {note.appointments && (
                                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{note.appointments.appointment_date}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
