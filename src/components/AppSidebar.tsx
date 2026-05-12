import React from "react";
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  MessageSquare, 
  PlusCircle, 
  LogOut,
  User
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../lib/firebase"; // Ensure path matches your 'lib' folder
import { signOut } from "firebase/auth";

const AppSidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Find Team",
      url: "/find-team",
      icon: Search,
    },
    {
      title: "My Squads", // Renamed for clarity
      url: "/my-teams",  // Updated URL
      icon: Users,       
    },
    {
      title: "Create Team",
      url: "/create-team",
      icon: PlusCircle,
    },
    {
      title: "Manage Team",
      url: "/manage-team",
      icon: LayoutDashboard,
    },
    
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="w-64 bg-[#0a0c10] border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">HackBridge</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <Icon size={20} className={`${isActive ? "text-cyan-400" : "group-hover:text-white"}`} />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link 
          to="/profile" 
          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <User size={18} />
          <span className="text-sm font-medium">Profile Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;