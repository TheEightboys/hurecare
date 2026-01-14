import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  FlaskConical,
  ImageIcon,
  DollarSign,
  Clock,
  Activity,
  Award,
  Target,
  BarChart3,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function ProviderStatsPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | '30days'>('today');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      loadProviderStats();
    }
  }, [selectedProvider, dateRange]);

  const loadProviders = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, specialty, avatar_url')
        .in('role', ['provider', 'admin', 'super_admin'])
        .eq('account_status', 'approved')
        .order('full_name');
      
      setProviders(data || []);
      if (data && data.length > 0 && selectedProvider === 'all') {
        setSelectedProvider(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load providers' });
    }
  };

  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (dateRange) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      default:
        startDate = today;
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  };

  const loadProviderStats = async () => {
    if (!selectedProvider || selectedProvider === 'all') return;
    
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Get provider activity data
      const db = supabase as any;
      const { data: activityData } = await db
        .from('provider_activity')
        .select('*')
        .eq('provider_id', selectedProvider)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate);

      // Aggregate stats
      const aggregated = (activityData || []).reduce((acc: any, day: any) => ({
        patients_seen: acc.patients_seen + (day.patients_seen || 0),
        new_patients: acc.new_patients + (day.new_patients || 0),
        appointments_completed: acc.appointments_completed + (day.appointments_completed || 0),
        appointments_cancelled: acc.appointments_cancelled + (day.appointments_cancelled || 0),
        notes_created: acc.notes_created + (day.notes_created || 0),
        notes_signed: acc.notes_signed + (day.notes_signed || 0),
        revenue_generated: acc.revenue_generated + parseFloat(day.revenue_generated || 0),
        lab_orders: acc.lab_orders + (day.lab_orders || 0),
        imaging_orders: acc.imaging_orders + (day.imaging_orders || 0),
        total_session_minutes: acc.total_session_minutes + (day.total_session_minutes || 0),
      }), {
        patients_seen: 0,
        new_patients: 0,
        appointments_completed: 0,
        appointments_cancelled: 0,
        notes_created: 0,
        notes_signed: 0,
        revenue_generated: 0,
        lab_orders: 0,
        imaging_orders: 0,
        total_session_minutes: 0,
      });

      // Calculate averages
      const daysCount = activityData?.length || 1;
      aggregated.avg_patients_per_day = (aggregated.patients_seen / daysCount).toFixed(1);
      aggregated.avg_revenue_per_day = (aggregated.revenue_generated / daysCount).toFixed(2);
      
      // Calculate completion rate
      const totalAppointments = aggregated.appointments_completed + aggregated.appointments_cancelled;
      aggregated.completion_rate = totalAppointments > 0 
        ? ((aggregated.appointments_completed / totalAppointments) * 100).toFixed(1)
        : '0.0';

      // Calculate documentation rate
      aggregated.documentation_rate = aggregated.notes_created > 0
        ? ((aggregated.notes_signed / aggregated.notes_created) * 100).toFixed(1)
        : '0.0';

      setStats(aggregated);
    } catch (err) {
      console.error('Failed to load provider stats:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load statistics' });
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Provider Statistics</h1>
            <p className="text-muted-foreground">Track provider performance and activity metrics</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Provider</CardTitle>
            <CardDescription>Choose a provider to view their statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  variant={selectedProvider === provider.id ? 'default' : 'outline'}
                  className="justify-start h-auto p-3"
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {provider.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-sm">{provider.full_name}</p>
                      <p className="text-xs text-muted-foreground">{provider.specialty || 'General Practice'}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Dashboard */}
        {selectedProviderData && stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Patients Seen</p>
                      <p className="text-2xl font-bold">{stats.patients_seen}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: {stats.avg_patients_per_day}/day
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Appointments</p>
                      <p className="text-2xl font-bold">{stats.appointments_completed}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.completion_rate}% completion
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Notes Signed</p>
                      <p className="text-2xl font-bold">{stats.notes_signed}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.documentation_rate}% rate
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">Ksh {stats.revenue_generated.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: Ksh {stats.avg_revenue_per_day}/day
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Patient Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Total Patients Seen</span>
                    <Badge variant="secondary">{stats.patients_seen}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">New Patients</span>
                    <Badge variant="secondary">{stats.new_patients}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Follow-up Patients</span>
                    <Badge variant="secondary">{stats.patients_seen - stats.new_patients}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Average per Day</span>
                    <Badge variant="secondary">{stats.avg_patients_per_day}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Clinical Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Notes Created</span>
                    <Badge variant="secondary">{stats.notes_created}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Notes Signed</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.notes_signed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Pending Notes</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">{stats.notes_created - stats.notes_signed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Documentation Rate</span>
                    <Badge variant="secondary">{stats.documentation_rate}%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Investigation Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Investigation Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Lab Orders</span>
                    </div>
                    <Badge variant="secondary">{stats.lab_orders}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">Imaging Orders</span>
                    </div>
                    <Badge variant="secondary">{stats.imaging_orders}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Total Investigations</span>
                    <Badge variant="secondary">{stats.lab_orders + stats.imaging_orders}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Appointment Completion</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.completion_rate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Appointments Cancelled</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">{stats.appointments_cancelled}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Total Session Time</span>
                    <Badge variant="secondary">{Math.floor(stats.total_session_minutes / 60)}h {stats.total_session_minutes % 60}m</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Revenue Generated</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">Ksh {stats.revenue_generated.toLocaleString()}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading statistics...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
