"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6 md:px-10">
        {/* Left: About link pill */}
        <Link
          href="/about"
          style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", color: "#1a1f2e" }}
          className="text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-white/50 transition-colors tracking-wide"
        >
          About
        </Link>

        {/* Center: nav links */}
        <div className="flex items-center gap-6" />

        {/* Right: CTA pill */}
        <button
          onClick={() => scrollTo("submit")}
          style={{ background: "linear-gradient(135deg, #7c6fcd 0%, #5b8dee 100%)", boxShadow: "0 4px 16px rgba(100,110,220,0.35)" }}
          className="text-white rounded-full px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Submit your deck
        </button>
      </div>
    </nav>
  );
}
