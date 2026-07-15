import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface Profile {
  uid?: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  githubUrl?: string;
  githubUsername?: string;
  skills?: string[];
  verifiedSkills?: string[];
  isVerified?: boolean;
  role?: string;
  teamId?: string;    // Added for HackBridge Logic
  teamName?: string;  // Added for HackBridge Logic
  portfolioData?: {
    domain?: string;
    primary_category?: string;
    complexity?: string;
    use_case?: string;
    tech_stack?: string[];
  }[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
  syncProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes and Profile Data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Use onSnapshot for real-time updates across the app
        const docRef = doc(db, "profiles", currentUser.uid);
        const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as Profile);
          } else {
            console.log("No profile found, user likely needs onboarding.");
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Sync Profile (Corrected to use "profiles" collection)
  const syncProfile = async (data: any) => {
    if (!auth.currentUser) throw new Error("No authenticated user");

    try {
      // Updated from "users" to "profiles" to match your rules and listener
      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      
      const profileData = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        name: data.name || data.username || "",
        username: data.username || "",
        bio: data.bio || "",
        githubUrl: data.githubUrl || "",
        skills: data.skills || [],
        updatedAt: serverTimestamp(),
      };

      await setDoc(profileRef, profileData, { merge: true });
      // We don't manually setProfile(profileData) here because 
      // the onSnapshot listener above will handle it automatically!
      console.log("Profile successfully synced to Firestore!");
    } catch (error) {
      console.error("Profile sync error details:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};