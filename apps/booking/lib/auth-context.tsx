"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  loginAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isGuest: false,
  signOut: async () => { },
  loginAsGuest: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for guest session first
    const isGuestSession = document.cookie.includes('glvt_guest_session=true');
    if (isGuestSession) {
      setIsGuest(true);
      // Create a mock guest user so components don't crash
      setUser({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'guest@glvt.club',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User);
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Explicitly redirect to home on sign in to override any default/site URL behavior
      if (event === "SIGNED_IN" && session) {
        router.replace("/glvt/home");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = async () => {
    try {
      setLoading(true);
      // 1. Try Anonymous Sign In (if enabled in Supabase)
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      // Success - session/user will be updated by onAuthStateChange
      // Force redirect handled by auth listener
      document.cookie = "glvt_guest_session=true; path=/; max-age=86400"; // Keep cookie for middleware
      setIsGuest(true);

    } catch (err) {
      console.warn("Anonymous login failed, falling back to auto-provisioned guest account:", err);

      // 2. Fallback: Create a real "Guest" account with random email
      const guestId = Math.random().toString(36).substring(7);
      const email = `guest-${Date.now()}-${guestId}@glvt.temp`;
      const password = `guest-${Date.now()}-${guestId}`; // Secure enough for tmp account

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Critical: Failed to provision guest account", error);
        alert("Could not start guest session. Please try again.");
        setLoading(false);
        return;
      }

      // Success - session/user will be updated by onAuthStateChange
      document.cookie = "glvt_guest_session=true; path=/; max-age=86400";
      setIsGuest(true);
    }
  };

  const signOut = async () => {
    if (isGuest) {
      document.cookie = "glvt_guest_session=; path=/; max-age=0";
      setIsGuest(false);
      setUser(null);
      router.push("/glvt/login");
    } else {
      await supabase.auth.signOut();
      router.push("/glvt/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuest, signOut, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
