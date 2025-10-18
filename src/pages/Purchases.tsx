import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, ShoppingCart } from 'lucide-react';
import { getCurrentUser, getSalesByBuyer, type Sale } from '@/lib/localStorage';
import Navbar from '@/components/Navbar';

const Purchases = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [purchases, setPurchases] = useState<Sale[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'buyer') {
      navigate('/login');
      return;
    }
    loadPurchases();
  }, [currentUser, navigate]);

  const loadPurchases = () => {
    if (currentUser) {
      const buyerPurchases = getSalesByBuyer(currentUser.id);
      setPurchases(buyerPurchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);

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
          <h1 className="text-3xl font-bold mb-2">Purchase History</h1>
          <p className="text-muted-foreground">View all your past transactions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8 animate-slide-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-xs text-muted-foreground">Items purchased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Purchase History</CardTitle>
            <CardDescription>Detailed record of all your purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No purchases yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start shopping in the marketplace!</p>
                <Button onClick={() => navigate('/buyer/marketplace')}>
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{purchase.cropName}</TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>${purchase.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${purchase.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Purchases;
