import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASiZZ55wWmYbehDd2ATG0YIzsdzldvDYk",
  authDomain: "minor-project-3de2f.firebaseapp.com",
  projectId: "minor-project-3de2f",
  storageBucket: "minor-project-3de2f.firebasestorage.app",
  messagingSenderId: "942478813921",
  appId: "1:942478813921:web:a3b24d39aa9af7d15265a0",
  measurementId: "G-9H8JKTY0W8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
