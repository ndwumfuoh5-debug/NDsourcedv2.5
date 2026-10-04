import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Background and contact for NDC.",
  robots: { index: false, follow: false },
};

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #c8dff5 0%, #dce8f5 30%, #e8d5f0 65%, #c5d8f0 100%)",
        backgroundSize: "400% 400%",
        animation: "aurora 8s ease-in-out infinite alternate",
      }}
    >
      {/* Navbar (minimal) */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6 md:px-10">
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide transition-colors"
            style={{
              background: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#1a1f2e",
            }}
          >
            Home
          </Link>
          <Link
            href="/#submit"
            className="text-white rounded-full px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #7c6fcd 0%, #5b8dee 100%)",
              boxShadow: "0 4px 16px rgba(100,110,220,0.35)",
            }}
          >
            Submit your deck
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div
          className="w-full max-w-2xl p-10 md:p-14"
          style={{
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow:
              "0 8px 40px rgba(100,120,180,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
            borderRadius: "2rem",
          }}
        >
          <div className="flex flex-col sm:flex-row gap-10 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div
                className="w-28 h-28 rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow: "0 4px 16px rgba(100,120,180,0.12)",
                }}
              >
                <img
                  src="https://zjxnv7e5voftnnlw.public.blob.vercel-storage.com/orgs/voOpL6opTLkHnCpQtivIXrTgWhKCLnyF/images/9c6d04c9-7edf-41a7-9610-4919e9103390-d0982964-d8e7-48bb-8f33-101043703bdf.jpg"
                  alt="Nana Dwumfuoh"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs tracking-widest uppercase text-slate-400 font-medium mb-2">
                About
              </p>
              <h1 className="text-2xl font-bold text-[#1a1f2e] tracking-tight mb-5">
                Nana Dwumfuoh, MHS
              </h1>

              <div className="text-slate-600 text-base leading-relaxed text-pretty max-w-prose space-y-4">
                <p>I align healthcare innovation with business incentives to improve population health. The world is full of brilliant minds creating brilliant solutions to pressing healthcare problems, and I am on a mission to find them.</p>
                <p>
                  <span className="font-semibold text-[#1a1f2e]">A message to founders:</span> Thank you.{" "}
                  Thank you for the time, energy, passion, and persistence you commit to building your businesses. Your courage to create makes the world a better place.
                </p>
              </div>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/nana-dwumfuoh-b00705119"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-7 text-sm font-medium text-[#1a1f2e] hover:opacity-70 transition-opacity"
              >
                LinkedIn
                <ArrowUpRight size={14} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}