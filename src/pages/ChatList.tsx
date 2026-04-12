import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function ChatList() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-display text-primary neon-text">Chats</h1>
        {profile.mySquad?.length > 0 ? (
          <div className="space-y-3">
            {profile.mySquad.map((m) => (
              <div
                key={m.uid}
                onClick={() => navigate(`/chat/${m.combinedId}`)}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:neon-border transition-all"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{m.combinedId?.slice(0, 16)}...</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No chats yet. Join a squad first!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
