import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, MessageCircle, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !profile) return;
    const fetchRecommended = async () => {
      const q = query(collection(db, "profiles"), limit(10));
      const snap = await getDocs(q);
      const results = snap.docs
        .filter((d) => d.id !== user.uid)
        .map((d) => ({ uid: d.id, ...d.data() }))
        .filter((p: any) => p.skills?.some((s: string) => profile.skills?.includes(s)))
        .slice(0, 4);
      setRecommended(results);
    };
    fetchRecommended();
  }, [user, profile]);

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="glass-card neon-border p-6">
          <h1 className="text-3xl font-display text-primary neon-text mb-1">
            Welcome back, {profile.name}
          </h1>
          <p className="text-muted-foreground text-lg">{profile.role}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Squad Members", value: profile.mySquad?.length || 0, color: "text-primary" },
            { icon: Zap, label: "Incoming Requests", value: profile.incomingRequests?.length || 0, color: "text-neon-magenta" },
            { icon: MessageCircle, label: "Active Chats", value: profile.mySquad?.length || 0, color: "text-neon-green" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-display text-primary mb-4">Recent Activity</h2>
          {profile.incomingRequests?.length > 0 ? (
            <div className="space-y-3">
              {profile.incomingRequests.slice(0, 3).map((req) => (
                <div key={req.uid} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Zap className="h-4 w-4 text-neon-magenta" />
                  <span className="text-sm"><strong>{req.name}</strong> sent you a team request</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No recent activity yet. Start exploring!</p>
          )}
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-display text-primary mb-4">Recommended Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommended.map((p: any) => (
                <div key={p.uid} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/find-team")}>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{p.role}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.skills?.slice(0, 4).map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs border-primary/30 text-primary">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
