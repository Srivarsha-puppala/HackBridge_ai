import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Sparkles, CheckCircle2, ArrowRight, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

const FindTeam = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. REAL-TIME DATA FETCHING
  useEffect(() => {
    const qTeams = query(collection(db, "teams"));
    const qProfiles = query(collection(db, "profiles"));
    
    const unsubTeams = onSnapshot(qTeams, (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubProfiles = onSnapshot(qProfiles, (snapshot) => {
      setProfiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTeams();
      unsubProfiles();
    };
  }, []);

  // 2. MAGIC SUGGEST LOGIC (The Core Feature)
  const handleMagicSuggest = () => {
    if (!auth.currentUser) {
      toast.error("Please login to see matches!");
      return;
    }

    // Find the logged-in user's profile skills
    const userProfile = profiles.find(p => p.id === auth.currentUser?.uid);
    const userSkills = userProfile?.skills || [];

    if (userSkills.length === 0) {
      toast.error("Add skills to your profile first!");
      return;
    }

    // Map through teams and calculate compatibility percentage
    const rankedTeams = teams.map(team => {
      const matchCount = team.openRoles?.filter((role: string) => 
        userSkills.some((skill: string) => 
          role.toLowerCase().trim().includes(skill.toLowerCase().trim()) || 
          skill.toLowerCase().trim().includes(role.toLowerCase().trim())
        )
      ).length || 0;
      
      const score = team.openRoles?.length > 0 
        ? Math.round((matchCount / team.openRoles.length) * 100) 
        : 0;

      return { ...team, compatibility: score };
    });

    // CRITICAL: Force a new array reference and sort by compatibility
    const sortedData = [...rankedTeams].sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
    
    setTeams(sortedData); 
    toast.success("AI Matching Complete! High compatibility squads are now at the top.");
  };

  const handleJoinRequest = async (teamId: string, teamName: string, teamLeadId: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "invitations"), {
        teamId,
        teamName,
        receiverId: teamLeadId, // Renamed to match your Security Rules
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Hacker",
        status: "pending",
        timestamp: serverTimestamp()
      });
      toast.success(`Request sent to ${teamName}!`);
    } catch (error) {
      toast.error("Failed to send request.");
    }
  };

  // 3. FILTER GUARD (Handles both search bar and AI sorting)
  const filteredTeams = teams.filter(team => 
    team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.projectCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <Zap className="animate-pulse text-cyan-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Squad Discovery</h1>
          <p className="text-gray-500 text-sm font-bold mt-2 flex items-center gap-2">
            <Shield size={14} className="text-cyan-500" /> Powered by HackBridge Intelligence
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input 
              type="text"
              placeholder="Search tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#11141b] border border-gray-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-cyan-500/50 w-[300px] text-sm"
            />
          </div>
          <button 
            onClick={handleMagicSuggest}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            <Sparkles size={16} /> Magic Suggest
          </button>
        </div>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTeams.map((team) => {
          const isOwner = team.createdBy === auth.currentUser?.uid;
          const isMember = team.members?.includes(auth.currentUser?.uid);

          return (
            <div key={team.id} className="bg-[#11141b] border border-gray-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between group hover:border-gray-700 transition-all">
              <div className="flex-1">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {team.projectCategory}
                </span>
                <h3 className="text-2xl font-bold mt-4 mb-2 uppercase">{team.name}</h3>
                <p className="text-gray-500 text-sm max-w-xl mb-6">{team.description}</p>
                <div className="flex flex-wrap gap-2">
                  {team.openRoles?.map((role: string, idx: number) => (
                    <span key={idx} className="bg-black/40 text-gray-400 text-[10px] font-bold px-4 py-2 rounded-xl border border-gray-800">{role}</span>
                  ))}
                </div>
              </div>

              {/* Compatibility UI */}
              <div className="flex flex-col items-center md:items-end gap-6 md:pl-12 border-l-0 md:border-l border-gray-800">
                <div className="text-right">
                  <span className={`text-4xl font-black ${team.compatibility > 70 ? 'text-green-400' : 'text-white'}`}>
                    {team.compatibility || 0}%
                  </span>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Compatibility</p>
                </div>
                
                {isOwner ? (
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Captain</span>
                ) : isMember ? (
                  <div className="flex items-center gap-2 bg-cyan-500/10 px-6 py-3 rounded-2xl border border-cyan-500/20 text-cyan-500 text-xs font-bold uppercase">
                    <CheckCircle2 size={14} /> Joined
                  </div>
                ) : (
                  <button 
                    onClick={() => handleJoinRequest(team.id, team.name, team.createdBy)}
                    className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center gap-2"
                  >
                    Join Squad <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FindTeam;