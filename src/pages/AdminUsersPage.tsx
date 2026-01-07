import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import {
    Search,
    UserCheck,
    UserX,
    Clock,
    MoreHorizontal,
    Mail,
    Phone,
    Building2,
    Stethoscope,
    FileText,
    Shield,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    role: string;
    account_status: string;
    specialty?: string;
    license_number?: string;
    facility_name?: string;
    facility_address?: string;
    bio?: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    created_at: string;
}

export default function AdminUsersPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.from('.user-card', {
                    opacity: 0,
                    y: 20,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power3.out',
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, statusFilter]);

    const checkAdminAndLoad = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            setCurrentUserId(user.id);
            
            // Check if current user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            
            if (profile?.role === 'admin' || profile?.role === 'super_admin') {
                setIsAdmin(true);
                await loadUsers();
            } else {
                toast.error('Access denied. Admin privileges required.');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setUsers((data as any[]) || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load users');
        }
    };

    const handleApprove = async (user: UserProfile) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    account_status: 'approved',
                    approved_by: currentUserId,
                    approved_at: new Date().toISOString(),
                    rejection_reason: null,
                })
                .eq('id', user.id);
            
            if (error) throw error;
            
            toast.success(`${user.full_name} has been approved!`);
            await loadUsers();
            setIsViewOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve user');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedUser) return;
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    account_status: 'rejected',
                    approved_by: currentUserId,
                    approved_at: new Date().toISOString(),
                    rejection_reason: rejectionReason,
                })
                .eq('id', selectedUser.id);
            
            if (error) throw error;
            
            toast.success(`${selectedUser.full_name}'s registration has been rejected.`);
            await loadUsers();
            setIsRejectOpen(false);
            setIsViewOpen(false);
            setRejectionReason('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject user');
        } finally {
            setProcessing(false);
        }
    };

    const handleSuspend = async (user: UserProfile) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ account_status: 'suspended' })
                .eq('id', user.id);
            
            if (error) throw error;
            
            toast.success(`${user.full_name}'s account has been suspended.`);
            await loadUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to suspend user');
        } finally {
            setProcessing(false);
        }
    };

    const handleReactivate = async (user: UserProfile) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    account_status: 'approved',
                    approved_by: currentUserId,
                    approved_at: new Date().toISOString(),
                })
                .eq('id', user.id);
            
            if (error) throw error;
            
            toast.success(`${user.full_name}'s account has been reactivated.`);
            await loadUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to reactivate user');
        } finally {
            setProcessing(false);
        }
    };

    const handleRoleChange = async (user: UserProfile, newRole: string) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', user.id);
            
            if (error) throw error;
            
            toast.success(`${user.full_name}'s role updated to ${newRole}`);
            await loadUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'suspended':
                return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge className="bg-purple-600"><Shield className="w-3 h-3 mr-1" />Super Admin</Badge>;
            case 'admin':
                return <Badge className="bg-blue-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
            case 'provider':
                return <Badge variant="secondary"><Stethoscope className="w-3 h-3 mr-1" />Provider</Badge>;
            case 'billing':
                return <Badge variant="outline">Billing</Badge>;
            case 'staff':
                return <Badge variant="outline">Staff</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || user.account_status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const pendingCount = users.filter(u => u.account_status === 'pending').length;
    const approvedCount = users.filter(u => u.account_status === 'approved').length;
    const rejectedCount = users.filter(u => u.account_status === 'rejected').length;

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    if (!isAdmin) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You need admin privileges to access this page.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div ref={containerRef} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">User Management</h1>
                        <p className="text-muted-foreground">Review and manage user registrations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <Badge className="bg-yellow-500 text-white">
                                {pendingCount} Pending Approval
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{users.length}</p>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-yellow-500/10">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{approvedCount}</p>
                            <p className="text-sm text-muted-foreground">Approved</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-500/10">
                            <UserX className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{rejectedCount}</p>
                            <p className="text-sm text-muted-foreground">Rejected</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending" className="relative">
                                    Pending
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                            {pendingCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="approved">Approved</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Users List */}
                <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No users found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? 'Try adjusting your search terms' : 'No users match the current filter'}
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="user-card glass-card-hover rounded-xl p-4 cursor-pointer"
                                onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {getInitials(user.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{user.full_name}</h3>
                                                {getRoleBadge(user.role)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                {user.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </span>
                                                )}
                                                {user.specialty && (
                                                    <span className="flex items-center gap-1">
                                                        <Stethoscope className="w-3 h-3" />
                                                        {user.specialty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(user.account_status)}
                                        <span className="text-xs text-muted-foreground hidden sm:inline">
                                            {format(new Date(user.created_at), 'MMM d, yyyy')}
                                        </span>
                                        
                                        {user.account_status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(user); }}
                                                    disabled={processing}
                                                >
                                                    <UserCheck className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setIsRejectOpen(true); }}
                                                    disabled={processing}
                                                >
                                                    <UserX className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.account_status === 'approved' && (
                                                    <DropdownMenuItem 
                                                        className="text-destructive"
                                                        onClick={() => handleSuspend(user)}
                                                    >
                                                        Suspend Account
                                                    </DropdownMenuItem>
                                                )}
                                                {(user.account_status === 'suspended' || user.account_status === 'rejected') && (
                                                    <DropdownMenuItem onClick={() => handleReactivate(user)}>
                                                        Reactivate Account
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* View User Dialog */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={selectedUser?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                                        {getInitials(selectedUser?.full_name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle className="flex items-center gap-2">
                                        {selectedUser?.full_name}
                                        {selectedUser && getStatusBadge(selectedUser.account_status)}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Registered {selectedUser && format(new Date(selectedUser.created_at), 'MMMM d, yyyy')}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        {selectedUser && (
                            <div className="space-y-6 mt-4">
                                {/* Contact Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedUser.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-primary" />
                                                <span>{selectedUser.email}</span>
                                            </div>
                                        )}
                                        {selectedUser.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-primary" />
                                                <span>{selectedUser.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Professional Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Professional Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedUser.specialty && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Stethoscope className="w-4 h-4 text-primary" />
                                                <span>{selectedUser.specialty}</span>
                                            </div>
                                        )}
                                        {selectedUser.license_number && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <span>{selectedUser.license_number}</span>
                                            </div>
                                        )}
                                        {selectedUser.facility_name && (
                                            <div className="flex items-center gap-2 text-sm col-span-2">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                <span>{selectedUser.facility_name}</span>
                                            </div>
                                        )}
                                        {selectedUser.facility_address && (
                                            <div className="text-sm text-muted-foreground col-span-2 ml-6">
                                                {selectedUser.facility_address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Role Management */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Role & Permissions</h4>
                                    <div className="flex items-center gap-4">
                                        <Label>User Role:</Label>
                                        <Select
                                            value={selectedUser.role}
                                            onValueChange={(value) => handleRoleChange(selectedUser, value)}
                                            disabled={processing}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="provider">Provider</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="billing">Billing</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                {/* Rejection Reason */}
                                {selectedUser.account_status === 'rejected' && selectedUser.rejection_reason && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <h4 className="font-semibold text-sm text-red-600 mb-2">Rejection Reason</h4>
                                        <p className="text-sm">{selectedUser.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <DialogFooter className="mt-6">
                            {selectedUser?.account_status === 'pending' && (
                                <>
                                    <Button
                                        variant="destructive"
                                        onClick={() => { setIsRejectOpen(true); }}
                                        disabled={processing}
                                    >
                                        <UserX className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(selectedUser)}
                                        disabled={processing}
                                    >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}
                            {selectedUser?.account_status === 'approved' && (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleSuspend(selectedUser)}
                                    disabled={processing}
                                >
                                    Suspend Account
                                </Button>
                            )}
                            {(selectedUser?.account_status === 'suspended' || selectedUser?.account_status === 'rejected') && (
                                <Button
                                    onClick={() => handleReactivate(selectedUser)}
                                    disabled={processing}
                                >
                                    Reactivate Account
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Registration</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting {selectedUser?.full_name}'s registration.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                                <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter the reason for rejection..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleReject} disabled={processing}>
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
