import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends a password reset email to the user.
 * @param {string} toEmail  - recipient email
 * @param {string} resetUrl - the full reset link (frontend URL with token)
 */
export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = createTransporter();
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
              style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
                  <h1 style="margin:0;font-size:22px;color:#e2e8f0;letter-spacing:-0.3px;">
                    🔐 CodeSM
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9;font-weight:600;">
                    Reset your password
                  </h2>
                  <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
                    We received a request to reset the password for your CodeSM account.
                    Click the button below to choose a new password. This link is valid for
                    <strong style="color:#c7d2fe;">1 hour</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
                    <tr>
                      <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);">
                        <a href="${resetUrl}"
                          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;
                                 color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
                          Reset Password →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email — your password won't change.
                  </p>
                  <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                    Or copy &amp; paste this link into your browser:<br/>
                    <a href="${resetUrl}" style="color:#818cf8;word-break:break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
                    © ${new Date().getFullYear()} CodeSM. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Reset your CodeSM password',
    html,
  });
}
