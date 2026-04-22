
import { sendEmail } from '../email-service';
import env from '../../../config';

const baseUrl = env.CLIENT_URL.replace(/\/$/, '');

export const sendOnboardingWelcomeEmail = async (
    email: string,
    user: { name: string; heroImageUrl?: string }
) => {
    const subject = 'Welcome to CodeSM — your account is ready';
    const avatarBlock = user.heroImageUrl
        ? `<p style="margin: 0 0 24px 0;"><img src="${user.heroImageUrl}" alt="" width="64" height="64" style="border-radius: 50%; display: block; border: 2px solid #e4e4e7;"></p>`
        : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CodeSM</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e4e4e7;">
        <div style="background-color: #0f172a; padding: 32px; text-align: center;">
            <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CodeSM</div>
            <div style="color: #94a3b8; font-size: 13px; margin-top: 8px;">AI coding platform</div>
        </div>

        <div style="padding: 40px 32px;">
            <p style="color: #2563eb; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Welcome aboard</p>
            ${avatarBlock}
            <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #111827; margin-top: 0;">Hi ${user.name}</h1>

            <p style="line-height: 1.6; margin-bottom: 24px; color: #3f3f46; font-size: 16px;">
                Thanks for verifying your email. CodeSM is where you practice coding problems, join contests, run submissions, and discuss solutions with the community. Here is how to get the most out of your account.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                    <td style="padding: 24px;">
                        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #111827; margin-top: 0;">
                            <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">🚀</span>
                            <span style="display: inline-block; vertical-align: middle;">Open your dashboard</span>
                        </h2>
                        <p style="line-height: 1.6; margin-bottom: 16px; color: #3f3f46; font-size: 15px;">
                            Your home base for what is new, what to solve next, and quick links across the platform.
                        </p>
                        <div style="text-align: center;">
                            <a href="${baseUrl}/" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to CodeSM &rarr;</a>
                        </div>
                    </td>
                </tr>
            </table>

            <div style="margin-bottom: 32px;">
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111827;">📋 Problems & submissions</h2>
                <p style="line-height: 1.6; margin-bottom: 12px; color: #3f3f46; font-size: 15px;">
                    Browse the problem set, write code in the editor, and submit for automated checks. Build streaks and track how you improve over time.
                </p>
                <p style="margin: 0;"><a href="${baseUrl}/problems" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">Explore problems</a></p>
            </div>

            <div style="margin-bottom: 32px;">
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111827;">🏆 Contests</h2>
                <p style="line-height: 1.6; margin-bottom: 12px; color: #3f3f46; font-size: 15px;">
                    Join timed contests, compete on the same problems as others, and see how you rank when the round ends.
                </p>
                <p style="margin: 0;"><a href="${baseUrl}/contests" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">View contests</a></p>
            </div>

            <div style="margin-bottom: 32px;">
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111827;">💬 Discussions</h2>
                <p style="line-height: 1.6; margin-bottom: 12px; color: #3f3f46; font-size: 15px;">
                    Ask questions, share approaches, and learn from threads tied to problems and the wider community.
                </p>
                <p style="margin: 0;"><a href="${baseUrl}/discuss" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">Open discussions</a></p>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-top: 40px;">
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #111827; margin-top: 0;">Quick links</h3>
                <ul style="margin: 0; padding-left: 20px; color: #3f3f46; font-size: 15px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;"><a href="${baseUrl}/" style="color: #2563eb; text-decoration: none;">Dashboard</a></li>
                    <li style="margin-bottom: 8px;"><a href="${baseUrl}/problems" style="color: #2563eb; text-decoration: none;">All problems</a></li>
                    <li><a href="${baseUrl}/contests" style="color: #2563eb; text-decoration: none;">Contest list</a></li>
                </ul>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                <p style="line-height: 1.6; margin: 0; color: #3f3f46; font-size: 16px;">
                    We are glad you are here. Good luck with your next solve.
                </p>
                <p style="line-height: 1.6; margin-top: 16px; margin-bottom: 0; color: #3f3f46; font-size: 16px;">
                    Cheers,<br>
                    <strong>The CodeSM Team</strong>
                </p>
            </div>
        </div>

        <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
            <p style="margin-bottom: 8px;">You received this because you verified your email on CodeSM.</p>
            <p style="margin-top: 16px;">
                &copy; ${new Date().getFullYear()} CodeSM. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to: email,
        subject,
        text: `Welcome to CodeSM, ${user.name}! Your email is verified. Open ${baseUrl}/ to get started.`,
        html,
        senderName: 'CodeSM',
        senderEmail: env.EMAIL_USER,
    });
};
