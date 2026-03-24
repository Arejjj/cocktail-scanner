"use client";

import { useRouter } from "next/navigation";
import { useCocktailStore } from "@/app/store/cocktailStore";
import CocktailCard from "@/app/components/CocktailCard";

export default function FavoritesPage() {
  const router = useRouter();
  const { collection, setActiveCocktail } = useCocktailStore();
  const favorites = collection.filter((c) => c.isFavorite);

  return (
    <div className="px-5 pt-14">
      <p
        className="text-xs uppercase tracking-widest mb-1"
        style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
      >
        Your Collection
      </p>
      <h1
        className="text-4xl font-semibold mb-8"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        Saved
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 42s-18-12-18-24a12 12 0 0124 0 12 12 0 0124 0c0 12-18 24-18 24z"
              stroke="#484847"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <p
            className="text-sm text-center"
            style={{ color: "#484847", fontFamily: "var(--font-manrope)" }}
          >
            No saved cocktails yet.{"\n"}Tap the heart on any recipe to save it.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {favorites.map((c) => (
            <CocktailCard
              key={c.id}
              cocktail={c}
              onClick={() => {
                setActiveCocktail(c);
                router.push(`/recipe/${c.id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
