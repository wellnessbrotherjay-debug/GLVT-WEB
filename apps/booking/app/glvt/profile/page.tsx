"use client";

import { useEffect, useState } from "react";
import { User, Calendar, Ruler, Weight, Edit2, LogOut, Camera, Home, Building2, ChevronLeft } from "lucide-react";
import { GLVT_THEME, commonStyles } from "../theme";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase"; // Need direct access for data fetching if not in context
import { RouterBottomNav } from "../_components/RouterBottomNav";
import { Database } from "@/lib/database.types";

type ProfileRow = Database['public']['Tables']['gym_profiles']['Row'];

export default function ProfilePage() {
    const router = useRouter();
    const { user, signOut, loading: authLoading } = useAuth(); // Use auth context for user state

    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<ProfileRow | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        height_cm: "",
        weight_kg: "",
        gender: ""
    });

    useEffect(() => {
        // 1. Wait for Auth to initialize
        if (authLoading) return;

        // 2. If no user, kick them out
        if (!user) {
            router.replace("/glvt/launch");
            return;
        }

        // 3. If user exists, fetch profile
        const loadProfile = async () => {
            const { data, error } = await supabase
                .from('gym_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                const profileData = data as unknown as ProfileRow;
                setProfile(profileData);
                setFormData({
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    date_of_birth: profileData.date_of_birth || "",
                    height_cm: profileData.height_cm?.toString() || "",
                    weight_kg: profileData.weight_kg?.toString() || "",
                    gender: profileData.gender || ""
                });
            }
            setLoadingData(false);
        };

        loadProfile();
    }, [user, authLoading, router]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updates = {
                id: user.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth || null,
                height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
                weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
                gender: formData.gender || null,
                updated_at: new Date().toISOString(),
            };

            const { data: updatedProfile, error } = await (supabase
                .from('gym_profiles') as any)
                .upsert(updates)
                .select()
                .single();

            if (error) throw error;

            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (!user || loadingData) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${commonStyles.pageContainer}`}>
                <div className="animate-pulse text-[#C8A871] font-serif text-xl">Loading Profile...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col ${commonStyles.pageContainer} pb-24`} style={{ fontFamily: GLVT_THEME.fonts.sans }}>

            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center z-10 sticky top-0 bg-[#2D2D2D]/90 backdrop-blur-md border-b border-[#D7D5D2]/5">
                <div className="flex items-center gap-4">
                    {/* Back button just in case, though tabs are present */}
                    <button onClick={() => router.back()} className="lg:hidden text-[#D7D5D2]/60 hover:text-[#F1EDE5]">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl tracking-[0.05em]" style={{ fontFamily: 'serif' }}>Profile</h1>
                </div>
                {isEditing ? (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-[#C8A871] text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-[#D7D5D2]/60 hover:text-[#C8A871]"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                )}
            </header>

            <main className="flex-1 px-6 py-8 space-y-8 overflow-y-auto no-scrollbar">

                {/* Profile Header Card */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-[#C8A871]/20 flex items-center justify-center overflow-hidden">
                            {/* Placeholder Avatar - could specificy an image URL if available in profile */}
                            <User className="w-10 h-10 text-[#D7D5D2]/20" />
                        </div>
                        {/* Camera Icon Overlay (Visual only for now) */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-6 h-6 text-white/80" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl text-[#F1EDE5] font-serif">
                            {profile?.first_name} {profile?.last_name}
                        </h2>
                        <p className="text-xs text-[#D7D5D2]/40 uppercase tracking-widest mt-1">{user.email}</p>
                    </div>
                </div>

                {/* Info Form */}
                <div className="space-y-6">
                    <div className={commonStyles.subHeaderSans}>Personal Details</div>

                    <div className={`${commonStyles.card} space-y-6`}>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871]"
                                    />
                                ) : (
                                    <div className="text-[#F1EDE5] text-sm py-2">{profile?.first_name || "-"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871]"
                                    />
                                ) : (
                                    <div className="text-[#F1EDE5] text-sm py-2">{profile?.last_name || "-"}</div>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D7D5D2]/5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-3 h-3 text-[#C8A871]" />
                                    <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">Height (cm)</label>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.height_cm}
                                        onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871]"
                                    />
                                ) : (
                                    <div className="text-xl font-serif text-[#F1EDE5]">{profile?.height_cm || "-"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Weight className="w-3 h-3 text-[#C8A871]" />
                                    <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">Weight (kg)</label>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.weight_kg}
                                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871]"
                                    />
                                ) : (
                                    <div className="text-xl font-serif text-[#F1EDE5]">{profile?.weight_kg || "-"}</div>
                                )}
                            </div>
                        </div>

                        {/* Gender & DOB */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D7D5D2]/5">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">Gender</label>
                                {isEditing ? (
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871] appearance-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <div className="text-[#F1EDE5] text-sm py-2">{profile?.gender || "-"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#D7D5D2]/40 uppercase tracking-wider">Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#D7D5D2]/10 rounded-lg p-3 text-[#F1EDE5] text-sm focus:outline-none focus:border-[#C8A871]"
                                    />
                                ) : (
                                    <div className="text-[#F1EDE5] text-sm py-2">{profile?.date_of_birth || "-"}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4 pt-8 pb-8">
                    <button
                        onClick={async () => {
                            await signOut();
                            // signOut function redirects, so we don't need to do anything here
                            // but the context implementation handles the redirect.
                        }}
                        className="w-full border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-[#D7D5D2]/20 uppercase tracking-widest">Version 1.0.0 • GLVT System</p>
                    </div>
                </div>

            </main>

            {/* TAB BAR NAVIGATION */}
            <RouterBottomNav />
        </div>
    );
}
