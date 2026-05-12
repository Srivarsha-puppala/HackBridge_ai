import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/find-team" element={<FindTeam />} />
            <Route path="/manage-team" element={<ManageTeam />} />
            <Route path="/my-teams" element={<MyTeams />} />
            {/* The Inbox: Shows all your active conversations */}
            <Route path="/chat" element={<ChatList />} />
            
            {/* The Chat Window: Updated to use conversationId for the Firestore Doc ID */}
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/profile/:uid" element={<PublicProfile />} />
      
            <Route path="/create-team" element={<CreateTeam />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;