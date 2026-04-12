import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? "Red Rose Shop <noreply@redrose.com>",
    to,
    subject,
    html,
  });
};

// ══════════════════════════════════════════════════════════════
// Email Templates
// ══════════════════════════════════════════════════════════════

// ── Verification Email ─────────────────────────────────────────
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationUrl: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "🌹 Red Rose Shop — Email Verify করো",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: 1px; }
          .body { padding: 36px 32px; }
          .body p { color: #444; font-size: 15px; line-height: 1.7; }
          .btn { display: inline-block; margin: 24px 0; padding: 14px 36px; background: #c0392b; color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
          .link-box { background: #f9f9f9; border: 1px dashed #ddd; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 13px; color: #666; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Red Rose Cosmetic Shop</h1>
          </div>
          <div class="body">
            <p>WELCOME <strong>${name}</strong>!</p>
            <p>তোমার account verify করতে নিচের button এ click করো। এই link টি <strong>24 ঘন্টা</strong> পর্যন্ত valid থাকবে।</p>
            <div style="text-align:center;">
              <a href="${verificationUrl}" class="btn">✅ Email Verify করো</a>
            </div>
            <p style="font-size:13px; color:#888;">Button কাজ না করলে এই link টি browser এ paste করো:</p>
            <div class="link-box">${verificationUrl}</div>
          </div>
          <div class="footer">
            <p>এই email তুমি request করোনি? তাহলে ignore করো।</p>
            <p>© ${new Date().getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// ── Password Reset Email ───────────────────────────────────────
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "🔐 Red Rose Shop — Password Reset",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; }
          .body { padding: 36px 32px; }
          .body p { color: #444; font-size: 15px; line-height: 1.7; }
          .btn { display: inline-block; margin: 24px 0; padding: 14px 36px; background: #c0392b; color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
          .link-box { background: #f9f9f9; border: 1px dashed #ddd; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 13px; color: #666; margin-top: 16px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #856404; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Red Rose Cosmetic Shop</h1>
          </div>
          <div class="body">
            <p>হ্যালো <strong>${name}</strong>,</p>
            <p>তোমার account এর password reset করার request পেয়েছি। নিচের button এ click করো:</p>
            <div style="text-align:center;">
              <a href="${resetUrl}" class="btn">🔐 Password Reset করো</a>
            </div>
            <div class="warning">⚠️ এই link টি <strong>1 ঘন্টা</strong> পর্যন্ত valid। তুমি request না করলে এই email ignore করো।</div>
            <p style="font-size:13px; color:#888; margin-top:16px;">Button কাজ না করলে:</p>
            <div class="link-box">${resetUrl}</div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// ── Order Confirmation Email ───────────────────────────────────
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number,
  address: string,
  phone: string
): Promise<void> => {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">৳${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `🌹 Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f5f5f5; padding: 10px; text-align: left; font-size: 13px; color: #666; }
          .total-row td { font-weight: bold; font-size: 16px; padding: 14px 10px; border-top: 2px solid #c0392b; }
          .info-box { background: #fff8f8; border: 1px solid #f5c6c6; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .cod-badge { display: inline-block; background: #28a745; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Red Rose Cosmetic Shop</h1>
            <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Order Confirmed! 🎉</p>
          </div>
          <div class="body">
            <p>প্রিয় <strong>${name}</strong>,</p>
            <p>তোমার order সফলভাবে placed হয়েছে। Order ID: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>

            <table>
              <thead>
                <tr>
                  <th>পণ্য</th>
                  <th style="text-align:center;">পরিমাণ</th>
                  <th style="text-align:right;">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2">মোট মূল্য</td>
                  <td style="text-align:right; color:#c0392b;">৳${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div class="info-box">
              <p style="margin:0 0 8px;"><strong>📦 ডেলিভারি ঠিকানা:</strong> ${address}</p>
              <p style="margin:0 0 8px;"><strong>📞 ফোন:</strong> ${phone}</p>
              <p style="margin:0;"><strong>💳 পেমেন্ট:</strong> <span class="cod-badge">💵 Cash on Delivery</span></p>
            </div>

            <p style="color:#666; font-size:14px;">পণ্য পৌঁছানোর সময় ক্যাশ দিয়ে পেমেন্ট করবে। আমরা শীঘ্রই তোমার সাথে যোগাযোগ করব।</p>
          </div>
          <div class="footer">
            <p>ধন্যবাদ Red Rose Cosmetic Shop এ order করার জন্য! 🌹</p>
            <p>© ${new Date().getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
