import { NextResponse } from "next/server";
import { createCommissionRequest } from "@/lib/db/inquiries";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB per file, stored as base64 in SQLite

interface AttachmentPayload {
  filename: string;
  mimeType: string;
  dataBase64: string;
}

interface CommissionRequestBody {
  fullName: string;
  email: string;
  phone?: string;
  workType: string;
  brief: string;
  approxSize?: string;
  budgetRange: string;
  pieceSlug?: string;
  attachments?: AttachmentPayload[];
}

export async function POST(request: Request) {
  let body: CommissionRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.fullName || !body.email || !body.workType || !body.brief || !body.budgetRange) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const attachments = (body.attachments ?? []).filter((file) => {
    const approxBytes = (file.dataBase64.length * 3) / 4;
    return approxBytes <= MAX_ATTACHMENT_BYTES;
  });

  const commission = await createCommissionRequest({
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
    workType: body.workType,
    brief: body.brief,
    approxSize: body.approxSize,
    budgetRange: body.budgetRange,
    pieceSlug: body.pieceSlug,
    attachments,
  });

  await sendEmail({
    to: siteConfig.email,
    subject: `New commission inquiry ${commission.referenceId}`,
    body: `From: ${commission.fullName} <${commission.email}>\nType: ${commission.workType}\nBudget: ${commission.budgetRange}\n\n${commission.brief}`,
  });
  await sendEmail({
    to: commission.email,
    subject: `We received your commission request — ${siteConfig.name}`,
    body: `Thanks for reaching out. Your reference number is ${commission.referenceId}. We'll follow up within 3-5 business days.`,
  });

  return NextResponse.json({ referenceId: commission.referenceId }, { status: 201 });
}
