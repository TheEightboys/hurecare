import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Heart, Mail, Lock, User, ArrowRight, Phone, Building2, Stethoscope, FileText } from 'lucide-react';

// Medical specialties for Kenya/East Africa
const SPECIALTIES = [
  'General Practice',
  'Internal Medicine',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Surgery',
  'Orthopedics',
  'Dentistry',
  'Dermatology',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
  'Psychiatry',
  'Radiology',
  'Physiotherapy',
  'Nursing',
  'Clinical Officer',
  'Pharmacy',
  'Laboratory',
  'Other',
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Multi-step signup

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup step 1 - Basic info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Signup step 2 - Professional info
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && step === 1) {
      // Move to step 2 for signup
      if (!fullName || !email || !password || !phone) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all required fields.' });
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Check if account is approved
        if (authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('id', authData.user.id)
            .single();
          
          if (profile?.account_status === 'pending') {
            await supabase.auth.signOut();
            toast({
              variant: 'destructive',
              title: 'Account Pending Approval',
              description: 'Your account is awaiting admin verification. Please check back later.',
            });
            return;
          }
          
          if (profile?.account_status === 'rejected') {
            await supabase.auth.signOut();
            toast({
              variant: 'destructive',
              title: 'Account Rejected',
              description: 'Your registration was not approved. Please contact support.',
            });
            return;
          }
        }
        
        navigate('/dashboard');
      } else {
        // Create account with all metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              specialty,
              license_number: licenseNumber,
              facility_name: facilityName,
              facility_address: facilityAddress,
            },
          },
        });
        if (error) throw error;

        // Update profile with additional fields and set status to pending
        if (data.user) {
          await supabase.from('profiles').update({
            phone,
            specialty,
            license_number: licenseNumber,
            facility_name: facilityName,
            facility_address: facilityAddress,
            account_status: 'pending', // Requires admin approval
          }).eq('id', data.user.id);
        }

        toast({
          title: 'Registration Submitted!',
          description: 'Your account is pending admin approval. You will receive an email once approved.',
        });
        resetForm();
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setSpecialty('');
    setLicenseNumber('');
    setFacilityName('');
    setFacilityAddress('');
    setStep(1);
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-sidebar-foreground">HURE Care</h1>
            <p className="text-sm text-sidebar-foreground/60">Healthcare Platform</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-display font-bold text-sidebar-foreground leading-tight">
            Streamline your<br />
            <span className="gradient-text">clinical workflow</span>
          </h2>
          <p className="text-sidebar-foreground/70 text-lg max-w-md">
            AI-assisted clinical notes, appointment management, billing, and more - all in one platform for Kenyan healthcare providers.
          </p>
          <div className="flex items-center gap-6 text-sidebar-foreground/60 text-sm">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>SOAP Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>ICD-10</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Insurance Claims</span>
            </div>
          </div>
        </div>

        <p className="text-sidebar-foreground/50 text-sm">© 2025 HURE Care. All rights reserved.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold">HURE Care</h1>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-bold">
              {isLogin ? 'Welcome back' : step === 1 ? 'Create account' : 'Professional details'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? 'Sign in to access your dashboard'
                : step === 1
                  ? 'Get started with HURE Care'
                  : 'Help us personalize your experience'}
            </p>
            {!isLogin && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              // Login Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </>
            ) : step === 1 ? (
              // Signup Step 1 - Basic Info
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      placeholder="+254 7XX XXX XXX"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </>
            ) : (
              // Signup Step 2 - Professional Info
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License/Registration Number</Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g., KMPDB-12345"
                  />
                  <p className="text-xs text-muted-foreground">Kenya Medical Practitioners Board or relevant body</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilityName">Facility/Practice Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="facilityName"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="pl-10"
                      placeholder="Healthcare Clinic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilityAddress">Facility Address</Label>
                  <Input
                    id="facilityAddress"
                    value={facilityAddress}
                    onChange={(e) => setFacilityAddress(e.target.value)}
                    placeholder="123 Main Street, Nairobi"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {!isLogin && step === 2 && (
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isLogin ? (
                  <>Sign In<ArrowRight className="w-4 h-4 ml-2" /></>
                ) : step === 1 ? (
                  <>Continue<ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Create Account<ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={handleToggleMode} className="text-primary font-medium hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {!isLogin && (
            <p className="text-center text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
