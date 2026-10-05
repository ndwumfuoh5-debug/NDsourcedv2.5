import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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

    const required = [
      'founder_name', 'founder_email', 'company_name', 'one_liner',
      'sector', 'arr_bucket', 'fda_clearance', 'stage', 'round_size', 'pitch_deck_url',
    ];
    for (const f of required) {
      if (!body[f]) return err(`${f} is required`, 400);
    }
    if (!body.consent) return err('consent is required', 400);

    const CORE_TAGS = new Set([
      "Care Coordination & Navigation", "Data & Interoperability", "Diagnostics & Screening",
      "Direct Care & Clinical Delivery", "Mental & Behavioral Health", "Prevention & Wellness",
      "Regulatory & Compliance", "Remote Patient Monitoring", "Revenue Cycle Management",
      "Substance Use & Addiction", "Value-Based Care Enablement", "Women's Health",
      "Workforce & Staffing", "Aging & Senior Care",
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

    const { data, error } = await supabase
      .from('pitch_submissions')
      .insert([
        {
          founder_name: String(body.founder_name ?? ''),
          founder_email: String(body.founder_email ?? ''),
          founder_linkedin: body.founder_linkedin ? String(body.founder_linkedin) : null,
          company_name: String(body.company_name ?? ''),
          company_website: body.company_website ? String(body.company_website) : null,
          one_liner: String(body.one_liner ?? ''),
          sector: String(body.sector ?? ''),
          arr_bucket: arr,
          fda_clearance: fda,
          stage: String(body.stage ?? ''),
          round_size: String(body.round_size ?? ''),
          amount_committed: body.amount_committed ? String(body.amount_committed) : null,
          pitch_deck_url: String(body.pitch_deck_url ?? ''),
          strategic_fit: fit,
          consent: Boolean(body.consent),
          quick_scan_tag: tag,
        }
      ])
      .select('id, company_name, founder_email')
      .single();

    if (error) throw error;

    void sendEmails(body, data, tag);

    return ok(data, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    console.error('POST /api/submissions error:', msg);
    return err(msg);
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pitch_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return ok(data);
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
