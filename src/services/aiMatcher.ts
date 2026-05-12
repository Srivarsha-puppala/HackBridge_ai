/**
 * AI Matcher Service for HackBridge
 * Updated to use Gemini 3.1 Flash Lite (v1beta) 
 * compatible with your specific API key permissions.
 */

export const automateTeamFields = async (rawDescription: string) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // URL synced with your confirmed model list
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Analyze this project pitch: "${rawDescription}"
            
            Extract and standardize data into this JSON format:
            {
              "requiredSkills": ["skill1", "skill2"],
              "openRoles": ["Role Title", "Role Title"],
              "projectCategory": "Category Name"
            }

            Rules:
            - Standardize skill names (e.g., "Node.js", "React", "PostgreSQL").
            - Use professional role titles.
            - Return ONLY the raw JSON object. 
            - DO NOT include markdown formatting like \`\`\`json.`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Response:", errorData);
      throw new Error(`API Request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Mapping the Gemini 3.1 response structure
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Clean up any potential markdown formatting the AI might add
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      
      return JSON.parse(cleanJson);
    } else {
      throw new Error("Unexpected API response structure.");
    }
  } catch (error) {
    console.error("AI Automation failed:", error);
    return null;
  }
};