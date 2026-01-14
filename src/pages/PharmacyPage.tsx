import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Search,
  Pill,
  Package,
  Edit,
  Eye,
  Trash2,
  FileText,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

interface Prescription {
  id: string;
  patient_name: string;
  date: string;
  dosage_instructions: string;
  audit_by: string;
  audit_date: string;
}

export default function PharmacyPage() {
  const { toast } = useToast();
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('100');
  const [showNewDialog, setShowNewDialog] = useState(false);

  // Form state for new prescription
  const [formData, setFormData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    duration: '',
    instructions: '',
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power3.out',
        });
      });
      return () => ctx.revert();
    }
  }, [loading]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      // Mock data since prescriptions table doesn't exist
      // In production, this would fetch from a prescriptions table
      const mockData: Prescription[] = [
        {
          id: '1',
          patient_name: 'Abid Ansari',
          date: '18-Sep-2025',
          dosage_instructions: 'Ibuprofen\nDosage: , Duration:',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '18-09-2025 15:14:53',
        },
        {
          id: '2',
          patient_name: 'Mr jaicobi',
          date: '20-Sep-2025',
          dosage_instructions: 'Flagyl\nDosage: 1, Duration: 2 Time\nGauze\nQuantity: 1',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '20-09-2025 09:30:09',
        },
        {
          id: '3',
          patient_name: 'Jon kee',
          date: '20-Sep-2025',
          dosage_instructions: '',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '20-09-2025 15:09:07',
        },
        {
          id: '4',
          patient_name: 'Joe Lee',
          date: '20-Sep-2025',
          dosage_instructions: 'Amoxicillin\nDosage: 1, Duration: 2 Time\nGauze\nQuantity: 1',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '20-09-2025 15:55:10',
        },
        {
          id: '5',
          patient_name: 'Abid Ansari',
          date: '24-Sep-2025',
          dosage_instructions: '',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '24-09-2025 12:07:42',
        },
        {
          id: '6',
          patient_name: 'Abid Ansari',
          date: '24-Sep-2025',
          dosage_instructions: 'Flagyl\nDosage: 1, Duration: 2 Time\nIbuprofen\nDosage: 1, Duration: 2 Time',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '24-09-2025 12:08:11',
        },
        {
          id: '7',
          patient_name: 'Joe Lee',
          date: '25-Sep-2025',
          dosage_instructions: 'Amoxicillin\nDosage: 1×2, Duration: 3 days',
          audit_by: 'Dr. Jacksons',
          audit_date: '25-09-2025 07:02:24',
        },
        {
          id: '8',
          patient_name: 'Jon kee',
          date: '25-Sep-2025',
          dosage_instructions: '',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '25-09-2025 10:28:06',
        },
        {
          id: '9',
          patient_name: 'Anas Khan',
          date: '29-Sep-2025',
          dosage_instructions: 'Flagyl',
          audit_by: 'Dr. Dolly Smith',
          audit_date: '29-09-2025 11:15:22',
        },
      ];
      setPrescriptions(mockData);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load prescriptions' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.dosage_instructions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div ref={headerRef}>
          <Tabs defaultValue="list" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Prescription List
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Prescription
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  {/* Table Controls */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show</span>
                      <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                        <SelectTrigger className="w-[80px] h-8">
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
                      <Input
                        placeholder=""
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[200px] h-8"
                      />
                    </div>
                  </div>

                  {/* Prescriptions Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                          <TableHead className="text-primary-foreground font-semibold">SN.</TableHead>
                          <TableHead className="text-primary-foreground font-semibold">Patient</TableHead>
                          <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
                          <TableHead className="text-primary-foreground font-semibold">Dosage Instructions</TableHead>
                          <TableHead className="text-primary-foreground font-semibold">Audit By</TableHead>
                          <TableHead className="text-primary-foreground font-semibold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredPrescriptions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No prescriptions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPrescriptions.map((rx, index) => (
                            <TableRow key={rx.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{rx.patient_name}</TableCell>
                              <TableCell>{rx.date}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {rx.dosage_instructions.split('\n').map((line, i) => (
                                    <div key={i} className="text-sm">
                                      {line.startsWith('Dosage:') || line.startsWith('Quantity:') ? (
                                        <span className="text-muted-foreground text-xs">{line}</span>
                                      ) : (
                                        <span className="font-medium">{line}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{rx.audit_by}</p>
                                  <p className="text-xs text-muted-foreground">{rx.audit_date}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
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

                  {/* Pagination Info */}
                  <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
                    <span>Showing 1 to {Math.min(parseInt(entriesPerPage), filteredPrescriptions.length)} of {filteredPrescriptions.length} entries</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button variant="default" size="sm" className="w-8">1</Button>
                      <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Add New Prescription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Abid Ansari</SelectItem>
                          <SelectItem value="2">Joe Lee</SelectItem>
                          <SelectItem value="3">Jon kee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Medication</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amoxicillin">Amoxicillin</SelectItem>
                        <SelectItem value="ibuprofen">Ibuprofen</SelectItem>
                        <SelectItem value="flagyl">Flagyl</SelectItem>
                        <SelectItem value="paracetamol">Paracetamol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input placeholder="e.g., 1×2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input placeholder="e.g., 3 days" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Instructions</Label>
                    <Input placeholder="e.g., Take after meals" />
                  </div>

                  <div className="flex gap-3">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Prescription
                    </Button>
                    <Button variant="outline">Clear</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
