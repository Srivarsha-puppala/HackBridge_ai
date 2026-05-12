import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Users, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import ChatRoom from '../components/ChatRoom';

const MyTeams = () => {
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for teams where the user is a member
    const q = query(
      collection(db, "teams"),
      where("members", "array-contains", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...(doc.data() as any) 
      }));
      setMyTeams(teamsData);
      
      // Auto-select the first team if none is selected
      if (teamsData.length > 0 && !activeChat) {
        setActiveChat({ id: teamsData[0].id, name: teamsData[0].name });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeChat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0c10]">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 text-white min-h-screen">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          SQUAD COMMAND
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
          Active Collaborations & Secure Channels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: TEAM LIST */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-4">
            Your Squads ({myTeams.length})
          </h2>
          
          {myTeams.length > 0 ? (
            myTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => setActiveChat({ id: team.id, name: team.name })}
                className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${
                  activeChat?.id === team.id
                    ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                    : 'bg-[#11141b] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-tighter">
                      {team.projectCategory || 'General'}
                    </span>
                    {activeChat?.id === team.id && (
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <h3 className={`font-bold transition-colors ${activeChat?.id === team.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    <MessageSquare size={12} className="text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {activeChat?.id === team.id ? 'Viewing Chat' : 'Open Channel'}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 border-2 border-dashed border-gray-900 rounded-[2.5rem] text-center">
              <Users size={32} className="mx-auto mb-4 text-gray-800" />
              <p className="text-xs text-gray-600 font-bold uppercase">No Squads Found</p>
            </div>
          )}
        </div>

        {/* MAIN CONTENT: CHAT INTERFACE */}
        <div className="lg:col-span-3">
          {activeChat ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ChatRoom teamId={activeChat.id} teamName={activeChat.name} />
            </div>
          ) : (
            <div className="h-[600px] bg-[#11141b] border border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={40} className="text-gray-800" />
              </div>
              <h2 className="text-xl font-bold text-gray-400">Secure Channel Encrypted</h2>
              <p className="text-gray-600 text-sm mt-2 max-w-xs">
                Select a squad from the left to authorize access to the real-time communication bridge.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyTeams;