import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
import {
    Plus,
    Search,
    Calendar as CalendarIcon,
    List,
    Grid,
    Filter,
    Clock,
    Users,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    UserPlus,
} from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, startOfDay } from 'date-fns';

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getAppointments, createAppointment, updateAppointmentStatus, updateConfirmation, loading } = useAppointments();
    const { getPatients, createPatient } = usePatients();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'schedule' | 'list'>('schedule');
    const [doctorFilter, setDoctorFilter] = useState<'on-duty' | 'all'>('on-duty');
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
        loadProviders();
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

    const loadProviders = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role, specialty')
                .in('role', ['provider', 'admin', 'super_admin'])
                .eq('account_status', 'approved');
            setProviders(data || []);
        } catch (err) {
            console.error('Failed to load providers:', err);
        }
    };

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

    // Time slots for schedule view
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    // Get appointments for a specific provider
    const getProviderAppointments = (providerId: string) => {
        return appointments.filter(apt => apt.provider_id === providerId);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Schedule / Calendar</h1>
                    </div>

                    <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="w-4 h-4" />
                                Add Patient
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

                {/* Schedule View Card */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {/* Date Navigation */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <span className="font-semibold text-lg">
                                    {format(selectedDate, 'EEE, MMM d, yyyy')}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Doctor Filter Toggle */}
                                <div className="flex bg-muted rounded-lg p-1">
                                    <Button
                                        variant={doctorFilter === 'on-duty' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-8 px-4"
                                        onClick={() => setDoctorFilter('on-duty')}
                                    >
                                        On Duty Doctor
                                    </Button>
                                    <Button
                                        variant={doctorFilter === 'all' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-8 px-4"
                                        onClick={() => setDoctorFilter('all')}
                                    >
                                        All Doctors
                                    </Button>
                                </div>
                                
                                {/* Provider Dropdown */}
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Doctors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Doctors</SelectItem>
                                        {providers.map(provider => (
                                            <SelectItem key={provider.id} value={provider.id}>
                                                {provider.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left p-3 font-semibold text-sm border-r min-w-[80px]">Time</th>
                                        {providers.slice(0, 5).map(provider => (
                                            <th key={provider.id} className="text-left p-3 font-semibold text-sm border-r min-w-[150px]">
                                                {provider.full_name || 'Unknown'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.slice(8, 18).map((time, index) => (
                                        <tr key={time} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                            <td className="p-3 text-sm text-muted-foreground border-r font-medium">
                                                {time}
                                            </td>
                                            {providers.slice(0, 5).map(provider => {
                                                const providerAppts = getProviderAppointments(provider.id);
                                                const aptAtTime = providerAppts.find(apt => 
                                                    apt.appointment_time?.substring(0, 5) === time
                                                );
                                                return (
                                                    <td key={provider.id} className="p-2 border-r min-h-[60px]">
                                                        {aptAtTime ? (
                                                            <div 
                                                                className="p-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                                                                onClick={() => navigate(`/appointments/${aptAtTime.id}`)}
                                                            >
                                                                <p className="font-medium text-sm truncate">
                                                                    {aptAtTime.patients?.first_name} {aptAtTime.patients?.last_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {aptAtTime.reason_for_visit || 'Consultation'}
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Empty state if no providers */}
                        {providers.length === 0 && (
                            <div className="p-12 text-center">
                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Providers Found</h3>
                                <p className="text-muted-foreground">No doctors or providers have been set up yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* List View (alternative) */}
                {viewMode === 'list' && appointments.length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Appointments ({appointments.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filteredAppointments.map((apt, index) => (
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
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
