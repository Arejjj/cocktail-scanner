"use client";

import { useRouter } from "next/navigation";
import { useCocktailStore } from "@/app/store/cocktailStore";

export default function PickCocktailPage() {
  const router = useRouter();
  const { scan, setScanName, setScanIngredients, clearScan } = useCocktailStore();
  const detectedCocktails = scan.detectedCocktails ?? [];
  const { menuImageDataUrl } = scan;

  function selectCocktail(index: number) {
    const cocktail = detectedCocktails[index];
    setScanName(cocktail.name ?? null);
    setScanIngredients(cocktail.ingredients);
    router.push("/scanner/review");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
          >
            Current Scan
          </p>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Select Cocktail
          </h1>
        </div>
        <button
          onClick={() => { clearScan(); router.push("/scanner"); }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#131313" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#adaaaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Menu image thumbnail */}
      {menuImageDataUrl && (
        <div className="mx-5 mb-5 rounded-2xl overflow-hidden h-28 relative">
          <img src={menuImageDataUrl} alt="Scanned menu" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(14,14,14,0.85) 100%)" }} />
          <span
            className="absolute bottom-3 left-4 text-[10px] uppercase tracking-widest"
            style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
          >
            Scanned Menu
          </span>
        </div>
      )}

      {/* Subtitle */}
      <p className="px-5 mb-4 text-sm" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>
        {detectedCocktails.length} cocktail{detectedCocktails.length !== 1 ? "s" : ""} detected. Tap one to review and save it.
      </p>

      {/* Cocktail list */}
      <div className="flex flex-col px-5 gap-3">
        {detectedCocktails.length === 0 ? (
          <div
            className="py-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#131313" }}
          >
            <p className="text-sm" style={{ color: "#484847", fontFamily: "var(--font-manrope)" }}>
              No cocktails detected. Try a clearer photo.
            </p>
          </div>
        ) : (
          detectedCocktails.map((cocktail, i) => (
            <button
              key={i}
              onClick={() => selectCocktail(i)}
              className="w-full text-left px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
              style={{ background: "#131313" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-base mb-1 truncate"
                  style={{ fontFamily: "var(--font-noto-serif)", color: "#ffffff" }}
                >
                  {cocktail.name ?? "Unnamed Cocktail"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
                >
                  {cocktail.ingredients.length > 0
                    ? cocktail.ingredients.map((ing) => ing.name).join(", ")
                    : "No ingredients detected"}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M7 4l5 5-5 5" stroke="#ff9069" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))
        )}
      </div>

      <div className="flex-1" />

      {/* Re-scan */}
      <div className="px-5 pb-8 pt-4">
        <button
          onClick={() => { clearScan(); router.push("/scanner"); }}
          className="w-full py-3 rounded-2xl text-sm font-medium"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)", background: "transparent" }}
        >
          Re-scan Menu
        </button>
      </div>
    </div>
  );
}
