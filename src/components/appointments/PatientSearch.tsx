import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/hooks/useSupabase';
import { Search, User, Phone, Calendar, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

interface PatientSearchProps {
    onSelectPatient: (patient: any) => void;
    onCreatePatient?: (data: MinimalPatientData) => Promise<void>;
    selectedPatient?: any | null;
}

interface MinimalPatientData {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth?: string;
}

export function PatientSearch({ onSelectPatient, onCreatePatient, selectedPatient }: PatientSearchProps) {
    const { getPatients } = usePatients();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);

    // New patient form state
    const [newPatient, setNewPatient] = useState<MinimalPatientData>({
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
    });

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = patients.filter(patient => {
                const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
                const search = searchTerm.toLowerCase();
                return (
                    fullName.includes(search) ||
                    patient.phone?.includes(search) ||
                    patient.date_of_birth?.includes(search)
                );
            });
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients([]);
        }
    }, [searchTerm, patients]);

    const loadPatients = async () => {
        const data = await getPatients();
        setPatients(data || []);
    };

    const handleSelect = (patient: any) => {
        onSelectPatient(patient);
        setSearchTerm('');
        setFilteredPatients([]);
        setShowCreateForm(false);
    };

    const handleCreateNew = async () => {
        if (!newPatient.first_name || !newPatient.last_name || !newPatient.phone) {
            return;
        }

        setCreating(true);
        try {
            if (onCreatePatient) {
                await onCreatePatient(newPatient);
                setShowCreateForm(false);
                setNewPatient({ first_name: '', last_name: '', phone: '', date_of_birth: '' });
                setSearchTerm('');
                await loadPatients();
            }
        } finally {
            setCreating(false);
        }
    };

    const clearSelection = () => {
        onSelectPatient(null);
        setSearchTerm('');
    };

    if (selectedPatient) {
        return (
            <div className="space-y-2">
                <Label>Selected Patient</Label>
                <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {selectedPatient.first_name?.[0]}{selectedPatient.last_name?.[0]}
                        </div>
                        <div>
                            <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {selectedPatient.phone}
                                </span>
                                {selectedPatient.date_of_birth && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(selectedPatient.date_of_birth), 'MMM d, yyyy')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Search Patient *</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, or DOB..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Search Results */}
            {searchTerm && filteredPatients.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredPatients.slice(0, 5).map((patient) => (
                        <button
                            key={patient.id}
                            onClick={() => handleSelect(patient)}
                            className="w-full text-left glass-card-hover rounded-lg p-3 transition-all hover:border-primary/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{patient.first_name} {patient.last_name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{patient.phone}</span>
                                        {patient.date_of_birth && (
                                            <>
                                                <span>•</span>
                                                <span>{format(new Date(patient.date_of_birth), 'MMM d, yyyy')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results / Create new */}
            {searchTerm && filteredPatients.length === 0 && !showCreateForm && (
                <div className="border border-dashed rounded-lg p-6 text-center space-y-3">
                    <User className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div>
                        <p className="text-sm font-medium">No patients found</p>
                        <p className="text-xs text-muted-foreground">Create a new patient record</p>
                    </div>
                    {onCreatePatient && (
                        <Button size="sm" onClick={() => setShowCreateForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Patient
                        </Button>
                    )}
                </div>
            )}

            {/* Create New Patient Form */}
            {showCreateForm && (
                <div className="glass-card rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Create New Patient</h4>
                        <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">First Name *</Label>
                            <Input
                                placeholder="John"
                                value={newPatient.first_name}
                                onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Last Name *</Label>
                            <Input
                                placeholder="Doe"
                                value={newPatient.last_name}
                                onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Phone Number *</Label>
                        <Input
                            type="tel"
                            placeholder="+254 700 000 000"
                            value={newPatient.phone}
                            onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Date of Birth (Optional)</Label>
                        <Input
                            type="date"
                            value={newPatient.date_of_birth}
                            onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreateForm(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleCreateNew}
                            disabled={creating || !newPatient.first_name || !newPatient.last_name || !newPatient.phone}
                            className="flex-1"
                        >
                            {creating ? 'Creating...' : 'Create & Select'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Initial state - Show create option */}
            {!searchTerm && !showCreateForm && onCreatePatient && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Or Create New Patient
                </Button>
            )}
        </div>
    );
}
