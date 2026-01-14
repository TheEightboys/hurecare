import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ScanLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type-safe client for new tables not yet in generated types
const db = supabase as any;

interface ImagingInvestigation {
  id: string;
  modality: string;
  body_region: string | null;
  view_protocol: string | null;
  price: number;
  description: string | null;
  preparation_instructions: string | null;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
}

const MODALITIES = [
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'PET Scan',
  'Mammography',
  'Fluoroscopy',
  'Nuclear Medicine',
  'DEXA Scan',
  'Angiography',
];

const BODY_REGIONS = [
  'Head',
  'Neck',
  'Chest',
  'Abdomen',
  'Pelvis',
  'Spine',
  'Upper Extremity',
  'Lower Extremity',
  'Whole Body',
  'Other',
];

export default function ImagingInvestigationPage() {
  const [investigations, setInvestigations] = useState<ImagingInvestigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImagingInvestigation | null>(null);
  const [deletingItem, setDeletingItem] = useState<ImagingInvestigation | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    modality: '',
    body_region: '',
    view_protocol: '',
    price: '',
    description: '',
    preparation_instructions: '',
    duration_minutes: '',
  });

  useEffect(() => {
    loadInvestigations();
  }, []);

  const loadInvestigations = async () => {
    try {
      setLoading(true);
      const { data, error } = await db
        .from('imaging_investigations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestigations(data || []);
    } catch (error: any) {
      console.error('Error loading imaging investigations:', error);
      toast.error('Failed to load imaging investigations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: ImagingInvestigation) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        modality: item.modality,
        body_region: item.body_region || '',
        view_protocol: item.view_protocol || '',
        price: item.price?.toString() || '0',
        description: item.description || '',
        preparation_instructions: item.preparation_instructions || '',
        duration_minutes: item.duration_minutes?.toString() || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        modality: '',
        body_region: '',
        view_protocol: '',
        price: '',
        description: '',
        preparation_instructions: '',
        duration_minutes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.modality.trim()) {
      toast.error('Modality is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        modality: formData.modality.trim(),
        body_region: formData.body_region || null,
        view_protocol: formData.view_protocol || null,
        price: parseFloat(formData.price) || 0,
        description: formData.description || null,
        preparation_instructions: formData.preparation_instructions || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      };

      if (editingItem) {
        const { error } = await db
          .from('imaging_investigations')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Imaging investigation updated successfully');
      } else {
        const { error } = await db
          .from('imaging_investigations')
          .insert(payload);

        if (error) throw error;
        toast.success('Imaging investigation created successfully');
      }

      setIsDialogOpen(false);
      loadInvestigations();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save imaging investigation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const { error } = await db
        .from('imaging_investigations')
        .update({ is_active: false })
        .eq('id', deletingItem.id);

      if (error) throw error;
      toast.success('Imaging investigation deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      loadInvestigations();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete imaging investigation');
    }
  };

  // Filter and pagination
  const filteredInvestigations = investigations.filter(item =>
    item.modality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.body_region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.view_protocol?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <ScanLine className="w-6 h-6 text-primary" />
              Imaging Investigation
            </h1>
            <p className="text-muted-foreground">Manage imaging tests and their pricing</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Imaging Investigation
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
                  <TableHead className="text-primary-foreground font-semibold">Modality</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Body Region</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">View/Protocol</TableHead>
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
                      No imaging investigations found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={item.modality}
                          readOnly
                          className="border-border bg-background max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>{item.body_region || '***'}</TableCell>
                      <TableCell>{item.view_protocol || '***'}</TableCell>
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
            <DialogTitle>{editingItem ? 'Edit Imaging Investigation' : 'Add Imaging Investigation'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the imaging test details' : 'Add a new imaging test'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modality">Modality *</Label>
              <Select
                value={formData.modality}
                onValueChange={(val) => setFormData({ ...formData, modality: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select modality" />
                </SelectTrigger>
                <SelectContent>
                  {MODALITIES.map((mod) => (
                    <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_region">Body Region</Label>
                <Select
                  value={formData.body_region}
                  onValueChange={(val) => setFormData({ ...formData, body_region: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="view_protocol">View/Protocol</Label>
                <Input
                  id="view_protocol"
                  value={formData.view_protocol}
                  onChange={(e) => setFormData({ ...formData, view_protocol: e.target.value })}
                  placeholder="e.g., PA & Lateral"
                />
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
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="0"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
              <Textarea
                id="preparation_instructions"
                value={formData.preparation_instructions}
                onChange={(e) => setFormData({ ...formData, preparation_instructions: e.target.value })}
                placeholder="Patient preparation instructions..."
                rows={2}
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
            <AlertDialogTitle>Delete Imaging Investigation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.modality}"? This action cannot be undone.
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
