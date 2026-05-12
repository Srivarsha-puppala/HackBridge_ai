import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { subscribeToIncomingRequests, updateRequestStatus } from '../services/invitationService';
import { Shield, UserPlus, Check, X, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const ManageTeam = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Use the service to listen for invitations where receiverId == current user
    const unsubscribe = subscribeToIncomingRequests(auth.currentUser.uid, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateRequestStatus(requestId, status);
      // The real-time listener will automatically remove the request from the UI
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  if (loading) return <div className="p-10 text-white animate-pulse">Loading Operations...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 text-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Shield className="text-cyan-500" /> Squad Operations
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and verify incoming join requests.</p>
        </div>
        
        <div className="bg-[#11141b] border border-gray-800 px-4 py-2 rounded-full flex items-center gap-2">
          <span className="text-cyan-500 font-bold">{requests.length}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} className="bg-[#11141b] border border-gray-800 rounded-3xl p-6 flex items-center justify-between group hover:border-gray-700 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
                  <UserPlus className="text-gray-400" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{req.senderName}</h3>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-md border border-cyan-500/20 uppercase font-black">
                      Applicant
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <Users size={12} /> Wants to join <span className="text-gray-300 font-bold">{req.teamName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAction(req.id, 'rejected')}
                  className="p-3 rounded-xl border border-gray-800 text-gray-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                  title="Decline"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={() => handleAction(req.id, 'accepted')}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-500 transition-all"
                >
                  <Check size={18} /> Approve Hacker
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#11141b]/50 border border-dashed border-gray-800 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-gray-700" size={32} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your squad is secure. No new requests.</p>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-12 pt-6 border-t border-gray-900 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
        <Clock size={12} /> Live Sync Active
        <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
      </div>
    </div>
  );
};

export default ManageTeam;