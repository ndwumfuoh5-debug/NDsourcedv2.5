"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, Download, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSubmissions,
  updateSubmissionStatus,
  type PitchSubmission,
} from "@/client-lib/api-client";
import { SubmissionSheet } from "@/components/dashboard/SubmissionSheet";
import { toast } from "sonner";

// ─── Admin password gate ──────────────────────────────────────────────────────

const ADMIN_PASSWORD = "*HlTw2605!";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  const attempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (val === ADMIN_PASSWORD) {
      sessionStorage.setItem("ndc_admin_auth", "1");
      onUnlock();
    } else {
      setErr(true);
      setVal("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <form onSubmit={attempt} className="bg-white border border-gray-100 rounded-2xl p-10 w-full max-w-sm shadow-sm text-center space-y-6">
        <div className="w-10 h-10 bg-[#1a1f2e] rounded-full flex items-center justify-center mx-auto">
          <Lock size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Admin access</h2>
          <p className="text-xs text-gray-400">Enter the admin password to continue.</p>
        </div>
        <input
          type="password"
          value={val}
          onChange={(e) => { setVal(e.target.value); setErr(false); }}
          placeholder="Password"
          autoFocus
          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 ${err ? "border-red-400" : "border-gray-200"}`}
        />
        {err && <p className="text-xs text-red-500 -mt-3">Incorrect password.</p>}
        <button type="submit" className="w-full bg-[#1a1f2e] text-white text-xs font-semibold py-2.5 rounded-full hover:opacity-90 transition-opacity">
          Enter
        </button>
      </form>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = [
  "Digital Health", "Health AI", "Care Delivery", "Payer Tech",
  "Benefits / Admin", "RCM / Billing", "Regulatory / Compliance Tech",
  "Clinical Ops", "Other",
];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B+"];
const ARR_BUCKETS = ["Pre-revenue", "<$1M", "$1M–$5M", "$5M+"];
const FDA_OPTIONS = ["Yes", "No", "Unsure"];
const QUICK_SCAN_OPTIONS = ["Core fit", "Possible fit", "Outside current focus"];

const STATUS_OPTIONS: { value: PitchSubmission["status"]; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "interested", label: "Interested" },
  { value: "follow_up", label: "Follow Up" },
  { value: "pass", label: "Pass" },
];

const STATUS_BADGE: Record<PitchSubmission["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
  interested: { bg: "bg-blue-50", text: "text-blue-700", label: "Interested" },
  follow_up: { bg: "bg-green-50", text: "text-green-700", label: "Follow Up" },
  pass: { bg: "bg-rose-50", text: "text-rose-700", label: "Pass" },
};

const QUICK_SCAN_BADGE: Record<string, string> = {
  "Core fit": "bg-emerald-50 text-emerald-700",
  "Possible fit": "bg-amber-50 text-amber-700",
  "Outside current focus": "bg-rose-50 text-rose-600",
};

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: PitchSubmission[]) {
  const headers = [
    "Company", "Founder", "Email", "Sector", "ARR", "FDA", "Stage",
    "Round Size", "Quick-Scan", "Status", "Deck URL", "Submitted",
  ];
  const escape = (v: string | null | undefined) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((s) =>
      [
        s.company_name, s.founder_name, s.founder_email, s.sector,
        s.arr_bucket, s.fda_clearance, s.stage, s.round_size,
        s.quick_scan_tag, s.status, s.pitch_deck_url, s.submitted_at,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 border-l-4 ${accent}`}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: PitchSubmission["status"] }) {
  const s = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function QuickScanBadge({ tag }: { tag: string | null }) {
  if (!tag) return null;
  const cls = QUICK_SCAN_BADGE[tag] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {tag}
    </span>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [authed, setAuthed] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("ndc_admin_auth") === "1"
  );

  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;

  return <DashboardInner />;
}

function DashboardInner() {
  const { data: submissions, isLoading, error } = useSubmissions();

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [arrFilter, setArrFilter] = useState("all");
  const [fdaFilter, setFdaFilter] = useState("all");
  const [quickScanFilter, setQuickScanFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const stats = useMemo(() => {
    const all = submissions ?? [];
    return {
      total: all.length,
      pending: all.filter((s) => s.status === "pending").length,
      interested: all.filter((s) => s.status === "interested").length,
      follow_up: all.filter((s) => s.status === "follow_up").length,
      pass: all.filter((s) => s.status === "pass").length,
      core_fit: all.filter((s) => s.quick_scan_tag === "Core fit").length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (submissions ?? []).filter((s) => {
      if (q && !s.company_name.toLowerCase().includes(q) && !s.founder_name.toLowerCase().includes(q)) return false;
      if (sectorFilter !== "all" && s.sector !== sectorFilter) return false;
      if (stageFilter !== "all" && s.stage !== stageFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (arrFilter !== "all" && s.arr_bucket !== arrFilter) return false;
      if (fdaFilter !== "all" && s.fda_clearance !== fdaFilter) return false;
      if (quickScanFilter !== "all" && s.quick_scan_tag !== quickScanFilter) return false;
      return true;
    });
  }, [submissions, search, sectorFilter, stageFilter, statusFilter, arrFilter, fdaFilter, quickScanFilter]);

  const selectedSubmission = useMemo(
    () => (submissions ?? []).find((s) => s.id === selectedId) ?? null,
    [submissions, selectedId],
  );

  const hasFilters =
    search || sectorFilter !== "all" || stageFilter !== "all" ||
    statusFilter !== "all" || arrFilter !== "all" || fdaFilter !== "all" || quickScanFilter !== "all";

  const clearFilters = () => {
    setSearch(""); setSectorFilter("all"); setStageFilter("all");
    setStatusFilter("all"); setArrFilter("all"); setFdaFilter("all"); setQuickScanFilter("all");
  };

  const openSheet = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: PitchSubmission["status"]) => {
      try {
        await updateSubmissionStatus(id, status);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [],
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 bg-[#1a1f2e] rounded flex items-center justify-center text-white text-xs font-bold">
              N
            </span>
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">
              Deal Flow Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {stats.core_fit > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                {stats.core_fit} core fit
              </span>
            )}
            {stats.pending > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                {stats.pending} new
              </span>
            )}
            <span className="text-xs text-gray-400 hidden md:block">{today}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard label="Total" count={stats.total} accent="border-l-gray-300" />
          <StatCard label="Core Fit" count={stats.core_fit} accent="border-l-emerald-400" />
          <StatCard label="Pending" count={stats.pending} accent="border-l-gray-400" />
          <StatCard label="Interested" count={stats.interested} accent="border-l-blue-400" />
          <StatCard label="Follow Up" count={stats.follow_up} accent="border-l-green-500" />
          <StatCard label="Pass" count={stats.pass} accent="border-l-rose-400" />
        </div>

        {/* Filters + CSV */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search company or founder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder-gray-400"
            />
          </div>

          <Select value={quickScanFilter} onValueChange={setQuickScanFilter}>
            <SelectTrigger className="w-44 h-9 text-sm border-gray-200">
              <SelectValue placeholder="Quick-scan tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {QUICK_SCAN_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={arrFilter} onValueChange={setArrFilter}>
            <SelectTrigger className="w-36 h-9 text-sm border-gray-200">
              <SelectValue placeholder="ARR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ARR</SelectItem>
              {ARR_BUCKETS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={fdaFilter} onValueChange={setFdaFilter}>
            <SelectTrigger className="w-32 h-9 text-sm border-gray-200">
              <SelectValue placeholder="FDA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All FDA</SelectItem>
              {FDA_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sectors</SelectItem>
              {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-32 h-9 text-sm border-gray-200">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5">
              <X size={14} /> Clear
            </button>
          )}

          {/* CSV Export */}
          <button
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading submissions…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 text-sm">Failed to load submissions.</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {hasFilters ? "No submissions match your filters." : "No submissions yet."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Founder</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Quick-Scan</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">ARR</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">FDA</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Stage</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}
                    className="cursor-pointer hover:bg-gray-50/60 transition-colors"
                    onClick={() => openSheet(sub.id)}>
                    <TableCell className="font-medium text-gray-900 text-sm">
                      <div>
                        <p className="font-semibold">{sub.company_name}</p>
                        {sub.company_website && (
                          <p className="text-xs text-gray-400 truncate max-w-[130px]">{sub.company_website}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div>
                        <p>{sub.founder_name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[130px]">{sub.founder_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <QuickScanBadge tag={sub.quick_scan_tag} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 hidden lg:table-cell">{sub.arr_bucket ?? "—"}</TableCell>
                    <TableCell className="text-xs text-gray-600 hidden lg:table-cell">{sub.fda_clearance ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-600 hidden md:table-cell">{sub.stage}</TableCell>
                    <TableCell><StatusBadge status={sub.status} /></TableCell>
                    <TableCell className="text-xs text-gray-400 hidden md:table-cell">
                      {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={sub.status}
                        onValueChange={(v) => handleStatusChange(sub.id, v as PitchSubmission["status"])}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isLoading && !error && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {filtered.length} of {submissions?.length ?? 0} submissions
          </p>
        )}
      </div>

      <SubmissionSheet
        submission={selectedSubmission}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}