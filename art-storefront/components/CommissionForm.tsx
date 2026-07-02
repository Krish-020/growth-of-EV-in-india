"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCatalog } from "@/lib/catalog-context";

const BUDGET_BANDS = [
  "Under ₹50,000",
  "₹50,000 – ₹1,50,000",
  "₹1,50,000 – ₹3,00,000",
  "Above ₹3,00,000",
  "Not sure yet",
];

const WORK_TYPES = ["Painting", "Sculpture", "Either / open to suggestions"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix — we store mime separately.
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CommissionForm() {
  const searchParams = useSearchParams();
  const pieceSlug = searchParams.get("piece") ?? "";
  const { getArtworkBySlug } = useCatalog();
  const referencePiece = pieceSlug ? getArtworkBySlug(pieceSlug) : undefined;

  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    try {
      const attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          dataBase64: await fileToBase64(file),
        }))
      );

      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          workType: form.get("workType"),
          brief: form.get("brief"),
          approxSize: form.get("approxSize") || undefined,
          budgetRange: form.get("budgetRange"),
          pieceSlug: pieceSlug || undefined,
          attachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong sending your request.");
        setSubmitting(false);
        return;
      }
      setReferenceId(data.referenceId);
      setSubmitted(true);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-line bg-paper-dim/60 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage">
          Request received
        </p>
        <h2 className="mt-2 font-display text-2xl">
          Reference {referenceId}
        </h2>
        <p className="mt-3 text-ink-soft">
          Thank you — this is a conversation, not an instant order. Expect a
          reply within 3–5 business days with questions, a rough quote, and
          next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {referencePiece && (
        <div className="rounded-md border border-line bg-paper-dim/60 px-4 py-3 text-sm">
          Inquiring about something in the spirit of{" "}
          <span className="font-medium">{referencePiece.title}</span>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input name="fullName" required className={inputClass} />
        </Field>
        <Field label="Email" required>
          <input name="email" type="email" required className={inputClass} />
        </Field>
      </div>

      <Field label="Phone (optional)">
        <input name="phone" type="tel" className={inputClass} />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-ink-soft">
          What kind of piece are you imagining? *
        </legend>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((type) => (
            <label
              key={type}
              className="focus-ring flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm has-[:checked]:border-clay has-[:checked]:text-clay"
            >
              <input type="radio" name="workType" value={type} required />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Tell us about the brief" required>
        <textarea
          name="brief"
          required
          rows={5}
          placeholder="Space it's for, mood, colours, any constraints on size or timeline…"
          className={inputClass}
        />
      </Field>

      <Field label="Approximate size (optional)">
        <input
          name="approxSize"
          placeholder="e.g. roughly 90 x 120 cm"
          className={inputClass}
        />
      </Field>

      <Field label="Budget range" required>
        <select name="budgetRange" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a range
          </option>
          {BUDGET_BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Reference images (optional)">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="focus-ring text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper hover:file:bg-clay-dark"
        />
        {files.length > 0 && (
          <ul className="mt-1 text-xs text-ink-soft">
            {files.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        )}
      </Field>

      {error && (
        <p className="rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring mt-2 w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-dark disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {submitting ? "Sending…" : "Send commission request"}
      </button>
    </form>
  );
}

const inputClass =
  "focus-ring rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-soft">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
    </label>
  );
}
