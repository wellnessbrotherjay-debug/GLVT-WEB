import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    try {
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
