"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(255,144,105,0.15)" : "none"}
        />
        <path
          d="M9 21V12h6v9"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/scanner",
    label: "Scan",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="7" height="7" rx="1"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
        />
        <rect
          x="14" y="3" width="7" height="7" rx="1"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
        />
        <rect
          x="3" y="14" width="7" height="7" rx="1"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
        />
        <path
          d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3v-3z"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Saved",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "rgba(255,144,105,0.15)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          fill={active ? "rgba(255,144,105,0.15)" : "none"}
        />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? "#ff9069" : "#767575"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        background: "rgba(26,26,26,0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(72,72,71,0.25)",
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
        paddingTop: "12px",
      }}
    >
      {tabs.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-4 py-1 relative"
          >
            {tab.icon(active)}
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{
                color: active ? "#ff9069" : "#767575",
                fontFamily: "var(--font-manrope)",
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: "#59ee50" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
