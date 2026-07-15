import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppLayout } from "@/components/AppLayout";
import { Profile } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendInvitation } from "@/services/invitationService";
import { toast } from "sonner";
import { 
  ShieldCheck, Github, Code2, Layers, 
  Terminal, ArrowLeft, UserPlus, CheckCircle2,
  Mail, ExternalLink, Award
} from "lucide-react";

export default function PublicProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      try {
        const docSnap = await getDoc(doc(db, "profiles", uid));
        if (docSnap.exists()) {
          setTargetProfile(docSnap.data() as Profile);
        } else {
          toast.error("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  const handleInvite = async () => {
    // 1. Validation checks
    if (!user || !currentUserProfile) {
      return toast.error("Please login to send invites");
    }
    if (user.uid === uid) {
      return toast.error("You cannot invite yourself!");
    }
    if (!currentUserProfile.teamId) {
      return toast.error("You must create or join a team first to invite others!");
    }

    setSending(true);

    try {
      // 2. Call sendInvitation with all 5 required arguments
      const result = await sendInvitation(
        currentUserProfile.teamId,               // 1. teamId
        currentUserProfile.teamName || "My Squad", // 2. teamName
        uid!,                                     // 3. receiverId (The person you are viewing)
        user.uid,                                 // 4. senderId
        currentUserProfile.name || "A Hacker"     // 5. senderName
      );
      
      if (result?.success) {
        toast.success(`Invitation sent to ${targetProfile?.name}!`);
      }
    } catch (error) {
      toast.error("Failed to send invitation.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!targetProfile) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-400">Profile Not Found</h2>
          <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discovery
        </Button>

        <div className="bg-[#11141b] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-cyan-900/20 to-violet-900/20 border-b border-gray-800" />
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="p-2 bg-[#0a0c10] rounded-[2rem] border border-gray-800">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[1.8rem] flex items-center justify-center">
                  <span className="text-4xl font-black text-gray-700">
                    {targetProfile.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleInvite}
                disabled={sending}
                className="bg-white text-black hover:bg-cyan-500 font-bold px-8 py-6 rounded-2xl transition-all shadow-lg shadow-cyan-500/10"
              >
                {sending ? "Sending..." : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" /> Recruit to Squad
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                    {targetProfile.name}
                    <ShieldCheck className="text-cyan-500" size={24} />
                  </h1>
                  <p className="text-gray-400 font-medium text-lg mt-1">{targetProfile.role || "Independent Hacker"}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Bio</h4>
                  <p className="text-gray-300 leading-relaxed italic">
                    "{targetProfile.bio || "This hacker is too busy building the future to write a bio."}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Technical Arsenal</h4>
                  <div className="flex flex-wrap gap-2">
                    {targetProfile.skills?.map((skill, index) => (
                      <Badge 
                        key={index} 
                        className="bg-gray-900/50 hover:bg-cyan-500/10 border-gray-800 text-gray-400 hover:text-cyan-500 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Stats/Links */}
              <div className="space-y-6">
                <div className="bg-black/20 border border-gray-800/50 rounded-3xl p-6 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Hacker Stats</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs flex items-center gap-2"><Award size={14}/> Ranking</span>
                    <span className="text-white font-bold text-xs">Elite</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs flex items-center gap-2"><Code2 size={14}/> Commits</span>
                    <span className="text-white font-bold text-xs">1.2k+</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start gap-3 border-gray-800 text-gray-400 hover:bg-gray-800">
                    <Github size={18} /> GitHub Profile <ExternalLink size={14} className="ml-auto opacity-50"/>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 border-gray-800 text-gray-400 hover:bg-gray-800">
                    <Mail size={18} /> Direct Message <ExternalLink size={14} className="ml-auto opacity-50"/>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

  