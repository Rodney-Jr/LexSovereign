import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.RESEND_FROM || 'NomosDesk <noreply@nomosdesk.com>';
const PLATFORM_URL = process.env.PLATFORM_URL || 'https://app.nomosdesk.com';

// ─── HTML Templates ──────────────────────────────────────────────────────────

function baseLayout(content: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${previewText}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⚖ NomosDesk</p>
            <p style="margin:4px 0 0;color:#c4b5fd;font-size:13px;">Sovereign Legal Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;color:#e2e8f0;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #334155;background:#0f172a;">
            <p style="margin:0;color:#64748b;font-size:12px;">
              This email was sent by NomosDesk. If you did not expect it, you may safely ignore it.<br/>
              &copy; ${new Date().getFullYear()} NomosDesk Ltd. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${text}</a>`;
}

// ─── Email Functions ──────────────────────────────────────────────────────────

/**
 * Send an invitation email to a new practitioner.
 */
export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  tenantName: string;
  roleName: string;
  inviteToken: string;
}) {
  const { to, inviterName, tenantName, roleName, inviteToken } = params;
  const joinUrl = `${PLATFORM_URL}/join?token=${inviteToken}`;

  const content = `
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">You've been invited</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${inviterName} has invited you to join <strong style="color:#a5b4fc;">${tenantName}</strong> on NomosDesk as <strong style="color:#a5b4fc;">${roleName}</strong>.</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.6;">Click the button below to set up your account and access your secure legal enclave. This invitation expires in <strong>7 days</strong>.</p>
        ${button('Accept Invitation & Join →', joinUrl)}
        <p style="margin-top:24px;color:#64748b;font-size:13px;">Or copy this link: <a href="${joinUrl}" style="color:#818cf8;">${joinUrl}</a></p>
    `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You've been invited to ${tenantName} on NomosDesk`,
    html: baseLayout(content, `Invitation to ${tenantName}`)
  });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetToken: string;
}) {
  const { to, resetToken } = params;
  const resetUrl = `${PLATFORM_URL}/?resetToken=${resetToken}`;

  const content = `
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">Reset your password</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">We received a request to reset your password for your NomosDesk account.</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.6;">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        ${button('Reset Password →', resetUrl)}
        <p style="margin-top:24px;color:#64748b;font-size:13px;">If you didn't request this, no action is needed — your account remains secure.</p>
        <p style="color:#64748b;font-size:13px;">Or copy this link: <a href="${resetUrl}" style="color:#818cf8;">${resetUrl}</a></p>
    `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Reset your NomosDesk password',
    html: baseLayout(content, 'Password Reset')
  });
}

/**
 * Send a welcome email after tenant provisioning by Global Admin.
 */
export async function sendTenantWelcomeEmail(params: {
  to: string;
  adminName: string;
  tenantName: string;
  tempPassword: string;
  loginUrl: string;
}) {
  const { to, adminName, tenantName, tempPassword, loginUrl } = params;

  const content = `
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">Welcome to NomosDesk, ${adminName}!</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Your sovereign legal enclave <strong style="color:#a5b4fc;">${tenantName}</strong> has been provisioned and is ready.</p>
        <table style="width:100%;background:#0f172a;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
            <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Login Email</td></tr>
            <tr><td style="color:#e2e8f0;font-weight:600;font-size:15px;padding-bottom:16px;">${to}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Temporary Password</td></tr>
            <tr><td style="color:#e2e8f0;font-weight:600;font-size:15px;font-family:monospace;letter-spacing:2px;">${tempPassword}</td></tr>
        </table>
        <p style="color:#f59e0b;font-size:13px;">⚠ Please change your password immediately after your first login.</p>
        ${button('Access Your Enclave →', loginUrl)}
    `;

  console.log(`[Email] Dispatching Welcome Email to: ${to} (Tenant: ${tenantName})`);
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your NomosDesk enclave "${tenantName}" is ready`,
    html: baseLayout(content, `Welcome to ${tenantName}`)
  });
}

/**
 * Send welcome email after auto-provisioning from a demo request.
 * This replaces the generic lead-ack and specifically communicates
 * that the demo request resulted in a live, fully provisioned account.
 */
export async function sendDemoProvisionedEmail(params: {
  to: string;
  adminName: string;
  tenantName: string;
  tempPassword: string;
  loginUrl: string;
}) {
  const { to, adminName, tenantName, tempPassword, loginUrl } = params;

  const content = `
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">Your enclave is live, ${adminName}!</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">
          Thank you for requesting a demo. Instead of scheduling a call, we've gone ahead and
          <strong style="color:#a5b4fc;">automatically provisioned your sovereign legal enclave</strong> so you can explore the full platform right now.
        </p>
        <table style="width:100%;background:#0f172a;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
            <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:4px;">Workspace</td></tr>
            <tr><td style="color:#e2e8f0;font-weight:600;font-size:15px;padding-bottom:16px;">${tenantName}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:4px;">Login Email</td></tr>
            <tr><td style="color:#e2e8f0;font-weight:600;font-size:15px;padding-bottom:16px;">${to}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:4px;">Temporary Password</td></tr>
            <tr><td style="color:#e2e8f0;font-weight:600;font-size:16px;font-family:monospace;letter-spacing:2px;">${tempPassword}</td></tr>
        </table>
        <p style="color:#f59e0b;font-size:13px;">⚠ Please change your password immediately after your first login.</p>
        <p style="color:#cbd5e1;font-size:14px;line-height:1.6;">
          This is a fully functional account — not a limited demo. You have access to matter management,
          document automation, AI legal research, client portals, and more.
        </p>
        ${button('Access Your Enclave Now →', loginUrl)}
        <p style="margin-top:32px;color:#64748b;font-size:13px;">
          A member of our team will follow up within 1 business day to walk you through the platform and answer any questions.
        </p>
    `;

  console.log(`[Email] Dispatching Demo Provisioning Email to: ${to} (Tenant: ${tenantName})`);
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your NomosDesk enclave "${tenantName}" is ready — start now`,
    html: baseLayout(content, `Welcome to NomosDesk — ${tenantName} is live`)
  });
}
