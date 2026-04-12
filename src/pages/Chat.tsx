import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  createdAt: any;
}

export default function Chat() {
  const { combinedId } = useParams<{ combinedId: string }>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!combinedId) return;
    const q = query(collection(db, "chats", combinedId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [combinedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user || !profile || !combinedId) return;
    await addDoc(collection(db, "chats", combinedId, "messages"), {
      text: text.trim(),
      senderUid: user.uid,
      senderName: profile.name,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  const formatTime = (ts: any) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <h1 className="text-xl font-display text-primary neon-text mb-4">
          Chat <span className="text-sm text-muted-foreground font-mono">#{combinedId?.slice(0, 12)}</span>
        </h1>

        <div className="flex-1 overflow-auto space-y-3 glass-card p-4 mb-4">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</p>
          )}
          {messages.map((m) => {
            const isMe = m.senderUid === user?.uid;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${isMe ? "gradient-primary text-primary-foreground" : "bg-muted border border-border/50"}`}>
                  {!isMe && <p className="text-xs font-semibold text-primary mb-1">{m.senderName}</p>}
                  <p className="text-sm">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="bg-input border-border/50 focus:border-primary"
          />
          <Button onClick={handleSend} disabled={!text.trim()} className="gradient-primary text-primary-foreground px-6">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
