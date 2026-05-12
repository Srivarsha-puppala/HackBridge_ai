import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Save, 
  Github, 
  ExternalLink, 
  Code2, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "profiles", auth.currentUser.uid);
      await updateDoc(docRef, {
        name: profile.name,
        role: profile.role,
        bio: profile.bio || "",
        updatedAt: new Date().toISOString()
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
      <p className="text-gray-500 font-medium tracking-widest uppercase text-[10px]">Syncing Identity...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-[#0a0c10] min-h-screen font-sans">
      {/* Header Area */}
      <div className="mb-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tighter">
          Identity Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium italic">Manage your verified developer presence.</p>
      </div>
      
      <div className="space-y-8">
        {/* Core Profile Card */}
        <div className="bg-[#11141b] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-gray-800/50 pb-8 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[1.5rem] flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
              <User size={40} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {profile?.name || "Anonymous Hacker"}
                </h2>
                <div className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  Active
                </div>
              </div>
              <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                <Code2 size={14} className="text-gray-600" /> {profile?.role || "Unassigned Role"}
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text" 
                value={profile?.name || ""} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-black/40 border border-gray-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Public Email</label>
              <div className="bg-black/20 border border-gray-800/50 rounded-2xl px-5 py-4 text-gray-600 text-sm flex items-center gap-3 italic">
                <Mail size={16} /> {auth.currentUser?.email}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Professional Bio</label>
              <textarea 
                rows={3}
                value={profile?.bio || ""} 
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-black/40 border border-gray-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all resize-none"
                placeholder="Describe your expertise..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>

        {/* AI-VERIFIED SKILLS SECTION */}
        <div className="bg-[#11141b] border border-gray-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck size={16} fill="currentColor" className="opacity-50" /> 
                AI-Verified Expertise
              </h3>
              <p className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-tighter">
                Skills audited via Gemini 3.1 & GitHub Engine
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
              <Github size={12} /> Sync Status: Active
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {profile?.verifiedSkills && profile.verifiedSkills.length > 0 ? (
              profile.verifiedSkills.map((skill: string) => (
                <div 
                  key={skill} 
                  className="group relative flex items-center gap-3 bg-gradient-to-b from-[#161b22] to-black border border-gray-800/80 px-5 py-3 rounded-2xl hover:border-cyan-500/40 transition-all duration-300"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                  
                  <div className="w-6 h-6 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck size={14} className="text-cyan-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                    {skill}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full py-12 border-2 border-dashed border-gray-800/50 rounded-[2rem] flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-700 mb-4">
                  <ExternalLink size={24} />
                </div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                  No skills verified yet
                </p>
                <p className="text-[10px] text-gray-700 mt-1 max-w-[200px]">
                  Run the AI Audit on the Discovery page to earn your credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;