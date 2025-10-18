import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser, saveCrop } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const AddCrop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    cropName: '',
    cropType: '',
    plantDate: '',
    harvestDate: '',
    quantity: '',
    unit: 'kg',
    price: '',
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    const newCrop = {
      id: crypto.randomUUID(),
      farmerId: currentUser.id,
      cropName: formData.cropName,
      cropType: formData.cropType,
      plantDate: formData.plantDate,
      harvestDate: formData.harvestDate,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      status: 'available' as const,
      price: parseFloat(formData.price),
    };

    saveCrop(newCrop);

    toast({
      title: "Crop added successfully!",
      description: `${formData.cropName} has been added to your inventory.`,
    });

    navigate('/farmer/manage-crops');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

        <Card className="max-w-2xl mx-auto shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Crop</CardTitle>
            <CardDescription>Fill in the details to list your crop for sale</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cropName">Crop Name</Label>
                  <Input
                    id="cropName"
                    placeholder="e.g., Tomatoes"
                    value={formData.cropName}
                    onChange={(e) => handleChange('cropName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select value={formData.cropType} onValueChange={(value) => handleChange('cropType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetable">Vegetable</SelectItem>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="grain">Grain</SelectItem>
                      <SelectItem value="legume">Legume</SelectItem>
                      <SelectItem value="herb">Herb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plantDate">Plant Date</Label>
                  <Input
                    id="plantDate"
                    type="date"
                    value={formData.plantDate}
                    onChange={(e) => handleChange('plantDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleChange('harvestDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="price">Price per Unit ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="5.99"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Add Crop
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/farmer/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddCrop;
