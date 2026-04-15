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

/** Max photo size users may upload (5 MB). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
