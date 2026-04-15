import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { ScanRequestSchema } from "@/app/lib/schemas";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // 1. Validate input with Zod — reject early with a clear message
    const parsed = ScanRequestSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { imageDataUrl } = parsed.data;

    // 2. Extract MIME + base64 data (regex already validated by schema)
    const matches = imageDataUrl.match(/^data:(.+?);base64,(.+)$/)!;
    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Disable extended thinking — cuts latency from 20-30s down to 2-4s
      // for structured JSON extraction tasks that don't need deep reasoning.
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } } as object,
    });

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Data } },
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

    // 3. Parse and enforce safe output bounds
    const data = JSON.parse(jsonMatch[0]);
    const cocktails = Array.isArray(data.cocktails)
      ? data.cocktails.slice(0, 30).map((c: { name?: unknown; ingredients?: unknown[] }) => ({
          name: typeof c.name === "string" ? c.name.slice(0, 100) : null,
          ingredients: Array.isArray(c.ingredients)
            ? c.ingredients.slice(0, 12).map((ing: unknown) => {
                const i = ing as Record<string, unknown>;
                return {
                  name: String(i?.name ?? "").slice(0, 100),
                  measure: String(i?.measure ?? "").slice(0, 30),
                };
              })
            : [],
        }))
      : [];

    return NextResponse.json({ cocktails });
  } catch (error) {
    // Log full error server-side; send only a generic message to the client
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
