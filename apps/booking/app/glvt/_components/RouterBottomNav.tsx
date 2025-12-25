"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/dashboard/BottomNav";

export function RouterBottomNav() {
    const pathname = usePathname();


    // Map current path to active view ID
    const getActiveView = () => {
        if (pathname?.includes('/glvt/diary')) return 'log';
        if (pathname?.includes('/glvt/book') || pathname?.includes('/glvt/facility') || pathname?.includes('/glvt/training')) return 'workouts'; // Facility & Workouts map to same tab
        if (pathname?.includes('/glvt/profile')) return 'profile';
        if (pathname?.includes('/glvt/home')) return 'dashboard';

        // Fallback for sub-routes
        return '';
    };

    // Hide on login/onboarding if needed, but for now show if we are deep in app
    // if (pathname === '/glvt/login') return null;

    return <BottomNav activeView={getActiveView()} />;
}
