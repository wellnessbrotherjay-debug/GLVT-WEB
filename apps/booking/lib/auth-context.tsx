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
        id: 'guest-user-id',
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

  const loginAsGuest = () => {
    // Set cookie for middleware
    document.cookie = "glvt_guest_session=true; path=/; max-age=86400"; // 24 hours
    setIsGuest(true);
    setUser({
      id: 'guest-user-id',
      email: 'guest@glvt.club',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User);
    router.replace("/glvt/home");
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
