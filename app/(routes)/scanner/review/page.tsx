"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCocktailStore, Ingredient } from "@/app/store/cocktailStore";
import IngredientRow from "@/app/components/IngredientRow";

export default function ReviewPage() {
  const router = useRouter();
  const { scan, clearScan, addCocktail, setActiveCocktail } = useCocktailStore();

  const [ingredients, setIngredients] = useState<Ingredient[]>(scan.detectedIngredients);
  const [newName, setNewName] = useState("");
  const [newMeasure, setNewMeasure] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMeasure(i: number, measure: string) {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, measure } : ing));
  }

  function addIngredient() {
    if (!newName.trim()) return;
    setIngredients((prev) => [...prev, { name: newName.trim(), measure: newMeasure.trim() }]);
    setNewName("");
    setNewMeasure("");
  }

  async function generateRecipe() {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/cocktails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const cocktail = await res.json();
      addCocktail(cocktail);
      setActiveCocktail(cocktail);
      clearScan();
      router.push(`/recipe/${cocktail.id}`);
    } catch {
      setError("Couldn't generate the recipe. Try again.");
      setIsGenerating(false);
    }
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
            Review Ingredients
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

      {/* Menu image */}
      {scan.menuImageDataUrl && (
        <div className="mx-5 mb-6 rounded-2xl overflow-hidden h-36 relative">
          <img src={scan.menuImageDataUrl} alt="Scanned menu" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(14,14,14,0.8) 100%)" }} />
          <span
            className="absolute bottom-3 left-4 text-[10px] uppercase tracking-widest"
            style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
          >
            Scanned Menu
          </span>
        </div>
      )}

      {/* Section label */}
      <div className="px-5 mb-4">
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
        >
          Digitized Elements
        </p>
        <h2
          className="text-2xl font-semibold mb-1"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          The Composition
        </h2>
        <p className="text-sm" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>
          Verify the ratios detected. Tap any measure to edit it.
        </p>
      </div>

      {/* Ingredients */}
      <div className="flex flex-col px-5 gap-2 mb-5">
        {ingredients.length === 0 ? (
          <div
            className="py-10 rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{ background: "#131313" }}
          >
            <p className="text-sm" style={{ color: "#484847", fontFamily: "var(--font-manrope)" }}>
              No ingredients detected. Add them below.
            </p>
          </div>
        ) : (
          ingredients.map((ing, i) => (
            <IngredientRow
              key={i}
              ingredient={ing}
              editable
              onRemove={() => removeIngredient(i)}
              onMeasureChange={(m) => updateMeasure(i, m)}
            />
          ))
        )}
      </div>

      {/* Add ingredient row */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "#131313" }}
        >
          <input
            type="text"
            placeholder="2oz"
            value={newMeasure}
            onChange={(e) => setNewMeasure(e.target.value)}
            className="text-sm text-center outline-none rounded-lg py-1.5 px-2 w-16"
            style={{
              fontFamily: "var(--font-manrope)",
              color: "#ffffff",
              background: "#262626",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Add manual ingredient…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }}
          />
          <button
            onClick={addIngredient}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,144,105,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="#ff9069" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <p className="px-5 text-sm mb-3" style={{ color: "#ff7070", fontFamily: "var(--font-manrope)" }}>
          {error}
        </p>
      )}

      <div className="flex-1" />

      {/* CTAs */}
      <div className="px-5 pb-8 pt-4 flex flex-col gap-3">
        <button
          onClick={generateRecipe}
          disabled={ingredients.length === 0 || isGenerating}
          className="w-full py-4 rounded-2xl font-semibold text-sm uppercase tracking-wider transition-opacity disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #ff9069, #ff7441)",
            color: "#000000",
            fontFamily: "var(--font-manrope)",
          }}
        >
          {isGenerating ? "Generating…" : "Generate Recipe"}
        </button>
        <button
          onClick={() => { clearScan(); router.push("/scanner"); }}
          className="w-full py-3 rounded-2xl text-sm font-medium"
          style={{
            color: "#adaaaa",
            fontFamily: "var(--font-manrope)",
            background: "transparent",
          }}
        >
          Re-scan Menu
        </button>
      </div>
    </div>
  );
}
