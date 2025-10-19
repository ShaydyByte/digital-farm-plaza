import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  userRole?: string;
}

export default function ProtectedRoute({ children, allowedRoles, userRole }: ProtectedRouteProps) {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === null) {
      navigate("/login"); // Not logged in
    } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      navigate("/"); // Logged in but not allowed here
    }
  }, [session, userRole, allowedRoles, navigate]);

  // Wait until Supabase finishes checking session
  if (session === undefined) {
    return <div className="flex h-screen items-center justify-center text-lg">Loading...</div>;
  }

  return <>{children}</>;
}

