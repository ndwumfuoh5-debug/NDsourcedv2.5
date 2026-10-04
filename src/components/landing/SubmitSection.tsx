"use client";

import { PitchForm } from "./PitchForm";

export function SubmitSection() {
  return (
    <section
      id="submit"
      className="relative py-28 px-6 md:px-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #d5e8f5 0%, #e8d5f0 50%, #dce8f5 100%)",
        backgroundSize: "400% 400%",
        animation: "aurora 8s ease-in-out infinite alternate",
      }}
    >
      {/* Blurred orbs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Orb 1 */}
        <div
          className="absolute"
          style={{
            width: 600,
            height: 600,
            top: "-20%",
            right: "-15%",
            background:
              "radial-gradient(circle, rgba(180,210,255,0.5) 0%, rgba(200,190,255,0.25) 40%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite alternate",
          }}
        />
        {/* Orb 2 */}
        <div
          className="absolute"
          style={{
            width: 450,
            height: 450,
            bottom: "-15%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(210,180,255,0.45) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "float 10s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            className="inline-flex items-center text-slate-500 text-xs px-4 py-1.5 rounded-full border mb-5"
            style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.6)" }}
          >
            Submit your deck
          </div>
          <h2 className="text-4xl font-bold text-[#1a1f2e] leading-tight mb-4">
            Share your vision.
          </h2>

        </div>

        {/* Frosted glass form card */}
        <div
          className="p-10 md:p-14"
          style={{
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow:
              "0 8px 40px rgba(100,120,180,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
            borderRadius: "2rem",
          }}
        >
          <PitchForm />
        </div>
      </div>
    </section>
  );
}
