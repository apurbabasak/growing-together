import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtsAciOYgMrnzWey3WWWHFY2tqQPVYDq8",
  authDomain: "growing-together-90132.firebaseapp.com",
  projectId: "growing-together-90132",
  storageBucket: "growing-together-90132.firebasestorage.app",
  messagingSenderId: "363899905414",
  appId: "1:363899905414:web:a010cb0d8ff97ce0e2f807"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;