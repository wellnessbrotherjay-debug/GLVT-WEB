import { Suspense } from "react";
import HRMResultsContent from "./HRMResultsContent";

export default function HRMResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                Loading Results...
            </div>
        }>
            <HRMResultsContent />
        </Suspense>
    );
}
