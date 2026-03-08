import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QRButton } from './qr-button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvestorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const { data: investor } = await supabase
    .from('investors')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!investor) notFound();

  const profileUrl = `https://scopecheck.ai/${handle}`;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 100 }}>
        <Link href="/" style={{ color: 'var(--rasp)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>&gt; scopecheck.ai</Link>
        <Link href="/log" style={{ fontSize: '10px', color: 'var(--white-mid)', letterSpacing: '0.1em', textDecoration: 'none' }}>// build log</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <span style={{ fontSize: '11px', color: 'var(--rasp)' }}>scopecheck.ai/{handle}</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.08em', padding: '2px 7px', border: '1px solid var(--rasp-border)', color: 'var(--rasp)', background: 'var(--rasp-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ animation: 'blink 2s ease infinite', display: 'inline-block' }}>●</span>
              {investor.status === 'active' ? 'open to inbound' : 'paused'}
            </span>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px' }}>{investor.name}</h1>
                <p style={{ fontSize: '11px', color: 'var(--white-mid)' }}>
                  {[investor.firm, investor.location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {investor.stages?.map((s: string) => (
                  <span key={s} style={{ fontSize: '10px', letterSpacing: '0.08em', padding: '2px 7px', border: '1px solid var(--border2)', color: 'var(--white-mid)' }}>
                    {s.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border2)', marginBottom: '16px' }}>
              {investor.ticket_min && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>ticket_size</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--rasp)' }}>€{investor.ticket_min}K → €{investor.ticket_max}K</span>
                  </div>
                </div>
              )}
              {investor.sectors?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>sectors</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    {investor.sectors.map((s: string, i: number) => (
                      <span key={s}><span style={{ color: 'var(--amber)' }}>{s}</span>{i < investor.sectors.length - 1 ? ' · ' : ''}</span>
                    ))}
                  </div>
                </div>
              )}
              {investor.geographies?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>geography</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white)' }}>{investor.geographies.join(' · ')}</div>
                </div>
              )}
              {investor.wont_invest_in && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>wont_invest</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-mid)' }}>{investor.wont_invest_in}</div>
                </div>
              )}
              {investor.how_we_work && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>how_we_work</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-mid)', fontStyle: 'italic' }}>{investor.how_we_work}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href={`/${handle}/apply`} style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'var(--rasp)', color: '#fff', border: '1px solid var(--rasp)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', padding: '9px 16px', textDecoration: 'none', alignItems: 'center' }}>
                $ apply →
              </Link>
              <QRButton url={profileUrl} />
              <Link href={`/${handle}/for-llm`} style={{ background: 'var(--bg3)', color: 'var(--white-mid)', border: '1px solid var(--border2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', padding: '9px 12px', textDecoration: 'none' }}>
                /for-llm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
