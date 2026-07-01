"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getArtworkBySlug } from "@/lib/mockData";

const BUDGET_BANDS = [
  "Under ₹50,000",
  "₹50,000 – ₹1,50,000",
  "₹1,50,000 – ₹3,00,000",
  "Above ₹3,00,000",
  "Not sure yet",
];

const WORK_TYPES = ["Painting", "Sculpture", "Either / open to suggestions"];

export default function CommissionForm() {
  const searchParams = useSearchParams();
  const pieceSlug = searchParams.get("piece") ?? "";
  const referencePiece = pieceSlug ? getArtworkBySlug(pieceSlug) : undefined;

  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Mock inquiry submission. Phase 2 stores this as a commission_requests
    // row (status: "new") and emails the studio + a confirmation to the
    // requester; reference uploads go to blob storage, not a real backend yet.
    const id = `COM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setReferenceId(id);
    setSubmitted(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    setFiles(names);
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
          <input required className={inputClass} />
        </Field>
        <Field label="Email" required>
          <input type="email" required className={inputClass} />
        </Field>
      </div>

      <Field label="Phone (optional)">
        <input type="tel" className={inputClass} />
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
          required
          rows={5}
          placeholder="Space it's for, mood, colours, any constraints on size or timeline…"
          className={inputClass}
        />
      </Field>

      <Field label="Approximate size (optional)">
        <input placeholder="e.g. roughly 90 x 120 cm" className={inputClass} />
      </Field>

      <Field label="Budget range" required>
        <select required defaultValue="" className={inputClass}>
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
            {files.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </Field>

      <button
        type="submit"
        className="focus-ring mt-2 w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-dark sm:w-auto sm:px-10"
      >
        Send commission request
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
