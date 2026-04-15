"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCocktailStore, Cocktail } from "@/app/store/cocktailStore";
import IngredientRow from "@/app/components/IngredientRow";
import { compressImage, MAX_PHOTO_BYTES } from "@/app/lib/schemas";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { activeCocktail, collection, toggleFavorite, addCocktail, updateCocktail } = useCocktailStore();

  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [suggestions, setSuggestions] = useState<Cocktail[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = params.id as string;
    const found = collection.find((c) => c.id === id) ?? activeCocktail;
    setCocktail(found ?? null);

    if (found) {
      const mainIngredient = found.ingredients[0]?.name;
      if (mainIngredient) {
        fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(mainIngredient)}`
        )
          .then((r) => r.json())
          .then((data) => {
            const seen = new Set<string>([found.id]);
            const drinks = (data.drinks ?? []).filter((d: Record<string, string>) => {
              if (seen.has(d.idDrink)) return false;
              seen.add(d.idDrink);
              return true;
            });
            setSuggestions(
              drinks.slice(0, 3).map((d: Record<string, string>) => ({
                id: d.idDrink,
                name: d.strDrink,
                imageUrl: d.strDrinkThumb,
                category: "Similar",
                tags: [],
                ingredients: [],
                instructions: "",
                glass: "",
                source: "api" as const,
                createdAt: new Date().toISOString(),
              }))
            );
          })
          .catch(() => {});
      }
    }
  }, [params.id, collection, activeCocktail]);

  function searchOnline() {
    if (!cocktail) return;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(cocktail.name + " cocktail recipe")}`,
      "_blank"
    );
  }

  function handleSave() {
    if (!cocktail) return;
    const inCollection = collection.some((c) => c.id === cocktail.id);
    if (!inCollection) {
      addCocktail({ ...cocktail, isFavorite: true });
    } else {
      toggleFavorite(cocktail.id);
    }
    // Update local state
    setCocktail((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : prev);
  }

  async function lookupFullRecipe(id: string) {
    try {
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      const d = data.drinks?.[0];
      if (!d) return;
      const ingredients: { name: string; measure: string }[] = [];
      for (let i = 1; i <= 15; i++) {
        const ing = d[`strIngredient${i}`];
        const mea = d[`strMeasure${i}`];
        if (ing) ingredients.push({ name: ing, measure: mea?.trim() ?? "" });
      }
      const full: Cocktail = {
        id: d.idDrink, name: d.strDrink, category: d.strCategory,
        instructions: d.strInstructions, ingredients, glass: d.strGlass,
        imageUrl: d.strDrinkThumb, tags: d.strTags?.split(",") ?? [],
        source: "api", createdAt: new Date().toISOString(),
      };
      useCocktailStore.getState().setActiveCocktail(full);
      router.push(`/recipe/${full.id}`);
    } catch {}
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPhotoError(null);
    if (file.size > MAX_PHOTO_BYTES * 3) { // allow up to 15 MB before compression
      setPhotoError("Photo is too large. Please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const compressed = await compressImage(raw).catch(() => raw);
      updateCocktail(cocktail!.id, { imageUrl: compressed });
      setCocktail((prev) => prev ? { ...prev, imageUrl: compressed } : prev);
    };
    reader.readAsDataURL(file);
  }

  if (!cocktail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "#484847", fontFamily: "var(--font-manrope)" }}>Recipe not found.</p>
      </div>
    );
  }

  const inCollection = collection.some((c) => c.id === cocktail.id);
  const isFav = cocktail.isFavorite || collection.find((c) => c.id === cocktail.id)?.isFavorite;
  const steps = cocktail.instructions.split(/\.\s+/).filter(Boolean);

  return (
    <div className="min-h-screen pb-28">
      {/* Hero */}
      <div className="relative" style={{ height: "52vw", maxHeight: "320px", minHeight: "220px" }}>
        {cocktail.imageUrl ? (
          <img src={cocktail.imageUrl} alt={cocktail.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "#131313" }}>
            {/* Prominent Add Photo prompt when no image and recipe is saved */}
            {inCollection && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ background: "rgba(255,144,105,0.15)", color: "#ff9069", border: "1.5px solid rgba(255,144,105,0.3)", fontFamily: "var(--font-manrope)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="7" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5 3l.8-1.5h2.4L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Upload Photo
                  </button>
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ background: "rgba(255,144,105,0.15)", color: "#ff9069", border: "1.5px solid rgba(255,144,105,0.3)", fontFamily: "var(--font-manrope)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4.5h10a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1v-5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="7" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5 4.5l.6-1.5h2.8L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Take Photo
                  </button>
                </div>
                {photoError && (
                  <p className="text-xs px-6 text-center" style={{ color: "#ff7070", fontFamily: "var(--font-manrope)" }}>{photoError}</p>
                )}
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(14,14,14,0.3) 0%, rgba(14,14,14,0.7) 70%, #0e0e0e 100%)" }} />

        {/* Change photo button — shown over existing image */}
        {cocktail.imageUrl && inCollection && (
          <button
            onClick={() => photoRef.current?.click()}
            className="absolute bottom-14 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider z-10"
            style={{ background: "rgba(14,14,14,0.6)", color: "#ffffff", backdropFilter: "blur(12px)", fontFamily: "var(--font-manrope)" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="0.5" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="5.5" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3.5 2l.7-1.5h2.6L7.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Change Photo
          </button>
        )}

        {/* Hidden photo inputs */}
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(14,14,14,0.6)", backdropFilter: "blur(12px)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 5L8 10l5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)" }}>Mixology AI</span>
          </div>
          <div className="flex gap-2">
            {inCollection && (
              <button
                onClick={() => router.push(`/recipe/${cocktail.id}/edit`)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(14,14,14,0.6)", backdropFilter: "blur(12px)" }}
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M12 2.5l2.5 2.5-8 8-3 .5.5-3 8-8z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button
              onClick={searchOnline}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(14,14,14,0.6)", backdropFilter: "blur(12px)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2a7 7 0 100 14A7 7 0 009 2zM2 9h14M9 2a10 10 0 010 14M9 2a10 10 0 000 14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={handleSave}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(14,14,14,0.6)", backdropFilter: "blur(12px)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 15s-7-4.5-7-8.5a4 4 0 018 0 4 4 0 018 0c0 4-7 8.5-7 8.5z"
                  stroke={isFav ? "#ff7070" : "#fff"}
                  fill={isFav ? "#ff7070" : "none"}
                  strokeWidth="1.6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4">
        {/* Category */}
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-2"
          style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
        >
          {cocktail.category || "Classic Collection"}
        </p>

        {/* Title */}
        <h1
          className="text-5xl font-semibold leading-none mb-4"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {cocktail.name}
        </h1>

        {/* Source + Edited tags */}
        {(() => {
          const src = cocktail.source;
          const isCocktailDB = src === "cocktaildb" || src === "api";
          const isGemini = src === "gemini" || src === "scanned";
          const isManual = src === "manual";
          return (
            <div className="flex gap-2 flex-wrap mb-6">
              {(isCocktailDB || isGemini || isManual) && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold"
                  style={{
                    background: isCocktailDB ? "rgba(89,238,80,0.1)" : isManual ? "rgba(89,238,80,0.1)" : "rgba(255,144,105,0.1)",
                    color: isCocktailDB ? "#59ee50" : isManual ? "#59ee50" : "#ff9069",
                    fontFamily: "var(--font-manrope)",
                  }}
                >
                  {isCocktailDB && (
                    <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><ellipse cx="5" cy="3" rx="4" ry="2" stroke="currentColor" strokeWidth="1.2" /><path d="M1 3v4c0 1.1 1.8 2 4 2s4-.9 4-2V3" stroke="currentColor" strokeWidth="1.2" /></svg>TheCocktailDB</>
                  )}
                  {isGemini && (
                    <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1 3h3l-2.5 1.8 1 3L5 7 2.5 8.8l1-3L1 4h3z" fill="currentColor" /></svg>Gemini AI</>
                  )}
                  {isManual && (
                    <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8l1.5-1.5L7 3l1 1-3.5 3.5L3 9 2 8z" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M6.5 2.5l1 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>Your Recipe</>
                  )}
                </span>
              )}
              {cocktail.edited && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold"
                  style={{ background: "rgba(255,112,112,0.1)", color: "#ff7070", fontFamily: "var(--font-manrope)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M7 1.5l1.5 1.5-5 5-2 .5.5-2 5-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edited
                </span>
              )}
            </div>
          );
        })()}

        {/* Save to Favorites CTA */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={handleSave}
            className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-sm"
            style={{
              background: isFav ? "rgba(255,112,112,0.15)" : "linear-gradient(135deg, #ff9069, #ff7441)",
              color: isFav ? "#ff7070" : "#000000",
              fontFamily: "var(--font-manrope)",
              border: isFav ? "1px solid rgba(255,112,112,0.3)" : "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 4-6.5 8-6.5 8z"
                stroke={isFav ? "#ff7070" : "#000"}
                fill={isFav ? "#ff7070" : "#000"}
                strokeWidth="1.4"
              />
            </svg>
            {isFav ? "Saved to Favorites" : "Save to Favorites"}
          </button>
          <button
            onClick={searchOnline}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "#131313" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 10h8M14 7l3 3-3 3" stroke="#adaaaa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Glassware + Garnish */}
        {(cocktail.glass || cocktail.garnish) && (
          <div
            className="flex gap-3 mb-10 p-4 rounded-2xl"
            style={{ background: "#131313" }}
          >
            {cocktail.glass && (
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#1a1a1a" }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 2h12l-3 8H6L3 2zM6 10v5M12 10v5M4.5 15h9" stroke="#ff9069" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Glassware</p>
                  <p className="text-sm font-medium" style={{ fontFamily: "var(--font-manrope)" }}>{cocktail.glass}</p>
                </div>
              </div>
            )}
            {cocktail.garnish && (
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#1a1a1a" }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="#59ee50" strokeWidth="1.5" />
                    <path d="M9 5v8M5 9h8" stroke="#59ee50" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Garnish</p>
                  <p className="text-sm font-medium" style={{ fontFamily: "var(--font-manrope)" }}>{cocktail.garnish}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-1"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
        >
          The Components
        </p>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Ingredients
        </h2>
        <div className="flex flex-col gap-1.5 mb-10">
          {cocktail.ingredients.map((ing, i) => (
            <IngredientRow key={i} ingredient={ing} />
          ))}
        </div>

        {/* Method */}
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-1"
          style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
        >
          Preparation
        </p>
        <h2
          className="text-xl font-semibold mb-5"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Method
        </h2>
        <div className="flex flex-col gap-5 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span
                className="text-3xl font-semibold shrink-0 leading-none"
                style={{ color: "#ff9069", fontFamily: "var(--font-noto-serif)", minWidth: "2rem" }}
              >
                {i + 1}
              </span>
              <p
                className="text-sm leading-7 pt-1"
                style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
              >
                {step.trim()}.
              </p>
            </div>
          ))}
        </div>

        {/* You might also like */}
        {suggestions.length > 0 && (
          <div className="mb-10">
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-1"
              style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
            >
              Similar Drinks
            </p>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              You Might Also Like
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => lookupFullRecipe(s.id)}
                  className="shrink-0 w-40 rounded-2xl overflow-hidden text-left"
                  style={{ background: "#131313" }}
                >
                  {s.imageUrl && (
                    <img src={`${s.imageUrl}/preview`} alt={s.name} className="w-full h-28 object-cover" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      {s.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Look up online */}
        <button
          onClick={searchOnline}
          className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: "transparent",
            color: "#ff9069",
            border: "1.5px solid rgba(255,144,105,0.25)",
            fontFamily: "var(--font-manrope)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#ff9069" strokeWidth="1.4" />
            <path d="M2 8h12M8 2a9 9 0 010 12M8 2a9 9 0 000 12" stroke="#ff9069" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Look Up Online
        </button>
      </div>
    </div>
  );
}
