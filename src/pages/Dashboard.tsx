import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { AppointmentCard } from '@/components/ui/appointment-card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  Plus,
  ArrowRight,
  RefreshCw,
  UserPlus,
  CalendarPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useAppointments, useClinicalNotes } from '@/hooks/useSupabase';
import { useRealtimeAppointments } from '@/hooks/useRealtime';
import { IncompleteNotesAlert } from '@/components/dashboard/IncompleteNotesAlert';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/storageService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // User profile state for personalized greeting and role-based features
  const [doctorName, setDoctorName] = useState<string>('Doctor');
  const [userRole, setUserRole] = useState<string>('provider');

  // Real-time appointment updates
  const handleRealtimeUpdate = useCallback(() => {
    loadDashboardData(true);
  }, []);

  useRealtimeAppointments({
    onInsert: handleRealtimeUpdate,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeUpdate,
  });

  useEffect(() => {
    loadUserProfile();
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

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile?.full_name) {
          // Extract last name for "Dr. LastName" format
          const nameParts = profile.full_name.trim().split(' ');
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
          setDoctorName(`Dr. ${lastName}`);
        }
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

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

  // Get contextual subtitle based on today's schedule
  const getContextMessage = () => {
    if (appointments.length === 0) {
      return "No appointments scheduled for today";
    } else if (appointments.length === 1) {
      return "1 patient appointment today";
    } else {
      return `${appointments.length} patient appointments today`;
    }
  };

  // Check if user is an owner (admin role) for revenue visibility
  const isOwner = userRole === 'admin' || userRole === 'super_admin';

  if (loading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="space-y-8">
          {/* Header */}
          <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">{getGreeting()}, {doctorName}</h1>
              <p className="text-muted-foreground">{getContextMessage()}</p>
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild>
                    <Link to="/patients/new">
                      <UserPlus className="w-4 h-4 mr-2" />
                      New Patient
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new patient to your practice</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90" asChild>
                    <Link to="/appointments">
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Schedule
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Book a new appointment</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isOwner ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
            <div className="stat-card-item h-full">
              <StatCard
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={Calendar}
                variant="primary"
                delay={0.1}
                emptyStateMessage="No appointments today"
              />
            </div>
            <div className="stat-card-item h-full">
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={Users}
                variant="success"
                delay={0.2}
                emptyStateMessage="No patients added yet"
              />
            </div>
            <div className="stat-card-item h-full">
              <StatCard
                title="Pending Notes"
                value={stats.pendingNotes}
                icon={FileText}
                variant="warning"
                delay={0.3}
                emptyStateMessage="You're all caught up 🎉"
              />
            </div>

            {/* Revenue card - only visible to owners/admins */}
            {isOwner && (
              <div className="stat-card-item h-full">
                <StatCard
                  title="Revenue (Today)"
                  value={`KES ${stats.todayRevenue.toLocaleString()}`}
                  icon={CreditCard}
                  variant="default"
                  delay={0.4}
                  hideable={true}
                />
              </div>
            )}
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
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/appointments" className="flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No appointments scheduled for today</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Get started by adding a patient or scheduling an appointment
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/appointments" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          View Calendar
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/patients/new" className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Add Patient
                        </Link>
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90" asChild>
                        <Link to="/appointments" className="flex items-center gap-2">
                          <CalendarPlus className="w-4 h-4" />
                          Schedule Appointment
                        </Link>
                      </Button>
                    </div>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/appointments">
                        <Calendar className="w-4 h-4 mr-2" />
                        Today's Appointments
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>View and manage today's schedule</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/patients">
                        <Users className="w-4 h-4 mr-2" />
                        Patient Records
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Search and manage patients</p>
                  </TooltipContent>
                </Tooltip>

                {/* Only show billing for owners */}
                {isOwner && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/billing">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Create Invoice
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Generate a new invoice</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
}
