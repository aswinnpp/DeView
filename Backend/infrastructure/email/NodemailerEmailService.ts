import nodemailer from 'nodemailer';
import { EmailServicePort } from '../../application/auth/ports/EmailServicePort.js';
export class NodemailerEmailService implements EmailServicePort {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendOTP(email: string, otp: string, userName: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - DeViewS App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to Intervu, ${userName}!</h2>
                    <p style="color: #666; font-size: 16px;">
                        Thank you for signing up. Please verify your email address to complete your registration.
                    </p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
                        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This code will expire in 60 seconds.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `,
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password - DeView App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px;">
                        Hi ${userName},
                    </p>
                    <p style="color: #666; font-size: 16px;">
                        We received a request to reset your password for your DeView account. 
                        Click the button below to reset your password:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                                  text-decoration: none; border-radius: 5px; font-size: 16px; 
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="color: #4CAF50; font-size: 14px; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        This link will expire in 15 minutes for security reasons.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        Your password will not be changed unless you click the link above and create a new password.
                    </p>
                </div>
            `,
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetOTP(email: string, otp: string, userName: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password - DeView App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px;">
                        Hi ${userName},
                    </p>
                    <p style="color: #666; font-size: 16px;">
                        We received a request to reset your password for your DeView account. 
                        Use the verification code below to reset your password:
                    </p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
                        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This code will expire in 60 seconds for security reasons.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        Your password will not be changed unless you enter this code.
                    </p>
                </div>
            `,
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendWelcomeEmail(email: string, userName: string, role: string, temporaryPassword: string): Promise<void> {
        const loginUrl = `${process.env.FRONTEND_URL}/login`;
        const roleLabel = role === 'hr' ? 'HR' : 'Interviewer';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Welcome to DeView - Your ${roleLabel} Account is Ready!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to DeView, ${userName}!</h2>
                    <p style="color: #666; font-size: 16px;">
                        Your company has created a <strong>${roleLabel}</strong> account for you on the DeView platform.
                    </p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #333; font-size: 14px; margin: 0 0 12px 0;"><strong>Your login credentials:</strong></p>
                        <p style="color: #555; font-size: 14px; margin: 4px 0;">
                            📧 <strong>Email:</strong> ${email}
                        </p>
                        <p style="color: #555; font-size: 14px; margin: 4px 0;">
                            🔑 <strong>Temporary Password:</strong> 
                            <code style="background: #e8e8e8; padding: 2px 8px; border-radius: 4px; font-size: 15px; letter-spacing: 1px;">${temporaryPassword}</code>
                        </p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" 
                           style="background-color: #6366f1; color: white; padding: 14px 28px; 
                                  text-decoration: none; border-radius: 5px; font-size: 16px; 
                                  display: inline-block;">
                            Login Now
                        </a>
                    </div>
                    <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">
                        ⚠️ Please change your password after your first login for security.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        If you weren't expecting this email, please contact your company admin.
                    </p>
                </div>
            `,
        };
        await this.transporter.sendMail(mailOptions);
    }

}
