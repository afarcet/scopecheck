import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QRButton } from './qr-button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function FounderPassportPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const { data: founder } = await supabase
    .from('founders')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!founder) notFound();

  // Increment view count (fire and forget)
  try { await supabase.rpc('increment_view_count', { founder_id: founder.id }); } catch { /* non-blocking */ }

  const profileUrl = `https://scopecheck.ai/f/${handle}`;
  const roundSize = founder.round_size || 0;
  const committed = founder.committed || 0;
  const pct = roundSize > 0 ? Math.round((committed / roundSize) * 100) : 0;
  const available = founder.available || (roundSize - committed);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 100 }}>
        <Link href="/" style={{ color: 'var(--rasp)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>&gt; scopecheck.ai</Link>
        <span style={{ fontSize: '10px', color: 'var(--white-mid)', letterSpacing: '0.1em' }}>// founder passport</span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber)' }}>scopecheck.ai/f/{handle}</span>
            {founder.stage && (
              <span style={{ fontSize: '10px', letterSpacing: '0.08em', padding: '2px 7px', border: '1px solid rgba(240,165,0,0.3)', color: 'var(--amber)', background: 'rgba(240,165,0,0.08)' }}>
                {founder.stage.toLowerCase()}
              </span>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px' }}>{founder.company_name}</h1>
              {founder.one_liner && (
                <p style={{ fontSize: '13px', color: 'var(--white-mid)', lineHeight: 1.6 }}>{founder.one_liner}</p>
              )}
              <p style={{ fontSize: '11px', color: 'var(--white-dimmer)', marginTop: '6px' }}>
                {[founder.sector, founder.geography].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Round progress */}
            {roundSize > 0 && (
              <div style={{ border: '1px solid var(--border2)', padding: '14px 16px', marginBottom: '16px', background: 'var(--bg3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--white-mid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>round_progress</span>
                  <span style={{ fontSize: '11px', color: 'var(--amber)' }}>{pct}% committed</span>
                </div>
                <div style={{ background: 'var(--bg)', height: '6px', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ background: 'var(--amber)', height: '100%', width: `${pct}%`, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--white-mid)' }}>target: <span style={{ color: 'var(--white)' }}>€{roundSize.toLocaleString()}K</span></span>
                  <span style={{ color: 'var(--white-mid)' }}>available: <span style={{ color: 'var(--amber)' }}>€{available.toLocaleString()}K</span></span>
                </div>
              </div>
            )}

            {/* Criteria table */}
            <div style={{ border: '1px solid var(--border2)', marginBottom: '16px' }}>
              {founder.traction_summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>traction</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white)' }}>{founder.traction_summary}</div>
                </div>
              )}
              {founder.what_we_want && (
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>want</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-mid)', fontStyle: 'italic' }}>{founder.what_we_want}</div>
                </div>
              )}
              {founder.deck_url && (
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderBottom: founder.data_room_url ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>deck</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <a href={founder.deck_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>view deck →</a>
                  </div>
                </div>
              )}
              {founder.data_room_url && (
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>data_room</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <a href={founder.data_room_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>access data room →</a>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <QRButton url={profileUrl} />
              <Link href="/scope" style={{ fontSize: '11px', padding: '9px 14px', border: '1px solid var(--border2)', color: 'var(--white-mid)', fontFamily: "'JetBrains Mono', monospace", textDecoration: 'none', background: 'var(--bg3)' }}>
                find investors →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
