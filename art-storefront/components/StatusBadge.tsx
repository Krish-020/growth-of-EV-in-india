import type { Artwork } from "@/lib/types";
import { availabilityLabel } from "@/lib/mockData";

export default function StatusBadge({ artwork }: { artwork: Artwork }) {
  const label = availabilityLabel(artwork);
  const isSold = artwork.status === "sold";
  const isCommission = artwork.status === "commission";

  const styles = isSold
    ? "bg-sold/90 text-paper"
    : isCommission
    ? "bg-sage text-paper"
    : "bg-paper/90 text-ink border border-line";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide ${styles}`}
    >
      {label}
    </span>
  );
}
