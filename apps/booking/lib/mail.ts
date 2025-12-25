import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

// Only init if key exists to prevent build crashes
const resend = apiKey ? new Resend(apiKey) : null;

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    try {
        if (!resend) {
            console.warn("Resend API Key missing");
            return { success: false, error: "Missing API Key" };
        }

        const { data, error } = await resend.emails.send({
            from: 'GLVT <onboarding@resend.dev>', // Default Resend testing address
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Exception sending email:', err);
        return { success: false, error: err };
    }
};
