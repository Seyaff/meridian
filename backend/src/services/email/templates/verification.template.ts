import { Env } from "../../../config/app.config";

export const verificationTemplate = (token: string) => {
  const verificationUrl = `${Env.FRONTEND_ORIGIN}/verify-email?token=${encodeURIComponent(token)}`;

  return {
    subject: "Verify Your Email Address",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f9fafb;
            padding: 40px 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .header {
            padding: 32px 40px 20px 40px;
        }

        .logo {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            text-decoration: none;
        }

        .body-content {
            padding: 0 40px 32px 40px;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 16px;
        }

        p {
            font-size: 16px;
            line-height: 24px;
            color: #4b5563;
        }

        .btn {
            background-color: #111827;
            color: #ffffff !important;
            display: inline-block;
            font-size: 15px;
            line-height: 48px;
            text-align: center;
            text-decoration: none;
            width: 200px;
            border-radius: 6px;
        }

        .token-text {
            font-size: 13px;
            color: #9ca3af;
            word-break: break-all;
        }

        .footer {
            padding: 24px 40px;
            background-color: #f3f4f6;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
        }

        @media screen and (max-width: 600px) {
            .wrapper { padding: 12px 0; }
            .container { border-radius: 0; border: none; }
            .header, .body-content, .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
        }
    </style>
</head>

<body>
<div class="wrapper">
    <table class="container" role="presentation">

        <tr>
            <td class="header">
                <a href="${Env.FRONTEND_ORIGIN}" class="logo">YOUR_BRAND</a>
            </td>
        </tr>

        <tr>
            <td class="body-content">
                <h1>Verify your email address</h1>

                <p>
                    Thanks for signing up! Please verify your email to activate your account.
                </p>

                <p>
                    <a href="${verificationUrl}" class="btn" target="_blank">
                        Verify Email
                    </a>
                </p>

                <p>
                    This link will expire in 24 hours. If you didn’t create this account, you can ignore this email.
                </p>

                <p class="token-text">
                    If the button doesn’t work, copy and paste this URL:<br>
                    <a href="${verificationUrl}" style="color:#2563eb;">
                        ${verificationUrl}
                    </a>
                </p>
            </td>
        </tr>

        <tr>
            <td class="footer">
                <p class="footer-text">© 2026 YOUR_BRAND. All rights reserved.</p>
                <p class="footer-text">You received this email because you registered on our platform.</p>
            </td>
        </tr>

    </table>
</div>
</body>
</html>`,
  };
};

export const passwordResetTemplate = (token: string) => {
  const resetUrl = `${Env.FRONTEND_ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;

  return {
    subject: "Reset Your Password",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f9fafb;
            padding: 40px 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .header {
            padding: 32px 40px 20px 40px;
        }

        .logo {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            text-decoration: none;
        }

        .body-content {
            padding: 0 40px 32px 40px;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 16px;
        }

        p {
            font-size: 16px;
            line-height: 24px;
            color: #4b5563;
        }

        .btn {
            background-color: #111827;
            color: #ffffff !important;
            display: inline-block;
            font-size: 15px;
            line-height: 48px;
            text-align: center;
            text-decoration: none;
            width: 200px;
            border-radius: 6px;
        }

        .token-text {
            font-size: 13px;
            color: #9ca3af;
            word-break: break-all;
        }

        .footer {
            padding: 24px 40px;
            background-color: #f3f4f6;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
        }

        @media screen and (max-width: 600px) {
            .wrapper { padding: 12px 0; }
            .container { border-radius: 0; border: none; }
            .header, .body-content, .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
        }
    </style>
</head>

<body>
<div class="wrapper">
    <table class="container" role="presentation">

        <tr>
            <td class="header">
                <a href="${Env.FRONTEND_ORIGIN}" class="logo">YOUR_BRAND</a>
            </td>
        </tr>

        <tr>
            <td class="body-content">
                <h1>Reset your password</h1>

                <p>
                    We received a request to reset the password for your account. Click the button below to choose a new one.
                </p>

                <p>
                    <a href="${resetUrl}" class="btn" target="_blank">
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in 1 hour. If you didn’t request a password reset, you can safely ignore this email and your password will remain unchanged.
                </p>

                <p class="token-text">
                    If the button doesn’t work, copy and paste this URL:<br>
                    <a href="${resetUrl}" style="color:#2563eb;">
                        ${resetUrl}
                    </a>
                </p>
            </td>
        </tr>

        <tr>
            <td class="footer">
                <p class="footer-text">© 2026 YOUR_BRAND. All rights reserved.</p>
                <p class="footer-text">You received this email because a password reset was requested for your account.</p>
            </td>
        </tr>

    </table>
</div>
</body>
</html>`,
  };
};