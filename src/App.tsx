import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser } from "@supabase/auth-helpers-react";
...
const App = () => {
  const user = useUser();

  // You might fetch userRole from your DB or metadata here if needed
  const userRole = user?.user_metadata?.role;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["farmer"]} userRole={userRole}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["buyer"]} userRole={userRole}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]} userRole={userRole}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
