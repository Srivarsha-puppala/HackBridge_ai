🌉 HackBridge

HackBridge is a real-time, AI-powered matchmaking platform designed to streamline team formation during hackathons. By calculating skill-based compatibility, it ensures that project ideas find the right technical talent instantly.

🚀 Key Features

•Magic Suggest (AI Matching): Uses fuzzy logic to compare participant skills against team requirements, providing a real-time compatibility score.

•Squad Operations Dashboard: A centralized hub for team leads to manage, review, and approve join requests instantly.

•Live Sync discovery: Powered by Firebase, the discovery feed updates in real-time as squads fill up or roles change.

•Secure Authentication: Integrated with GitHub/Google for verified developer profiles.

🛠️ Tech Stack

•Frontend: React.js, TypeScript, Tailwind CSS

•Backend/Database: Firebase (Firestore, Authentication, Storage)

•State Management: React Hooks

•Icons & UI: Lucide React, Shadcn UI

📋 Problem Statement

Traditional hackathon networking often relies on messy group chats or static spreadsheets, leading to fragmented teams and overlooked talent. HackBridge automates this process, reducing team formation time from hours to seconds by focusing on data-driven synergy.

⚙️ Installation & Setup

Clone the repository:

git clone https://github.com/your-username/hackbridge.git

Install dependencies:

npm install

Configure Firebase:

Create a .env file in the root directory and add your Firebase configuration:

VITE_FIREBASE_API_KEY=your_key

VITE_FIREBASE_AUTH_DOMAIN=your_domain

VITE_FIREBASE_PROJECT_ID=your_id

Run the development server:

npm run dev

🛡️ Security Rules

The project utilizes strict Firestore Security Rules to ensure that join requests and personal profile data are only accessible to authorized receivers and owners.
