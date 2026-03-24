import { Ingredient } from "@/app/store/cocktailStore";

// Common spirit sub-labels
const SPIRIT_LABELS: Record<string, string> = {
  gin: "London Dry",
  vodka: "Premium",
  rum: "White",
  tequila: "Blanco",
  mezcal: "Joven",
  whiskey: "Bourbon",
  whisky: "Scotch",
  campari: "Aperitif",
  aperol: "Aperitif",
  vermouth: "Fortified Wine",
  "sweet vermouth": "Fortified Wine",
  "dry vermouth": "Fortified Wine",
  cointreau: "Triple Sec",
  "lime juice": "Fresh Squeezed",
  "lemon juice": "Fresh Squeezed",
  "simple syrup": "House Made",
  "agave syrup": "Light",
};

function getSubLabel(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, label] of Object.entries(SPIRIT_LABELS)) {
    if (lower.includes(key)) return label;
  }
  return null;
}

type Props = {
  ingredient: Ingredient;
  onRemove?: () => void;
  editable?: boolean;
  onMeasureChange?: (measure: string) => void;
};

export default function IngredientRow({ ingredient, onRemove, editable, onMeasureChange }: Props) {
  const subLabel = getSubLabel(ingredient.name);

  return (
    <div
      className="flex items-center justify-between py-3.5 px-4"
      style={{ background: "#131313", borderRadius: "0.875rem", marginBottom: "2px" }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Measure */}
        {editable && onMeasureChange ? (
          <input
            type="text"
            value={ingredient.measure}
            onChange={(e) => onMeasureChange(e.target.value)}
            placeholder="—"
            className="text-xl font-semibold text-center outline-none w-16 rounded-lg py-1"
            style={{
              fontFamily: "var(--font-noto-serif)",
              color: "#ffffff",
              background: "rgba(255,144,105,0.12)",
              border: "1px solid rgba(255,144,105,0.35)",
            }}
          />
        ) : (
          <span
            className="text-xl font-semibold shrink-0"
            style={{
              fontFamily: "var(--font-noto-serif)",
              color: "#ffffff",
              minWidth: "3.5rem",
            }}
          >
            {ingredient.measure || "—"}
          </span>
        )}

        {/* Name + sub-label */}
        <div className="flex flex-col">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-manrope)", color: "#ffffff" }}
          >
            {ingredient.name}
          </span>
          {subLabel && (
            <span
              className="text-[10px] uppercase tracking-widest mt-0.5"
              style={{ fontFamily: "var(--font-manrope)", color: "#ff9069", opacity: 0.7 }}
            >
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {editable && onRemove && (
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center ml-3 shrink-0"
          style={{ background: "rgba(255,112,112,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="#ff7070" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
