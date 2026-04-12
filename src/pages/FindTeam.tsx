import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendTeamRequest } from "@/lib/teamActions";
import { verifyGitHubSkills } from "@/lib/githubVerify";
import { toast } from "sonner";
import { Search, UserPlus, CheckCircle, Github, Loader2 } from "lucide-react";

interface DiscoveredProfile {
  uid: string;
  name: string;
  role: string;
  skills: string[];
  bio: string;
  githubUrl?: string;
  verifiedSkills?: string[];
}

export default function FindTeam() {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveredProfile[]>([]);
  const [search, setSearch] = useState("");
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "profiles"));
      const results = snap.docs
        .filter((d) => d.id !== user?.uid)
        .map((d) => ({ uid: d.id, ...d.data() } as DiscoveredProfile));
      setProfiles(results);
    };
    fetch();
  }, [user]);

  const handleInvite = async (target: DiscoveredProfile) => {
    if (!user || !profile) return;
    const alreadySent = profile.sentInvitations?.some((i) => i.uid === target.uid);
    const alreadyInSquad = profile.mySquad?.some((m) => m.uid === target.uid);
    if (alreadySent || alreadyInSquad) {
      toast.info("Already connected or invitation sent");
      return;
    }
    try {
      await sendTeamRequest(user.uid, profile.name, target.uid, target.name);
      toast.success(`Invitation sent to ${target.name}!`);
    } catch {
      toast.error("Failed to send invitation");
    }
  };

  const handleVerify = async (p: DiscoveredProfile) => {
    if (!p.githubUrl) { toast.info("No GitHub URL provided"); return; }
    setVerifying((v) => ({ ...v, [p.uid]: true }));
    const result = await verifyGitHubSkills(p.githubUrl, p.skills);
    setVerified((v) => ({ ...v, [p.uid]: result }));
    setVerifying((v) => ({ ...v, [p.uid]: false }));
    if (result.length > 0) toast.success(`${result.length} skills verified for ${p.name}`);
    else toast.info("No skills could be verified from repos");
  };

  const filtered = profiles.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase()) ||
    p.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-display text-primary neon-text">Find Your Team</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.uid} className="glass-card p-5 space-y-3 hover:neon-border transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                </div>
                {p.githubUrl && (
                  <button onClick={() => handleVerify(p)} disabled={verifying[p.uid]} className="text-muted-foreground hover:text-primary transition-colors">
                    {verifying[p.uid] ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.skills?.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className={`text-xs ${verified[p.uid]?.includes(s) ? "border-neon-green text-neon-green" : "border-primary/30 text-primary"}`}
                  >
                    {verified[p.uid]?.includes(s) && <CheckCircle className="h-3 w-3 mr-1" />}
                    {s}
                  </Badge>
                ))}
              </div>
              <Button onClick={() => handleInvite(p)} variant="outline" size="sm" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                <UserPlus className="h-4 w-4 mr-2" /> Send Invitation
              </Button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-2 text-center py-12">No hackers found. Try a different search!</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
