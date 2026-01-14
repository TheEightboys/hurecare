import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Pencil, Eye, ClipboardList, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Type-safe client for new tables not yet in generated types
const db = supabase as any;

interface PatientInvestigation {
  id: string;
  patient_id: string;
  investigation_date: string;
  investigation_type: 'lab' | 'imaging';
  lab_investigation_id: string | null;
  imaging_investigation_id: string | null;
  status: string;
  priority: string;
  results: string | null;
  notes: string | null;
  created_at: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
  lab_investigations?: {
    test_name: string;
  };
  imaging_investigations?: {
    modality: string;
  };
}

interface LabTest {
  id: string;
  test_name: string;
  price: number;
}

interface ImagingTest {
  id: string;
  modality: string;
  body_region: string | null;
  price: number;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

export default function InvestigationListPage() {
  const [investigations, setInvestigations] = useState<PatientInvestigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Master data
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [imagingTests, setImagingTests] = useState<ImagingTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PatientInvestigation | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    investigation_date: new Date().toISOString().split('T')[0],
    priority: 'routine',
    notes: '',
  });
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [selectedImagingTests, setSelectedImagingTests] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load investigations with related data
      const { data: invData, error: invError } = await db
        .from('patient_investigations')
        .select(`
          *,
          patients(first_name, last_name),
          lab_investigations(test_name),
          imaging_investigations(modality)
        `)
        .order('investigation_date', { ascending: false });

      if (invError) throw invError;
      setInvestigations(invData || []);

      // Load lab tests
      const { data: labData } = await db
        .from('lab_investigations')
        .select('id, test_name, price')
        .eq('is_active', true)
        .order('test_name');
      setLabTests(labData || []);

      // Load imaging tests
      const { data: imagingData } = await db
        .from('imaging_investigations')
        .select('id, modality, body_region, price')
        .eq('is_active', true)
        .order('modality');
      setImagingTests(imagingData || []);

      // Load patients
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('first_name');
      setPatients(patientData || []);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load investigations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      patient_id: '',
      investigation_date: new Date().toISOString().split('T')[0],
      priority: 'routine',
      notes: '',
    });
    setSelectedLabTests([]);
    setSelectedImagingTests([]);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    if (selectedLabTests.length === 0 && selectedImagingTests.length === 0) {
      toast.error('Please select at least one investigation');
      return;
    }

    setSaving(true);
    try {
      const records: any[] = [];

      // Create lab investigation records
      for (const labId of selectedLabTests) {
        records.push({
          patient_id: formData.patient_id,
          investigation_date: formData.investigation_date,
          investigation_type: 'lab',
          lab_investigation_id: labId,
          priority: formData.priority,
          notes: formData.notes || null,
          status: 'ordered',
        });
      }

      // Create imaging investigation records
      for (const imagingId of selectedImagingTests) {
        records.push({
          patient_id: formData.patient_id,
          investigation_date: formData.investigation_date,
          investigation_type: 'imaging',
          imaging_investigation_id: imagingId,
          priority: formData.priority,
          notes: formData.notes || null,
          status: 'ordered',
        });
      }

      const { error } = await db
        .from('patient_investigations')
        .insert(records);

      if (error) throw error;

      toast.success(`${records.length} investigation(s) ordered successfully`);
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to order investigations');
    } finally {
      setSaving(false);
    }
  };

  const handleView = (item: PatientInvestigation) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'sample_collected': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'in_progress': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Group investigations by patient and date for display
  const groupedInvestigations = investigations.reduce((acc, inv) => {
    const key = `${inv.patient_id}-${inv.investigation_date}`;
    if (!acc[key]) {
      acc[key] = {
        patient_id: inv.patient_id,
        patient_name: inv.patients ? `${inv.patients.first_name} ${inv.patients.last_name}` : 'Unknown',
        date: inv.investigation_date,
        investigations: [],
      };
    }
    acc[key].investigations.push(inv);
    return acc;
  }, {} as Record<string, { patient_id: string; patient_name: string; date: string; investigations: PatientInvestigation[] }>);

  const groupedList = Object.values(groupedInvestigations);

  // Filter
  const filteredList = groupedList.filter(group =>
    group.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.investigations.some(inv => 
      inv.lab_investigations?.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.imaging_investigations?.modality?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredList.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredList.slice(startIndex, startIndex + entriesPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Investigation List
            </h1>
            <p className="text-muted-foreground">View and manage patient investigations</p>
          </div>
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Order Investigation
          </Button>
        </div>

        {/* Controls */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(val) => {
                  setEntriesPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Search:</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold w-16">SN.</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Patient</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Investigation</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No investigations found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((group, index) => (
                    <TableRow key={`${group.patient_id}-${group.date}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium text-primary">{group.patient_name}</TableCell>
                      <TableCell>{format(new Date(group.date), 'dd-MMM-yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.investigations.map((inv) => (
                            <Badge
                              key={inv.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {inv.investigation_type === 'lab' 
                                ? inv.lab_investigations?.test_name 
                                : inv.imaging_investigations?.modality}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
                            onClick={() => handleView(group.investigations[0])}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white border-0"
                            onClick={() => handleView(group.investigations[0])}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, filteredList.length)} of {filteredList.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Investigation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Investigation</DialogTitle>
            <DialogDescription>
              Select a patient and order investigations
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(val) => setFormData({ ...formData, patient_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Investigation Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.investigation_date}
                  onChange={(e) => setFormData({ ...formData, investigation_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(val) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lab Tests Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Lab Investigations</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {labTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lab tests available</p>
                ) : (
                  labTests.map((test) => (
                    <div key={test.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lab-${test.id}`}
                        checked={selectedLabTests.includes(test.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLabTests([...selectedLabTests, test.id]);
                          } else {
                            setSelectedLabTests(selectedLabTests.filter(id => id !== test.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`lab-${test.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {test.test_name}
                      </label>
                      <span className="text-xs text-muted-foreground">${test.price?.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Imaging Tests Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Imaging Investigations</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {imagingTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No imaging tests available</p>
                ) : (
                  imagingTests.map((test) => (
                    <div key={test.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`imaging-${test.id}`}
                        checked={selectedImagingTests.includes(test.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedImagingTests([...selectedImagingTests, test.id]);
                          } else {
                            setSelectedImagingTests(selectedImagingTests.filter(id => id !== test.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`imaging-${test.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {test.modality} {test.body_region ? `(${test.body_region})` : ''}
                      </label>
                      <span className="text-xs text-muted-foreground">${test.price?.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Ordering...' : 'Order Investigation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Investigation Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">
                    {viewingItem.patients?.first_name} {viewingItem.patients?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{format(new Date(viewingItem.investigation_date), 'dd-MMM-yyyy')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium capitalize">{viewingItem.investigation_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Investigation</Label>
                  <p className="font-medium">
                    {viewingItem.investigation_type === 'lab'
                      ? viewingItem.lab_investigations?.test_name
                      : viewingItem.imaging_investigations?.modality}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(viewingItem.status)}>
                    {viewingItem.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <p className="font-medium capitalize">{viewingItem.priority}</p>
                </div>
              </div>
              {viewingItem.results && (
                <div>
                  <Label className="text-muted-foreground">Results</Label>
                  <p className="font-medium">{viewingItem.results}</p>
                </div>
              )}
              {viewingItem.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{viewingItem.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
