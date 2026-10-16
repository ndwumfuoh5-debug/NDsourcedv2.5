import useSWR, { mutate } from 'swr';

export interface PitchSubmission {
  id: string;
  founder_name: string;
  founder_email: string;
  founder_linkedin: string | null;
  company_name: string;
  company_website: string | null;
  one_liner: string;
  sector: string;
  arr_bucket: string;
  fda_clearance: string;
  stage: string;
  round_size: string;
  amount_committed: string | null;
  pitch_deck_url: string;
  strategic_fit: string[] | null;
  consent: boolean;
  status: 'pending' | 'interested' | 'follow_up' | 'pass';
  notes: string | null;
  quick_scan_tag: string | null;
  submitted_at: string;
}

export interface CreateSubmissionData {
  founder_name: string;
  founder_email: string;
  founder_linkedin: string | null;
  company_name: string;
  company_website: string | null;
  one_liner: string;
  sector: string;
  arr_bucket: string;
  fda_clearance: string;
  stage: string;
  round_size: string;
  amount_committed: string | null;
  pitch_deck_url: string;
  strategic_fit: string[];
  consent: boolean;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
  });

// Always hit the Vybe-hosted app URL directly so submissions work
// from any custom domain (e.g. ndsourced.com)
const API_BASE = 'https://source-cay.vybe.build';

export function useSubmissions() {
  return useSWR<PitchSubmission[]>('/api/submissions', fetcher);
}

export function useSubmission(id: string) {
  return useSWR<PitchSubmission>(id ? `/api/submissions/${id}` : null, fetcher);
}

export async function createSubmission(data: CreateSubmissionData) {
  const url = `${API_BASE}/api/submissions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (networkErr) {
    throw new Error(`Network request failed: ${String(networkErr)}`);
  }

  const rawText = await res.text();
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(rawText) as { error?: string };
      if (parsed.error?.trim()) detail = parsed.error.trim();
      else if (rawText.trim()) detail = rawText.slice(0, 300);
    } catch {
      if (rawText.trim()) detail = rawText.slice(0, 300);
    }
    throw new Error(detail);
  }
  return JSON.parse(rawText) as { id: string; company_name: string; founder_email: string };
}

export async function updateSubmissionStatus(
  id: string,
  status: PitchSubmission['status'],
) {
  await mutate<PitchSubmission[], PitchSubmission>(
    '/api/submissions',
    async () => {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json() as Promise<PitchSubmission>;
    },
    {
      optimisticData: (current) =>
        (current ?? []).map((s) => (s.id === id ? { ...s, status } : s)),
      populateCache: (updated, current) =>
        (current ?? []).map((s) => (s.id === updated.id ? updated : s)),
      rollbackOnError: true,
      revalidate: false,
    },
  );
}

export async function updateSubmissionNotes(id: string, notes: string) {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error('Failed to update notes');
  const updated = (await res.json()) as PitchSubmission;
  await mutate<PitchSubmission[]>(
    '/api/submissions',
    (current) => (current ?? []).map((s) => (s.id === updated.id ? updated : s)),
    false,
  );
}