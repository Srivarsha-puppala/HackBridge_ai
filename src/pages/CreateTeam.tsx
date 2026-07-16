import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { automateTeamFields } from '../services/aiMatcher'; // Ensure this path is correct
import { toast } from 'sonner';

const CreateTeam: React.FC = () => {
  // Input for the AI to analyze
  const [projectPitch, setProjectPitch] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for the fields the AI will auto-populate
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  // Step 1: The AI Automation Logic
  const handleAIMagic = async () => {
    if (!projectPitch || projectPitch.length < 20) {
      toast.error("Please provide a bit more detail about your project for the AI to analyze!");
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading("AI is analyzing your project pitch...");
    const structuredData = await automateTeamFields(projectPitch);

    toast.dismiss(loadingToast);

    if (structuredData) {
      // Mapping AI output to our Firestore schema
      setRequiredSkills(structuredData.requiredSkills || []);
      setOpenRoles(structuredData.openRoles || []);
      setCategory(structuredData.projectCategory || "General");
      toast.success("Requirements auto-filled!");
    } else {
      toast.error("AI failed to extract data. Please check your API key or connection.");
    }
    setIsAnalyzing(false);
  };

  // Step 2: Saving the "AI-populated" data to Firestore & Triggering Backend Embeddings
  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || requiredSkills.length === 0) {
      toast.error("Please ensure the team has a name and skills are populated.");
      return;
    }

    setIsSubmitting(true);
    const submissionToast = toast.loading("Launching your squad globally...");

    try {
      // 1. Save initial document text structure directly to your collection fields
      const docRef = await addDoc(collection(db, "teams"), {
        name: teamName,
        description: projectPitch,
        requiredSkills: requiredSkills, 
        openRoles: openRoles,           
        projectCategory: category,
        members: [auth.currentUser?.uid], 
        createdBy: auth.currentUser?.uid, 
        createdAt: serverTimestamp(),
        compatibility: 0 // Default baseline state setting
      });

      // 2. Fire backend pipeline action route to calculate high-dimensional vector similarity spaces
      const vectorIndexResponse = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/update-team-vector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: docRef.id, // Newly generated document hash id parameter
          name: teamName,
          description: projectPitch,
          projectCategory: category,
          openRoles: openRoles
        })
      });

      toast.dismiss(submissionToast);

      if (!vectorIndexResponse.ok) {
        throw new Error("Vector update microservice pipeline threw an error.");
      }

      toast.success("Squad created successfully with native AI Semantic Vector Indexing!");
      
      // Reset form states completely upon successful operations completion
      setTeamName("");
      setProjectPitch("");
      setRequiredSkills([]);
      setOpenRoles([]);
      setCategory("");

    } catch (error) {
      toast.dismiss(submissionToast);
      console.error("Error creating team and mapping vector coordinates:", error);
      toast.error("Squad saved locally, but AI vector indexing failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Create Your Squad</h1>

      <div className="space-y-6 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
        {/* Project Pitch Section */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 uppercase">Project Pitch</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none h-32"
            placeholder="Describe your project (e.g., 'We're building a real-time AI-powered dashboard for healthcare using React and Firebase. Need a backend dev and a designer.')"
            value={projectPitch}
            onChange={(e) => setProjectPitch(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAIMagic}
            disabled={isAnalyzing}
            className="mt-3 flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 disabled:opacity-50"
          >
            {isAnalyzing ? "AI is thinking..." : "✨ Auto-Fill Requirements with AI"}
          </button>
        </div>

        <hr className="border-gray-700" />

        {/* Form Fields (Automated by AI) */}
        <form onSubmit={handleSubmitTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Squad Name</label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
              <span className="text-xs text-purple-400 font-bold uppercase">AI-Detected Skills</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {requiredSkills.length > 0 ? requiredSkills.map(s => (
                  <span key={s} className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">{s}</span>
                )) : <span className="text-gray-600 text-xs italic">Awaiting AI analysis...</span>}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
              <span className="text-xs text-green-400 font-bold uppercase">Roles Needed</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {openRoles.length > 0 ? openRoles.map(r => (
                  <span key={r} className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/30">{r}</span>
                )) : <span className="text-gray-600 text-xs italic">Awaiting AI analysis...</span>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? "Building Squad..." : "Launch Squad"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;

