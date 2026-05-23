import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, signInWithGoogle, signOutUser } from '../firebase/firebase'
import useAuthStore from '../store/useAuthStore'

/**
 * useAuth
 *
 * Subscribes to Firebase Auth state changes and syncs with useAuthStore.
 * Also fetches the /users/{uid} Firestore document to determine admin status.
 *
 * Usage:
 *   const { user, isAdmin, loading, signIn, signOut } = useAuth()
 *
 * Mount this hook once near the root of the app (e.g. App.jsx) so the
 * subscription is always active. Child components should read from
 * useAuthStore directly instead of calling this hook again.
 */
const useAuth = () => {
  const { user, isAdmin, loading, setUser, setAdmin, setLoading } =
    useAuthStore()

  useEffect(() => {
    setLoading(true)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Check /users/{uid} in Firestore for the isAdmin flag
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            setAdmin(data.isAdmin === true)
          } else {
            // Document doesn't exist yet — not an admin
            setAdmin(false)
          }
        } catch (err) {
          // Network error or security rules denied the read
          console.error('[useAuth] Could not fetch user document:', err)
          setAdmin(false)
        }
      } else {
        // Signed out
        setUser(null)
        setAdmin(false)
      }

      setLoading(false)
    })

    // Clean up the listener when the component that mounted this hook unmounts
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Helpers exposed to consumers
  // ---------------------------------------------------------------------------

  /**
   * Trigger Google OAuth popup sign-in.
   * Returns the Firebase UserCredential on success.
   * Throws on failure (cancelled popup, network error, etc.).
   */
  const signIn = async () => {
    try {
      const credential = await signInWithGoogle()
      return credential
    } catch (err) {
      // Surface the error so the caller can show a toast / alert
      throw err
    }
  }

  /**
   * Sign the current user out.
   */
  const signOut = async () => {
    try {
      await signOutUser()
    } catch (err) {
      console.error('[useAuth] Sign-out failed:', err)
      throw err
    }
  }

  return { user, isAdmin, loading, signIn, signOut }
}

export default useAuth
