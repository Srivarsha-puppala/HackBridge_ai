import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap } from "lucide-react";

/**
 * PROTECTED ROUTE
 * Prevents unauthenticated users from accessing private pages.
 * Redirects to /login if no active session is found.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Wait for Firebase to verify the user's identity
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Zap className="text-cyan-500 animate-pulse" size={48} />
          <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse"></div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">
          Verifying Credentials
        </p>
      </div>
    );
  }

  // 2. If no user is logged in, redirect to login
  // We save the 'from' location so we can send them back after they log in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If authenticated, render the page
  return <>{children}</>;
};