import nodemailer from 'nodemailer';

export interface AlertPayload {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  pendingCount: number;
  adminDashboardURL: string;
}

export class NotificationService {
  /**
   * Dispatches notifications across multiple alert channels.
   */
  static async sendAllAlerts(payload: AlertPayload): Promise<boolean> {
    console.log(`[NotificationService] Initiating alert pipeline for message ID: ${payload.id}`);
    
    // Format the email alert body according to requirements
    const emailSubject = `🔔 New Portfolio Message Received`;
    const emailBody = `----------------------------------------
A new message has been received.

Sender Name:
${payload.name}

Email:
${payload.email}

Subject:
${payload.subject}

Message:
${payload.message}

Received At:
${payload.timestamp}

Current Dashboard Status:
You currently have:
• ${payload.pendingCount} Pending Message${payload.pendingCount === 1 ? '' : 's'}

Open Admin Dashboard:
${payload.adminDashboardURL}
----------------------------------------`;

    let success = false;

    // 1. Primary Dispatcher: SMTP / Nodemailer (if credentials exist in env)
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Jeeva Portfolio Alert" <${smtpUser}>`,
          to: 'jeevasenthilkumar0225@gmail.com',
          replyTo: payload.email,
          subject: emailSubject,
          text: emailBody,
        });

        console.log(`[NotificationService] Direct SMTP alert sent successfully for message ID: ${payload.id}`);
        success = true;
        return success;
      } catch (smtpError) {
        console.error(`[NotificationService] SMTP delivery failed, falling back to Web3Forms API:`, smtpError);
      }
    }

    // 2. Fallback Gateway: Web3Forms Email Submission API
    // Setting visitor details correctly so Web3Forms forwards the submission to key owner (jeevasenthilkumar0225@gmail.com)
    try {
      const accessKey = process.env.WEB3FORMS_ACCESS_KEY || 'b947c6d6-6d63-4c91-a1e6-31a89c9339e8';
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: payload.name,
          email: payload.email,
          subject: emailSubject,
          message: emailBody,
        }),
      });

      const resJson = await response.json();
      if (response.ok && resJson.success) {
        console.log(`[NotificationService] Web3Forms API alert sent successfully for message ID: ${payload.id}`);
        success = true;
      } else {
        console.error(`[NotificationService] Web3Forms rejected submission:`, resJson);
      }
    } catch (apiError) {
      console.error(`[NotificationService] Web3Forms API fallback failed:`, apiError);
    }

    return success;
  }
}
