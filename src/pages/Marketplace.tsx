import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Sprout, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface Crop {
  id: string;
  crop_name: string;
  crop_type: string;
  quantity: number;
  unit: string;
  price: number;
  harvest_date: string;
  image_url: string | null;
  farmer_id: string;
  farmer_name: string;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>('');

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'buyer')) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    const { data } = await supabase
      .from('crops')
      .select(`
        *,
        profiles!crops_farmer_id_fkey(full_name)
      `)
      .eq('status', 'active')
      .gt('quantity', 0);

    if (data) {
      const cropsWithFarmer = data.map((crop: any) => ({
        ...crop,
        farmer_name: crop.profiles?.full_name || 'Unknown',
      }));
      setCrops(cropsWithFarmer);
    }
  };

  const handlePurchase = async () => {
    if (!selectedCrop || !profile) return;

    const qty = parseFloat(purchaseQuantity);
    
    if (qty <= 0 || qty > selectedCrop.quantity) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a valid quantity (max: ${selectedCrop.quantity})`,
        variant: "destructive",
      });
      return;
    }

    const total = qty * selectedCrop.price;

    try {
      // Update crop quantity
      const newQuantity = selectedCrop.quantity - qty;
      const { error: updateError } = await supabase
        .from('crops')
        .update({ 
          quantity: newQuantity,
          status: newQuantity === 0 ? 'inactive' : 'active'
        })
        .eq('id', selectedCrop.id);

      if (updateError) throw updateError;

      // Record sale
      const { error: saleError } = await supabase.from('sales').insert({
        crop_id: selectedCrop.id,
        buyer_id: profile.id,
        farmer_id: selectedCrop.farmer_id,
        quantity: qty,
        total_price: total,
      });

      if (saleError) throw saleError;

      toast({
        title: "Purchase successful!",
        description: `You bought ${qty} ${selectedCrop.unit} of ${selectedCrop.crop_name} for $${total.toFixed(2)}`,
      });

      setSelectedCrop(null);
      setPurchaseQuantity('');
      loadCrops();
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMessage = (crop: Crop) => {
    navigate(`/messages?crop=${crop.id}&farmer=${crop.farmer_id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

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
              <Card key={crop.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {crop.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={crop.image_url}
                      alt={crop.crop_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{crop.crop_name}</CardTitle>
                      <CardDescription className="capitalize">
                        {crop.crop_type} • by {crop.farmer_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-primary">${crop.price.toFixed(2)} / {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harvest Date:</span>
                    <span className="font-medium">{new Date(crop.harvest_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMessage(crop)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase {selectedCrop?.crop_name}</DialogTitle>
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
                    <span className="font-medium">${selectedCrop.price.toFixed(2)}</span>
                  </div>
                  {purchaseQuantity && (
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-primary">
                        ${(parseFloat(purchaseQuantity) * selectedCrop.price).toFixed(2)}
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
