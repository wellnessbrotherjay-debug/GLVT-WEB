import { Suspense } from "react";
import FitnessTestContent from "./FitnessTestContent";

export default function FitnessTestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#2D2D2D] text-[#C8A871]">
                Loading Assessment...
            </div>
        }>
            <FitnessTestContent />
        </Suspense>
    );
}
