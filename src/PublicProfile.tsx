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
  Terminal, ArrowLeft, UserPlus, CheckCircle2 
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
    if (!user || !currentUserProfile) {
      return toast.error("Please login to send invites");
    }
    if (user.uid === uid) {
      return toast.error("You cannot invite yourself!");
    }

    setSending(true);
    const result = await sendInvitation(currentUserProfile, uid!);
    
    if (result.success) {
      toast.success(`Invitation sent to ${targetProfile?.name}!`);
    } else {
      toast.error("Failed to send invitation.");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-pulse text-primary font-display text-xl">
            Decoding Hacker Identity...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!targetProfile) {
    return (
      <AppLayout>
        <div className="p-10 text-center">
          <h2 className="text-2xl font-display text-white">404: Hacker Not Found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
        
        {/* Navigation & Header Actions */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {user?.uid !== uid && (
            <Button 
              onClick={handleInvite}
              disabled={sending}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 neon-shadow"
            >
              {sending ? (
                "Processing..."
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Invite to Squad</>
              )}
            </Button>
          )}
        </div>

        {/* Profile Identity Card */}
        <div className="glass-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display text-white tracking-tight">
                {targetProfile.name}
              </h1>
              {targetProfile.isVerified && (
                <Badge className="bg-primary/10 text-primary border-primary/50 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> AI Audited
                </Badge>
              )}
            </div>
            
            <p className="text-xl text-primary/80 font-medium">{targetProfile.role}</p>
            
            <div className="flex items-center gap-4">
               {targetProfile.githubUrl && (
                 <a 
                   href={targetProfile.githubUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                 >
                   <Github className="h-4 w-4" /> 
                   <span>github.com/{targetProfile.githubUsername || 'profile'}</span>
                 </a>
               )}
            </div>
          </div>
        </div>

        {/* Portfolio Intelligence Section */}
        {targetProfile.portfolioData && targetProfile.portfolioData.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-display text-white">Portfolio Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {targetProfile.portfolioData.map((project, index) => (
                <div key={index} className="glass-card p-6 border-t border-white/5 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                        {project.domain || "General"}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {project.primary_category}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-white/50">
                      {project.complexity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    "{project.use_case}"
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <span 
                        key={tech} 
                        className="text-[11px] bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-white/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Technical Foundation */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display text-white">Technical Foundation</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {(targetProfile.verifiedSkills || targetProfile.skills || []).map((skill) => (
              <Badge 
                key={skill} 
                className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 py-1.5 px-4 text-sm"
              >
                <CheckCircle2 className="h-3 w-3 mr-2" />
                {skill}
              </Badge>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}