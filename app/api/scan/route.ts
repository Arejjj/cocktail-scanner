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
      `This is a photo of a bar menu or cocktail menu.
Extract all cocktail ingredients you can identify, including any measurements shown.
Return ONLY a valid JSON array — no markdown, no code fences, no explanation:
[
  { "name": "Ingredient Name", "measure": "2oz" },
  { "name": "Another Ingredient", "measure": "1oz" }
]
If no measurement is visible, use an empty string for measure.
Focus on spirits, liqueurs, juices, syrups, and garnishes. List up to 12 ingredients.`,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ ingredients: [] });
    }

    const ingredients = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
