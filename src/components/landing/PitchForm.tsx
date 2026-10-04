"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSubmission } from "@/client-lib/api-client";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = [
  "Digital Health",
  "Health AI",
  "Diagnostics",
  "Care Delivery",
  "Payer Tech",
  "Benefits / Admin",
  "RCM / Billing",
  "Regulatory / Compliance Tech",
  "Clinical Ops",
  "Other",
];

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B+"];

const ROUND_SIZES = [
  "Under $500K",
  "$500K–$1M",
  "$1M–$3M",
  "$3M–$5M",
  "$5M–$10M",
  "$10M+",
];

const AMOUNT_COMMITTED = [
  "Nothing yet",
  "Under $100K",
  "$100K–$500K",
  "$500K–$1M",
  "$1M+",
  "Fully committed (looking for strategic)",
];

const ARR_BUCKETS = ["Pre-revenue", "<$1M", "$1M–$5M", "$5M+"];

const FDA_OPTIONS = ["Yes", "No", "Unsure"];

const STRATEGIC_FIT_OPTIONS = [
  "Aging & Senior Care",
  "Care Coordination & Navigation",
  "Data & Interoperability",
  "Diagnostics & Screening",
  "Direct Care & Clinical Delivery",
  "Mental & Behavioral Health",
  "Prevention & Wellness",
  "Regulatory & Compliance",
  "Remote Patient Monitoring",
  "Revenue Cycle Management",
  "Substance Use & Addiction",
  "Value-Based Care Enablement",
  "Women's Health",
  "Workforce & Staffing",
  "Other",
];

// ─── Form Types ───────────────────────────────────────────────────────────────

interface FormData {
  founder_name: string;
  founder_email: string;
  founder_linkedin: string;
  company_name: string;
  company_website: string;
  one_liner: string;
  sector: string;
  arr_bucket: string;
  fda_clearance: string;
  stage: string;
  round_size: string;
  amount_committed: string;
  pitch_deck_url: string;
  strategic_fit: string[];
  consent: boolean;
}

const emptyForm: FormData = {
  founder_name: "",
  founder_email: "",
  founder_linkedin: "",
  company_name: "",
  company_website: "",
  one_liner: "",
  sector: "",
  arr_bucket: "",
  fda_clearance: "",
  stage: "",
  round_size: "",
  amount_committed: "",
  pitch_deck_url: "",
  strategic_fit: [],
  consent: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] tracking-[0.15em] uppercase font-medium text-slate-600 mb-2">
      {children}
      {required && <span className="text-slate-700 ml-1">*</span>}
    </label>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors bg-white/50 backdrop-blur-sm focus:bg-white/70 ${
          error ? "border-red-400" : "border-white/60"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        {...props}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors appearance-none cursor-pointer bg-white/50 backdrop-blur-sm focus:bg-white/70 ${
          error ? "border-red-400" : "border-white/60"
        }`}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Textarea({
  error,
  maxLength,
  value,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  const len = typeof value === "string" ? value.length : 0;
  return (
    <div>
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors resize-none bg-white/50 backdrop-blur-sm focus:bg-white/70 ${
          error ? "border-red-400" : "border-white/60"
        }`}
      />
      <div className="flex justify-between mt-1">
        {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
        {maxLength && (
          <p className={`text-xs ml-auto ${len >= maxLength ? "text-red-500" : "text-slate-300"}`}>
            {len}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionDivider({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-4 py-4 border-t border-white/40">
      <span className="text-[10px] tracking-widest text-slate-400 font-medium">{number}</span>
      <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-white/40" />
    </div>
  );
}

function MultiSelectChips({
  options,
  selected,
  onChange,
  error,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  error?: string;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt],
    );
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "bg-[#1a1f2e]/80 border-[#1a1f2e]/80 text-white backdrop-blur-sm"
                  : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60 backdrop-blur-sm"
              }`}
            >
              {active && <Check size={10} className="inline mr-1 mb-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SuccessState({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-12 bg-[#1a1f2e] text-white rounded-full flex items-center justify-center mx-auto mb-8">
        <Check size={20} />
      </div>
      <h3 className="text-3xl font-bold tracking-tight text-[#1a1f2e] mb-4">Submission received.</h3>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-pretty text-sm">
        Thanks for sharing. I review submissions on a rolling basis and will follow up if there&apos;s a fit.
        A confirmation has been sent to{" "}
        <span className="font-medium text-[#1a1f2e]">{email}</span>.
      </p>
      <button
        onClick={onReset}
        className="mt-10 text-xs tracking-widest uppercase text-slate-400 hover:text-slate-700 underline underline-offset-4 transition-colors"
      >
        Submit another deck
      </button>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function PitchForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const set = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.founder_name.trim()) e.founder_name = "Required";
    if (!form.founder_email.trim()) {
      e.founder_email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.founder_email)) {
      e.founder_email = "Enter a valid email";
    }
    if (!form.company_name.trim()) e.company_name = "Required";
    if (!form.one_liner.trim()) e.one_liner = "Required";
    else if (form.one_liner.length > 120) e.one_liner = "120 characters max";
    if (!form.sector) e.sector = "Required";
    if (!form.arr_bucket) e.arr_bucket = "Required";
    if (!form.fda_clearance) e.fda_clearance = "Required";
    if (!form.stage) e.stage = "Required";
    if (!form.round_size) e.round_size = "Required";
    if (!form.pitch_deck_url.trim()) e.pitch_deck_url = "Required";
    if (form.strategic_fit.length === 0) e.strategic_fit = "Select at least one";
    if (!form.consent) e.consent = "Consent required to submit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createSubmission({
        founder_name: form.founder_name,
        founder_email: form.founder_email,
        founder_linkedin: form.founder_linkedin || null,
        company_name: form.company_name,
        company_website: form.company_website || null,
        one_liner: form.one_liner,
        sector: form.sector,
        arr_bucket: form.arr_bucket,
        fda_clearance: form.fda_clearance,
        stage: form.stage,
        round_size: form.round_size,
        amount_committed: form.amount_committed || null,
        pitch_deck_url: form.pitch_deck_url,
        strategic_fit: form.strategic_fit,
        consent: form.consent,
      });
      setSubmittedEmail(form.founder_email);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error
        ? `${err.message} [origin: ${typeof window !== 'undefined' ? window.location.origin : 'unknown'}]`
        : String(err);
      toast.error("Submission failed", {
        description: msg || "Unknown error — please try again.",
        duration: 30000,
      });
      console.error('Submission error full:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SuccessState
        email={submittedEmail}
        onReset={() => {
          setForm(emptyForm);
          setSubmitted(false);
          setSubmittedEmail("");
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1">

      {/* 01 — About You */}
      <SectionDivider number="01" label="About You" />
      <div className="space-y-4 pt-2 pb-4">
        <div>
          <Label required>Founder Name(s)</Label>
          <Input type="text" placeholder="Jane Smith, John Doe" value={form.founder_name}
            onChange={(e) => set("founder_name", e.target.value)} error={errors.founder_name} />
          <p className="mt-1.5 text-xs text-slate-500">For co-founders, separate names with a comma</p>
        </div>
        <div>
          <Label required>Email Address</Label>
          <Input type="email" placeholder="jane@company.com" value={form.founder_email}
            onChange={(e) => set("founder_email", e.target.value)} error={errors.founder_email} />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input type="url" placeholder="https://linkedin.com/in/janesmith" value={form.founder_linkedin}
            onChange={(e) => set("founder_linkedin", e.target.value)} />
        </div>
      </div>

      {/* 02 — Company Profile */}
      <SectionDivider number="02" label="Company Profile" />
      <div className="space-y-4 pt-2 pb-4">
        <div>
          <Label required>Company Name</Label>
          <Input type="text" placeholder="Acme Health" value={form.company_name}
            onChange={(e) => set("company_name", e.target.value)} error={errors.company_name} />
        </div>
        <div>
          <Label>Website</Label>
          <Input type="url" placeholder="https://acmehealth.com" value={form.company_website}
            onChange={(e) => set("company_website", e.target.value)} />
        </div>
        <div>
          <Label required>One-line description</Label>
          <Input type="text" placeholder="We help hospitals reduce readmissions using AI."
            value={form.one_liner} onChange={(e) => set("one_liner", e.target.value)}
            error={errors.one_liner} maxLength={120} />
          <p className={`text-xs mt-1 text-right ${form.one_liner.length > 110 ? "text-red-500" : "text-slate-300"}`}>
            {form.one_liner.length}/120
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Sector / Category</Label>
            <SelectField value={form.sector} onChange={(e) => set("sector", e.target.value)} error={errors.sector}>
              <option value="">Select sector…</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>
          <div>
            <Label required>Current ARR</Label>
            <SelectField value={form.arr_bucket} onChange={(e) => set("arr_bucket", e.target.value)} error={errors.arr_bucket}>
              <option value="">Select ARR…</option>
              {ARR_BUCKETS.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>
        </div>
        <div>
          <Label required>Does your product require FDA clearance/approval to operate or be sold?</Label>
          <SelectField value={form.fda_clearance} onChange={(e) => set("fda_clearance", e.target.value)} error={errors.fda_clearance}>
            <option value="">Select…</option>
            {FDA_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
        </div>
      </div>

      {/* 03 — Strategic Fit */}
      <SectionDivider number="03" label="Strategic Fit" />
      <div className="space-y-4 pt-2 pb-4">
        <div>
          <Label required>Which of these does your product primarily help with?</Label>
          <p className="text-xs text-slate-500 mb-3">Select all that apply</p>
          <MultiSelectChips
            options={STRATEGIC_FIT_OPTIONS}
            selected={form.strategic_fit}
            onChange={(val) => set("strategic_fit", val)}
            error={errors.strategic_fit}
          />
        </div>
      </div>

      {/* 04 — The Deal */}
      <SectionDivider number="04" label="The Deal" />
      <div className="space-y-4 pt-2 pb-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Stage</Label>
            <SelectField value={form.stage} onChange={(e) => set("stage", e.target.value)} error={errors.stage}>
              <option value="">Select stage…</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>
          <div>
            <Label required>Round Size Being Raised</Label>
            <SelectField value={form.round_size} onChange={(e) => set("round_size", e.target.value)} error={errors.round_size}>
              <option value="">Select range…</option>
              {ROUND_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>
        </div>
        <div>
          <Label>Amount Committed So Far</Label>
          <SelectField value={form.amount_committed} onChange={(e) => set("amount_committed", e.target.value)}>
            <option value="">Select…</option>
            {AMOUNT_COMMITTED.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
        </div>
      </div>

      {/* 05 — Your Pitch */}
      <SectionDivider number="05" label="Your Pitch" />
      <div className="space-y-4 pt-2 pb-4">
        <div>
          <Label required>Pitch Deck URL</Label>
          <Input type="url" placeholder="https://docsend.com/view/..." value={form.pitch_deck_url}
            onChange={(e) => set("pitch_deck_url", e.target.value)} error={errors.pitch_deck_url} />
          <p className="mt-2 text-xs text-slate-500">
            DocSend, Google Drive, or Dropbox link · Private and confidential
          </p>
        </div>
      </div>

      {/* 06 — Consent */}
      <SectionDivider number="06" label="Consent" />
      <div className="pt-3 pb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="sr-only" />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              form.consent ? "bg-[#1a1f2e] border-[#1a1f2e]" : errors.consent ? "border-red-400" : "border-slate-300 group-hover:border-slate-500"
            }`}>
              {form.consent && <Check size={11} className="text-white" />}
            </div>
          </div>
          <span className="text-sm text-slate-500 leading-relaxed">
            I consent to my information and materials being stored and reviewed for investment consideration purposes.
          </span>
        </label>
        {errors.consent && <p className="mt-1.5 text-xs text-red-500 ml-8">{errors.consent}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting || !form.consent}
        className="disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-widest uppercase rounded-full w-full py-4 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
        style={{
          background: "rgba(26,31,46,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {submitting ? (
          <><Loader2 size={14} className="animate-spin" /> Submitting…</>
        ) : (
          "Submit your deck →"
        )}
      </button>
    </form>
  );
}