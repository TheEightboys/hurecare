import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { AppointmentCard } from '@/components/ui/appointment-card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { Users, Calendar, FileText, CreditCard, Plus, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useAppointments, useClinicalNotes } from '@/hooks/useSupabase';
import { useRealtimeAppointments } from '@/hooks/useRealtime';
import { IncompleteNotesAlert } from '@/components/dashboard/IncompleteNotesAlert';

export default function Dashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { getStats } = useDashboardStats();
  const { getTodayAppointments, updateAppointmentStatus, updateConfirmation } = useAppointments();
  const { getIncompleteNotes } = useClinicalNotes();

  const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, pendingNotes: 0, todayRevenue: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [incompleteNotes, setIncompleteNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time appointment updates
  const handleRealtimeUpdate = useCallback(() => {
    // Silently refresh on real-time updates
    loadDashboardData(true);
  }, []);

  useRealtimeAppointments({
    onInsert: handleRealtimeUpdate,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeUpdate,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
        gsap.from('.stat-card-item', { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
        gsap.from('.schedule-section', { opacity: 0, x: -20, duration: 0.6, delay: 0.4, ease: 'power3.out' });
        gsap.from('.actions-section', { opacity: 0, x: 20, duration: 0.6, delay: 0.5, ease: 'power3.out' });
      });
      return () => ctx.revert();
    }
  }, [loading]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [statsData, appointmentsData, notesData] = await Promise.all([
        getStats(),
        getTodayAppointments(),
        getIncompleteNotes('', false),
      ]);
      setStats(statsData);
      setAppointments(appointmentsData || []);
      setIncompleteNotes(notesData || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status);
    loadDashboardData();
  };

  const handleConfirmationChange = async (id: string, indicator: string) => {
    await updateConfirmation(id, indicator as 'C' | 'NC' | 'LM');
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">{getGreeting()}, Doctor</h1>
            <p className="text-muted-foreground">Here's what's happening today</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => loadDashboardData()} 
              disabled={refreshing}
              className="relative"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
            <Button variant="outline" asChild><Link to="/patients/new"><Plus className="w-4 h-4 mr-2" />New Patient</Link></Button>
            <Button asChild><Link to="/appointments"><Calendar className="w-4 h-4 mr-2" />Schedule</Link></Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card-item h-full">
            <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} variant="primary" delay={0.1} />
          </div>
          <div className="stat-card-item h-full">
            <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="success" delay={0.2} />
          </div>
          <div className="stat-card-item h-full">
            <StatCard title="Pending Notes" value={stats.pendingNotes} icon={FileText} variant="warning" delay={0.3} />
          </div>
          <div className="stat-card-item h-full">
            <StatCard title="Revenue (Today)" value={`KES ${stats.todayRevenue.toLocaleString()}`} icon={CreditCard} variant="default" delay={0.4} />
          </div>
        </div>

        {/* Incomplete Notes Alert */}
        {incompleteNotes.length > 0 && (
          <IncompleteNotesAlert notes={incompleteNotes} />
        )}

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 schedule-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Today's Schedule</h2>
              <Button variant="ghost" size="sm" asChild><Link to="/appointments" className="flex items-center gap-1">View All<ArrowRight className="w-4 h-4" /></Link></Button>
            </div>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/appointments">Schedule Appointment</Link>
                  </Button>
                </div>
              ) : (
                appointments.slice(0, 5).map((apt, index) => (
                  <AppointmentCard
                    key={apt.id}
                    id={apt.id}
                    patientName={`${apt.patients?.first_name || ''} ${apt.patients?.last_name || ''}`}
                    time={apt.appointment_time?.substring(0, 5) || ''}
                    duration={apt.duration_minutes || 30}
                    status={apt.status || 'SCHEDULED'}
                    bookingType={apt.booking_type}
                    confirmationIndicator={apt.confirmation_indicator || 'NC'}
                    reason={apt.reason_for_visit}
                    delay={0.1 * index}
                    onStatusChange={handleStatusChange}
                    onConfirmationChange={handleConfirmationChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 actions-section">
            <h2 className="text-lg font-display font-semibold">Quick Actions</h2>
            <div className="glass-card rounded-xl p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild><Link to="/clinical-notes/new"><FileText className="w-4 h-4 mr-2" />New Clinical Note</Link></Button>
              <Button variant="outline" className="w-full justify-start" asChild><Link to="/referral-notes/new"><FileText className="w-4 h-4 mr-2" />New Referral Note</Link></Button>
              <Button variant="outline" className="w-full justify-start" asChild><Link to="/intake-forms"><Plus className="w-4 h-4 mr-2" />Send Intake Form</Link></Button>
              <Button variant="outline" className="w-full justify-start" asChild><Link to="/billing"><CreditCard className="w-4 h-4 mr-2" />Create Invoice</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
