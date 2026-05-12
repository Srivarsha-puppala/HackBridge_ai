import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure you have VITE_GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Uses Gemini 3.1 Flash Lite to match user skills with available teams.
 * Includes a safety check to prevent duplicate team suggestions.
 */
export const getMagicSuggestions = async (userSkills: string[], teams: any[]) => {
  // Use the Flash Lite model for fast, efficient processing
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const prompt = `
    You are an AI Hackathon Matchmaker. Your job is to analyze a developer's skills and suggest the best teams for them to join.

    USER VERIFIED SKILLS: 
    ${userSkills.join(", ")}

    AVAILABLE TEAMS LIST: 
    ${JSON.stringify(teams.map(t => ({ 
      id: t.id, 
      name: t.name, 
      required: t.requiredSkills, 
      desc: t.description 
    })))}

    TASK:
    1. Identify the TOP 3 teams that best fit this user's skill set.
    2. Provide a compelling reason for each match.
    3. IMPORTANT: Do not recommend teams with the same name. Each recommendation must be a unique project.
    4. If multiple teams have the same name, only select the most relevant one.

    RETURN ONLY RAW JSON (No markdown, no preamble):
    [
      {
        "teamId": "the_firebase_document_id",
        "reason": "A one-sentence explanation of why this user fits this specific project.",
        "confidence": 85
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response in case the AI includes markdown backticks
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gemini Matchmaking Error:", error);
    // Return empty array so the UI doesn't crash on error
    return [];
  }
};