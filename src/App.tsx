import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // Import your new gatekeeper

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import FindTeam from "./pages/FindTeam";
import ManageTeam from "./pages/ManageTeam";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import PublicProfile from "./PublicProfile";
import CreateTeam from "./pages/CreateTeam";
import MyTeams from './pages/MyTeams';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* --- PROTECTED ROUTES (Require Login) --- */}
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            
            <Route path="/find-team" element={
              <ProtectedRoute><FindTeam /></ProtectedRoute>
            } />
            
            <Route path="/manage-team" element={
              <ProtectedRoute><ManageTeam /></ProtectedRoute>
            } />
            
            <Route path="/my-teams" element={
              <ProtectedRoute><MyTeams /></ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute><ChatList /></ProtectedRoute>
            } />
            
            <Route path="/chat/:conversationId" element={
              <ProtectedRoute><Chat /></ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            <Route path="/profile/:uid" element={
              <ProtectedRoute><PublicProfile /></ProtectedRoute>
            } />
            
            <Route path="/create-team" element={
              <ProtectedRoute><CreateTeam /></ProtectedRoute>
            } />

            {/* --- 404 CATCH-ALL --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;