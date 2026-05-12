import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { automateTeamFields } from '../services/aiMatcher'; // Ensure this path is correct

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
      alert("Please provide a bit more detail about your project for the AI to analyze!");
      return;
    }

    setIsAnalyzing(true);
    const structuredData = await automateTeamFields(projectPitch);

    if (structuredData) {
      // Mapping AI output to our Firestore schema
      setRequiredSkills(structuredData.requiredSkills);
      setOpenRoles(structuredData.openRoles);
      setCategory(structuredData.projectCategory);
    } else {
      alert("AI failed to extract data. Please check your API key or connection.");
    }
    setIsAnalyzing(false);
  };

  // Step 2: Saving the "AI-populated" data to Firestore
  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || requiredSkills.length === 0) {
      alert("Please ensure the team has a name and skills are populated.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "teams"), {
        name: teamName,
        description: projectPitch,
        requiredSkills: requiredSkills, // Now an array of strings
        openRoles: openRoles,           // Now an array of strings
        projectCategory: category,
       // ... inside handleSubmitTeam ...
       members: [auth.currentUser?.uid], 
       createdBy: auth.currentUser?.uid, // Changed from user.uid to fix the error
      createdAt: serverTimestamp(),
      // ...
      });
      alert("Squad created successfully! AI has listed your requirements.");
    } catch (error) {
      console.error("Error creating team:", error);
    }
    setIsSubmitting(false);
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
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
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            {isSubmitting ? "Building Squad..." : "Launch Squad"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;