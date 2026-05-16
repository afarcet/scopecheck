// lib/matching.ts - Investor matching engine
import { createClient } from '@supabase/supabase-js';

const raspberryUrl = process.env.RASPBERRY_SUPABASE_URL!;
const raspberryKey = process.env.RASPBERRY_SUPABASE_ANON_KEY!;
const raspberry = createClient(raspberryUrl, raspberryKey);

export type InvestorMatch = {
  id: string;
  name: string;
  firm: string;
  title: string | null;
  relevance: string[];
  score: number;
};

const SECTOR_GROUPS: Record<string, string[]> = {
  climate: ['climate', 'climatetech', 'cleantech', 'energy', 'carbon', 'carbon-removal', 'decarbonisation', 'sustainability', 'circular-economy', 'energy-transition'],
  deeptech: ['deeptech', 'deep-tech', 'hardware', 'robotics', 'materials', 'quantum', 'semiconductors'],
  ai: ['ai', 'artificial-intelligence', 'machine-learning', 'ml', 'data', 'automation'],
  robotics: ['robotics', 'industrial', 'manufacturing', 'automation', 'hardware'],
  energy: ['energy', 'cleantech', 'renewables', 'batteries', 'hydrogen', 'solar', 'wind'],
};

const STAGE_GROUPS: Record<string, string[]> = {
  'pre-seed': ['pre-seed', 'preseed', 'idea', 'inception'],
  'seed': ['seed', 'early-stage', 'early'],
  'series-a': ['series-a', 'series a', 'growth'],
};

const GEO_GROUPS: Record<string, string[]> = {
  europe: ['europe', 'eu', 'uk', 'france', 'germany', 'nordics', 'baltics', 'spain', 'portugal', 'italy', 'netherlands', 'belgium', 'ireland', 'denmark', 'sweden', 'norway', 'finland'],
  uk: ['uk', 'london', 'united kingdom', 'britain'],
  france: ['france', 'paris', 'french'],
  germany: ['germany', 'berlin', 'munich', 'german'],
  nordics: ['nordics', 'denmark', 'sweden', 'norway', 'finland', 'copenhagen', 'stockholm'],
  portugal: ['portugal', 'lisbon', 'porto'],
};

function expandKeywords(input: string, groups: Record<string, string[]>): string[] {
  const lower = input.toLowerCase();
  const expanded: Set<string> = new Set();
  expanded.add(lower);
  for (const [group, keywords] of Object.entries(groups)) {
    if (keywords.some(k => lower.includes(k))) {
      keywords.forEach(k => expanded.add(k));
      expanded.add(group);
    }
  }
  return Array.from(expanded);
}

function scoreContact(
  contact: { investment_interests: string[] | null; tags: string[] },
  sectorKeywords: string[],
  geoKeywords: string[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const interests = (contact.investment_interests || []).map(i => i.toLowerCase());
  const tags = contact.tags.map(t => t.toLowerCase());
  const all = [...interests, ...tags];
  const sectorHits = sectorKeywords.filter(k => all.some(a => a.includes(k) || k.includes(a)));
  if (sectorHits.length >= 3) { score += 3; reasons.push('Strong sector fit'); }
  else if (sectorHits.length >= 1) { score += 1 + sectorHits.length * 0.5; reasons.push('Sector overlap'); }
  const geoHits = geoKeywords.filter(k => all.some(a => a.includes(k) || k.includes(a)));
  if (geoHits.length >= 1) { score += 2; reasons.push('Geo match'); }
  if (all.includes('deal-flow')) { score += 1; reasons.push('Active deal flow'); }
  if (all.includes('co-invest')) { score += 0.5; reasons.push('Co-invest'); }
  if (tags.includes('climate-vc') && sectorKeywords.some(k => ['climate','climatetech','cleantech','energy','carbon'].includes(k))) {
    score += 1; reasons.push('Climate VC');
  }
  return { score, reasons };
}

function scoreFirm(
  firm: { sectors: string[] | null; stage_focus: string[] | null; geo_focus: string[] | null },
  sectorKeywords: string[],
  stageKeywords: string[],
  geoKeywords: string[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const sectors = (firm.sectors || []).map(s => s.toLowerCase());
  const stages = (firm.stage_focus || []).map(s => s.toLowerCase());
  const geos = (firm.geo_focus || []).map(g => g.toLowerCase());
  const sectorHits = sectorKeywords.filter(k => sectors.some(s => s.includes(k) || k.includes(s)));
  if (sectorHits.length >= 1) { score += 3; reasons.push('Sector focus match'); }
  const stageHits = stageKeywords.filter(k => stages.some(s => s.includes(k) || k.includes(s)));
  if (stageHits.length >= 1) { score += 2; reasons.push('Stage fit'); }
  const geoHits = geoKeywords.filter(k => geos.some(g => g.includes(k) || k.includes(g)));
  if (geoHits.length >= 1) { score += 2; reasons.push('Geography fit'); }
  return { score, reasons };
}

export async function findInvestorMatches(
  sector: string,
  stage: string,
  geography: string,
  limit: number = 10
): Promise<InvestorMatch[]> {
  const sectorKeywords = expandKeywords(sector, SECTOR_GROUPS);
  const stageKeywords = expandKeywords(stage, STAGE_GROUPS);
  const geoKeywords = expandKeywords(geography, GEO_GROUPS);

  const { data: contacts } = await raspberry
    .from('contacts')
    .select('id, full_name, company, title, investment_interests')
    .or('status.eq.member,status.eq.warm,status.eq.pitched,status.eq.contacted,status.eq.lead');

  const investorTags = ['vc', 'climate-vc', 'corporate-vc', 'angel', 'family-office', 'co-invest', 'deal-flow'];
  const { data: taggedContacts } = await raspberry
    .from('contact_tags')
    .select('contact_id, tag')
    .in('tag', investorTags);

  const tagMap = new Map<string, string[]>();
  (taggedContacts || []).forEach(t => {
    const existing = tagMap.get(t.contact_id) || [];
    existing.push(t.tag);
    tagMap.set(t.contact_id, existing);
  });

  const investorContactIds = Array.from(tagMap.keys());
  const { data: allTagsForInvestors } = await raspberry
    .from('contact_tags')
    .select('contact_id, tag')
    .in('contact_id', investorContactIds);

  const fullTagMap = new Map<string, string[]>();
  (allTagsForInvestors || []).forEach(t => {
    const existing = fullTagMap.get(t.contact_id) || [];
    existing.push(t.tag);
    fullTagMap.set(t.contact_id, existing);
  });

  const contactMatches: InvestorMatch[] = [];
  (contacts || []).forEach(c => {
    if (!tagMap.has(c.id)) return;
    const tags = fullTagMap.get(c.id) || [];
    const { score, reasons } = scoreContact(
      { investment_interests: c.investment_interests, tags },
      sectorKeywords, geoKeywords
    );
    if (score > 0) {
      contactMatches.push({
        id: c.id,
        name: c.full_name || 'Unknown',
        firm: c.company || '',
        title: c.title,
        relevance: reasons,
        score,
      });
    }
  });

  const { data: firms } = await raspberry
    .from('crm_firms')
    .select('id, name, type, sectors, stage_focus, geo_focus');

  const firmMatches: InvestorMatch[] = [];
  (firms || []).forEach(f => {
    if (!f.sectors && !f.stage_focus && !f.geo_focus) return;
    const { score, reasons } = scoreFirm(
      { sectors: f.sectors, stage_focus: f.stage_focus, geo_focus: f.geo_focus },
      sectorKeywords, stageKeywords, geoKeywords
    );
    if (score > 0) {
      firmMatches.push({
        id: f.id, name: f.name, firm: f.name,
        title: f.type ? f.type.replace('_', ' ') : 'VC',
        relevance: reasons, score,
      });
    }
  });

  const allMatches = [...contactMatches, ...firmMatches];
  const seen = new Set<string>();
  const deduped = allMatches.filter(m => {
    const key = m.firm.toLowerCase() || m.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  deduped.sort((a, b) => b.score - a.score);
  return deduped.slice(0, limit);
}
