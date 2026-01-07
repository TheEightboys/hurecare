import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadAvatar, getUserProfile, updateUserProfile } from '@/lib/storageService';
import {
    User,
    Phone,
    Mail,
    Building2,
    Stethoscope,
    FileText,
    Camera,
    Save,
    ArrowLeft,
} from 'lucide-react';

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

export default function SettingsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [userId, setUserId] = useState<string>('');

    // Profile fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [facilityName, setFacilityName] = useState('');
    const [facilityAddress, setFacilityAddress] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.settings-section', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
            });
        }, containerRef);
        return () => ctx.revert();
    }, [loading]);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }
            setUserId(user.id);
            setEmail(user.email || '');

            const profile = await getUserProfile(user.id);
            if (profile) {
                setFullName(profile.full_name || '');
                setPhone(profile.phone || '');
                setSpecialty(profile.specialty || '');
                setLicenseNumber(profile.license_number || '');
                setFacilityName(profile.facility_name || '');
                setFacilityAddress(profile.facility_address || '');
                setBio(profile.bio || '');
                setAvatarUrl(profile.avatar_url);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load profile settings.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid file',
                description: 'Please select an image file.',
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Please select an image under 2MB.',
            });
            return;
        }

        setUploadingAvatar(true);
        try {
            const result = await uploadAvatar(userId, file);
            if (result) {
                setAvatarUrl(result.url);
                toast({
                    title: 'Avatar updated',
                    description: 'Your profile picture has been updated.',
                });
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Failed to upload avatar.',
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Full name is required.',
            });
            return;
        }

        setSaving(true);
        try {
            const success = await updateUserProfile(userId, {
                full_name: fullName,
                phone,
                specialty,
                license_number: licenseNumber,
                facility_name: facilityName,
                facility_address: facilityAddress,
                bio,
            });

            if (success) {
                toast({
                    title: 'Settings saved',
                    description: 'Your profile has been updated.',
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save settings.',
            });
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        return fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div ref={containerRef} className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="settings-section flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-display font-bold">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your account and professional information</p>
                    </div>
                </div>

                {/* Avatar Section */}
                <Card className="settings-section">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Profile Picture
                        </CardTitle>
                        <CardDescription>
                            Click to upload a new profile picture
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={avatarUrl || undefined} />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {uploadingAvatar ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <div>
                                <p className="font-medium">{fullName || 'Your Name'}</p>
                                <p className="text-sm text-muted-foreground">{email}</p>
                                {specialty && (
                                    <p className="text-sm text-primary mt-1">{specialty}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="settings-section">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Dr. Jane Smith"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={email}
                                        disabled
                                        className="pl-10 bg-muted"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10"
                                    placeholder="+254 7XX XXX XXX"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="A brief introduction about yourself..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="settings-section">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Professional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialty">Medical Specialty</Label>
                                <Select value={specialty} onValueChange={setSpecialty}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPECIALTIES.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="licenseNumber"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        className="pl-10"
                                        placeholder="KMPDB-12345"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Facility Information */}
                <Card className="settings-section">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Facility Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="facilityName">Facility / Practice Name</Label>
                            <Input
                                id="facilityName"
                                value={facilityName}
                                onChange={(e) => setFacilityName(e.target.value)}
                                placeholder="Healthcare Clinic"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facilityAddress">Facility Address</Label>
                            <Textarea
                                id="facilityAddress"
                                value={facilityAddress}
                                onChange={(e) => setFacilityAddress(e.target.value)}
                                placeholder="123 Main Street, Nairobi, Kenya"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="settings-section flex justify-end pb-8">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
