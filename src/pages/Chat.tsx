import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ name: string; verified?: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Listen for Real-time Messages
  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
      
      // Auto-scroll to bottom
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // 2. Fetch Other User Info (to show name and GitHub verification)
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!conversationId || !user) return;
      const convSnap = await getDoc(doc(db, "conversations", conversationId));
      if (convSnap.exists()) {
        const participants = convSnap.data().participants;
        const otherId = participants.find((id: string) => id !== user.uid);
        
        const userSnap = await getDoc(doc(db, "profiles", otherId));
        if (userSnap.exists()) {
          setOtherUser({
            name: userSnap.data().name,
            verified: userSnap.data().verifiedSkills?.length > 0 // Linking to your Octokit work!
          });
        }
      }
    };
    fetchOtherUser();
  }, [conversationId, user]);

  // 3. Send Message Function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user) return;

    const text = newMessage;
    setNewMessage(""); // Clear input early for better UX

    try {
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      
      // Add message to sub-collection
      await addDoc(messagesRef, {
        text,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });

      // Update parent doc for the Inbox preview
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
      <div className="max-w-3xl mx-auto h-[80vh] flex flex-col glass-card overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">{otherUser?.name || "Chat"}</h2>
            {otherUser?.verified && (
              <Badge variant="outline" className="border-neon-green text-neon-green flex gap-1 items-center px-1.5 py-0">
                <Github className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none"
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-background/50 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-input border-border/50 focus:border-primary"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}