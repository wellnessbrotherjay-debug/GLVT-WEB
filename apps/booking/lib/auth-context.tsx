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
    // Check for guest session cookie but DO NOT overwrite user with mock data
    // We rely on Supabase session for the real user object.
    const isGuestSession = document.cookie.includes('glvt_guest_session=true');
    if (isGuestSession) {
      setIsGuest(true);
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
      console.log("AuthContext: Attempting signInAnonymously");
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.warn("signInAnonymously failed:", error.message);
        throw error;
      };

      // Success - session/user will be updated by onAuthStateChange
      console.log("AuthContext: Access granted via Anonymous Sign In");
      document.cookie = "glvt_guest_session=true; path=/; max-age=86400"; // Keep cookie for middleware
      setIsGuest(true);

    } catch (err: any) {
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
        // CRITICAL: SHOW USER THE ERROR
        alert(`Guest Login Failed: ${error.message}\n\nHint: Check if 'Enable Email Signups' is on, or if connection is blocked.`);
        setLoading(false);
        return;
      }

      // Success - session/user will be updated by onAuthStateChange
      console.log("AuthContext: Created temporary guest account");
      document.cookie = "glvt_guest_session=true; path=/; max-age=86400";
      setIsGuest(true);
    }
  };

  const signOut = async () => {
    console.log("AuthContext: signOut called");
    try {
      if (isGuest) {
        console.log("AuthContext: clearing guest session cookie");
        document.cookie = "glvt_guest_session=; path=/; max-age=0";
      } else {
        console.log("AuthContext: calling supabase.auth.signOut()");
        // Await this to ensure Supabase clears its local storage properly
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("AuthContext: Sign out error:", error);
    } finally {
      console.log("AuthContext: executing finally cleanup");
      // ALWAYS cleanup and redirect, even if network fails
      setIsGuest(false);
      setUser(null);
      setSession(null);

      console.log("AuthContext: redirecting to login");
      router.replace("/glvt/login");
      // Fallback: Force hard reload if router fails after a short delay
      // This is a safety net in case next/navigation is stuck
      setTimeout(() => {
        if (window.location.pathname !== '/glvt/login') {
          console.log("AuthContext: router replace seemingly failed, forcing window.location");
          window.location.href = "/glvt/login";
        }
      }, 500);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuest, signOut, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
