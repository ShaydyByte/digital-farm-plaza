import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, LogOut } from 'lucide-react';
import { getCurrentUser, clearCurrentUser } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    clearCurrentUser();
    toast({
      title: "Logged out successfully",
      description: "Come back soon!",
    });
    navigate('/');
  };

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FarmLinkJA</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-semibold text-foreground">{currentUser.name}</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
