"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CocktailCard from "@/app/components/CocktailCard";
import { useCocktailStore, Cocktail } from "@/app/store/cocktailStore";

const FLAVORS = ["All", "Spicy", "Herbal", "Sweet", "Clean"];

const FEATURED: Cocktail[] = [
  {
    id: "featured-1",
    name: "Midnight Negroni",
    category: "Classic",
    tags: ["Bitter & Sweet"],
    instructions: "Stir all ingredients with ice. Strain into rocks glass over large ice.",
    ingredients: [
      { name: "Gin", measure: "1oz" },
      { name: "Campari", measure: "1oz" },
      { name: "Sweet Vermouth", measure: "1oz" },
    ],
    glass: "Rocks Glass",
    garnish: "Orange Peel",
    imageUrl: "https://www.thecocktaildb.com/images/media/drink/qgdu971561574065.jpg",
    source: "api",
    createdAt: new Date().toISOString(),
  },
  {
    id: "featured-2",
    name: "Emerald Sour",
    category: "Sour",
    tags: ["Fresh & Herbal"],
    instructions: "Shake all ingredients with ice. Double strain into a chilled coupe.",
    ingredients: [
      { name: "Gin", measure: "2oz" },
      { name: "Lime Juice", measure: "¾oz" },
      { name: "Elderflower Liqueur", measure: "½oz" },
      { name: "Egg White", measure: "1" },
    ],
    glass: "Coupe",
    garnish: "Cucumber Ribbon",
    imageUrl: "https://www.thecocktaildb.com/images/media/drink/z0omyp1582480573.jpg",
    source: "api",
    createdAt: new Date().toISOString(),
  },
  {
    id: "featured-3",
    name: "Desert Fire",
    category: "Modern Classic",
    tags: ["Smoky & Bold"],
    instructions: "Muddle jalapeño. Add mezcal, lime, and agave. Shake with ice. Strain.",
    ingredients: [
      { name: "Mezcal", measure: "2oz" },
      { name: "Jalapeño", measure: "3 slices" },
      { name: "Lime Juice", measure: "¾oz" },
      { name: "Agave Syrup", measure: "½oz" },
    ],
    glass: "Rocks Glass",
    garnish: "Charred Lime",
    imageUrl: "https://www.thecocktaildb.com/images/media/drink/ywxwqs1461867097.jpg",
    source: "api",
    createdAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  const router = useRouter();
  const { collection, setActiveCocktail } = useCocktailStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const allCocktails = [
    ...collection,
    ...FEATURED.filter((f) => !collection.find((c) => c.id === f.id)),
  ];

  const filtered = allCocktails.filter((c) => {
    const matchesFlavor =
      activeFilter === "All" ||
      c.tags?.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase())) ||
      c.category === activeFilter;
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ingredients.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return matchesFlavor && matchesSearch;
  });

  function openRecipe(cocktail: Cocktail) {
    setActiveCocktail(cocktail);
    router.push(`/recipe/${cocktail.id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* App bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
          >
            Discover
          </p>
          <h1
            className="text-3xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Find your mood
          </h1>
        </div>
        <button
          onClick={() => router.push("/scanner")}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ff9069, #ff7441)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <rect x="12" y="2" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <rect x="2" y="12" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <path d="M12 12h3M17 12v2M12 15v2M15 17h2v-2" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-5">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "#131313" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="5" stroke="#767575" strokeWidth="1.6" />
            <path d="M11 11l3 3" stroke="#767575" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search ingredients, bars, or flavors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }}
          />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <path d="M2 5h14M5 9h8M8 13h2" stroke="#767575" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Flavor filters */}
      <div className="flex gap-2 px-5 mb-7 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {FLAVORS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeFilter === f ? "#ff9069" : "#131313",
              color: activeFilter === f ? "#000000" : "#adaaaa",
              fontFamily: "var(--font-manrope)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.18em] mb-0.5"
            style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
          >
            Curated List
          </p>
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Trending Cocktails
          </h2>
        </div>
        <button
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#ff9069", fontFamily: "var(--font-manrope)" }}
        >
          View All
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 px-5">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: "#484847", fontFamily: "var(--font-manrope)", fontSize: "0.875rem" }}>
              No cocktails found.
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <CocktailCard key={c.id} cocktail={c} onClick={() => openRecipe(c)} />
          ))
        )}
      </div>

      {/* Scan CTA */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => router.push("/scanner")}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #ff9069, #ff7441)",
            color: "#000000",
            fontFamily: "var(--font-manrope)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <rect x="12" y="2" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <rect x="2" y="12" width="6" height="6" rx="1" stroke="#000" strokeWidth="1.6" />
            <path d="M12 12h3M17 12v2M12 15v2M15 17h2v-2" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Scan Menu
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}
