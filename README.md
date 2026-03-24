# Mixology AI — Cocktail Scanner

A high-end web app for discovering, scanning, and saving cocktail recipes. Point your camera at a bar menu, and Mixology AI extracts the ingredients, lets you fill in proportions, and saves the recipe to your personal collection.

---

## Features

- **Scan bar menus** — upload or photograph a menu and extract cocktail ingredients automatically using Gemini AI
- **Review & edit ingredients** — confirm detected ingredients, add missing ones, and set measures
- **Recipe collection** — browse your saved cocktails with rich detail views
- **Favorites** — heart any recipe to save it to your curated collection
- **Discovery feed** — trending cocktails with filter by flavor profile (Spicy, Herbal, Sweet, Clean)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| State | Zustand (persisted to localStorage) |
| AI / OCR | Google Gemini 2.5 Flash |
| Fonts | Noto Serif (headings) + Manrope (body) |

---

## How It Works

### 1. Scan a Menu
Navigate to the **Scan** tab. Upload a photo of a bar menu (any language). The image is sent to `/api/scan`, which calls Gemini 2.5 Flash with a structured prompt to extract ingredient names and measures from the image.

### 2. Review Ingredients
The extracted ingredients appear on the **Review Ingredients** screen. You can edit any measure, remove ingredients, or add missing ones manually. Hit **Generate Recipe** when ready.

### 3. Generate & Save
`/api/cocktails/generate` takes the ingredient list and uses Gemini to produce a full recipe — name, method, glassware, garnish, and instructions. The result is saved into the Zustand store (persisted in localStorage) and you land on the **Recipe Detail** screen.

### 4. Browse Your Collection
All saved recipes live on the **Home** feed and **Favorites** tab. Each recipe detail page shows ingredients with spirit sub-labels, glassware, garnish, and preparation steps.

---

## Project Structure

```
app/
├── (routes)/
│   ├── page.tsx              # Home / discovery feed
│   ├── layout.tsx            # Shell with bottom navigation
│   ├── favorites/page.tsx    # Saved favorites
│   ├── profile/page.tsx      # User profile
│   ├── recipe/[id]/page.tsx  # Recipe detail
│   └── scanner/
│       ├── page.tsx          # Camera / upload screen
│       └── review/page.tsx   # Ingredient review & editing
├── api/
│   ├── scan/route.ts         # POST — image → ingredients (Gemini)
│   └── cocktails/generate/   # POST — ingredients → full recipe (Gemini)
├── components/
│   ├── BottomNav.tsx         # Glassmorphic bottom navigation bar
│   ├── CocktailCard.tsx      # Full-bleed card with image overlay
│   └── IngredientRow.tsx     # Measure + name + spirit sub-label row
├── store/
│   └── cocktailStore.ts      # Zustand store (collection + scan state)
└── globals.css               # Tailwind v4 theme tokens + base layer
```

---

## Design System

The UI follows **"The Speakeasy Digital Experience"** — a dark, editorial aesthetic inspired by high-end craft cocktail bars.

- **Colors:** Near-black surfaces (`#0e0e0e`), Sunset Orange primary (`#ff9069`), Lime Green accents (`#59ee50`)
- **Typography:** Noto Serif for cocktail names and headlines, Manrope for body and labels
- **Components:** No borders — depth is created through tonal surface layering and glassmorphism
- **Spacing:** Generous vertical whitespace between sections for an "expensive" feel

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Google AI Studio](https://aistudio.google.com) API key

### Setup

```bash
# Install dependencies
npm install

# Create environment file and add your key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key — get one free at [aistudio.google.com](https://aistudio.google.com) |
