import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { Send, Loader2, User, ShieldCheck } from 'lucide-react';

interface ChatProps {
  teamId: string;
  teamName: string;
}

const ChatRoom: React.FC<ChatProps> = ({ teamId, teamName }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Real-time Message Listener
  useEffect(() => {
    if (!teamId) return;

    const q = query(
      collection(db, "messages"),
      where("teamId", "==", teamId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Firestore Chat Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [teamId]);

  // 2. Handle Sending Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      // Fetch the sender's real name from their profile
      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      const realName = profileSnap.exists() ? profileSnap.data().name : "Hacker";

      await addDoc(collection(db, "messages"), {
        teamId,
        senderId: auth.currentUser.uid,
        senderName: realName,
        text: newMessage.trim(),
        timestamp: serverTimestamp()
      });
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return (
    <div className="h-[600px] flex flex-col items-center justify-center bg-[#11141b] rounded-[2rem] border border-gray-800">
      <Loader2 className="animate-spin text-cyan-500 mb-2" />
      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Decrypting Channel...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[650px] bg-[#11141b] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
      
      {/* Chat Header */}
      <div className="p-6 bg-gray-900/40 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-none mb-1">#{teamName}</h3>
            <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">End-to-End Secure</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#11141b] bg-gray-800 flex items-center justify-center">
            <User size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1.5 px-1">
                   {isMe ? "You" : msg.senderName}
                </span>
                <div className={`px-5 py-3 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-cyan-500 text-black font-bold rounded-tr-none' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700/50'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-6 bg-gray-900/60 border-t border-gray-800 flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a secure message..."
          className="flex-1 bg-black/40 border border-gray-800 rounded-2xl px-6 py-4 text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700 text-white"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-cyan-500 text-black px-6 rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-20 active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;