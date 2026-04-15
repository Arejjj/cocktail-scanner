import { z } from "zod";

// ── Shared building blocks ────────────────────────────────────────────────────

export const IngredientSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name is required").max(100, "Max 100 characters"),
  measure: z.string().trim().max(30, "Max 30 characters"),
});

// Base64 images can be ~4/3 the size of the original file.
// 10 MB file → ~13.4 MB base64 string — cap at 15 MB of chars to stay safe.
const MAX_IMAGE_CHARS = 15 * 1024 * 1024;

// ── Server: POST /api/scan ───────────────────────────────────────────────────

export const ScanRequestSchema = z.object({
  imageDataUrl: z
    .string({ error: "No image provided" })
    .max(MAX_IMAGE_CHARS, "Image is too large (max ~10 MB)")
    .regex(
      /^data:image\/(jpeg|jpg|png|webp|gif|heic|heif);base64,/i,
      "Only image files are accepted (JPEG, PNG, WebP, GIF, HEIC)"
    ),
});

// ── Server: POST /api/cocktails/generate ─────────────────────────────────────

export const GenerateRequestSchema = z.object({
  name: z.string().trim().max(100, "Name must be 100 characters or fewer").nullable().optional(),
  ingredients: z
    .array(IngredientSchema)
    .max(20, "Maximum 20 ingredients allowed"),
  scannedMenuImageUrl: z
    .string()
    .max(MAX_IMAGE_CHARS, "Scanned image too large")
    .nullable()
    .optional(),
});

// ── Client: New / Edit recipe forms ──────────────────────────────────────────

export const CocktailFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Cocktail name is required")
    .max(100, "Name must be 100 characters or fewer"),
  category: z.string().trim().max(50, "Max 50 characters").default(""),
  glass: z.string().trim().max(50, "Max 50 characters").default(""),
  garnish: z.string().trim().max(100, "Max 100 characters").default(""),
  instructions: z.string().trim().max(3000, "Max 3 000 characters").default(""),
  ingredients: z
    .array(IngredientSchema)
    .max(20, "Maximum 20 ingredients allowed"),
});

export type CocktailFormData = z.infer<typeof CocktailFormSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip characters that could break out of a prompt string. */
export function sanitizeForPrompt(s: string): string {
  return s
    .replace(/[\r\n]+/g, " ")   // no newlines (prompt injection)
    .replace(/["\\\`]/g, "'")   // neutralise quote/backtick escapes
    .trim()
    .slice(0, 100);
}

/** Max photo size users may upload from disk (5 MB). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Compress and resize an image data URL before sending to the API.
 * Scales down to max 1600px on the longest side and re-encodes as JPEG.
 * Keeps the image readable by Gemini while staying well under the API size limit.
 */
export function compressImage(dataUrl: string, maxPx = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxPx / Math.max(width, height));
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
