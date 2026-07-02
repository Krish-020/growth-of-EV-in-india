import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends a transactional email via Resend if RESEND_API_KEY is configured;
 * otherwise records it in the email_log table so nothing is silently lost
 * during local dev / before a provider is wired up. Every call is logged
 * either way (sent=1 on real delivery, sent=0 for the local fallback).
 */
export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "studio@example.com";
  let sent = false;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          text: input.body,
        }),
      });
      sent = res.ok;
      if (!res.ok) {
        console.error("Resend email failed:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Resend email request failed:", err);
    }
  }

  db.prepare(
    "INSERT INTO email_log (id, created_at, to_email, subject, body, sent) VALUES (?,?,?,?,?,?)"
  ).run(randomUUID(), new Date().toISOString(), input.to, input.subject, input.body, sent ? 1 : 0);

  return { sent };
}

export async function getRecentEmailLog(limit = 50) {
  return db
    .prepare("SELECT * FROM email_log ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as {
    id: string;
    created_at: string;
    to_email: string;
    subject: string;
    body: string;
    sent: number;
  }[];
}
