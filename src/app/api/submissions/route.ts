import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS });
}

function err(msg: string, status = 500) {
  return NextResponse.json({ error: msg }, { status, headers: CORS });
}

export async function POST(request: Request) {
  try {
    // 1. Parse body
    const body = await request.json() as Record<string, unknown>;

    // 2. Required fields
    const required = [
      'founder_name','founder_email','company_name','one_liner',
      'sector','arr_bucket','fda_clearance','stage','round_size','pitch_deck_url',
    ];
    for (const f of required) {
      if (!body[f]) return err(`${f} is required`, 400);
    }
    if (!body.consent) return err('consent is required', 400);

    // 3. Quick-scan tag
    const CORE_TAGS = new Set([
      "Care Coordination & Navigation","Data & Interoperability","Diagnostics & Screening",
      "Direct Care & Clinical Delivery","Mental & Behavioral Health","Prevention & Wellness",
      "Regulatory & Compliance","Remote Patient Monitoring","Revenue Cycle Management",
      "Substance Use & Addiction","Value-Based Care Enablement","Women's Health",
      "Workforce & Staffing","Aging & Senior Care",
    ]);
    const arr = String(body.arr_bucket ?? '');
    const fda = String(body.fda_clearance ?? '');
    const fit = Array.isArray(body.strategic_fit) ? (body.strategic_fit as string[]) : [];
    const arrOk = arr === '$1M–$5M' || arr === '$5M+';
    const fdaOk = fda === 'No';
    const themeOk = fit.filter((f) => CORE_TAGS.has(f)).length >= 1;
    let tag = 'Possible fit';
    if (arrOk && fdaOk && themeOk) tag = 'Core fit';
    else if (arr === 'Pre-revenue' || fda === 'Yes' || fit.length === 0) tag = 'Outside current focus';

    // 4. Insert
    const rows = await queryInternalDatabase(
      `INSERT INTO pitch_submissions
        (founder_name, founder_email, founder_linkedin, company_name, company_website,
         one_liner, sector, arr_bucket, fda_clearance, stage, round_size, amount_committed,
         pitch_deck_url, strategic_fit, consent, quick_scan_tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::text[],$15,$16)
       RETURNING id, company_name, founder_email`,
      [
        String(body.founder_name ?? ''),
        String(body.founder_email ?? ''),
        body.founder_linkedin ? String(body.founder_linkedin) : null,
        String(body.company_name ?? ''),
        body.company_website ? String(body.company_website) : null,
        String(body.one_liner ?? ''),
        String(body.sector ?? ''),
        arr,
        fda,
        String(body.stage ?? ''),
        String(body.round_size ?? ''),
        body.amount_committed ? String(body.amount_committed) : null,
        String(body.pitch_deck_url ?? ''),
        fit,
        Boolean(body.consent),
        tag,
      ],
    );

    // 5. Emails (fire-and-forget — never block or fail the response)
    const row = rows[0] as { id: string; company_name: string; founder_email: string };
    void sendEmails(body, row, tag);

    return ok(row, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    console.error('POST /api/submissions error:', msg);
    // Write error to DB so we can read it
    try {
      await queryInternalDatabase(
        `INSERT INTO api_errors (route, error_msg) VALUES ($1, $2)`,
        ['POST /api/submissions', msg],
      );
    } catch { /* ignore */ }
    return err(msg);
  }
}

export async function GET() {
  try {
    const rows = await queryInternalDatabase(
      `SELECT id, founder_name, founder_email, founder_linkedin, company_name,
              company_website, one_liner, sector, arr_bucket, fda_clearance, stage,
              round_size, amount_committed, pitch_deck_url, strategic_fit, consent,
              status, notes, quick_scan_tag, submitted_at
       FROM pitch_submissions ORDER BY submitted_at DESC`,
      [],
    );
    return ok(rows);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('GET /api/submissions error:', msg);
    return err(msg);
  }
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendEmails(
  body: Record<string, unknown>,
  row: { id: string; company_name: string; founder_email: string },
  tag: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = 'onboarding@resend.dev';
  const admin = process.env.ADMIN_EMAIL ?? 'ndsourced@gmail.com';

  await Promise.allSettled([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: row.founder_email,
        subject: 'We received your submission',
        html: `<p>Hi ${String(body.founder_name ?? '')},</p>
               <p>Thanks for sharing. I review submissions on a rolling basis and will follow up if there's a fit.</p>
               <p style="color:#888;font-size:12px;">This is an automated confirmation. Please do not reply.</p>`,
      }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: admin,
        subject: `New submission: ${row.company_name} — ${tag}`,
        html: `<p><strong>Company:</strong> ${String(body.company_name ?? '')}</p>
               <p><strong>Founder:</strong> ${String(body.founder_name ?? '')} (${row.founder_email})</p>
               <p><strong>ARR:</strong> ${String(body.arr_bucket ?? '')}</p>
               <p><strong>Quick-scan:</strong> ${tag}</p>`,
      }),
    }),
  ]);
}