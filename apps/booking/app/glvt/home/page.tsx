"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { Activity, Dumbbell, Flame, Calendar, Home, Building2, Ticket } from "lucide-react";
import { RouterBottomNav } from "../_components/RouterBottomNav";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GLVT_THEME, commonStyles } from "../theme";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import launchHero from "../../assets/images/glvt-launch-hero.jpg";
import pilatesCover from "../../assets/images/class-covers/pilates-core.png";
import glutesCover from "../../assets/images/class-covers/glutes-workout.png";

export default function GlvtHome() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading, isGuest } = useAuth();
    const router = useRouter();

    // Feature Flags (Default false as requested)
    const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
    const [whoopConnected, setWhoopConnected] = useState(false);

    // Check for active booking
    const [hasActiveBooking, setHasActiveBooking] = useState(true);
    const [bookingData, setBookingData] = useState<any>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.replace("/glvt/launch");
            return;
        }

        const loadProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('gym_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn("DB profile load failed, checking local storage.");
            }

            // Fallback to local storage
            const localData = localStorage.getItem(`glvt_profile_${user.id}`);
            if (localData) {
                setProfile(JSON.parse(localData));
                setLoading(false);
            } else {
                router.replace("/glvt/onboarding");
            }
        };
        loadProfile();
    }, [user, authLoading, router, isGuest]);

    useEffect(() => {
        const isCancelled = localStorage.getItem("glvt_booking_cancelled");
        if (isCancelled === "true") {
            setHasActiveBooking(false);
        } else {
            // Load active booking data
            const activeBooking = localStorage.getItem("glvt_active_booking");
            if (activeBooking) {
                try {
                    const booking = JSON.parse(activeBooking);
                    setBookingData(booking);
                    setHasActiveBooking(true);
                } catch (e) {
                    console.error("Failed to parse booking data", e);
                }
            }
        }
    }, []);

    return (
        <div className={`min-h-screen flex flex-col ${commonStyles.pageContainer} pb-24`} style={{ fontFamily: GLVT_THEME.fonts.sans }}>

            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center z-10 sticky top-0 bg-[#2D2D2D]/90 backdrop-blur-md border-b border-[#D7D5D2]/5">
                <h1 className="text-xl tracking-[0.05em]" style={{ fontFamily: 'serif' }}>GLVT</h1>
                <div className="flex gap-4">
                    {/* Header Actions if needed, currently moved to Tabs */}
                </div>
            </header>

            <main className="flex-1 px-6 py-6 space-y-10 overflow-y-auto no-scrollbar">

                {/* Editorial Welcome */}
                <section className="space-y-1 mt-2">
                    <div className={commonStyles.subHeaderSans}>Welcome Back</div>
                    <h2 className="text-4xl text-[#F1EDE5] leading-tight" style={{ fontFamily: 'serif' }}>
                        {loading ? "..." : `${profile?.first_name || "Member"}.`}
                    </h2>
                </section>

                {/* DASHBOARD WIDGETS - CONDITIONAL */}
                {(hasNutritionPlan || whoopConnected) && (
                    <section>
                        <div className="flex justify-between items-baseline mb-3">
                            <h3 className={commonStyles.subHeaderSans}>Daily Vitality</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Nutrition Widget */}
                            {hasNutritionPlan && (
                                <Link href="/glvt/food-tracking" className="bg-[#3a3a3a] border border-[#D7D5D2]/10 p-5 rounded-2xl relative overflow-hidden group hover:border-[#C8A871]/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[10px] uppercase tracking-widest text-[#D7D5D2]/60">Nutrition</div>
                                        <Flame className="w-4 h-4 text-[#C8A871]" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-3xl font-serif text-[#F1EDE5]">1,250</div>
                                        <div className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider mt-1">kcal consumed</div>
                                        <div className="h-1 w-full bg-[#2D2D2D] rounded-full mt-3">
                                            <div className="h-full bg-[#C8A871] w-[45%]"></div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Strain/Activity Widget */}
                            {whoopConnected && (
                                <div className="bg-[#3a3a3a] border border-[#D7D5D2]/10 p-5 rounded-2xl relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[10px] uppercase tracking-widest text-[#D7D5D2]/60">Strain</div>
                                        <Activity className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-3xl font-serif text-[#F1EDE5]">14.2</div>
                                        <div className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider mt-1">Daily Load</div>
                                        <div className="h-1 w-full bg-[#2D2D2D] rounded-full mt-3">
                                            <div className="h-full bg-blue-400 w-[65%]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Next Session - The 'Golden Ticket' Aesthetic */}
                {hasActiveBooking && (
                    <section>
                        <div className="flex justify-between items-baseline mb-3">
                            <h3 className={commonStyles.subHeaderSans}>Up Next</h3>
                            <span className="text-[10px] text-[#C8A871] font-bold uppercase tracking-wider">Today</span>
                        </div>

                        <Link href="/glvt/book/manage" className="block w-full group relative overflow-hidden rounded-2xl bg-[#3a3a3a] border border-[#D7D5D2]/10 transition-all shadow-[0_0_30px_rgba(200,168,113,0.08)] hover:shadow-[0_0_40px_rgba(200,168,113,0.15)]">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={pilatesCover}
                                    alt="Next Class"
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-700"
                                    placeholder="blur"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent"></div>
                            </div>

                            <div className="relative z-10 p-6 pt-24">
                                <h4 className="text-3xl text-[#F1EDE5] mb-2 group-hover:text-[#C8A871] transition-colors" style={{ fontFamily: 'serif' }}>Pilates Core</h4>
                                <p className="text-xs text-[#D7D5D2]/90 uppercase tracking-wider mb-4 font-medium">Coach Sarah • 5:00 PM</p>

                                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-[#2D2D2D] border border-[#D7D5D2]/10" />
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-[#C8A871] border border-[#2D2D2D] flex items-center justify-center text-[10px] font-bold text-[#2D2D2D]">+3</div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white uppercase tracking-widest font-bold">
                                        Confirmed
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Experience Navigation - Updated to Match Booking Aesthetic */}
                <section className="space-y-4">
                    <div className={commonStyles.subHeaderSans}>Browse</div>

                    {/* Training Hub - Light Background */}
                    <Link href="/glvt/training" className="group block relative h-40 rounded-2xl overflow-hidden shadow-lg border border-[#D7D5D2]/10 bg-[#3a3a3a]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={launchHero}
                                alt="Training"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-700 grayscale-[0.2] group-hover:grayscale-0"
                                placeholder="blur"
                            />
                            {/* Lighter Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 via-transparent to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-[#C8A871] uppercase tracking-[0.2em] mb-1 font-boldDrop-shadow-md">Programs</p>
                                    <h3 className="text-2xl text-[#F1EDE5] italic font-serif leading-none drop-shadow-md">Training Hub</h3>
                                </div>
                                <Dumbbell className="w-6 h-6 text-[#F1EDE5] group-hover:text-[#C8A871] transition-colors drop-shadow-md" />
                            </div>
                        </div>
                    </Link>

                    {/* Studio Classes */}
                    <Link href="/glvt/book" className="group block relative h-40 rounded-2xl overflow-hidden shadow-lg border border-[#D7D5D2]/10 bg-[#3a3a3a]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={glutesCover}
                                alt="Studio"
                                fill
                                className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700 grayscale group-hover:grayscale-0"
                                placeholder="blur"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-[#C8A871] uppercase tracking-[0.2em] mb-1 font-bold">Schedule</p>
                                    <h3 className="text-2xl text-[#F1EDE5] italic font-serif leading-none">Studio Classes</h3>
                                </div>
                                <Calendar className="w-6 h-6 text-[#D7D5D2]/40 group-hover:text-[#C8A871] transition-colors" />
                            </div>
                        </div>
                    </Link>
                </section>

            </main>

            {/* TAB BAR NAVIGATION */}
            <RouterBottomNav />
        </div>
    );
}
