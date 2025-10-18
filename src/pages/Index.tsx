import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Sprout className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Connect Farmers & Buyers
              <span className="block text-primary mt-2">Directly on FarmLinkJA</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A complete farm management and marketplace platform. List your crops, manage inventory, and connect with buyers seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose FarmLinkJA?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to manage and grow your farm business</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-slide-in">
            <Card className="border-2 hover:border-primary transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Direct Connection</CardTitle>
                <CardDescription>
                  Connect farmers directly with buyers, eliminating middlemen and maximizing profits
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/10">
                  <TrendingUp className="h-7 w-7 text-secondary" />
                </div>
                <CardTitle>Easy Management</CardTitle>
                <CardDescription>
                  Intuitive dashboard to add, manage, and track all your crops and sales in one place
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Safe and reliable platform with secure transactions and verified user accounts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-accent py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center animate-scale-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join FarmLinkJA today and start connecting with farmers or buyers
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">FarmLinkJA</span>
          </div>
          <p className="text-sm">© 2025 FarmLinkJA. Connecting farms to markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
