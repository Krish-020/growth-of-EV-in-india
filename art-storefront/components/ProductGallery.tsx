"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import type { ArtCategory, ArtworkImage } from "@/lib/types";

const VIEW_LABEL: Record<string, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  detail: "Detail",
  "in-situ": "In the room",
};

export default function ProductGallery({
  images,
  title,
  category,
}: {
  images: ArtworkImage[];
  title: string;
  category: ArtCategory;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const dragState = useRef<{ startX: number; index: number } | null>(null);

  const rotationOrder = ["front", "side", "back"];
  const canRotate =
    category === "sculpture" &&
    images.filter((img) => rotationOrder.includes(img.view)).length >= 2;

  const active = images[activeIndex] ?? images[0];

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!canRotate) return;
    dragState.current = { startX: e.clientX, index: activeIndex };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (canRotate && dragState.current) {
      const delta = e.clientX - dragState.current.startX;
      const threshold = 70;
      if (Math.abs(delta) > threshold) {
        const rotatable = images
          .map((img, i) => ({ img, i }))
          .filter(({ img }) => rotationOrder.includes(img.view));
        const currentPos = rotatable.findIndex(
          ({ i }) => i === dragState.current!.index
        );
        const step = delta > 0 ? -1 : 1;
        const nextPos =
          (currentPos + step + rotatable.length) % rotatable.length;
        setActiveIndex(rotatable[nextPos].i);
        dragState.current = { startX: e.clientX, index: rotatable[nextPos].i };
      }
      return;
    }

    // Hover-zoom follow for non-rotating (painting/print) images.
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.9)",
    });
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handlePointerLeave() {
    dragState.current = null;
    setZoomStyle({});
  }

  return (
    <div>
      <div
        className={`relative aspect-square overflow-hidden bg-paper-dim ${
          canRotate ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={() => !canRotate && setLightboxOpen(true)}
      >
        <Image
          src={active.src}
          alt={active.alt}
          fill
          unoptimized
          priority
          sizes="(min-width: 1024px) 45vw, 92vw"
          className="object-cover transition-transform duration-150 ease-out"
          style={canRotate ? undefined : zoomStyle}
        />
        {canRotate && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs text-paper">
            Drag to rotate
          </span>
        )}
        {!canRotate && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-paper">
            Click to zoom
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`focus-ring relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-paper-dim transition-colors ${
              i === activeIndex ? "border-clay" : "border-transparent"
            }`}
            aria-label={`Show ${VIEW_LABEL[img.view] ?? img.view} view`}
            aria-pressed={i === activeIndex}
          >
            <Image
              src={img.src}
              alt=""
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[10px] text-paper">
              {VIEW_LABEL[img.view] ?? img.view}
            </span>
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, full size image`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="focus-ring absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-paper/20"
            aria-label="Close zoomed image"
          >
            ✕
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image
              src={active.src}
              alt={active.alt}
              fill
              unoptimized
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
