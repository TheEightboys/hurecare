import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AppointmentCard } from '@/components/ui/appointment-card';
import { PatientSearch } from '@/components/appointments/PatientSearch';
import { IntakeFormButton } from '@/components/appointments/IntakeFormButton';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppointments, usePatients } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    Calendar as CalendarIcon,
    List,
    Grid,
    Filter,
    Clock,
    Users,
    CheckCircle2
} from 'lucide-react';
import { format, addDays, isToday, isTomorrow, startOfDay } from 'date-fns';

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getAppointments, createAppointment, updateAppointmentStatus, updateConfirmation, loading } = useAppointments();
    const { getPatients, createPatient } = usePatients();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewDialog, setShowNewDialog] = useState(false);

    // New appointment form
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [newDate, setNewDate] = useState<Date>(new Date());
    const [newTime, setNewTime] = useState('09:00');
    const [newDuration, setNewDuration] = useState('30');
    const [newReason, setNewReason] = useState('');
    const [creating, setCreating] = useState(false);
    const [newlyCreatedAppointment, setNewlyCreatedAppointment] = useState<any | null>(null);

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [selectedDate]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.from('.appointment-item', {
                opacity: 0,
                y: 20,
                duration: 0.4,
                stagger: 0.06,
                delay: 0.2,
                ease: 'power3.out',
            });
        });

        return () => ctx.revert();
    }, [appointments]);

    const loadData = async () => {
        const patientsData = await getPatients();
        setPatients(patientsData);
        await loadAppointments();
    };

    const loadAppointments = async () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const data = await getAppointments({ date: dateStr });
        setAppointments(data);
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateAppointmentStatus(id, status);
            toast({ title: 'Status updated', description: `Appointment marked as ${status}` });
            loadAppointments();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update status' });
        }
    };

    const handleConfirmationChange = async (id: string, indicator: string) => {
        try {
            await updateConfirmation(id, indicator as 'C' | 'NC' | 'LM');
            toast({ title: 'Confirmation updated' });
            loadAppointments();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update confirmation' });
        }
    };

    const handleCreateAppointment = async () => {
        if (!selectedPatient || !newReason) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please select a patient and enter reason for visit' });
            return;
        }

        setCreating(true);
        try {
            const appointment = await createAppointment({
                patient_id: selectedPatient.id,
                appointment_date: format(newDate, 'yyyy-MM-dd'),
                appointment_time: newTime,
                duration_minutes: parseInt(newDuration),
                reason_for_visit: newReason,
            });

            setNewlyCreatedAppointment(appointment);
            toast({ title: 'Appointment created successfully' });

            // Don't close dialog yet - show intake form option
            resetForm();
            loadAppointments();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create appointment' });
        } finally {
            setCreating(false);
        }
    };

    const handleCreatePatient = async (data: { first_name: string, last_name: string, phone: string, date_of_birth?: string }) => {
        try {
            const patient = await createPatient(data);
            setSelectedPatient(patient);
            toast({ title: 'Patient created successfully' });
            // Reload patients list
            const patientsData = await getPatients();
            setPatients(patientsData);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not create patient' });
            throw error;
        }
    };

    const resetForm = () => {
        setSelectedPatient(null);
        setNewDate(new Date());
        setNewTime('09:00');
        setNewDuration('30');
        setNewReason('');
        setNewlyCreatedAppointment(null);
    };

    const filteredAppointments = appointments.filter(apt => {
        const patientName = `${apt.patients?.first_name || ''} ${apt.patients?.last_name || ''}`.toLowerCase();
        const matchesSearch = patientName.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'EEEE, MMMM d');
    };

    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
        inSession: appointments.filter(a => a.status === 'IN_SESSION').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Appointments</h1>
                        <p className="text-muted-foreground">{getDateLabel(selectedDate)}</p>
                    </div>

                    <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                New Appointment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Schedule Appointment</DialogTitle>
                                <DialogDescription>
                                    {newlyCreatedAppointment
                                        ? 'Appointment created successfully! Send intake forms to the patient.'
                                        : 'Search for an existing patient or create a new one.'}
                                </DialogDescription>
                            </DialogHeader>

                            {!newlyCreatedAppointment ? (
                                <div className="space-y-4 py-4">
                                    {/* Patient Search/Create */}
                                    <PatientSearch
                                        onSelectPatient={setSelectedPatient}
                                        onCreatePatient={handleCreatePatient}
                                        selectedPatient={selectedPatient}
                                    />

                                    {selectedPatient && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={format(newDate, 'yyyy-MM-dd')}
                                                        onChange={(e) => setNewDate(new Date(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Time *</Label>
                                                    <Input
                                                        type="time"
                                                        value={newTime}
                                                        onChange={(e) => setNewTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Duration (minutes)</Label>
                                                <Select value={newDuration} onValueChange={setNewDuration}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 minutes</SelectItem>
                                                        <SelectItem value="30">30 minutes</SelectItem>
                                                        <SelectItem value="45">45 minutes</SelectItem>
                                                        <SelectItem value="60">60 minutes</SelectItem>
                                                        <SelectItem value="90">90 minutes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Reason for Visit *</Label>
                                                <Textarea
                                                    value={newReason}
                                                    onChange={(e) => setNewReason(e.target.value)}
                                                    placeholder="Brief description of the visit reason"
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Booking Type Preview */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Booking type:</span>
                                                <Badge className={
                                                    startOfDay(newDate).getTime() === startOfDay(new Date()).getTime()
                                                        ? 'badge-same-day'
                                                        : 'badge-advance'
                                                }>
                                                    {startOfDay(newDate).getTime() === startOfDay(new Date()).getTime() ? 'SD' : 'ADV'}
                                                </Badge>
                                                <span className="text-muted-foreground text-xs">
                                                    ({startOfDay(newDate).getTime() === startOfDay(new Date()).getTime() ? 'Same Day' : 'Advance'} booking)
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Success State - Show Intake Form Option */
                                <div className="py-6 space-y-4">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 text-success" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Appointment Booked!</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPatient?.first_name} {selectedPatient?.last_name} • {format(newDate, 'MMM d, yyyy')} at {newTime}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Send intake forms to collect patient demographics and insurance information
                                        </p>
                                        <IntakeFormButton
                                            patientId={selectedPatient?.id}
                                            appointmentId={newlyCreatedAppointment.id}
                                            patientPhone={selectedPatient?.phone}
                                        />
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                {!newlyCreatedAppointment ? (
                                    <>
                                        <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                                        <Button
                                            onClick={handleCreateAppointment}
                                            disabled={creating || !selectedPatient || !newReason}
                                        >
                                            {creating ? 'Creating...' : 'Create Appointment'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => {
                                        setShowNewDialog(false);
                                        resetForm();
                                    }} className="w-full">
                                        Done
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.scheduled}</p>
                                <p className="text-xs text-muted-foreground">Scheduled</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.inSession}</p>
                                <p className="text-xs text-muted-foreground">In Session</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                <SelectItem value="IN_SESSION">In Session</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex border rounded-lg overflow-hidden">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('calendar')}
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[-1, 0, 1, 2, 3, 4, 5].map((offset) => {
                        const date = addDays(new Date(), offset);
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <Button
                                key={offset}
                                variant={isSelected ? 'default' : 'outline'}
                                className="flex-shrink-0"
                                onClick={() => setSelectedDate(date)}
                            >
                                <div className="text-center">
                                    <div className="text-xs">{format(date, 'EEE')}</div>
                                    <div className="text-lg font-bold">{format(date, 'd')}</div>
                                </div>
                            </Button>
                        );
                    })}
                </div>

                {/* Appointments List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No appointments</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No appointments match your filters'
                                    : `No appointments scheduled for ${getDateLabel(selectedDate)}`}
                            </p>
                            <Button onClick={() => setShowNewDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule Appointment
                            </Button>
                        </div>
                    ) : (
                        filteredAppointments.map((apt, index) => (
                            <div key={apt.id} className="appointment-item">
                                <AppointmentCard
                                    id={apt.id}
                                    patientName={`${apt.patients?.first_name || ''} ${apt.patients?.last_name || ''}`}
                                    time={apt.appointment_time?.substring(0, 5) || ''}
                                    duration={apt.duration_minutes || 30}
                                    status={apt.status || 'SCHEDULED'}
                                    bookingType={apt.booking_type}
                                    confirmationIndicator={apt.confirmation_indicator || 'NC'}
                                    reason={apt.reason_for_visit}
                                    delay={index * 0.05}
                                    onStatusChange={handleStatusChange}
                                    onConfirmationChange={handleConfirmationChange}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
