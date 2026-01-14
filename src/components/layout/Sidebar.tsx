import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  BarChart3,
  UserCog,
  Send,
  FilePlus2,
  Pill,
  FlaskConical,
  ImageIcon,
  Building2,
  UserPlus,
  BookOpen,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogoutReminderModal } from '@/components/clinical/LogoutReminderModal';
import { getUserProfile } from '@/lib/storageService';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Menu items with role restrictions and grouping
interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  roles?: string[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { 
    icon: Building2, 
    label: 'Master Setup', 
    roles: ['admin', 'super_admin'],
    children: [
      { icon: UserCog, label: 'Manage User', path: '/admin/users' },
      { icon: UserPlus, label: 'Account Creation', path: '/settings' },
      { icon: Pill, label: 'Pharmacy & Store', path: '/pharmacy' },
      { icon: BookOpen, label: 'Diagnosis Catalogue', path: '/diagnosis' },
      { icon: FlaskConical, label: 'Lab Investigation', path: '/investigation/lab' },
      { icon: ImageIcon, label: 'Imaging Investigation', path: '/investigation/imaging' },
    ]
  },
  { icon: Calendar, label: 'Appointment Schedule', path: '/appointments' },
  { icon: FileText, label: 'Clinical Notes', path: '/clinical-notes', roles: ['provider', 'admin', 'super_admin'] },
  { 
    icon: Stethoscope, 
    label: 'Investigation', 
    path: '/investigation',
    roles: ['provider', 'admin', 'super_admin'],
  },
  { 
    icon: Pill, 
    label: 'Pharmacy & Store', 
    path: '/pharmacy',
    roles: ['provider', 'admin', 'super_admin', 'staff']
  },
  { icon: CreditCard, label: 'Billing', path: '/billing', roles: ['admin', 'super_admin', 'billing_staff', 'billing', 'provider'] },
  { 
    icon: BarChart3, 
    label: 'Report', 
    roles: ['admin', 'super_admin'],
    children: [
      { icon: FileText, label: 'Clinical Reports', path: '/admin/incomplete-notes' },
      { icon: Activity, label: 'Provider Statistics', path: '/admin/provider-stats' },
      { icon: CreditCard, label: 'Financial Reports', path: '/billing/reports' },
      { icon: Users, label: 'Patient Reports', path: '/patients/reports' },
    ]
  },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

// Simplified menu for non-admin users
const simpleMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: FileText, label: 'Clinical Notes', path: '/clinical-notes', roles: ['provider', 'admin', 'super_admin'] },
  { icon: Send, label: 'Referral Notes', path: '/referral-notes', roles: ['provider', 'admin', 'super_admin'] },
  { icon: Stethoscope, label: 'Investigation', path: '/investigation', roles: ['provider', 'admin', 'super_admin'] },
  { icon: FilePlus2, label: 'Intake Forms', path: '/intake-forms', roles: ['provider', 'admin', 'super_admin', 'staff'] },
  { icon: Activity, label: 'Team Performance', path: '/team-stats', roles: ['provider', 'admin', 'super_admin'] },
  { icon: CreditCard, label: 'Billing', path: '/billing', roles: ['admin', 'super_admin', 'billing_staff', 'billing', 'provider'] },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutReminder, setShowLogoutReminder] = useState(false);
  const [userRole, setUserRole] = useState<string>('provider');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );

      gsap.fromTo(menuRef.current?.children || [],
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
      );
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    } catch (err) {
      console.error('Failed to load user role:', err);
    }
  };

  const handleSignOutClick = () => {
    setShowLogoutReminder(true);
  };

  const handleConfirmLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    }).map(item => ({
      ...item,
      children: item.children ? filterMenuItems(item.children) : undefined
    }));
  };

  // Use admin menu for admins, simple menu for others
  const activeMenuItems = filterMenuItems(isAdmin ? menuItems : simpleMenuItems);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.label);
    const isActive = item.path && (
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
    );

    // Check if any child is active
    const hasActiveChild = item.children?.some(child => 
      child.path && (location.pathname === child.path || location.pathname.startsWith(child.path))
    );

    if (hasChildren && !collapsed) {
      return (
        <Collapsible key={item.label} open={isExpanded || hasActiveChild}>
          <CollapsibleTrigger asChild>
            <button
              onClick={() => toggleMenu(item.label)}
              className={cn(
                'flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                (isExpanded || hasActiveChild)
                  ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    if (item.path) {
      return (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            depth > 0 && 'py-2 text-sm',
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <item.icon className={cn(
            'flex-shrink-0 transition-transform duration-200',
            depth > 0 ? 'w-4 h-4' : 'w-5 h-5',
            !isActive && 'group-hover:scale-110'
          )} />
          {!collapsed && (
            <span className="font-medium truncate">{item.label}</span>
          )}
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div ref={logoRef} className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-display font-bold text-sidebar-foreground">HURE</h1>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <div ref={menuRef} className="space-y-1">
          {activeMenuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          onClick={handleSignOutClick}
          className={cn(
            'w-full justify-start text-sidebar-foreground/70 hover:text-error hover:bg-error/10',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Logout Reminder Modal */}
      <LogoutReminderModal
        open={showLogoutReminder}
        onOpenChange={setShowLogoutReminder}
        onConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
}
