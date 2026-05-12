import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  lastMessage: string;
  updatedAt: any;
  otherUser?: {
    name: string;
    uid: string;
  };
}

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Find all conversations where current user is a participant
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const otherUserId = data.participants.find((id: string) => id !== user.uid);
          
          // Fetch the other person's name from the 'profiles' collection
          const userDoc = await getDoc(doc(db, "profiles", otherUserId));
          const otherUserName = userDoc.exists() ? userDoc.data().name : "Unknown User";

          return {
            id: d.id,
            lastMessage: data.lastMessage,
            updatedAt: data.updatedAt,
            otherUser: {
              name: otherUserName,
              uid: otherUserId
            }
          };
        })
      );
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-display text-primary neon-text">Messages</h1>
        
        <div className="glass-card overflow-hidden">
          <ScrollArea className="h-[70vh]">
            {conversations.length > 0 ? (
              <div className="divide-y divide-border/30">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className="p-4 flex items-center gap-4 hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                      {conv.otherUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-foreground truncate">
                          {conv.otherUser?.name}
                        </h3>
                        {conv.updatedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(conv.updatedAt.toDate())} ago
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage || "Start a conversation..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                <p>No messages yet. Find a teammate to start chatting!</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}