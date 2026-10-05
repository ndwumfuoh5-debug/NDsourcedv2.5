import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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
    const body = await request.json() as Record<string, unknown>;

    const founder_name = String(body.founder_name ?? '').trim();
    const founder_email = String(body.founder_email ?? '').trim();
    const company_name = String(body.company_name ?? '').trim();
    const one_liner = String(body.one_liner ?? '').trim();
    const sector = String(body.sector ?? '').trim();
    const arr_bucket = String(body.arr_bucket ?? '').trim();
    const fda_clearance = String(body.fda_clearance ?? '').trim();
    const stage = String(body.stage ?? '').trim();
    const round_size = String(body.round_size ?? '').trim();
    const pitch_deck_url = String(body.pitch_deck_url ?? '').trim();

    if (!founder_name || !founder_email || !company_name || !one_liner || !sector || !arr_bucket || !fda_clearance || !stage || !round_size || !pitch_deck_url) {
      return err('Missing required fields', 400);
    }
    if (!body.consent) return err('consent is required', 400);

    const CORE_TAGS = new Set([
      "Care Coordination & Navigation", "Data & Interoperability", "Diagnostics & Screening",
      "Direct Care & Clinical Delivery", "Mental & Behavioral Health", "Prevention & Wellness",
      "Regulatory & Compliance", "Remote Patient Monitoring", "Revenue Cycle Management",
      "Substance Use & Addiction", "Value-Based Care Enablement", "Women's Health",
      "Workforce & Staffing", "Aging & Senior Care",
    ]);

    const fit = Array.isArray(body.strategic_fit) ? (body.strategic_fit as string[]) : [];
    const arrOk = arr_bucket === '$1M–$5M' || arr_bucket === '$5M+';
    const fdaOk = fda_clearance === 'No';
    const themeOk = fit.filter((f) => CORE_TAGS.has(f)).length >= 1;
    let tag = 'Possible fit';
    if (arrOk && fdaOk && themeOk) tag = 'Core fit';
    else if (arr_bucket === 'Pre-revenue' || fda_clearance === 'Yes' || fit.length === 0) tag = 'Outside current focus';

    const client = await pool.connect();
    let result;
    try {
      result = await client.query(
        `INSERT INTO pitch_submissions
          (founder_name, founder_email, founder_linkedin, company_name, company_website,
           one_liner, sector, arr_bucket, fda_clearance, stage, round_size, amount_committed,
           pitch_deck_url, strategic_fit, consent, quick_scan_tag)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::text[],$15,$16)
         RETURNING id, company_name, founder_email`,
        [
          founder_name,
          founder_email,
          body.founder_linkedin ? String(body.founder_linkedin) : null,
          company_name,
          body.company_website ? String(body.company_website) : null,
          one_liner,
          sector,
          arr_bucket,
          fda_clearance,
          stage,
          round_size,
          body.amount_committed ? String(body.amount_committed) : null,
          pitch_deck_url,
          fit,
          Boolean(body.consent),
          tag,
        ]
      );
    } finally {
      client.release();
    }

    const row = result.rows[0];
    void sendEmails(body, row, tag);

    return ok(row, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    console.error('POST /api/submissions error:', msg);
    return err(msg);
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    let result;
    try {
      result = await client.query(
        `SELECT id, founder_name, founder_email, founder_linkedin, company_name,
                company_website, one_liner, sector, arr_bucket, fda_clearance, stage,
                round_size, amount_committed, pitch_deck_url, strategic_fit, consent,
                status, notes, quick_scan_tag, submitted_at
         FROM pitch_submissions ORDER BY submitted_at DESC`
      );
    } finally {
      client.release();
    }
    return ok(result.rows);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('GET /api/submissions error:', msg);
    return err(msg);
  }
}

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
