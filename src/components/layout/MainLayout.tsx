import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bell, Search, Menu, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/storageService';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string | null }>({});
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileData = await getUserProfile(user.id);
        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: error.message,
      });
    }
  };

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'DR';
  };

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/patients': 'Patients',
      '/appointments': 'Appointments',
      '/intake-forms': 'Intake Forms',
      '/billing': 'Billing & Claims',
      '/settings': 'Settings',
    };

    for (const [key, value] of Object.entries(titles)) {
      if (path.startsWith(key)) return value;
    }
    return 'HURE Care';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        'lg:ml-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-display font-semibold text-foreground">
                {getPageTitle()}
              </h1>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients, appointments..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-[10px] text-error-foreground flex items-center justify-center font-medium">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <DropdownMenuItem className="p-4">
                    <div>
                      <p className="font-medium text-sm">Incomplete notes reminder</p>
                      <p className="text-xs text-muted-foreground mt-1">You have 2 incomplete notes from today</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4">
                    <div>
                      <p className="font-medium text-sm">New intake form</p>
                      <p className="text-xs text-muted-foreground mt-1">John Doe submitted medical history form</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4">
                    <div>
                      <p className="font-medium text-sm">Appointment reminder</p>
                      <p className="text-xs text-muted-foreground mt-1">3 appointments scheduled for tomorrow</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all hover:ring-2 hover:ring-primary/50">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'Profile'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-semibold text-sm">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 border-b border-border">
                    <p className="font-semibold text-sm">{profile.full_name || 'My Profile'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to view settings</p>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/settings" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
