# Healthcare VC Sourcing Hub

## High-level Strategy and Goal

A premium personal brand site for a healthcare/health-tech VC deal sourcing hub. The app serves two audiences:

1. **Founders** — a polished public landing page where they can learn about the investor's focus and submit their pitch deck via a structured form.
2. **The Investor (internal)** — a private dashboard to review, filter, and manage all incoming pitch submissions with status tracking and notes.

The design is intentionally premium and minimal: deep forest green accent on warm off-white, confident typography, and subtle motion — signaling health, growth, and seriousness.

---

## Changes Implemented

### Full Rebuild (July 2026)
- **Deleted** all old pitch portal components (`HeroSection`, `PitchFooter`, `PitchFormSection`, `PitchNavbar`, `WarmParticleCanvas`, `ElementSelector`) and old page/API files.
- **Database**: Dropped and recreated `pitch_submissions` table with full schema including founder info, company info, deal details, pitch content, consent, status, and notes. Added indexes on status, sector, stage, and submitted_at.
- **Landing page** (`/`): Full single-page scrolling site with sticky navbar (transparent → white on scroll), dark hero section with dot-grid overlay, about/focus section, and a comprehensive pitch submission form.
- **Pitch form**: 5-section form (About You, Your Company, The Deal, Your Pitch, Consent) with inline validation, character counters, and a success state replacing the form on submission.
- **Dashboard** (`/dashboard`): Private VC deal flow dashboard with stats cards, multi-filter bar (search + sector + stage + status), sortable table, and a right-side detail Sheet with inline status updates and auto-saving notes.
- **API routes**: `POST /api/submissions` (create), `GET /api/submissions` (list), `GET /api/submissions/[id]` (detail), `PATCH /api/submissions/[id]` (update status/notes).
- **Design system**: Updated `globals.css` CSS variables to deep forest green primary (`#14532D`), warm off-white background (`#FAFAF9`), near-black foreground (`#111827`).
- **Topbar/Sidebar**: Simplified to return null — each page manages its own header.

### Glassmorphism Redesign (July 2026)
- **`globals.css`**: Updated `--background` CSS variable to soft blue-gray (`#edf2f8` ≈ `hsl(214, 43%, 95%)`). Removed old dot-grid/canvas styles. Updated all color tokens to match the new blue-gray palette.
- **`LandingNavbar`**: Full-width sticky nav with `bg-white/50 backdrop-blur-xl` frosted glass effect. NDC initials as dark pill, centered nav links in slate-500, "Submit your deck" dark pill CTA on the right.
- **`HeroSection`**: Full-screen section with soft radial gradient background (`#dce8f5 → #e8f0f8 → #f0f4f8`). Decorative white blob overlays for depth. Two-column layout: left has badge pill, giant `clamp(3rem,7vw,6rem)` headline, subtext, and two pill buttons; right has a frosted glass card (`bg-white/50 backdrop-blur-xl rounded-3xl`) with 3 stat items (Stage, Geography, Response).
- **`AboutSection`**: White background section with pill label, bold heading, brief paragraph. Three `bg-[#f0f5fc] rounded-2xl` focus area cards in a 3-column grid, each with a ghost Lucide icon in the top-right corner. 4-column stat strip with `bg-[#f5f8fc] rounded-2xl` cells.
- **`SubmitSection`**: `bg-[#edf2f8]` background, centered header with pill label, form wrapped in a large `bg-white/70 backdrop-blur-xl rounded-3xl` frosted glass card.
- **`PitchForm`**: All logic/validation/submission unchanged. Restyled: inputs/selects/textareas use `rounded-xl border-slate-200 bg-white/80 focus:ring-slate-100`; submit button is `bg-[#1a1f2e] rounded-full`; success checkmark in a `bg-[#1a1f2e] rounded-full` circle; section dividers use `text-slate-400 border-slate-100`.
- **`LandingFooter`**: Dark `bg-[#1a1f2e]` background, two-column layout with wordmark left and LinkedIn/Email icon links right in `text-white/50 hover:text-white`.

---

## Architecture and Technical Decisions

### Component Structure
```
src/
  app/
    page.tsx                    # Landing page (assembles landing components)
    dashboard/
      page.tsx                  # VC dashboard (client component)
      layout.tsx                # Minimal wrapper
      loading.tsx               # Skeleton matching dashboard layout
    api/submissions/
      route.ts                  # GET (list) + POST (create)
      [id]/route.ts             # GET (detail) + PATCH (update)
  components/
    landing/
      LandingNavbar.tsx         # Sticky navbar with scroll detection
      HeroSection.tsx           # Dark hero with dot grid
      AboutSection.tsx          # About + focus areas + stats strip
      SubmitSection.tsx         # Section wrapper for the form
      PitchForm.tsx             # Full multi-section form with validation
      LandingFooter.tsx         # Dark footer
    dashboard/
      SubmissionSheet.tsx       # Right-side detail sheet with notes
  client-lib/
    api-client.ts               # SWR hooks + optimistic mutation helpers
```

### Key Decisions
- **Landing page is a client component** — needs scroll listener for navbar transparency effect.
- **Form uses `useState`** (not react-hook-form) — simpler for this single-page use case with custom validation logic.
- **Optimistic updates** on status changes — the table updates instantly, server reconciles in background.
- **Notes auto-save on blur** — avoids a save button, feels natural for a notes field.
- **No sidebar** — the dashboard is a single focused view; sidebar would add unnecessary chrome.
- **SWR `dedupingInterval: 30000`** — submissions list is stable; no need for aggressive revalidation.
- **Indexes** on `status`, `sector`, `stage`, `submitted_at` — the dashboard filters by all four.