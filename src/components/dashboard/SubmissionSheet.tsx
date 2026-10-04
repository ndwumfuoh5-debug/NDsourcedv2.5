"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PitchSubmission, updateSubmissionStatus, updateSubmissionNotes } from "@/client-lib/api-client";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: PitchSubmission["status"]; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "interested", label: "Interested" },
  { value: "follow_up", label: "Follow Up" },
  { value: "pass", label: "Pass" },
];

const STATUS_COLORS: Record<PitchSubmission["status"], string> = {
  pending: "bg-gray-100 text-gray-600",
  interested: "bg-blue-50 text-blue-700",
  follow_up: "bg-green-50 text-green-700",
  pass: "bg-rose-50 text-rose-700",
};

const QUICK_SCAN_COLORS: Record<string, string> = {
  "Core fit": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Possible fit": "bg-amber-50 text-amber-700 border border-amber-200",
  "Outside current focus": "bg-rose-50 text-rose-700 border border-rose-200",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm text-gray-800">{value ?? <span className="text-gray-300 italic">—</span>}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 mt-6 first:mt-0">
      {children}
    </p>
  );
}

interface Props {
  submission: PitchSubmission | null;
  open: boolean;
  onClose: () => void;
}

export function SubmissionSheet({ submission, open, onClose }: Props) {
  const [notes, setNotes] = useState(submission?.notes ?? "");

  useEffect(() => {
    setNotes(submission?.notes ?? "");
  }, [submission?.id, submission?.notes]);

  const handleStatusChange = useCallback(
    async (status: PitchSubmission["status"]) => {
      if (!submission) return;
      try {
        await updateSubmissionStatus(submission.id, status);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [submission],
  );

  const handleNotesBlur = useCallback(async () => {
    if (!submission || notes === submission.notes) return;
    try {
      await updateSubmissionNotes(submission.id, notes);
    } catch {
      toast.error("Failed to save notes");
    }
  }, [submission, notes]);

  if (!submission) return null;

  const formattedDate = new Date(submission.submitted_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const quickScanClass = submission.quick_scan_tag
    ? (QUICK_SCAN_COLORS[submission.quick_scan_tag] ?? "bg-gray-100 text-gray-600")
    : "bg-gray-100 text-gray-600";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 z-10">
          <SheetHeader className="space-y-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <SheetTitle className="text-lg font-bold text-gray-900 leading-tight truncate">
                  {submission.company_name}
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{submission.one_liner}</p>
              </div>
              <div className="flex-shrink-0">
                <Select
                  value={submission.status}
                  onValueChange={(v) => handleStatusChange(v as PitchSubmission["status"])}
                >
                  <SelectTrigger className={`h-8 text-xs font-medium border-0 rounded-full px-3 ${STATUS_COLORS[submission.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick-scan tag */}
            {submission.quick_scan_tag && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${quickScanClass}`}>
                  {submission.quick_scan_tag}
                </span>
              </div>
            )}
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-1">
          {/* Founder */}
          <SectionTitle>Founder</SectionTitle>
          <InfoRow label="Name" value={submission.founder_name} />
          <InfoRow label="Email" value={
            <a href={`mailto:${submission.founder_email}`} className="text-blue-600 hover:underline">
              {submission.founder_email}
            </a>
          } />
          <InfoRow label="LinkedIn" value={
            submission.founder_linkedin ? (
              <a href={submission.founder_linkedin} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1">
                View profile <ExternalLink size={12} />
              </a>
            ) : null
          } />

          {/* Company */}
          <SectionTitle>Company</SectionTitle>
          <InfoRow label="Website" value={
            submission.company_website ? (
              <a href={submission.company_website} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1">
                {submission.company_website} <ExternalLink size={12} />
              </a>
            ) : null
          } />
          <InfoRow label="One-liner" value={submission.one_liner} />
          <InfoRow label="Sector" value={submission.sector} />
          <InfoRow label="Current ARR" value={submission.arr_bucket} />
          <InfoRow label="FDA Clearance Required" value={submission.fda_clearance} />

          {/* Strategic Fit */}
          <SectionTitle>Strategic Fit</SectionTitle>
          <InfoRow label="Primary focus areas" value={
            submission.strategic_fit && submission.strategic_fit.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {submission.strategic_fit.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null
          } />

          {/* Deal */}
          <SectionTitle>Deal</SectionTitle>
          <InfoRow label="Stage" value={submission.stage} />
          <InfoRow label="Round Size" value={submission.round_size} />
          <InfoRow label="Amount Committed" value={submission.amount_committed} />

          {/* Pitch */}
          <SectionTitle>Pitch</SectionTitle>
          <InfoRow label="Pitch Deck" value={
            <a href={submission.pitch_deck_url} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1">
              Open deck <ExternalLink size={12} />
            </a>
          } />
          {/* Meta */}
          <SectionTitle>Meta</SectionTitle>
          <InfoRow label="Quick-scan Tag" value={
            submission.quick_scan_tag ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${quickScanClass}`}>
                {submission.quick_scan_tag}
              </span>
            ) : null
          } />
          <InfoRow label="Submitted" value={formattedDate} />

          {/* Notes */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add private notes about this submission…"
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 resize-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-saves on blur</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}