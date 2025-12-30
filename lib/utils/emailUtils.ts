import nodemailer from 'nodemailer';
import systemConfig from '../../config/system';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: systemConfig.email.server?.split('://')[1]?.split(':')[0] || 'smtp.example.com',
      port: systemConfig.email.server?.split(':')[1] ? parseInt(systemConfig.email.server.split(':')[1]) : 587,
      secure: systemConfig.email.server?.startsWith('smtps://') || false,
      auth: {
        user: systemConfig.email.user,
        pass: systemConfig.email.password,
      },
    });
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: systemConfig.email.from || 'no-reply@cbt-system.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  public async sendTestResultsEmail(
    to: string,
    testName: string,
    score: number,
    total: number,
    grade: string,
    feedback: string
  ): Promise<boolean> {
    const percentage = Math.round((score / total) * 100);
    const status = percentage >= 70 ? 'Passed' : 'Failed';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Test Results</h2>
        <p><strong>Test:</strong> ${testName}</p>
        <p><strong>Score:</strong> ${score}/${total} (${percentage}%)</p>
        <p><strong>Grade:</strong> ${grade}</p>
        <p><strong>Status:</strong> ${status}</p>
        
        <h3 style="color: #2563eb; margin-top: 20px;">Feedback</h3>
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
          ${feedback}
        </p>
        
        <p style="margin-top: 20px; color: #6b7280;">
          Thank you for using the CBT System!
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Your Test Results: ${testName} (${grade})`,
      html,
    });
  }

  public async sendPasswordResetEmail(
    to: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${systemConfig.app.url || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You have requested to reset your password for the CBT System.</p>
        
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">
            Reset Password
          </a>
        </p>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <p style="margin-top: 20px; color: #6b7280;">
          This link will expire in 24 hours.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Password Reset Request - CBT System',
      html,
    });
  }

  public async sendTwoFactorSetupEmail(
    to: string,
    recoveryCodes: string[]
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">2FA Setup Complete</h2>
        <p>Your two-factor authentication has been successfully set up.</p>
        
        <h3 style="color: #2563eb; margin-top: 20px;">Recovery Codes</h3>
        <p>Please save these recovery codes in a secure place. Each code can be used once to access your account if you lose your 2FA device.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${recoveryCodes.map(code => `
            <div style="background-color: white; padding: 8px; margin: 5px 0; border-radius: 3px;">
              ${code}
            </div>
          `).join('')}
        </div>
        
        <p style="margin-top: 20px; color: #dc2626; font-weight: bold;">
          WARNING: Do not share these codes with anyone. Treat them like passwords.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: '2FA Setup Complete - CBT System',
      html,
    });
  }

  public async sendTestInvitationEmail(
    to: string,
    testName: string,
    testDate: string,
    testDuration: number,
    testUrl: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Invitation: ${testName}</h2>
        
        <p><strong>Date:</strong> ${testDate}</p>
        <p><strong>Duration:</strong> ${testDuration} minutes</p>
        
        <p style="margin: 20px 0;">
          <a href="${testUrl}" style="
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">
            Start Test
          </a>
        </p>
        
        <h3 style="color: #2563eb; margin-top: 20px;">Important Instructions</h3>
        <ul style="padding-left: 20px;">
          <li>Ensure you have a stable internet connection</li>
          <li>Use a compatible browser (Chrome, Firefox, Edge)</li>
          <li>Have your webcam ready if required</li>
          <li>Prepare any allowed materials</li>
          <li>Find a quiet, well-lit space</li>
        </ul>
        
        <p style="margin-top: 20px; color: #6b7280;">
          Good luck with your test!
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Test Invitation: ${testName}`,
      html,
    });
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return getEmailService().sendEmail(options);
}

export async function sendTestResultsEmail(
  to: string,
  testName: string,
  score: number,
  total: number,
  grade: string,
  feedback: string
): Promise<boolean> {
  return getEmailService().sendTestResultsEmail(to, testName, score, total, grade, feedback);
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<boolean> {
  return getEmailService().sendPasswordResetEmail(to, resetToken);
}

export async function sendTwoFactorSetupEmail(
  to: string,
  recoveryCodes: string[]
): Promise<boolean> {
  return getEmailService().sendTwoFactorSetupEmail(to, recoveryCodes);
}

export async function sendTestInvitationEmail(
  to: string,
  testName: string,
  testDate: string,
  testDuration: number,
  testUrl: string
): Promise<boolean> {
  return getEmailService().sendTestInvitationEmail(to, testName, testDate, testDuration, testUrl);
}