import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Crop {
  id: string;
  crop_name: string;
  crop_type: string;
  quantity: number;
  unit: string;
  price: number;
  harvest_date: string;
  status: string;
  image_url: string | null;
}

const ManageCrops = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'farmer')) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile) {
      loadCrops();
    }
  }, [profile]);

  const loadCrops = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('crops')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCrops(data);
    }
  };

  const handleDelete = async (cropId: string) => {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete crop.",
        variant: "destructive",
      });
      return;
    }

    loadCrops();
    setDeleteId(null);
    toast({
      title: "Crop deleted",
      description: "The crop has been removed from your inventory.",
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/farmer/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Manage Crops</CardTitle>
                <CardDescription>View, edit, and delete your crop listings</CardDescription>
              </div>
              <Button onClick={() => navigate('/farmer/add-crop')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Crop
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {crops.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No crops listed yet</p>
                <Button onClick={() => navigate('/farmer/add-crop')}>
                  Add Your First Crop
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Crop Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Harvest Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crops.map((crop) => (
                      <TableRow key={crop.id}>
                        <TableCell>
                          {crop.image_url ? (
                            <img
                              src={crop.image_url}
                              alt={crop.crop_name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{crop.crop_name}</TableCell>
                        <TableCell className="capitalize">{crop.crop_type}</TableCell>
                        <TableCell>{crop.quantity} {crop.unit}</TableCell>
                        <TableCell>${crop.price.toFixed(2)}</TableCell>
                        <TableCell>{new Date(crop.harvest_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={crop.status === 'active' ? 'default' : 'secondary'}>
                            {crop.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(crop.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this crop from your inventory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ManageCrops;
