"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCocktailStore, Ingredient } from "@/app/store/cocktailStore";
import { CocktailFormSchema, MAX_PHOTO_BYTES } from "@/app/lib/schemas";

export default function NewRecipePage() {
  const router = useRouter();
  const { addCocktail } = useCocktailStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [glass, setGlass] = useState("");
  const [garnish, setGarnish] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [newIngName, setNewIngName] = useState("");
  const [newIngMeasure, setNewIngMeasure] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setImageError("Photo must be 5 MB or smaller.");
      return;
    }
    setImageError(null);
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
    if (ingredients.length >= 20) {
      setFormError("Maximum 20 ingredients allowed.");
      return;
    }
    setIngredients((prev) => [...prev, { name: newIngName.trim(), measure: newIngMeasure.trim() }]);
    setNewIngName("");
    setNewIngMeasure("");
    setFormError(null);
  }

  function save() {
    setFormError(null);
    const result = CocktailFormSchema.safeParse({
      name, category, glass, garnish, instructions, ingredients,
    });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    const data = result.data;
    const id = `manual-${Date.now()}`;
    addCocktail({
      id,
      name: data.name,
      category: data.category,
      glass: data.glass,
      garnish: data.garnish,
      instructions: data.instructions,
      ingredients: data.ingredients,
      imageUrl: imageUrl || undefined,
      tags: [],
      source: "manual",
      createdAt: new Date().toISOString(),
    });
    router.replace(`/recipe/${id}`);
  }

  const canSave = name.trim().length > 0;

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
          <p className="text-[10px] uppercase tracking-[0.2em] text-center" style={{ color: "#59ee50", fontFamily: "var(--font-manrope)" }}>New Recipe</p>
          <p className="text-sm font-semibold text-center" style={{ fontFamily: "var(--font-noto-serif)" }}>Your Creation</p>
        </div>
        <button
          onClick={save}
          disabled={!canSave}
          className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ff9069, #ff7441)", color: "#000", fontFamily: "var(--font-manrope)" }}
        >
          Save
        </button>
      </div>

      <div className="px-5 flex flex-col gap-7">
        {/* Photo */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Photo</p>
          <button onClick={() => fileRef.current?.click()} className="w-full h-44 rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ background: "#131313" }}>
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
          {imageError && (
            <p className="mt-2 text-xs" style={{ color: "#ff7070", fontFamily: "var(--font-manrope)" }}>{imageError}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>Cocktail Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your creation…"
            maxLength={100}
            className="w-full bg-transparent outline-none text-2xl font-semibold pb-2"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#ffffff", borderBottom: "1.5px solid #262626" }}
          />
        </div>

        {/* Category + Glass */}
        <div className="flex gap-4">
          <Field label="Category" className="flex-1">
            <TextInput value={category} onChange={setCategory} placeholder="e.g. Sour" maxLength={50} />
          </Field>
          <Field label="Glassware" className="flex-1">
            <TextInput value={glass} onChange={setGlass} placeholder="e.g. Coupe" maxLength={50} />
          </Field>
        </div>

        {/* Garnish */}
        <Field label="Garnish">
          <TextInput value={garnish} onChange={setGarnish} placeholder="e.g. Lemon Twist" maxLength={100} />
        </Field>

        {/* Ingredients */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}>
            Ingredients <span style={{ color: "#484847" }}>({ingredients.length}/20)</span>
          </p>
          <div className="flex flex-col gap-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#131313" }}>
                <input value={ing.measure} onChange={(e) => updateIngredient(i, "measure", e.target.value)} placeholder="30ml" maxLength={30} className="text-sm text-center outline-none rounded-lg py-1.5 px-2 w-16 shrink-0" style={{ fontFamily: "var(--font-manrope)", color: "#ffffff", background: "#262626" }} />
                <input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} maxLength={100} className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }} />
                <button onClick={() => removeIngredient(i)} className="shrink-0 opacity-40 hover:opacity-100">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="#adaaaa" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            {ingredients.length < 20 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#131313" }}>
                <input value={newIngMeasure} onChange={(e) => setNewIngMeasure(e.target.value)} placeholder="30ml" maxLength={30} className="text-sm text-center outline-none rounded-lg py-1.5 px-2 w-16 shrink-0" style={{ fontFamily: "var(--font-manrope)", color: "#ffffff", background: "#262626" }} />
                <input value={newIngName} onChange={(e) => setNewIngName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addIngredient()} placeholder="Add ingredient…" maxLength={100} className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }} />
                <button onClick={addIngredient} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,144,105,0.2)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="#ff9069" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Field label="Preparation Method">
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} placeholder="Describe the preparation steps…" maxLength={3000} className="w-full bg-transparent outline-none text-sm leading-7 resize-none pb-2" style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)", borderBottom: "1.5px solid #262626" }} />
          <p className="text-right text-[10px] mt-1" style={{ color: instructions.length > 2700 ? "#ff7070" : "#484847", fontFamily: "var(--font-manrope)" }}>
            {instructions.length}/3000
          </p>
        </Field>

        {/* Form-level error */}
        {formError && (
          <p className="text-sm px-1" style={{ color: "#ff7070", fontFamily: "var(--font-manrope)" }}>{formError}</p>
        )}
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

function TextInput({ value, onChange, placeholder, maxLength }: { value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="w-full bg-transparent outline-none text-sm pb-2" style={{ color: "#ffffff", fontFamily: "var(--font-manrope)", borderBottom: "1.5px solid #262626" }} />
  );
}
