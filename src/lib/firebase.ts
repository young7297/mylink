import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC7_tbHRJsXzZSWFVN4wEdqpFc1njFLWhk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-dy-link.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-dy-link",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-dy-link.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1064872886487",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1064872886487:web:8678e30059cdb6f7b1f092",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9GKX2DQP8B",
};

// Initialize Firebase (singleton pattern for Next.js SSR / HMR)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Commonly used Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Analytics initialization (client-side only with isSupported check)
let analyticsPromise: Promise<Analytics | null> | null = null;

export const getFirebaseAnalytics = (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => {
      if (supported) {
        return getAnalytics(app);
      }
      return null;
    });
  }
  return analyticsPromise;
};

export { app, auth, db, storage, firebaseConfig };
