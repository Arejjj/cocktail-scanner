"use client";

import { Cocktail } from "@/app/store/cocktailStore";

type Props = {
  cocktail: Cocktail;
  onClick?: () => void;
};

const FLAVOR_COLORS: Record<string, string> = {
  Spicy: "#ff7070",
  Herbal: "#59ee50",
  Sweet: "#ff9069",
  Clean: "#adaaaa",
  Bitter: "#ff9069",
  Smoky: "#adaaaa",
  Fresh: "#59ee50",
  Classic: "#ff9069",
  "Bitter & Sweet": "#ff9069",
  "Fresh & Herbal": "#59ee50",
  "Smoky & Bold": "#adaaaa",
};

export default function CocktailCard({ cocktail, onClick }: Props) {
  const tag = cocktail.tags?.[0] ?? cocktail.category;
  const tagColor = FLAVOR_COLORS[tag] ?? "#adaaaa";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[1.5rem] overflow-hidden relative"
      style={{ background: "#131313", minHeight: "260px" }}
    >
      {/* Full-bleed image */}
      {cocktail.imageUrl ? (
        <img
          src={cocktail.imageUrl}
          alt={cocktail.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "#20201f" }} />
      )}

      {/* Dark gradient overlay — stronger at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,14,14,0.15) 0%, rgba(14,14,14,0.5) 45%, rgba(14,14,14,0.92) 100%)",
        }}
      />

      {/* Content pinned to bottom */}
      <div className="relative z-10 flex flex-col justify-end h-full p-5" style={{ minHeight: "260px" }}>
        {/* Spacer */}
        <div className="flex-1" />

        {/* Flavor tag */}
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] mb-2 px-2.5 py-1 rounded-full"
          style={{
            color: tagColor,
            background: `${tagColor}22`,
            fontFamily: "var(--font-manrope)",
          }}
        >
          {tag}
        </span>

        {/* Cocktail name */}
        <h3
          className="text-3xl font-semibold leading-tight mb-1.5"
          style={{ fontFamily: "var(--font-noto-serif)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          {cocktail.name}
        </h3>

        {/* Ingredient preview */}
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-manrope)" }}
        >
          {cocktail.ingredients
            .slice(0, 3)
            .map((i) => i.name)
            .join(", ")}
          {cocktail.ingredients.length > 3 && ` +${cocktail.ingredients.length - 3} more`}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-manrope)" }}
          >
            {cocktail.glass || cocktail.category}
          </span>
          {cocktail.isFavorite && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#ff7070">
                <path d="M6 10.5S1 7 1 3.5a2.5 2.5 0 015 0 2.5 2.5 0 015 0C11 7 6 10.5 6 10.5z" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
