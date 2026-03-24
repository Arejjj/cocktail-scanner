"use client";

import { useCocktailStore } from "@/app/store/cocktailStore";

export default function ProfilePage() {
  const { collection } = useCocktailStore();
  const scanned = collection.filter((c) => c.source === "scanned").length;
  const favorites = collection.filter((c) => c.isFavorite).length;

  return (
    <div className="px-5 pt-14">
      <p
        className="text-xs uppercase tracking-widest mb-1"
        style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
      >
        Your Profile
      </p>
      <h1
        className="text-4xl font-semibold mb-10"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        The Bartender
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Recipes", value: collection.length },
          { label: "Scanned", value: scanned },
          { label: "Favorites", value: favorites },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 flex flex-col items-center gap-1"
            style={{ background: "#131313" }}
          >
            <span
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-noto-serif)", color: "#ff9069" }}
            >
              {stat.value}
            </span>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* About */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#131313" }}
      >
        <h2
          className="text-sm uppercase tracking-widest mb-3"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
        >
          About
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
        >
          Mixology AI lets you build a personal cocktail library by scanning bar menus.
          Powered by Claude Vision to read any menu, and TheCocktailDB for recipe lookup.
        </p>
      </div>
    </div>
  );
}
