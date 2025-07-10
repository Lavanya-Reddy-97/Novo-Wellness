import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase"; // your Firebase config
import { useToast } from "@/hooks/use-toast";

export interface ExtendedUser {
  uid: string;
  email?: string | null;
  role?: "student" | "management";
  demographics?: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = useCallback(
    async (firebaseUser: User) => {
      try {
        const docRef = doc(db, "demographics", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        const demographics = docSnap.exists() ? docSnap.data() : null;

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: demographics?.role || "student",
          demographics,
        });
      } catch (e: any) {
        setError(e.message || "Failed to fetch user data");
        toast({
          title: "User Data Error",
          description: e.message || "Failed to fetch user data",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  return { user, loading, error };
};
