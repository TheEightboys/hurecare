import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { AppointmentCard } from '@/components/ui/appointment-card';
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  ArrowRight,
  RefreshCw,
  UserPlus,
  CalendarPlus,
  Building2,
  Receipt,
  Activity,
  TrendingUp,
  ClipboardList,
  Stethoscope,
  FlaskConical,
  ImageIcon,
  UserCheck,
  Clock,
  FileCheck,
  CheckCircle2,
  DollarSign,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Dashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { getStats } = useDashboardStats();
  const { getTodayAppointments, updateAppointmentStatus, updateConfirmation } = useAppointments();
  const { getIncompleteNotes } = useClinicalNotes();

  const [stats, setStats] = useState({ 
    todayAppointments: 0, 
    totalPatients: 0, 
    pendingNotes: 0, 
    todayRevenue: 0,
    activeProviders: 0,
    openInvoices: 0,
    newPatientsToday: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalClaimsValue: 0,
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [incompleteNotes, setIncompleteNotes] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [outstandingBalances, setOutstandingBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialPeriod, setFinancialPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // User profile state for personalized greeting and role-based features
  const [doctorName, setDoctorName] = useState<string>('Doctor');
  const [userRole, setUserRole] = useState<string>('provider');
  const [facilityName, setFacilityName] = useState<string>('HURE Care');

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
    loadProviders();
    loadFinancialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
        gsap.from('.stat-card-item', { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
        gsap.from('.section-card', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
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
          const nameParts = profile.full_name.trim().split(' ');
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
          setDoctorName(`Dr. ${lastName}`);
        }
        if (profile?.role) {
          setUserRole(profile.role);
        }
        if (profile?.facility_name) {
          setFacilityName(profile.facility_name);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadProviders = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, specialty')
        .in('role', ['provider', 'admin', 'super_admin'])
        .eq('account_status', 'approved')
        .limit(5);
      
      // Get provider activity stats for today
      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const db = supabase as any;
        const providersWithStats = await Promise.all(
          data.map(async (provider) => {
            // Get today's activity
            const { data: activity } = await db
              .from('provider_activity')
              .select('*')
              .eq('provider_id', provider.id)
              .eq('activity_date', today)
              .single();
            
            // Get total patients handled (all time)
            const { count: totalPatients } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('provider_id', provider.id)
              .eq('status', 'COMPLETED');
            
            return { 
              ...provider, 
              patientCount: totalPatients || 0,
              todayStats: activity || {
                patients_seen: 0,
                appointments_completed: 0,
                notes_signed: 0,
                lab_orders: 0,
                imaging_orders: 0,
              }
            };
          })
        );
        setProviders(providersWithStats);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadFinancialData = async () => {
    try {
      // Load recent payments (PAID status)
      const { data: payments } = await supabase
        .from('billing')
        .select('id, patient_id, total')
        .eq('status', 'PAID')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentPayments((payments || []) as any);

      // Load outstanding balances (PENDING or PARTIAL status)
      const { data: outstanding } = await supabase
        .from('billing')
        .select('id, patient_id, balance')
        .in('status', ['PENDING', 'PARTIAL'])
        .order('created_at', { ascending: false })
        .limit(5);
      
      setOutstandingBalances((outstanding || []) as any);
    } catch (err) {
      console.error('Failed to load financial data:', err);
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

      // Get additional stats
      const { count: activeProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['provider', 'admin', 'super_admin'])
        .eq('account_status', 'approved');

      const { count: openInvoicesCount } = await supabase
        .from('billing')
        .select('*', { count: 'exact', head: true })
        .in('status', ['PENDING', 'PARTIAL']);

      const today = new Date().toISOString().split('T')[0];
      const { count: newPatientsToday } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // Get insurance claims stats
      const { count: pendingClaims } = await supabase
        .from('insurance_claims')
        .select('*', { count: 'exact', head: true })
        .in('status', ['DRAFT', 'READY', 'SUBMITTED_MANUAL']);

      const { count: approvedClaims } = await supabase
        .from('insurance_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PAID');

      const { data: claimsData } = await supabase
        .from('insurance_claims')
        .select('total_amount')
        .in('status', ['SUBMITTED_MANUAL', 'READY', 'PAID']);

      const totalClaimsValue = (claimsData || []).reduce((sum, claim) => sum + (parseFloat(claim.total_amount as any) || 0), 0);

      setStats({
        ...statsData,
        activeProviders: activeProviders || 0,
        openInvoices: openInvoicesCount || 0,
        newPatientsToday: newPatientsToday || 0,
        pendingClaims: pendingClaims || 0,
        approvedClaims: approvedClaims || 0,
        totalClaimsValue: totalClaimsValue,
      });
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
        <div className="space-y-6">
          {/* Header with Facility Badge */}
          <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                {facilityName}
              </Badge>
              <div>
                <h1 className="text-xl font-display font-bold">{getGreeting()}, {doctorName}</h1>
              </div>
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
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/patients/new">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Patient
                </Link>
              </Button>
            </div>
          </div>

          {/* Facility Snapshot */}
          <Card className="section-card border-0 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="w-5 h-5 text-primary" />
                Facility Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today's Visits */}
                <div className="stat-card-item flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Visits</p>
                    <p className="text-2xl font-bold text-foreground">{stats.todayAppointments}</p>
                  </div>
                </div>

                {/* Active Providers */}
                <div className="stat-card-item flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Providers</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeProviders}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{providers.length} Currently logged in</p>
                  </div>
                </div>

                {/* Open Invoices */}
                <div className="stat-card-item flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Invoices</p>
                    <p className="text-2xl font-bold text-foreground">Ksh {stats.openInvoices.toLocaleString()}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{outstandingBalances.length} pending bills</p>
                  </div>
                </div>

                {/* Today's New Patients */}
                <div className="stat-card-item flex items-center gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's New Patient</p>
                    <p className="text-2xl font-bold text-foreground">{stats.newPatientsToday}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Claims Overview */}
          {isOwner && (
            <Card className="section-card border-0 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Insurance Claims Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pending Claims */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pendingClaims}</p>
                      <p className="text-xs text-amber-600">Awaiting approval</p>
                    </div>
                  </div>

                  {/* Approved Claims */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">{stats.approvedClaims}</p>
                      <p className="text-xs text-green-600">Ready for payment</p>
                    </div>
                  </div>

                  {/* Total Claims Value */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-xl font-bold">Ksh {stats.totalClaimsValue.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">In process</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/claims">
                      View All Claims
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Overview */}
          {isOwner && (
            <Card className="section-card border-0 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Financial Overview
                  </CardTitle>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    <Button 
                      variant={financialPeriod === 'daily' ? 'default' : 'ghost'} 
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setFinancialPeriod('daily')}
                    >
                      Daily
                    </Button>
                    <Button 
                      variant={financialPeriod === 'weekly' ? 'default' : 'ghost'} 
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setFinancialPeriod('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant={financialPeriod === 'monthly' ? 'default' : 'ghost'} 
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setFinancialPeriod('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Summary */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Revenue Summary</h4>
                    <p className="text-2xl font-bold text-foreground">Ksh {stats.todayRevenue.toLocaleString()}</p>
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
                        <span>Patient</span>
                        <span>Invoice No.</span>
                        <span className="text-right">Amount</span>
                      </div>
                      {recentPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No payments today</p>
                      ) : (
                        recentPayments.slice(0, 3).map((payment) => (
                          <div key={payment.id} className="grid grid-cols-3 text-sm py-1">
                            <span className="truncate">{payment.patients?.first_name}</span>
                            <span className="text-muted-foreground">{payment.invoice_number}</span>
                            <span className="text-right font-medium">Ksh {payment.total_amount?.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Payment Methods</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cash</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">M-Pesa</span>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Insurance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outstanding Balances */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Outstanding Balances</h4>
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
                        <span>Patient</span>
                        <span>Invoice No.</span>
                        <span className="text-right">Amount</span>
                      </div>
                      {outstandingBalances.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No outstanding balances</p>
                      ) : (
                        outstandingBalances.slice(0, 3).map((balance) => (
                          <div key={balance.id} className="grid grid-cols-3 text-sm py-1">
                            <span className="truncate">{balance.patients?.first_name}</span>
                            <span className="text-muted-foreground">{balance.invoice_number}</span>
                            <span className="text-right font-medium text-amber-600">Ksh {balance.total_amount?.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staff Oversight */}
          <Card className="section-card border-0 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="w-5 h-5 text-primary" />
                Staff Oversight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Activity */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Provider Activity (Today)</h4>
                  <div className="space-y-3">
                    {providers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No providers found</p>
                    ) : (
                      providers.map((provider) => (
                        <div key={provider.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                  {provider.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{provider.full_name || 'Unknown Provider'}</p>
                                <p className="text-xs text-muted-foreground">{provider.specialty || 'General Practice'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {provider.patientCount} Total
                            </Badge>
                          </div>
                          
                          {/* Today's Stats */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="flex items-center gap-1.5 text-xs">
                              <UserCheck className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-muted-foreground">Seen:</span>
                              <span className="font-medium">{provider.todayStats?.patients_seen || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-muted-foreground">Signed:</span>
                              <span className="font-medium">{provider.todayStats?.notes_signed || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-muted-foreground">Lab:</span>
                              <span className="font-medium">{provider.todayStats?.lab_orders || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-muted-foreground">Imaging:</span>
                              <span className="font-medium">{provider.todayStats?.imaging_orders || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incomplete Notes Alert */}
          {incompleteNotes.length > 0 && (
            <IncompleteNotesAlert notes={incompleteNotes} />
          )}

          {/* Today's Schedule and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 schedule-section">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="w-5 h-5 text-primary" />
                      Today's Schedule
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/appointments" className="flex items-center gap-1">
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No appointments scheduled for today</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                          Get started by adding a patient or scheduling an appointment
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button variant="outline" asChild>
                            <Link to="/patients/new">
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Patient
                            </Link>
                          </Button>
                          <Button className="bg-primary hover:bg-primary/90" asChild>
                            <Link to="/appointments">
                              <CalendarPlus className="w-4 h-4 mr-2" />
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
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="actions-section">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/appointments">
                          <Calendar className="w-4 h-4 mr-3" />
                          View Schedule
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
                          <Users className="w-4 h-4 mr-3" />
                          Patient Records
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Search and manage patients</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/clinical-notes">
                          <FileText className="w-4 h-4 mr-3" />
                          Clinical Notes
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>View and create clinical notes</p>
                    </TooltipContent>
                  </Tooltip>

                  {isOwner && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/billing">
                            <CreditCard className="w-4 h-4 mr-3" />
                            Create Invoice
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Generate a new invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/intake-forms">
                          <ClipboardList className="w-4 h-4 mr-3" />
                          Intake Forms
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>View patient intake forms</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
}
