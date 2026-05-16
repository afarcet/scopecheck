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

  // Get latest intro for founder signals
  const { data: latestIntro } = await supabase
    .from('intros')
    .select('cofounder_count, cofounder_history, prior_founder, prior_exit, domain_experience')
    .eq('founder_handle', handle)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();


  // Increment view count (fire and forget)
  try { await supabase.rpc('increment_view_count', { founder_id: founder.id }); } catch { /* non-blocking */ }

  const profileUrl = `https://scopecheck.ai/f/${handle}`;
  const roundSize = founder.round_size || 0;
  const committed = founder.committed || 0;
  const pct = roundSize > 0 ? Math.round((committed / roundSize) * 100) : 0;
  const minTicket = founder.min_ticket || 0;
  const available = founder.available || (roundSize - committed);
  const sectors = Array.isArray(founder.sectors) ? founder.sectors : (founder.sector ? [founder.sector] : []);

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
                {[sectors.join(' · '), founder.country || founder.geography].filter(Boolean).join(' · ')}
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
                  {minTicket > 0 && (
                    <span style={{ color: 'var(--white-mid)' }}>min ticket: <span style={{ color: 'var(--white)' }}>€{minTicket.toLocaleString()}K</span></span>
                  )}
                  <span style={{ color: 'var(--white-mid)' }}>available: <span style={{ color: 'var(--amber)' }}>€{available.toLocaleString()}K</span></span>
                </div>
              </div>
            )}

            {/* Lead investor status */}
            {founder.has_lead && (
              <div style={{ border: '1px solid rgba(240,165,0,0.3)', background: 'rgba(240,165,0,0.06)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700 }}>✓ Lead investor confirmed</span>
                {founder.lead_details && (
                  <span style={{ fontSize: '11px', color: 'var(--white-mid)' }}>— {founder.lead_details}</span>
                )}
              </div>
            )}

            {/* Criteria table */}
            <div style={{ border: '1px solid var(--border2)', marginBottom: '16px' }}>
              {founder.traction_summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>traction</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white)' }}>{founder.traction_summary}</div>
                </div>
              )}
              {founder.founder_background && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>team</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white)' }}>{founder.founder_background}</div>
                </div>
              )}
              {founder.what_we_want && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>looking_for</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-mid)', fontStyle: 'italic' }}>{founder.what_we_want}</div>
                </div>
              )}
              {founder.deck_url && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: founder.data_room_url ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>deck</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <a href={founder.deck_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>view deck →</a>
                  </div>
                </div>
              )}
              {founder.linkedin_url && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: founder.data_room_url ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>linkedin</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <a href={founder.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>view profile →</a>
                  </div>
                </div>
              )}
              {founder.data_room_url && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
                  <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>data_room</div>
                  <div style={{ padding: '9px 14px', fontSize: '12px' }}>
                    <a href={founder.data_room_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>access data room →</a>
                  </div>
                </div>
              )}
            </div>

    
        {/* Founder Profile */}
        {latestIntro && (latestIntro.cofounder_count || latestIntro.prior_founder !== null || latestIntro.domain_experience) && (
          <div style={{ border: '1px solid var(--border2)', marginBottom: '16px' }}>
            <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>FOUNDER_PROFILE</div>
            {latestIntro.cofounder_count && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>co-founders</div>
                <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-high)' }}>{latestIntro.cofounder_count === '1' ? 'Solo founder' : latestIntro.cofounder_count}</div>
              </div>
            )}
            {latestIntro.cofounder_history && latestIntro.cofounder_history !== 'solo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>known each other</div>
                <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-high)' }}>{latestIntro.cofounder_history}</div>
              </div>
            )}
            {latestIntro.prior_founder !== null && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>founded before</div>
                <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-high)' }}>{latestIntro.prior_founder ? 'Yes' : 'No'}</div>
              </div>
            )}
            {latestIntro.prior_exit && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>prior exit</div>
                <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-high)' }}>Yes</div>
              </div>
            )}
            {latestIntro.domain_experience && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
                <div style={{ padding: '9px 14px', background: 'var(--bg3)', fontSize: '10px', color: 'var(--white-mid)', borderRight: '1px solid var(--border)', letterSpacing: '0.06em' }}>domain experience</div>
                <div style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--white-high)' }}>{latestIntro.domain_experience}</div>
              </div>
            )}
          </div>
        )}

        {founder.name && (
              <p style={{ fontSize: '11px', color: 'var(--white-dimmer)', marginBottom: '16px' }}>
                built by {founder.name}
              </p>
            )}

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
