import { create } from 'zustand'

/**
 * useAuthStore
 *
 * Holds authentication state derived from Firebase Auth.
 * This store is NOT persisted — it is always populated fresh by the
 * useAuth hook which subscribes to onAuthStateChanged.
 */
const useAuthStore = create((set) => ({
  // -------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------

  /** Firebase User object, or null when signed out */
  user: null,

  /** True when the user's Firestore document has isAdmin === true */
  isAdmin: false,

  /** True while the initial auth state is being resolved */
  loading: true,

  // -------------------------------------------------------------------
  // Setters
  // -------------------------------------------------------------------

  /**
   * Store the Firebase User object (or null on sign-out).
   * @param {import('firebase/auth').User | null} user
   */
  setUser: (user) => set({ user }),

  /**
   * Set the admin flag.
   * @param {boolean} isAdmin
   */
  setAdmin: (isAdmin) => set({ isAdmin }),

  /**
   * Toggle the loading indicator.
   * @param {boolean} loading
   */
  setLoading: (loading) => set({ loading }),
}))

export default useAuthStore
