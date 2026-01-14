import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Award,
  Target,
  Activity,
  Clock,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function TeamStatsPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | '30days'>('week');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadCurrentUser();
    loadTeamStats();
  }, [dateRange]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
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
        startDate = startOfWeek(today);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  };

  const loadTeamStats = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Get all active providers
      const { data: providersData } = await supabase
        .from('profiles')
        .select('id, full_name, role, specialty, avatar_url')
        .in('role', ['provider', 'admin', 'super_admin'])
        .eq('account_status', 'approved')
        .order('full_name');

      if (!providersData) return;

      // Get activity stats for each provider
      const db = supabase as any;
      const providersWithStats = await Promise.all(
        providersData.map(async (provider) => {
          // Get activity data for date range
          const { data: activityData } = await db
            .from('provider_activity')
            .select('*')
            .eq('provider_id', provider.id)
            .gte('activity_date', startDate)
            .lte('activity_date', endDate);

          // Aggregate stats
          const stats = (activityData || []).reduce((acc: any, day: any) => ({
            patients_seen: acc.patients_seen + (day.patients_seen || 0),
            new_patients: acc.new_patients + (day.new_patients || 0),
            appointments_completed: acc.appointments_completed + (day.appointments_completed || 0),
            notes_signed: acc.notes_signed + (day.notes_signed || 0),
            lab_orders: acc.lab_orders + (day.lab_orders || 0),
            imaging_orders: acc.imaging_orders + (day.imaging_orders || 0),
            revenue_generated: acc.revenue_generated + parseFloat(day.revenue_generated || 0),
          }), {
            patients_seen: 0,
            new_patients: 0,
            appointments_completed: 0,
            notes_signed: 0,
            lab_orders: 0,
            imaging_orders: 0,
            revenue_generated: 0,
          });

          return { ...provider, stats };
        })
      );

      // Sort by patients seen (descending)
      providersWithStats.sort((a, b) => b.stats.patients_seen - a.stats.patients_seen);
      setProviders(providersWithStats);
    } catch (err) {
      console.error('Failed to load team stats:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load team statistics' });
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🏆 #1</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">🥈 #2</Badge>;
    if (index === 2) return <Badge className="bg-amber-600">🥉 #3</Badge>;
    return <Badge variant="outline">#{index + 1}</Badge>;
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case '30days': return 'Last 30 Days';
      default: return 'This Week';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Team Performance</h1>
            <p className="text-muted-foreground">View and compare team member statistics</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[160px]">
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

        {/* Leaderboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.slice(0, 3).map((provider, index) => (
            <Card key={provider.id} className={index === 0 ? 'border-yellow-500 border-2' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className={`text-lg font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {provider.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getRankBadge(index)}
                      {provider.id === currentUserId && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="font-semibold">{provider.full_name}</p>
                    <p className="text-sm text-muted-foreground">{provider.specialty || 'General Practice'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{provider.stats.patients_seen}</p>
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-green-600">{provider.stats.notes_signed}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics - {getDateRangeLabel()}</CardTitle>
            <CardDescription>Comprehensive performance metrics for all team members</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-center">Patients</TableHead>
                    <TableHead className="text-center">New</TableHead>
                    <TableHead className="text-center">Appointments</TableHead>
                    <TableHead className="text-center">Notes Signed</TableHead>
                    <TableHead className="text-center">Lab Orders</TableHead>
                    <TableHead className="text-center">Imaging</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider, index) => (
                    <TableRow key={provider.id} className={provider.id === currentUserId ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankBadge(index)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {provider.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {provider.full_name}
                              {provider.id === currentUserId && (
                                <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{provider.specialty || 'General Practice'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {provider.stats.patients_seen}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{provider.stats.new_patients}</span>
                      </TableCell>
                      <TableCell className="text-center">{provider.stats.appointments_completed}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-blue-600 font-medium">{provider.stats.notes_signed}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                          <span>{provider.stats.lab_orders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>{provider.stats.imaging_orders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Ksh {provider.stats.revenue_generated.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Most Patients Seen</p>
                {providers.slice(0, 3).map((provider, index) => (
                  <div key={provider.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      <span className="text-sm">{provider.full_name}</span>
                    </div>
                    <Badge variant="secondary">{provider.stats.patients_seen} patients</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Team Totals - {getDateRangeLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Patients</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {providers.reduce((sum, p) => sum + p.stats.patients_seen, 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-muted-foreground">Appointments</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {providers.reduce((sum, p) => sum + p.stats.appointments_completed, 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-muted-foreground">Notes Signed</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {providers.reduce((sum, p) => sum + p.stats.notes_signed, 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  <p className="text-xl font-bold">
                    Ksh {providers.reduce((sum, p) => sum + p.stats.revenue_generated, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
