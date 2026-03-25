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
Identify ALL cocktails visible on the menu, along with their ingredients and measurements.
Convert all measurements to millilitres (ml). 1 oz = 30 ml, 1 cl = 10 ml.
Return ONLY a valid JSON object — no markdown, no code fences, no explanation:
{
  "cocktails": [
    {
      "name": "Cocktail Name",
      "ingredients": [
        { "name": "Ingredient Name", "measure": "45ml" },
        { "name": "Another Ingredient", "measure": "30ml" }
      ]
    }
  ]
}
If no measurement is visible, use an empty string for measure.
Focus on spirits, liqueurs, juices, syrups, and garnishes. List up to 12 ingredients per cocktail.
If no cocktails are found, return { "cocktails": [] }.`,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ cocktails: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const cocktails = Array.isArray(parsed.cocktails) ? parsed.cocktails.map((c: { name?: string; ingredients?: unknown[] }) => ({
      name: c.name ?? null,
      ingredients: Array.isArray(c.ingredients) ? c.ingredients : [],
    })) : [];

    return NextResponse.json({ cocktails });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
