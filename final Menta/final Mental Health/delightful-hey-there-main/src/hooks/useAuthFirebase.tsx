import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut, getIdToken, updateProfile } from 'firebase/auth';
import { auth } from '@/integrations/firebase';

interface ExtendedUser extends User {
  role?: 'student' | 'management';
  demographics?: any;
}

export function useAuthFirebase() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user role and demographics from your backend/database here
  const fetchUserMetadata = useCallback(async (firebaseUser: User) => {
    // Fetch role and demographics from Firestore demographics collection
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/integrations/firebase");
      const docRef = doc(db, "demographics", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      const demographics = docSnap.exists() ? docSnap.data() : null;
      return {
        role: demographics?.role || "student",
        demographics,
      };
    } catch (e) {
      return {
        role: "student",
        demographics: {},
      };
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const metadata = await fetchUserMetadata(firebaseUser);
          setUser({ ...firebaseUser, ...metadata });
        } catch (err: any) {
          setError('Failed to fetch user metadata');
          setUser({ ...firebaseUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserMetadata]);

  const logout = useCallback(() => signOut(auth), []);

  return {
    user,
    loading,
    error,
    logout,
    // Add more Firebase auth helpers as needed
  };
}
