import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { imageDataUrl } = await req.json();
    if (!imageDataUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const matches = imageDataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      },
      `This is a photo of a bar menu or cocktail menu. The menu may be in any language.
Extract the first or most prominent cocktail name you can identify, and all of its ingredients with measurements.
Convert all measurements to millilitres (ml). 1 oz = 30 ml, 1 cl = 10 ml.
Return ONLY a valid JSON object — no markdown, no code fences, no explanation:
{
  "name": "Cocktail Name or null if not found",
  "ingredients": [
    { "name": "Ingredient Name", "measure": "45ml" },
    { "name": "Another Ingredient", "measure": "30ml" }
  ]
}
If no measurement is visible, use an empty string for measure.
Focus on spirits, liqueurs, juices, syrups, and garnishes. List up to 12 ingredients.`,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ name: null, ingredients: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      name: parsed.name ?? null,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
