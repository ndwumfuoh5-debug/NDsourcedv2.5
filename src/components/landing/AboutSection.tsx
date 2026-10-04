"use client";

import { useState } from "react";
import { type LucideIcon, Stethoscope, Brain, Building2 } from "lucide-react";

const FOCUS_AREAS = [
  {
    title: "Digital Health",
    desc: "Consumer health, telehealth, remote monitoring, and mental wellness platforms reshaping how care is accessed and delivered.",
    Icon: Stethoscope,
  },
  {
    title: "AI / ML in Healthcare",
    desc: "Clinical decision support, diagnostics, drug discovery, and workflow automation powered by modern AI and machine learning.",
    Icon: Brain,
  },
  {
    title: "Payer-Provider Tech",
    desc: "Infrastructure modernizing how care is financed, coordinated, and delivered across the health system.",
    Icon: Building2,
  },
];

const STATS = [
  { label: "Stage", value: "Pre-seed → A" },
  { label: "Geography", value: "US-focused" },
  { label: "Check size", value: "$25K–$250K" },
  { label: "Response", value: "2 weeks" },
];

function FocusCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: LucideIcon;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={title}
      className="relative rounded-2xl p-7 overflow-hidden transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.3)",
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: hovered
          ? "0 8px 40px rgba(100,120,200,0.2), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 4px 24px rgba(100,120,200,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ghost icon top-right */}
      <div
        className="absolute top-4 right-4 pointer-events-none"
        aria-hidden="true"
        style={{ color: "rgba(100,120,200,0.15)" }}
      >
        <Icon size={56} strokeWidth={1} />
      </div>

      <h3 className="font-semibold text-[#1a1f2e] text-base mb-2 relative z-10">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed relative z-10">
        {desc}
      </p>
    </div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-28 px-6 md:px-10"
      style={{
        background:
          "linear-gradient(180deg, #dce8f5 0%, #e8d5f0 50%, #d5e8f5 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="mb-16">
          <div
            className="inline-flex items-center text-slate-500 text-xs px-4 py-1.5 rounded-full border mb-5"
            style={{
              background: "rgba(255,255,255,0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.6)",
            }}
          >
            About
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <h2 className="text-4xl font-bold text-[#1a1f2e] leading-tight">
              Why submit to me?
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm text-pretty">
              I&apos;m an early-stage investor personally reviewing every
              submission. No filters. No automated rejections. If you&apos;re
              building in healthcare, I want to hear your story.
            </p>
          </div>
        </div>

        {/* Focus area cards */}
        <div id="focus" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {FOCUS_AREAS.map((area) => (
            <FocusCard key={area.title} {...area} />
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <p className="text-2xl font-bold text-[#1a1f2e] mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
