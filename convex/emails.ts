"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";
import { action } from "./_generated/server";

export const sendPasswordResetEmail = action({
  args: {
    to: v.string(),
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const smtpHost = process.env.RESEND_SMTP_HOST ?? "smtp.resend.com";
    const smtpPort = Number(process.env.RESEND_SMTP_PORT ?? "465");
    const smtpUser = process.env.RESEND_SMTP_USER ?? "resend";
    const smtpPassword =
      process.env.RESEND_SMTP_PASSWORD ?? process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    if (!smtpPassword || !resendFromEmail) {
      throw new Error("Missing RESEND_SMTP_PASSWORD or RESEND_FROM_EMAIL");
    }

    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const subject = "Reset your Ledgerise password";
    const text = [
      "We received a request to reset your Ledgerise password.",
      "",
      `Reset your password: ${args.url}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n");
    const html = [
      "<p>We received a request to reset your Ledgerise password.</p>",
      `<p><a href="${args.url}">Reset your password</a></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join("");

    await transport.sendMail({
      to: args.to,
      from: resendFromEmail,
      subject,
      text,
      html,
    });
  },
});
