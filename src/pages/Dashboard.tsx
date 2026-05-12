import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, Users, MessageCircle, ShieldCheck, 
  Loader2, Github, Code2, Layers, Target,
  BrainCircuit, Terminal
} from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { verifyGitHubSkills } from "@/services/githubVerification";
import { toast } from "sonner";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    
    const fetchRecommended = async () => {
      try {
        const q = query(collection(db, "profiles"), limit(10));
        const snap = await getDocs(q);
        const results = snap.docs
          .filter((d) => d.id !== user.uid)
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((p: any) => p.skills?.some((s: string) => profile.skills?.includes(s)))
          .slice(0, 4);
        setRecommended(results);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    
    fetchRecommended();
  }, [user, profile]);

  const handleVerify = async () => {
    const rawUrl = profile?.githubUrl || "";
    const extractedUsername = rawUrl.replace(/\/$/, "").split('/').filter(Boolean).pop(); 
    const finalUsername = profile?.githubUsername || extractedUsername;

    if (!finalUsername || finalUsername.includes('github.com')) {
      toast.error("Please ensure your GitHub URL is correct in your profile.");
      return;
    }

    setIsVerifying(true);
    const loadingToast = toast.loading("Gemini is decoding READMEs and analyzing code patterns...");

    try {
      await verifyGitHubSkills(user.uid, finalUsername);
      toast.dismiss(loadingToast);
      toast.success("Deep Audit Complete! Profile updated with README insights.");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Verification failed:", error);
      toast.error("AI Analysis failed. See console for details.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        
        {/* HERO SECTION */}
        <div className="glass-card neon-border p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display text-white tracking-tight">
                Hi, <span className="text-primary neon-text">{profile?.name?.split(' ')[0] || "Hacker"}</span>
              </h1>
              {profile.isVerified && (
                <Badge className="bg-primary/10 text-primary border-primary/40 animate-pulse px-3 py-1">
                  <BrainCircuit className="h-3 w-3 mr-1" />
                  AI Audited
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-xl font-light">
              {profile.role || "Developer"} 
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-sm opacity-70">Ready for Hackathons</span>
            </p>
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            className={`h-12 px-6 transition-all duration-300 ${profile.isVerified ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'neon-border-hover text-primary border-primary/50'}`}
            variant="outline"
          >
            {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            {isVerifying ? "Analyzing..." : profile.isVerified ? "Re-run AI Audit" : "Verify with Gemini AI"}
          </Button>
        </div>

        {/* PORTFOLIO INTELLIGENCE */}
        {profile.isVerified && profile.portfolioData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Portfolio Intelligence
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolioData.map((project: any, index: number) => (
                <div key={index} className="glass-card p-6 border-t border-white/5 hover:border-primary/40 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Terminal className="h-12 w-12" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{project.domain || "General"}</p>
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                        {project.primary_category || "Project"}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-white/5 border-white/10">
                      {project.complexity || "Intermediate"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic leading-relaxed">
                    "{project.use_case || "Analyzing project significance..."}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.tech_stack?.map((tech: string) => (
                      <span key={tech} className="text-[10px] bg-primary/5 text-primary/80 px-2.5 py-1 rounded-md border border-primary/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MASTER SKILL STACK */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-display text-primary mb-6 flex items-center gap-2">
            <Code2 className="h-5 w-5" /> Aggregated Expertise
          </h2>
          <div className="flex flex-wrap gap-3">
            {(profile.verifiedSkills || profile.skills || ["New Member"])?.map((skill: string) => (
              <div key={skill} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 group hover:border-primary/30 transition-all">
                <span className="text-sm font-medium text-white/90">{skill}</span>
                {profile.isVerified && <ShieldCheck className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100" />}
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED MEMBERS SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-neon-magenta" /> Recommended Squad Members
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((p) => (
              <div 
                key={p.uid} 
                onClick={() => navigate(`/profile/${p.uid}`)}
                className="glass-card p-4 hover:bg-white/5 cursor-pointer group transition-all border-white/5 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold">
                    {/* CRASH PROTECTION: Safer access to name */}
                    {p?.name ? p.name[0] : "?"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white truncate mb-1">
                  {p?.name || "Anonymous"}
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-3 truncate">
                  {p?.role || "Hacker"}
                </p>
                <div className="flex justify-center gap-1">
                  {p?.isVerified && <ShieldCheck className="h-3 w-3 text-primary" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}