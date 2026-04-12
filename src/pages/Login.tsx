import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created! Let's set up your profile.");
        navigate("/onboarding");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="glass-card neon-border p-8 w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold neon-text text-primary tracking-wider">
            HackBridge
          </h1>
        </div>
        <p className="text-center text-muted-foreground mb-6 font-body text-lg">
          {isSignup ? "Create your account" : "Sign in to continue"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input border-border/50 focus:border-primary"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-input border-border/50 focus:border-primary"
          />
          <Button type="submit" disabled={loading} className="w-full gradient-primary font-display tracking-wider text-primary-foreground hover:opacity-90">
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <p className="text-center mt-6 text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:underline font-semibold">
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
