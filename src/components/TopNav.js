// src/components/TopNav.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const linkBase =
    "px-4 py-2 rounded-full text-sm font-medium transition";
  const linkActive = "bg-blue-600 text-white";
  const linkInactive =
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md mb-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="font-semibold text-slate-800">
          Livret d&apos;alternance
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={
              linkBase +
              " " +
              (pathname === "/" ? linkActive : linkInactive)
            }
          >
            Accueil
          </Link>
          <Link
            href="/journal"
            className={
              linkBase +
              " " +
              (pathname.startsWith("/journal") ? linkActive : linkInactive)
            }
          >
            Journaux
          </Link>
        </div>
      </div>
    </nav>
  );
}
