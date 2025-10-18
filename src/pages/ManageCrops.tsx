import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { getCurrentUser, getCropsByFarmer, deleteCrop, type Crop } from '@/lib/localStorage';
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

const ManageCrops = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/login');
      return;
    }
    loadCrops();
  }, [currentUser, navigate]);

  const loadCrops = () => {
    if (currentUser) {
      const farmerCrops = getCropsByFarmer(currentUser.id);
      setCrops(farmerCrops);
    }
  };

  const handleDelete = (cropId: string) => {
    deleteCrop(cropId);
    loadCrops();
    setDeleteId(null);
    toast({
      title: "Crop deleted",
      description: "The crop has been removed from your inventory.",
    });
  };

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
                        <TableCell className="font-medium">{crop.cropName}</TableCell>
                        <TableCell className="capitalize">{crop.cropType}</TableCell>
                        <TableCell>{crop.quantity} {crop.unit}</TableCell>
                        <TableCell>${crop.price?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>{new Date(crop.harvestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={crop.status === 'available' ? 'default' : 'secondary'}>
                            {crop.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toast({
                                title: "Edit feature",
                                description: "Edit functionality coming soon!",
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
