import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Cocktail, Ingredient } from "@/app/store/cocktailStore";
import { GenerateRequestSchema, sanitizeForPrompt } from "@/app/lib/schemas";

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

    const drink = drinks[0];
    const detail = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(drink.idDrink)}`
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
      source: "cocktaildb",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Fall back to Gemini to compose a recipe
async function generateWithGemini(name: string | null, ingredients: Ingredient[]): Promise<Cocktail> {
  // Sanitize all user-supplied strings before injecting into the prompt
  const safeName = name ? sanitizeForPrompt(name) : null;
  const safeIngredients = ingredients.map((i) => ({
    name: sanitizeForPrompt(i.name),
    measure: sanitizeForPrompt(i.measure),
  }));

  const ingredientList = safeIngredients
    .map((i) => (i.measure ? `${i.measure} ${i.name}` : i.name))
    .join(", ");

  const nameInstruction = safeName
    ? `The cocktail is called "${safeName}". Use this name.`
    : `Give the cocktail a fitting name.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(
    `You are an expert mixologist. ${nameInstruction}
Create a cocktail recipe using these ingredients: ${ingredientList || "no specific ingredients provided"}.
Use millilitres (ml) for all measurements.
Return ONLY valid JSON — no markdown, no code fences, no explanation:
{
  "name": "Cocktail Name",
  "category": "Classic|Sour|Modern Classic|Tropical|etc",
  "tags": ["Bitter", "Sweet", "Herbal", "Spicy", or "Clean"],
  "glass": "Glass type",
  "garnish": "Garnish description",
  "instructions": "Step by step instructions as a single paragraph.",
  "ingredients": [
    { "name": "Ingredient", "measure": "45ml" }
  ]
}`
  );

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Gemini response");

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
    source: "gemini",
    createdAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // 1. Validate and coerce input — reject invalid payloads early
    const parsed = GenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, ingredients, scannedMenuImageUrl } = parsed.data;

    if (!ingredients?.length && !name) {
      return NextResponse.json(
        { error: "Please provide a cocktail name or at least one ingredient." },
        { status: 400 }
      );
    }

    // 2. Try TheCocktailDB first (only when no specific name is given)
    const dbCocktail = !name ? await lookupCocktailDB(ingredients) : null;
    if (dbCocktail) {
      return NextResponse.json({
        ...dbCocktail,
        scannedMenuImageUrl: scannedMenuImageUrl ?? null,
      });
    }

    const generatedCocktail = await generateWithGemini(name ?? null, ingredients ?? []);
    return NextResponse.json({
      ...generatedCocktail,
      scannedMenuImageUrl: scannedMenuImageUrl ?? null,
    });
  } catch (error) {
    // Full error is logged server-side; client only gets a generic message
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
