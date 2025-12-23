import { Suspense } from "react";
import BookingConfirmContent from "./ConfirmContent";

export default function BookingConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#2D2D2D] text-[#C8A871]">
                Loading...
            </div>
        }>
            <BookingConfirmContent />
        </Suspense>
    );
}
