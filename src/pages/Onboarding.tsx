import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, ArrowRight, ArrowLeft, Zap } from "lucide-react";

const SKILL_OPTIONS = ["React", "TypeScript", "Python", "Node.js", "Go", "Rust", "Flutter", "AWS", "Docker", "Figma", "ML/AI", "Solidity"];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (s: string) => {
    setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleFinish = async () => {
    if (!user) {
      toast.error("You must be logged in to create a profile.");
      return;
    }

    try {
      // THE FIX: Using "profiles" collection to match your database structure
      const userProfileRef = doc(db, "profiles", user.uid);

      await setDoc(userProfileRef, {
        uid: user.uid,
        name: name.trim(),
        email: user.email || "",
        role: role.trim(),
        skills,
        bio: bio.trim(),
        githubUrl: githubUrl.trim(),
        mySquad: [],
        onboarded: true,
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast.success("Profile launched successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Onboarding Error:", err);
      // This will now pass if the security rule for /profiles/{userId} is published
      toast.error(err.message || "Failed to save profile. Check your connection.");
    }
  };

  const steps = [
    <div key="0" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-display text-primary neon-text">Who are you?</h2>
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-input border-border/50" />
      <Input placeholder="Your role (e.g. Frontend Dev, Designer)" value={role} onChange={(e) => setRole(e.target.value)} className="bg-input border-border/50" />
    </div>,

    <div key="1" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-display text-primary neon-text">Your Tech Stack</h2>
      <div className="flex flex-wrap gap-2">
        {SKILL_OPTIONS.map((s) => (
          <Badge
            key={s}
            variant={skills.includes(s) ? "default" : "outline"}
            className={`cursor-pointer text-sm px-3 py-1.5 transition-all ${skills.includes(s) ? "gradient-primary text-primary-foreground neon-glow" : "border-border hover:border-primary/50"}`}
            onClick={() => toggleSkill(s)}
          >
            {s}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input 
          placeholder="Add custom skill" 
          value={customSkill} 
          onChange={(e) => setCustomSkill(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())} 
          className="bg-input border-border/50" 
        />
        <Button variant="outline" onClick={addCustomSkill} className="border-primary/30 text-primary">Add</Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {skills.map((s) => (
            <Badge key={s} className="gradient-primary text-primary-foreground gap-1">
              {s} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSkill(s)} />
            </Badge>
          ))}
        </div>
      )}
    </div>,

    <div key="2" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-display text-primary neon-text">Almost there!</h2>
      <Textarea placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="bg-input border-border/50 min-h-[100px]" />
      <Input placeholder="GitHub URL (e.g. https://github.com/you)" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="bg-input border-border/50" />
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="glass-card neon-border p-8 w-full max-w-lg relative z-10 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-display text-sm text-muted-foreground tracking-wider uppercase">Onboarding Step {step + 1}</span>
        </div>
        
        <div className="flex gap-1 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary shadow-[0_0_10px_#06b6d4]" : "bg-muted"}`} />
          ))}
        </div>

        {steps[step]}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="border-border text-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {step < 2 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              disabled={(step === 0 && (!name || !role)) || (step === 1 && skills.length === 0)} 
              className="gradient-primary text-primary-foreground font-display tracking-wider hover:brightness-110"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              disabled={!bio || !githubUrl} 
              className="gradient-primary text-primary-foreground font-display tracking-wider shadow-lg shadow-primary/20"
            >
              Launch Profile <Zap className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}