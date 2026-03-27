"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCocktailStore } from "@/app/store/cocktailStore";

export default function ScannerPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setScanImage, setScanCocktails, setScanIngredients, setScanName, setScanProcessing, scan } = useCocktailStore();

  // Reset any stale processing state when arriving at this page
  useEffect(() => {
    setScanProcessing(false);
  }, [setScanProcessing]);

  const processImage = useCallback(
    async (dataUrl: string) => {
      setScanImage(dataUrl);
      setScanProcessing(true);
      setError(null);

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl: dataUrl }),
        });

        if (!res.ok) throw new Error("Scan failed");

        const { cocktails } = await res.json();
        setScanCocktails(cocktails ?? []);

        // If only one cocktail detected, skip the pick screen
        if (cocktails?.length === 1) {
          setScanName(cocktails[0].name ?? null);
          setScanIngredients(cocktails[0].ingredients ?? []);
          setScanProcessing(false);
          router.push("/scanner/review");
        } else {
          setScanProcessing(false);
          router.push("/scanner/pick");
        }
      } catch (e) {
        setError("Couldn't read the menu. Try a clearer photo.");
        setScanProcessing(false);
      }
    },
    [router, setScanImage, setScanCocktails, setScanIngredients, setScanName, setScanProcessing]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col h-dvh relative overflow-hidden">
      {/* Viewfinder area */}
      <div
        className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-5 pt-12"
        style={{ background: "#0e0e0e" }}
      >
        {/* Preview full-cover */}
        {preview && (
          <img
            src={preview}
            alt="Menu preview"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}

        {/* Viewfinder box with corner markers + scan line */}
        {!preview && (
          <div className="relative w-[80vw] h-[55vw]">
            {/* Rectangle */}
            <div
              className="w-full h-full rounded-lg opacity-20"
              style={{ border: "1px solid #767575" }}
            />

            {/* Corner markers */}
            {[
              { pos: "top-0 left-0", border: "2px 0 0 2px" },
              { pos: "top-0 right-0", border: "2px 2px 0 0" },
              { pos: "bottom-0 left-0", border: "0 0 2px 2px" },
              { pos: "bottom-0 right-0", border: "0 2px 2px 0" },
            ].map(({ pos, border }, i) => (
              <span
                key={i}
                className={`absolute ${pos} w-8 h-8`}
                style={{
                  borderColor: "#59ee50",
                  borderStyle: "solid",
                  borderWidth: border,
                  borderRadius: "3px",
                }}
              />
            ))}

            {/* Scan line */}
            {!scan.isProcessing && (
              <div
                className="absolute inset-x-0 h-px animate-[scan-line_2.5s_ease-in-out_infinite]"
                style={{
                  background: "linear-gradient(to right, transparent, #59ee50, transparent)",
                  boxShadow: "0 0 8px #59ee50",
                }}
              />
            )}
          </div>
        )}

        {/* Instruction */}
        {!preview && !scan.isProcessing && (
          <p
            className="text-center text-sm px-8 z-10"
            style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
          >
            Point your camera at a bar menu to detect cocktails
          </p>
        )}

        {/* Processing overlay */}
        {scan.isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#ff9069", borderTopColor: "transparent" }}
            />
            <p
              className="text-sm"
              style={{ color: "#adaaaa", fontFamily: "var(--font-manrope)" }}
            >
              Analyzing menu…
            </p>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14">
          <h1
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Scan Menu
          </h1>
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#59ee50", fontFamily: "var(--font-manrope)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#59ee50" strokeWidth="1.4" />
              <path d="M4 7l2 2 4-4" stroke="#59ee50" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Auto-detect
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-5 mb-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,112,112,0.12)",
            color: "#ff7070",
            fontFamily: "var(--font-manrope)",
          }}
        >
          {error}
        </div>
      )}

      {/* Bottom controls */}
      <div
        className="px-5 pb-24 pt-3 flex flex-col gap-3"
        style={{ background: "#0e0e0e" }}
      >
        {/* Upload photo */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={scan.isProcessing}
          className="w-full py-3.5 rounded-full font-semibold text-sm transition-opacity disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #ff9069, #ff7441)",
            color: "#000000",
            fontFamily: "var(--font-manrope)",
          }}
        >
          {scan.isProcessing ? "Processing…" : "Upload Photo of Menu"}
        </button>

        {/* Take photo (triggers camera on mobile) */}
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.setAttribute("capture", "environment");
              fileRef.current.click();
            }
          }}
          disabled={scan.isProcessing}
          className="w-full py-3.5 rounded-full font-semibold text-sm transition-opacity disabled:opacity-50"
          style={{
            background: "transparent",
            color: "#ff9069",
            fontFamily: "var(--font-manrope)",
            border: "1.5px solid rgba(255,144,105,0.3)",
          }}
        >
          Take Photo
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
