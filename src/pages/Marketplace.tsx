import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Sprout } from 'lucide-react';
import { 
  getCurrentUser, 
  getAvailableCrops, 
  updateCrop, 
  saveSale, 
  getUsers,
  type Crop 
} from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'buyer') {
      navigate('/login');
      return;
    }
    loadCrops();
  }, [currentUser, navigate]);

  const loadCrops = () => {
    const availableCrops = getAvailableCrops();
    setCrops(availableCrops);
  };

  const handlePurchase = () => {
    if (!selectedCrop || !currentUser) return;

    const qty = parseFloat(purchaseQuantity);
    
    if (qty <= 0 || qty > selectedCrop.quantity) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a valid quantity (max: ${selectedCrop.quantity})`,
        variant: "destructive",
      });
      return;
    }

    const total = qty * (selectedCrop.price || 0);
    const users = getUsers();
    const farmer = users.find(u => u.id === selectedCrop.farmerId);

    // Update crop quantity
    const updatedCrop = {
      ...selectedCrop,
      quantity: selectedCrop.quantity - qty,
      status: (selectedCrop.quantity - qty) === 0 ? 'sold' as const : 'available' as const,
    };
    updateCrop(updatedCrop);

    // Record sale
    const sale = {
      id: crypto.randomUUID(),
      cropId: selectedCrop.id,
      farmerId: selectedCrop.farmerId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      cropName: selectedCrop.cropName,
      quantity: qty,
      price: selectedCrop.price || 0,
      total,
      date: new Date().toISOString(),
    };
    saveSale(sale);

    toast({
      title: "Purchase successful!",
      description: `You bought ${qty} ${selectedCrop.unit} of ${selectedCrop.cropName} for $${total.toFixed(2)}`,
    });

    setSelectedCrop(null);
    setPurchaseQuantity('');
    loadCrops();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/buyer/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse and purchase fresh crops from local farmers</p>
        </div>

        {crops.length === 0 ? (
          <Card className="text-center py-12 animate-scale-in">
            <CardContent>
              <Sprout className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">No crops available at the moment</p>
              <p className="text-sm text-muted-foreground">Check back later for fresh produce!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-in">
            {crops.map((crop) => (
              <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{crop.cropName}</CardTitle>
                      <CardDescription className="capitalize">{crop.cropType}</CardDescription>
                    </div>
                    <Badge variant="outline">{crop.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-primary">${crop.price?.toFixed(2)} / {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harvest Date:</span>
                    <span className="font-medium">{new Date(crop.harvestDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase {selectedCrop?.cropName}</DialogTitle>
              <DialogDescription>
                Enter the quantity you want to purchase
              </DialogDescription>
            </DialogHeader>
            {selectedCrop && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity ({selectedCrop.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    max={selectedCrop.quantity}
                    placeholder={`Max: ${selectedCrop.quantity}`}
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(e.target.value)}
                  />
                </div>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per {selectedCrop.unit}:</span>
                    <span className="font-medium">${selectedCrop.price?.toFixed(2)}</span>
                  </div>
                  {purchaseQuantity && (
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-primary">
                        ${(parseFloat(purchaseQuantity) * (selectedCrop.price || 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCrop(null)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase}>
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Marketplace;
