import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
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
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes
  useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    
    if (currentUser) {
      try {
        // Line 46 is likely this getDoc call
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No profile found for this UID, user might need onboarding.");
          setProfile(null);
        }
      } catch (error) {
        // This stops the app from crashing with "Uncaught (in promise)"
        console.error("Error fetching profile on login:", error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
  // 2. THE FIX: Sync Profile using UID as Document ID
  const syncProfile = async (data: any) => {
    if (!auth.currentUser) throw new Error("No authenticated user");

    try {
      // We use auth.currentUser.uid to match your Security Rules
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const profileData = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        username: data.username || "",
        bio: data.bio || "",
        githubUrl: data.githubUrl || "",
        skills: data.skills || [],
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, profileData, { merge: true });
      setProfile(profileData);
      console.log("Profile successfully synced to Firestore!");
    } catch (error) {
      console.error("Profile sync error details:", error);
      throw error; // Pass the error to the UI to show an alert
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, syncProfile }}>
      {!loading && children}
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