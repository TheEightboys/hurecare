
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePatients } from '@/hooks/useSupabase';
import {
    Plus,
    Search,
    User,
    Calendar,
    Phone,
    Mail,
    MoreHorizontal,
    FileText,
    Building2,
    Edit,
    Eye,
    Heart,
    Droplets,
    AlertCircle,
    MapPin,
    Shield,
    UserCheck,
    ClipboardList,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Kenya/East Africa Insurance Providers
const INSURANCE_PROVIDERS = [
    'NHIF',
    'Jubilee Insurance',
    'AAR Insurance',
    'Britam Insurance',
    'CIC Insurance',
    'Madison Insurance',
    'Resolution Insurance',
    'APA Insurance',
    'UAP Old Mutual',
    'Sanlam Insurance',
    'Heritage Insurance',
    'First Assurance',
    'Self-Pay',
    'Other',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function PatientsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { getPatients, getPatient, createPatient, updatePatient, loading: loadingPatients } = usePatients();

    const [patients, setPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // View/Edit Patient
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savingPatient, setSavingPatient] = useState(false);

    // New Patient Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        blood_type: '',
        allergies: [] as string[],
        emergency_contact_name: '',
        emergency_contact_phone: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_group_number: '',
        insurance_holder_name: '',
        insurance_holder_relationship: '',
        insurance_valid_until: '',
    });

    const [newAllergy, setNewAllergy] = useState('');
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadPatients();

        // Check if we should open the create dialog immediately
        if (location.pathname === '/patients/new') {
            setIsCreateOpen(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        // GSAP animations
        if (patients.length > 0) {
            const ctx = gsap.context(() => {
                gsap.from(headerRef.current, {
                    opacity: 0,
                    y: -20,
                    duration: 0.6,
                    ease: 'power3.out',
                });

                gsap.from('.patient-card', {
                    opacity: 0,
                    y: 30,
                    duration: 0.5,
                    stagger: 0.08,
                    delay: 0.2,
                    ease: 'power3.out',
                });
            });
            return () => ctx.revert();
        }
    }, [patients]);

    const loadPatients = async () => {
        const data = await getPatients();
        setPatients(data || []);
    };

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean up formData to convert empty strings to null for optional fields
            const cleanedData = {
                ...formData,
                email: formData.email || null,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender || null,
                address: formData.address || null,
                blood_type: formData.blood_type || null,
                emergency_contact_name: formData.emergency_contact_name || null,
                emergency_contact_phone: formData.emergency_contact_phone || null,
                insurance_provider: formData.insurance_provider || null,
                insurance_policy_number: formData.insurance_policy_number || null,
                insurance_group_number: formData.insurance_group_number || null,
                insurance_holder_name: formData.insurance_holder_name || null,
                insurance_holder_relationship: formData.insurance_holder_relationship || null,
                insurance_valid_until: formData.insurance_valid_until || null,
            };
            await createPatient(cleanedData);
            toast.success('Patient created successfully');
            setIsCreateOpen(false);
            resetForm();
            loadPatients();
            if (location.pathname === '/patients/new') {
                navigate('/patients');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: '',
            address: '',
            blood_type: '',
            allergies: [],
            emergency_contact_name: '',
            emergency_contact_phone: '',
            insurance_provider: '',
            insurance_policy_number: '',
            insurance_group_number: '',
            insurance_holder_name: '',
            insurance_holder_relationship: '',
            insurance_valid_until: '',
        });
        setNewAllergy('');
    };
    
    const handleOpenPatient = async (patient: any) => {
        setSelectedPatient(patient);
        setFormData({
            first_name: patient.first_name || '',
            last_name: patient.last_name || '',
            email: patient.email || '',
            phone: patient.phone || '',
            date_of_birth: patient.date_of_birth || '',
            gender: patient.gender || '',
            address: patient.address || '',
            blood_type: patient.blood_type || '',
            allergies: patient.allergies || [],
            emergency_contact_name: patient.emergency_contact_name || '',
            emergency_contact_phone: patient.emergency_contact_phone || '',
            insurance_provider: patient.insurance_provider || '',
            insurance_policy_number: patient.insurance_policy_number || '',
            insurance_group_number: patient.insurance_group_number || '',
            insurance_holder_name: patient.insurance_holder_name || '',
            insurance_holder_relationship: patient.insurance_holder_relationship || '',
            insurance_valid_until: patient.insurance_valid_until || '',
        });
        setIsEditing(false);
        setIsViewOpen(true);
    };
    
    const handleSavePatient = async () => {
        if (!selectedPatient) return;
        setSavingPatient(true);
        try {
            // Clean up formData to convert empty strings to null for optional fields
            const cleanedData = {
                ...formData,
                email: formData.email || null,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender || null,
                address: formData.address || null,
                blood_type: formData.blood_type || null,
                emergency_contact_name: formData.emergency_contact_name || null,
                emergency_contact_phone: formData.emergency_contact_phone || null,
                insurance_provider: formData.insurance_provider || null,
                insurance_policy_number: formData.insurance_policy_number || null,
                insurance_group_number: formData.insurance_group_number || null,
                insurance_holder_name: formData.insurance_holder_name || null,
                insurance_holder_relationship: formData.insurance_holder_relationship || null,
                insurance_valid_until: formData.insurance_valid_until || null,
            };
            await updatePatient(selectedPatient.id, cleanedData);
            toast.success('Patient updated successfully');
            setIsEditing(false);
            loadPatients();
            // Update selected patient with new data
            setSelectedPatient({ ...selectedPatient, ...cleanedData });
        } catch (error: any) {
            toast.error(error.message || 'Failed to update patient');
        } finally {
            setSavingPatient(false);
        }
    };
    
    const addAllergy = () => {
        if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
            setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
            setNewAllergy('');
        }
    };
    
    const removeAllergy = (allergy: string) => {
        setFormData({ ...formData, allergies: formData.allergies.filter(a => a !== allergy) });
    };

    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open && location.pathname === '/patients/new') {
            navigate('/patients');
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Patients</h1>
                        <p className="text-muted-foreground">Manage patient records and history</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Patient
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleCreatePatient}>
                                <DialogHeader>
                                    <DialogTitle>Add New Patient</DialogTitle>
                                    <DialogDescription>
                                        Enter the patient's basic information to create a new record.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                required
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                required
                                                value={formData.date_of_birth}
                                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Patient'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-xl p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Patients List */}
                <div className="space-y-4">
                    {loadingPatients ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Add your first patient to get started'}
                            </p>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Patient
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="patient-card glass-card-hover rounded-xl p-5 relative group cursor-pointer hover:border-primary/50 transition-all"
                                    onClick={() => handleOpenPatient(patient)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                {patient.first_name?.[0]}{patient.last_name?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{patient.first_name} {patient.last_name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{patient.gender}</span>
                                                    <span>•</span>
                                                    <span>{new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs</span>
                                                </div>
                                            </div>
                                        </div>
                                        {patient.insurance_provider && (
                                            <Badge variant="outline" className="text-xs">
                                                <Shield className="w-3 h-3 mr-1" />
                                                Insured
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-primary/70" />
                                            <span>{patient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary/70" />
                                            <span className="truncate">{patient.email || 'No email'}</span>
                                        </div>
                                        {patient.allergies && patient.allergies.length > 0 && (
                                            <div className="flex items-center gap-2 text-destructive">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{patient.allergies.length} allerg{patient.allergies.length === 1 ? 'y' : 'ies'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleOpenPatient(patient); }}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
                                            <Link to={`/clinical-notes/new?patientId=${patient.id}`}>
                                                <FileText className="w-4 h-4 mr-2" />
                                                Note
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* View/Edit Patient Dialog */}
                <Dialog open={isViewOpen} onOpenChange={(open) => { setIsViewOpen(open); if (!open) setIsEditing(false); }}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="flex items-center gap-2">
                                        {selectedPatient?.first_name} {selectedPatient?.last_name}
                                        {isEditing && <Badge variant="secondary">Editing</Badge>}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Patient ID: {selectedPatient?.id?.slice(0, 8)}...
                                    </DialogDescription>
                                </div>
                                {!isEditing && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </DialogHeader>
                        
                        <Tabs defaultValue="personal" className="mt-4">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="medical">Medical</TabsTrigger>
                                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="personal" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="view_firstName">First Name</Label>
                                        <Input
                                            id="view_firstName"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="view_lastName">Last Name</Label>
                                        <Input
                                            id="view_lastName"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="view_email">Email</Label>
                                    <Input
                                        id="view_email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="view_phone">Phone Number</Label>
                                    <Input
                                        id="view_phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="view_dob">Date of Birth</Label>
                                        <Input
                                            id="view_dob"
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="view_gender">Gender</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="view_address">Address</Label>
                                    <Textarea
                                        id="view_address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        disabled={!isEditing}
                                        rows={2}
                                    />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="medical" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="view_blood_type">Blood Type</Label>
                                    <Select
                                        value={formData.blood_type}
                                        onValueChange={(val) => setFormData({ ...formData, blood_type: val })}
                                        disabled={!isEditing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        Allergies
                                    </Label>
                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
                                        {formData.allergies.length === 0 ? (
                                            <span className="text-sm text-muted-foreground">No allergies recorded</span>
                                        ) : (
                                            formData.allergies.map((allergy, index) => (
                                                <Badge key={index} variant="destructive" className="gap-1">
                                                    {allergy}
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAllergy(allergy)}
                                                            className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Add allergy (e.g., Penicillin)"
                                                value={newAllergy}
                                                onChange={(e) => setNewAllergy(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                                            />
                                            <Button type="button" variant="secondary" onClick={addAllergy}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="insurance" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="view_insurance_provider">Insurance Provider</Label>
                                    <Input
                                        id="view_insurance_provider"
                                        value={formData.insurance_provider}
                                        onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="e.g., Blue Cross Blue Shield"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="view_policy_number">Policy Number</Label>
                                        <Input
                                            id="view_policy_number"
                                            value={formData.insurance_policy_number}
                                            onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="view_group_number">Group Number</Label>
                                        <Input
                                            id="view_group_number"
                                            value={formData.insurance_group_number}
                                            onChange={(e) => setFormData({ ...formData, insurance_group_number: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="view_holder_name">Policy Holder Name</Label>
                                        <Input
                                            id="view_holder_name"
                                            value={formData.insurance_holder_name}
                                            onChange={(e) => setFormData({ ...formData, insurance_holder_name: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="If different from patient"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="view_holder_relationship">Relationship</Label>
                                        <Select
                                            value={formData.insurance_holder_relationship}
                                            onValueChange={(val) => setFormData({ ...formData, insurance_holder_relationship: val })}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Self">Self</SelectItem>
                                                <SelectItem value="Spouse">Spouse</SelectItem>
                                                <SelectItem value="Child">Child</SelectItem>
                                                <SelectItem value="Parent">Parent</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="view_valid_until">Valid Until</Label>
                                    <Input
                                        id="view_valid_until"
                                        type="date"
                                        value={formData.insurance_valid_until}
                                        onChange={(e) => setFormData({ ...formData, insurance_valid_until: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="emergency" className="space-y-4 mt-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Emergency Contact
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="view_emergency_name">Contact Name</Label>
                                            <Input
                                                id="view_emergency_name"
                                                value={formData.emergency_contact_name}
                                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="view_emergency_phone">Contact Phone</Label>
                                            <Input
                                                id="view_emergency_phone"
                                                value={formData.emergency_contact_phone}
                                                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                        
                        {isEditing && (
                            <DialogFooter className="mt-6">
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    // Reset form data to selected patient data
                                    if (selectedPatient) {
                                        setFormData({
                                            first_name: selectedPatient.first_name || '',
                                            last_name: selectedPatient.last_name || '',
                                            email: selectedPatient.email || '',
                                            phone: selectedPatient.phone || '',
                                            date_of_birth: selectedPatient.date_of_birth || '',
                                            gender: selectedPatient.gender || '',
                                            address: selectedPatient.address || '',
                                            blood_type: selectedPatient.blood_type || '',
                                            allergies: selectedPatient.allergies || [],
                                            emergency_contact_name: selectedPatient.emergency_contact_name || '',
                                            emergency_contact_phone: selectedPatient.emergency_contact_phone || '',
                                            insurance_provider: selectedPatient.insurance_provider || '',
                                            insurance_policy_number: selectedPatient.insurance_policy_number || '',
                                            insurance_group_number: selectedPatient.insurance_group_number || '',
                                            insurance_holder_name: selectedPatient.insurance_holder_name || '',
                                            insurance_holder_relationship: selectedPatient.insurance_holder_relationship || '',
                                            insurance_valid_until: selectedPatient.insurance_valid_until || '',
                                        });
                                    }
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSavePatient} disabled={savingPatient}>
                                    {savingPatient ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
