"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "./mobile.css";
import { useAuth } from "@/lib/auth-context";

export default function GlvtLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user, session } = useAuth(); // Use AuthContext

    const checkProfileAndRedirect = async (userId: string) => {
        console.log("LoginPage: checkProfileAndRedirect", userId);
        try {
            const { data, error } = await supabase
                .from('gym_profiles')
                .select('id')
                .eq('id', userId)
                .single();

            if (data) {
                console.log("LoginPage: Profile found, redirecting to home");
                router.replace("/glvt/home");
            } else {
                console.log("LoginPage: Profile not found, redirecting to onboarding");
                router.replace("/glvt/onboarding");
            }
        } catch (e) {
            console.error("LoginPage: checkProfileAndRedirect error", e);
            router.replace("/glvt/onboarding");
        }
    };

    // Check if checks session on mount
    useEffect(() => {
        if (user) {
            console.log("LoginPage: User already present on mount", user.id);
            checkProfileAndRedirect(user.id);
        }
    }, [user, router]); // Dependency on user from context

    const handleGoogleLogin = async () => {
        setLoading(true);
        console.log("LoginPage: Starting Google Login");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?next=/glvt/home`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("LoginPage: Google Login error", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log("LoginPage: Starting Auth (SignUp:", isSignUp, ")");

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                console.log("LoginPage: Sign in successful, fetching user");
                // Get the user we just logged in as
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await checkProfileAndRedirect(user.id);
                } else {
                    console.log("LoginPage: No user returned after sign in??");
                    router.replace("/glvt/home"); // Fallback
                }
            }
        } catch (err: any) {
            console.error("LoginPage: Auth Error", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // If user exists, don't show the login form to prevent flicker during redirect
    if (user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center p-8 font-sans">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-serif tracking-widest mb-2">GLVT</h1>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Member Access</p>
            </div>

            <div className="space-y-6">
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white text-black py-4 rounded-lg text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {/* Standard Google SVG Icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-[10px] text-gray-500 uppercase tracking-widest">Or with email</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-white focus:border-white/30 outline-none transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-white focus:border-white/30 outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] border border-white/20 text-white py-4 rounded-lg text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#222] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs text-gray-500 underline decoration-gray-700 hover:text-white transition-colors"
                    >
                        {isSignUp ? "Already have an account? Sign In" : "First time? Create Account"}
                    </button>

                    <button
                        onClick={() => {
                            // @ts-ignore - Login as guest added to context but TS might complain without restart
                            user === null && window.location.reload(); // Force reload if needed
                            // We access the context capability via a clean button click
                            const guestLogin = (window as any).glvtLoginAsGuest;
                            if (guestLogin) guestLogin();
                        }}
                        className="text-[10px] uppercase tracking-widest text-[#C8A871] hover:text-[#d4b57a] transition-colors"
                    >
                        — Continue as Guest (Demo) —
                    </button>
                </div>
            </div>

            {/* Hidden guest trigger handler since we can't easily access context function outside hook in button onClick inline without proper wrapping */}
            <GuestLoginTrigger />
        </div>
    );
}

function GuestLoginTrigger() {
    const { loginAsGuest } = useAuth();
    useEffect(() => {
        (window as any).glvtLoginAsGuest = loginAsGuest;
    }, [loginAsGuest]);
    return null;
}
