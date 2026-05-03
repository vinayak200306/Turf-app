import { Resend } from 'resend';

// WARNING: In a production environment, you should NOT expose your Resend API key
// in the frontend client. This logic should be moved to a Supabase Edge Function
// or a dedicated backend service.

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 're_mock_key');

export const sendBookingConfirmation = async ({ toEmail, userName, sportName, date, time }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Arena Booking <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Booking Confirmed: ${sportName} - ${date}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0F172A;">Mission Secured!</h2>
          <p>Hi ${userName},</p>
          <p>Your session at the arena is confirmed. Here are the details:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Sport:</strong> ${sportName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
          </div>
          <p>Please arrive 15 minutes before your scheduled time.</p>
          <p>Best,<br/>Karnataka Bhavan Sports Arena</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err };
  }
};
