"use client";

import { useState } from "react";
import type { Artwork } from "@/lib/types";
import { saveArtworkAction } from "@/app/admin/(dashboard)/pieces/actions";

export default function ArtworkForm({ artwork }: { artwork?: Artwork }) {
  const [category, setCategory] = useState(artwork?.category ?? "painting");
  const [isOriginal, setIsOriginal] = useState(artwork?.isOriginal ?? true);

  return (
    <form action={saveArtworkAction} className="flex flex-col gap-5">
      {artwork && <input type="hidden" name="id" value={artwork.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            name="title"
            required
            defaultValue={artwork?.title}
            className={inputClass}
          />
        </Field>
        <Field label="Category" required>
          <select
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={inputClass}
          >
            <option value="painting">Painting</option>
            <option value="sculpture">Sculpture</option>
            <option value="print">Print</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Medium" required>
          <input name="medium" required defaultValue={artwork?.medium} className={inputClass} />
        </Field>
        <Field label="Year" required>
          <input
            name="year"
            type="number"
            required
            defaultValue={artwork?.year ?? new Date().getFullYear()}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Height (cm)" required>
          <input
            name="height"
            type="number"
            step="0.1"
            required
            defaultValue={artwork?.dimensions.height}
            className={inputClass}
          />
        </Field>
        <Field label="Width (cm)" required>
          <input
            name="width"
            type="number"
            step="0.1"
            required
            defaultValue={artwork?.dimensions.width}
            className={inputClass}
          />
        </Field>
        <Field label="Depth (cm)">
          <input
            name="depth"
            type="number"
            step="0.1"
            defaultValue={artwork?.dimensions.depth}
            className={inputClass}
          />
        </Field>
        <Field label="Weight (kg)" required>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            required
            defaultValue={artwork?.weightKg}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (INR)" required>
          <input
            name="price"
            type="number"
            required
            defaultValue={artwork?.price}
            className={inputClass}
          />
        </Field>
        <Field label="Price note (optional)">
          <input name="priceNote" defaultValue={artwork?.priceNote} className={inputClass} />
        </Field>
        <Field label="Size bucket" required>
          <select
            name="sizeBucket"
            required
            defaultValue={artwork?.sizeBucket ?? "medium"}
            className={inputClass}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" required>
          <select
            name="status"
            required
            defaultValue={artwork?.status ?? "available"}
            className={inputClass}
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="commission">Commission only</option>
          </select>
        </Field>
        <Field label="Print of (original's slug, optional)">
          <input name="printOf" defaultValue={artwork?.printOf} className={inputClass} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isOriginal"
            defaultChecked={artwork?.isOriginal ?? true}
            onChange={(e) => setIsOriginal(e.target.checked)}
          />
          One-of-one original (uncheck for a print/edition)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="requiresShippingQuote"
            defaultChecked={artwork?.requiresShippingQuote}
          />
          Requires shipping quote (oversized/fragile)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={artwork?.featured} />
          Featured on homepage
        </label>
      </div>

      {!isOriginal && (
        <div className="grid gap-4 rounded-md border border-line bg-paper-dim/60 p-4 sm:grid-cols-2">
          <Field label="Edition size" required>
            <input
              name="editionSize"
              type="number"
              defaultValue={artwork?.edition?.size}
              className={inputClass}
            />
          </Field>
          <Field label="Edition available" required>
            <input
              name="editionAvailable"
              type="number"
              defaultValue={artwork?.edition?.availableCount}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <Field label="Tags (comma-separated)">
        <input name="tags" defaultValue={artwork?.tags.join(", ")} className={inputClass} />
      </Field>

      <Field label="Story" required>
        <textarea
          name="story"
          required
          rows={5}
          defaultValue={artwork?.story}
          className={inputClass}
        />
      </Field>

      <Field label={artwork ? "Add more images" : "Images"}>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="focus-ring text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper hover:file:bg-clay-dark"
        />
        <span className="text-xs text-ink-soft">
          Uploaded in order and auto-labelled front / side / back / detail.
        </span>
      </Field>

      <button
        type="submit"
        className="focus-ring mt-2 w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
      >
        {artwork ? "Save changes" : "Create piece"}
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
