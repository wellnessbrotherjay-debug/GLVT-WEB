"use client";

import { useState } from "react";

export default function TestEmailPage() {
    const [to, setTo] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSendTest = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to,
                    subject: "GLVT Test Email",
                    html: "<h1>Welcome to GLVT!</h1><p>This is a test email from your booking app.</p>",
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus("Email sent successfully!");
            } else {
                setStatus(`Failed: ${JSON.stringify(data.error)}`);
            }
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-2xl mb-4">Resend Integration Test</h1>
            <input
                type="email"
                placeholder="Enter email address"
                className="bg-[#1a1a1a] border border-white/10 p-2 rounded mb-4 w-64"
                value={to}
                onChange={(e) => setTo(e.target.value)}
            />
            <button
                onClick={handleSendTest}
                disabled={loading || !to}
                className="bg-[#C8A871] text-[#2D2D2D] px-6 py-2 rounded-full font-bold disabled:opacity-50"
            >
                {loading ? "Sending..." : "Send Test Email"}
            </button>
            {status && <p className="mt-4 text-sm">{status}</p>}
        </div>
    );
}
