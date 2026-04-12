import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { handleAccept, handleDecline } from "@/lib/teamActions";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getCombinedId } from "@/lib/teamActions";
import { Check, X, MessageCircle, Users, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function ManageTeam() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const onAccept = async (req: { uid: string; name: string }) => {
    if (!user || !profile) return;
    try {
      await handleAccept(user.uid, profile.name, req.uid, req.name);
      toast.success(`${req.name} joined your squad!`);
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const onDecline = async (req: { uid: string; name: string }) => {
    if (!user || !profile) return;
    try {
      await handleDecline(user.uid, req.uid, req.name);
      toast.info("Request declined");
    } catch {
      toast.error("Failed to decline");
    }
  };

  if (!profile || !user) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-display text-primary neon-text">Manage Team</h1>

        {/* My Squad */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display text-primary">My Active Squad</h2>
          </div>
          {profile.mySquad?.length > 0 ? (
            <div className="space-y-3">
              {profile.mySquad.map((m) => (
                <div key={m.uid} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">ID: {m.combinedId?.slice(0, 12)}...</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/chat/${m.combinedId}`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No squad members yet. Start exploring!</p>
          )}
        </section>

        {/* Incoming Requests */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownLeft className="h-5 w-5 text-neon-magenta" />
            <h2 className="text-xl font-display text-neon-magenta">Incoming Requests</h2>
          </div>
          {profile.incomingRequests?.length > 0 ? (
            <div className="space-y-3">
              {profile.incomingRequests.map((req) => (
                <div key={req.uid} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="font-semibold">{req.name}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onAccept(req)} className="gradient-primary text-primary-foreground">
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDecline(req)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No incoming requests</p>
          )}
        </section>

        {/* Sent Invitations */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="h-5 w-5 text-neon-purple" />
            <h2 className="text-xl font-display text-secondary">Sent Invitations</h2>
          </div>
          {profile.sentInvitations?.length > 0 ? (
            <div className="space-y-3">
              {profile.sentInvitations.map((inv) => (
                <div key={inv.uid} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="font-semibold">{inv.name}</p>
                  <Badge className="bg-secondary/10 text-secondary border border-secondary/30">Pending</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No sent invitations</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>{children}</span>;
}
