import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

// ---------------------------------------------------------------------------
// Firebase configuration — values injected via Vite env variables
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Prevent duplicate app initialisation in HMR / SSR environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// ---------------------------------------------------------------------------
// Service exports
// ---------------------------------------------------------------------------
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app, 'asia-south1')

// ---------------------------------------------------------------------------
// Auth providers & helpers
// ---------------------------------------------------------------------------
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

/**
 * Opens a Google sign-in popup and returns the UserCredential.
 * Throws on failure so the caller can handle the error.
 */
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

/**
 * Signs the current user out of Firebase Auth.
 */
export const signOutUser = () => signOut(auth)

export default app
