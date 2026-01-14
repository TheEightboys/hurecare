import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  FileCheck,
  Receipt,
  BarChart3,
  Shield,
  UserCog,
  Send,
  FilePlus2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogoutReminderModal } from '@/components/clinical/LogoutReminderModal';
import { getUserProfile } from '@/lib/storageService';

// Menu items with role restrictions
// roles: undefined = visible to all, ['admin'] = only admins, ['provider'] = only providers
// Note: Clinical Notes now accessible via sidebar for quick access
// Insurance claims are handled INSIDE Billing module (not separate nav item)
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  // Clinical Documentation
  { icon: FileText, label: 'Clinical Notes', path: '/clinical-notes', roles: ['provider', 'admin', 'super_admin'] },
  { icon: Send, label: 'Referral Notes', path: '/referral-notes', roles: ['provider', 'admin', 'super_admin'] },
  { icon: FilePlus2, label: 'Intake Forms', path: '/intake-forms', roles: ['provider', 'admin', 'super_admin', 'staff'] },
  // Billing (includes Claims inside - not separate nav)
  { icon: CreditCard, label: 'Billing', path: '/billing', roles: ['admin', 'super_admin', 'billing_staff', 'billing', 'provider'] },
  // Admin Reports
  { icon: BarChart3, label: 'Reports', path: '/admin/incomplete-notes', roles: ['admin', 'super_admin'] },
  { icon: UserCog, label: 'User Management', path: '/admin/users', roles: ['admin', 'super_admin'] },
  // Settings visible to all
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutReminder, setShowLogoutReminder] = useState(false);
  const [userRole, setUserRole] = useState<string>('provider');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(menuRef.current?.children || [],
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.3,
        }
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

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // If no roles specified, item is visible to everyone
    if (!item.roles) return true;
    // Check if user's role is in the allowed roles
    return item.roles.includes(userRole);
  });

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div ref={logoRef} className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-display font-bold text-sidebar-foreground">HURE Care</h1>
              <p className="text-xs text-sidebar-foreground/60">Healthcare Platform</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div ref={menuRef} className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )} />
                {!collapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
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
