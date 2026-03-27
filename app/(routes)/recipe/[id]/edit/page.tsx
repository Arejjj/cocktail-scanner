"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCocktailStore, Ingredient } from "@/app/store/cocktailStore";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { collection, updateCocktail } = useCocktailStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const cocktail = collection.find((c) => c.id === (params.id as string));

  const [name, setName] = useState(cocktail?.name ?? "");
  const [category, setCategory] = useState(cocktail?.category ?? "");
  const [glass, setGlass] = useState(cocktail?.glass ?? "");
  const [garnish, setGarnish] = useState(cocktail?.garnish ?? "");
  const [instructions, setInstructions] = useState(cocktail?.instructions ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(cocktail?.ingredients ?? []);
  const [imageUrl, setImageUrl] = useState(cocktail?.imageUrl ?? "");
  const [newIngName, setNewIngName] = useState("");
  const [newIngMeasure, setNewIngMeasure] = useState("");

  useEffect(() => {
    if (!cocktail) router.replace("/");
  }, [cocktail, router]);

  if (!cocktail) return null;

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addIngredient() {
    if (!newIngName.trim()) return;
    setIngredients((prev) => [...prev, { name: newIngName.trim(), measure: newIngMeasure.trim() }]);
    setNewIngName("");
    setNewIngMeasure("");
  }

  function save() {
    if (!cocktail) return;
    const wasAiOrDb = cocktail.source !== "manual";
    updateCocktail(cocktail.id, {
      name, category, glass, garnish, instructions, ingredients, imageUrl,
      edited: wasAiOrDb ? true : cocktail.edited,
    });
    router.back();
  }

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#131313" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#adaaaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-center" style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}>Editing</p>
          <p className="text-sm font-semibold text-center" style={{ fontFamily: "var(--font-noto-serif)" }}>{cocktail.name}</p>
        </div>
        <button onClick={save} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: "linear-gradient(135deg, #ff9069, #ff7441)", color: "#000", fontFamily: "var(--font-manrope)" }}>
          Save
        </button>
      </div>

      <div className="px-5 flex flex-col gap-7">
        {/* Photo */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Photo</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-44 rounded-2xl overflow-hidden flex items-center justify-center relative"
            style={{ background: "#131313" }}
          >
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }}>Change Photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#484847" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3.5" stroke="#484847" strokeWidth="1.5" />
                  <path d="M9 5l1.5-2h3L15 5" stroke="#484847" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs uppercase tracking-widest" style={{ color: "#484847", fontFamily: "var(--font-manrope)" }}>Add Photo</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        {/* Name */}
        <Field label="Cocktail Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none text-2xl font-semibold pb-2" style={{ fontFamily: "var(--font-noto-serif)", color: "#ffffff", borderBottom: "1.5px solid #262626" }} />
        </Field>

        {/* Category + Glass */}
        <div className="flex gap-4">
          <Field label="Category" className="flex-1">
            <TextInput value={category} onChange={setCategory} placeholder="e.g. Classic" />
          </Field>
          <Field label="Glassware" className="flex-1">
            <TextInput value={glass} onChange={setGlass} placeholder="e.g. Rocks Glass" />
          </Field>
        </div>

        {/* Garnish */}
        <Field label="Garnish">
          <TextInput value={garnish} onChange={setGarnish} placeholder="e.g. Orange Peel Twist" />
        </Field>

        {/* Ingredients */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Ingredients</p>
          <div className="flex flex-col gap-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#131313" }}>
                <input value={ing.measure} onChange={(e) => updateIngredient(i, "measure", e.target.value)} placeholder="30ml" className="text-sm text-center outline-none rounded-lg py-1.5 px-2 w-16 shrink-0" style={{ fontFamily: "var(--font-manrope)", color: "#ffffff", background: "#262626" }} />
                <input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }} />
                <button onClick={() => removeIngredient(i)} className="shrink-0 opacity-40 hover:opacity-100">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="#adaaaa" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#131313" }}>
              <input value={newIngMeasure} onChange={(e) => setNewIngMeasure(e.target.value)} placeholder="30ml" className="text-sm text-center outline-none rounded-lg py-1.5 px-2 w-16 shrink-0" style={{ fontFamily: "var(--font-manrope)", color: "#ffffff", background: "#262626" }} />
              <input value={newIngName} onChange={(e) => setNewIngName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addIngredient()} placeholder="Add ingredient…" className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }} />
              <button onClick={addIngredient} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,144,105,0.2)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="#ff9069" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Field label="Preparation Method">
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} placeholder="Describe the preparation steps…" className="w-full bg-transparent outline-none text-sm leading-7 resize-none pb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)", borderBottom: "1.5px solid #262626" }} />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>{label}</p>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent outline-none text-sm pb-2" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)", borderBottom: "1.5px solid #262626" }} />
  );
}
