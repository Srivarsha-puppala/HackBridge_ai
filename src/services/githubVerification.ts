import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Helper to prevent "429 Too Many Requests" on Gemini Free Tier
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });

/**
 * Deep Portfolio Auditor
 * Analyzes repositories individually, decodes READMEs, and 
 * classifies them into structured roles and tech stacks.
 */
export const verifyGitHubSkills = async (userId: string, githubUsername: string) => {
  try {
    // 1. Fetch the user's most recent active repositories
    const { data: repos } = await octokit.repos.listForUser({
      username: githubUsername,
      sort: "updated",
      per_page: 5, // Deep analysis on top 5 projects
    });

    if (!repos || repos.length === 0) {
      throw new Error("No public repositories found.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const projectClassifications: any[] = [];

    // --- START INDIVIDUAL ANALYSIS LOOP ---
    for (const repo of repos) {
      let readmeContent = "";
      
      // Attempt to fetch and decode the README for hidden tech stack insights
      try {
        const { data: readme } = await octokit.repos.getReadme({
          owner: githubUsername,
          repo: repo.name,
        });
        // Decode Base64 to string and take a snippet to save tokens
        readmeContent = atob(readme.content).substring(0, 3000); 
      } catch (e) {
        console.log(`No README found for ${repo.name}, skipping README analysis.`);
      }

      const prompt = `
        Convert this GitHub repository data into structured JSON for a Hackathon Team Formation Platform.
        
        INPUT:
        Repository Name: ${repo.name}
        Description: ${repo.description || "No description"}
        Topics: ${repo.topics?.join(", ") || "None"}
        Languages: ${repo.language || "Unknown"}
        Readme Summary: ${readmeContent}

        CLASSIFICATION SCHEMA (Return ONLY STRICT JSON):
        {
          "primary_category": "Frontend | Backend | Full Stack | AI/ML | Data Science | DevOps/Cloud | etc",
          "sub_categories": ["UI/UX", "NLP", "Automation", etc],
          "tech_stack": ["e.g., React, Node.js, Tailwind"],
          "roles_suitable": ["Frontend Developer", "Backend Developer", etc],
          "complexity": "Beginner | Intermediate | Advanced",
          "domain": "e.g., Healthcare, Fintech, Developer Tools",
          "use_case": "Brief 1-sentence summary of what it does",
          "confidence": 0-100
        }
      `;

      // Call Gemini for this specific project
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse the JSON output
      const cleanedJson = text.replace(/```json|```/g, "").trim();
      const projectData = JSON.parse(cleanedJson);
      
      projectClassifications.push(projectData);

      // --- RATE LIMIT GAP ---
      // We wait 2 seconds between requests to avoid hitting the 429 quota limit
      await delay(2000); 
    }

    // --- MASTER PROFILE AGGREGATION ---
    const allSkills = new Set<string>();
    const rolesCount: Record<string, number> = {};
    
    projectClassifications.forEach(proj => {
      // Only aggregate skills with high AI confidence
      if (proj.confidence > 65) {
        proj.tech_stack?.forEach((s: string) => allSkills.add(s));
      }
      // Count which roles appear most frequently in the portfolio
      proj.roles_suitable?.forEach((r: string) => {
        rolesCount[r] = (rolesCount[r] || 0) + 1;
      });
    });

    // Decide the user's primary role based on the data
    const finalRole = Object.keys(rolesCount).length > 0 
      ? Object.keys(rolesCount).reduce((a, b) => rolesCount[a] > rolesCount[b] ? a : b)
      : "Full Stack Developer";

    // --- SAVE TO FIREBASE ---
    const userRef = doc(db, "profiles", userId);
    await updateDoc(userRef, {
      role: finalRole,
      verifiedSkills: Array.from(allSkills),
      portfolioData: projectClassifications, // The detailed project-by-project breakdown
      isVerified: true,
      lastVerified: new Date().toISOString(),
      githubUsername: githubUsername
    });

    return { 
      finalRole, 
      verifiedSkills: Array.from(allSkills),
      portfolioData: projectClassifications 
    };

  } catch (error) {
    console.error("Critical Audit Failure:", error);
    throw error;
  }
};