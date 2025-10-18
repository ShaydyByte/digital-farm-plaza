import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TrendingUp, DollarSign, Package } from 'lucide-react';
import { getCurrentUser, getSalesByFarmer, type Sale } from '@/lib/localStorage';
import Navbar from '@/components/Navbar';

const Sales = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/login');
      return;
    }
    loadSales();
  }, [currentUser, navigate]);

  const loadSales = () => {
    if (currentUser) {
      const farmerSales = getSalesByFarmer(currentUser.id);
      setSales(farmerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

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

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Sales & Reports</h1>
          <p className="text-muted-foreground">Track your earnings and sales performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">Completed transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageSale.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Sales History</CardTitle>
            <CardDescription>Detailed record of all your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No sales yet</p>
                <p className="text-sm text-muted-foreground">Your sales will appear here once buyers purchase your crops</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{sale.buyerName}</TableCell>
                        <TableCell>{sale.cropName}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>${sale.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${sale.total.toFixed(2)}
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

export default Sales;
