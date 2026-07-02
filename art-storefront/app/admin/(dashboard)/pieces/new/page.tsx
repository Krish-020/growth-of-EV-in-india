import type { Metadata } from "next";
import ArtworkForm from "@/components/admin/ArtworkForm";

export const metadata: Metadata = {
  title: "Add a piece",
  robots: { index: false, follow: false },
};

export default function NewArtworkPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Add a piece</h1>
      <div className="mt-8">
        <ArtworkForm />
      </div>
    </div>
  );
}
