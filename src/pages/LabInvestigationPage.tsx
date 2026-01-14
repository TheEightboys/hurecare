import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type-safe client for new tables not yet in generated types
const db = supabase as any;

interface LabInvestigation {
  id: string;
  test_name: string;
  category: string | null;
  sample_type: string | null;
  price: number;
  description: string | null;
  normal_range: string | null;
  turnaround_time: string | null;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Immunology',
  'Serology',
  'Urinalysis',
  'Pathology',
  'Endocrinology',
  'Other',
];

const SAMPLE_TYPES = [
  'Blood',
  'Serum',
  'Plasma',
  'Urine',
  'Stool',
  'Sputum',
  'Swab',
  'CSF',
  'Tissue',
  'Other',
];

export default function LabInvestigationPage() {
  const [investigations, setInvestigations] = useState<LabInvestigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabInvestigation | null>(null);
  const [deletingItem, setDeletingItem] = useState<LabInvestigation | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    test_name: '',
    category: '',
    sample_type: '',
    price: '',
    description: '',
    normal_range: '',
    turnaround_time: '',
  });

  useEffect(() => {
    loadInvestigations();
  }, []);

  const loadInvestigations = async () => {
    try {
      setLoading(true);
      const { data, error } = await db
        .from('lab_investigations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestigations(data || []);
    } catch (error: any) {
      console.error('Error loading lab investigations:', error);
      toast.error('Failed to load lab investigations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: LabInvestigation) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        test_name: item.test_name,
        category: item.category || '',
        sample_type: item.sample_type || '',
        price: item.price?.toString() || '0',
        description: item.description || '',
        normal_range: item.normal_range || '',
        turnaround_time: item.turnaround_time || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        test_name: '',
        category: '',
        sample_type: '',
        price: '',
        description: '',
        normal_range: '',
        turnaround_time: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.test_name.trim()) {
      toast.error('Test name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        test_name: formData.test_name.trim(),
        category: formData.category || null,
        sample_type: formData.sample_type || null,
        price: parseFloat(formData.price) || 0,
        description: formData.description || null,
        normal_range: formData.normal_range || null,
        turnaround_time: formData.turnaround_time || null,
      };

      if (editingItem) {
        const { error } = await db
          .from('lab_investigations')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Lab investigation updated successfully');
      } else {
        const { error } = await db
          .from('lab_investigations')
          .insert(payload);

        if (error) throw error;
        toast.success('Lab investigation created successfully');
      }

      setIsDialogOpen(false);
      loadInvestigations();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save lab investigation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const { error } = await db
        .from('lab_investigations')
        .update({ is_active: false })
        .eq('id', deletingItem.id);

      if (error) throw error;
      toast.success('Lab investigation deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      loadInvestigations();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete lab investigation');
    }
  };

  // Filter and pagination
  const filteredInvestigations = investigations.filter(item =>
    item.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sample_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvestigations.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredInvestigations.slice(startIndex, startIndex + entriesPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" />
              Lab Investigation
            </h1>
            <p className="text-muted-foreground">Manage laboratory tests and their pricing</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Lab Investigation
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
                  <TableHead className="text-primary-foreground font-semibold">Test Name</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Category</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Sample Type</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Price(USD)</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center w-24">Action</TableHead>
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
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No lab investigations found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={item.test_name}
                          readOnly
                          className="border-border bg-background max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell>{item.sample_type || '-'}</TableCell>
                      <TableCell>{item.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredInvestigations.length)} of {filteredInvestigations.length} entries
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                }
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Lab Investigation' : 'Add Lab Investigation'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the lab test details' : 'Add a new laboratory test'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test_name">Test Name *</Label>
              <Input
                id="test_name"
                value={formData.test_name}
                onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                placeholder="e.g., CBC, Blood Sugar, Lipid Panel"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample_type">Sample Type</Label>
                <Select
                  value={formData.sample_type}
                  onValueChange={(val) => setFormData({ ...formData, sample_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turnaround_time">Turnaround Time</Label>
                <Input
                  id="turnaround_time"
                  value={formData.turnaround_time}
                  onChange={(e) => setFormData({ ...formData, turnaround_time: e.target.value })}
                  placeholder="e.g., 24 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal_range">Normal Range</Label>
              <Input
                id="normal_range"
                value={formData.normal_range}
                onChange={(e) => setFormData({ ...formData, normal_range: e.target.value })}
                placeholder="e.g., 4.5-11.0 x10^9/L"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lab Investigation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.test_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
