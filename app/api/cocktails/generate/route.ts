import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Cocktail, Ingredient } from "@/app/store/cocktailStore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// First try TheCocktailDB to find a match
async function lookupCocktailDB(ingredients: Ingredient[]): Promise<Cocktail | null> {
  try {
    const primary = ingredients[0]?.name;
    if (!primary) return null;

    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(primary)}`
    );
    const data = await res.json();
    const drinks = data.drinks;
    if (!drinks || !Array.isArray(drinks) || drinks.length === 0) return null;

    // Look up full details on the first match
    const drink = drinks[0];
    const detail = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`
    );
    const detailData = await detail.json();
    const d = detailData.drinks?.[0];
    if (!d) return null;

    const dbIngredients: Ingredient[] = [];
    for (let i = 1; i <= 15; i++) {
      const name = d[`strIngredient${i}`];
      const measure = d[`strMeasure${i}`];
      if (name) dbIngredients.push({ name, measure: measure?.trim() ?? "" });
    }

    return {
      id: d.idDrink,
      name: d.strDrink,
      category: d.strCategory ?? "Cocktail",
      instructions: d.strInstructions ?? "",
      ingredients: dbIngredients,
      glass: d.strGlass ?? "",
      garnish: "",
      imageUrl: d.strDrinkThumb ?? "",
      tags: d.strTags?.split(",").map((t: string) => t.trim()) ?? [],
      source: "api",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Fall back to Gemini to compose a recipe
async function generateWithGemini(ingredients: Ingredient[]): Promise<Cocktail> {
  const ingredientList = ingredients
    .map((i) => (i.measure ? `${i.measure} ${i.name}` : i.name))
    .join(", ");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(
    `You are an expert mixologist. Create a cocktail recipe using these ingredients: ${ingredientList}.
Return ONLY valid JSON — no markdown, no code fences, no explanation:
{
  "name": "Cocktail Name",
  "category": "Classic|Sour|Modern Classic|Tropical|etc",
  "tags": ["Bitter", "Sweet", "Herbal", "Spicy", or "Clean"],
  "glass": "Glass type",
  "garnish": "Garnish description",
  "instructions": "Step by step instructions as a single paragraph.",
  "ingredients": [
    { "name": "Ingredient", "measure": "2oz" }
  ]
}`
  );

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    id: `claude-${Date.now()}`,
    name: parsed.name ?? "Mystery Cocktail",
    category: parsed.category ?? "Cocktail",
    instructions: parsed.instructions ?? "",
    ingredients: parsed.ingredients ?? ingredients,
    glass: parsed.glass ?? "",
    garnish: parsed.garnish ?? "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    source: "scanned",
    createdAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const { ingredients } = await req.json() as { ingredients: Ingredient[] };

    if (!ingredients?.length) {
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    // Try TheCocktailDB first, fall back to Claude
    const dbCocktail = await lookupCocktailDB(ingredients);
    if (dbCocktail) {
      return NextResponse.json(dbCocktail);
    }

    const claudeCocktail = await generateWithGemini(ingredients);
    return NextResponse.json(claudeCocktail);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
