// Fetches real news headlines and converts them to dimension-tagged belief probes
// Uses server-side AI key (OPENAI_API_KEY env var) — never exposed to users

import { DIMENSIONS } from './beliefDNA';

export interface NewsProbe {
  statement: string;
  category: string;
  source: string;
  headline: string;
  dims: number[];
  dir: Record<number, number>;
  quality: string;
}

const NEWS_FEEDS = [
  { name: 'BBC',          url: 'https://feeds.bbci.co.uk/news/rss.xml',                category: 'society'      },
  { name: 'Reuters',      url: 'https://feeds.reuters.com/reuters/topNews',             category: 'politics'     },
  { name: 'AP News',      url: 'https://feeds.apnews.com/rss/apf-topnews',             category: 'society'      },
  { name: 'NPR',          url: 'https://feeds.npr.org/1001/rss.xml',                    category: 'society'      },
  { name: 'CNN',          url: 'http://rss.cnn.com/rss/cnn_topstories.rss',            category: 'politics'     },
  { name: 'Fox',          url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'politics'     },
  { name: 'TechCrunch',   url: 'https://techcrunch.com/feed/',                          category: 'science_tech' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss',                 category: 'society'      },
];

function extractTitles(xml: string): string[] {
  const matches = Array.from(xml.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>|<title>([^<]{10,})<\/title>/g));
  return matches
    .map(m => (m[1] || m[2] || '').trim())
    .filter(t => t.length > 15 && !t.toLowerCase().includes('rss') && !t.toLowerCase().includes('feed'))
    .slice(0, 8);
}

export async function fetchHeadlines(): Promise<Array<{ title: string; source: string; category: string }>> {
  const allHeadlines: Array<{ title: string; source: string; category: string }> = [];

  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        signal: AbortSignal.timeout(6000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeliefGenome/1.0)' },
      });
      const xml = await res.text();
      const titles = extractTitles(xml);
      for (const title of titles.slice(0, 3)) {
        allHeadlines.push({ title, source: feed.name, category: feed.category });
      }
    } catch (e) {
      console.warn(`RSS fetch failed for ${feed.name}: ${(e as Error).message}`);
    }
  }

  return allHeadlines;
}

function buildDimensionReference(): string {
  return DIMENSIONS.map(d => `  ${d.id}: ${d.name} (${d.cat}) — ${d.desc}`).join('\n');
}

export async function headlinesToProbes(
  headlines: Array<{ title: string; source: string; category: string }>
): Promise<NewsProbe[]> {
  if (headlines.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set — skipping AI probe generation');
    return [];
  }

  const batch = headlines.slice(0, 8);
  const headlineText = batch.map((h, i) => `${i + 1}. [${h.source}] ${h.title}`).join('\n');

  const prompt = `You are a belief dimension classifier for the Belief Genome Project.

Convert these news headlines into debate-worthy belief probe statements, then classify each probe against our 124-dimension belief framework.

RULES:
- Each probe must be a clear, debatable opinion statement (not a fact or question)
- A reasonable person could STRONGLY AGREE or STRONGLY DISAGREE
- Under 22 words. Standalone — no reference to the headline needed
- Be provocative but intellectually fair — no strawmen

FOR EACH PROBE, you must also classify:
- "dims": array of 2-3 dimension IDs [primary, secondary, tertiary?] that this probe most directly measures
  - Primary (index 0) gets weight 0.9, secondary 0.5, tertiary 0.3
- "dir": object mapping dimId to direction (+1 or -1)
  - +1 (default): AGREEING with the probe pushes that dimension score UP (toward 9)
  - -1: AGREEING pushes the score DOWN (toward 0)
  - Only include entries where direction is -1 (inverse). Omit +1 entries.
- "category": one of: philosophy, religion, psychology, relationships, society, economics, science_tech, politics, life
- "quality": "NEWS_REACTION"

DIMENSION REFERENCE (id: name — description):
${buildDimensionReference()}

Headlines:
${headlineText}

Return ONLY a JSON array of objects:
[
  {
    "statement": "The probe text here",
    "category": "politics",
    "dims": [48, 55, 49],
    "dir": { "55": -1 },
    "quality": "NEWS_REACTION"
  }
]

No markdown, no preamble. JSON array only.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('AI probe generation failed:', res.status, err);
      return [];
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.trim().replace(/^```json\n?|^```\n?|\n?```$/g, '').trim();
    const probes = JSON.parse(cleaned) as Array<{
      statement: string;
      category: string;
      dims: number[];
      dir?: Record<string, number>;
      quality: string;
    }>;

    return probes
      .filter(p => p.statement && p.dims?.length >= 2)
      .map((p, i) => {
        const validDims = p.dims.filter(d => d >= 4 && d <= 127).slice(0, 3);
        if (validDims.length < 2) return null;

        const dir: Record<number, number> = {};
        if (p.dir) {
          for (const [k, v] of Object.entries(p.dir)) {
            const dimId = parseInt(k);
            if (validDims.includes(dimId) && v === -1) {
              dir[dimId] = -1;
            }
          }
        }

        return {
          statement: p.statement.replace(/^['\".]|['\".]$/g, '').trim(),
          category: p.category || batch[i]?.category || 'society',
          source: `news:${batch[i]?.source || 'unknown'}`,
          headline: batch[i]?.title || '',
          dims: validDims,
          dir,
          quality: 'NEWS_REACTION',
        };
      })
      .filter((p): p is NewsProbe => p !== null);
  } catch (e) {
    console.error('AI probe conversion failed:', (e as Error).message);
    return [];
  }
}

export async function fetchNewsProbes(): Promise<NewsProbe[]> {
  try {
    const headlines = await fetchHeadlines();
    console.log(`Fetched ${headlines.length} headlines from ${NEWS_FEEDS.length} sources`);
    const probes = await headlinesToProbes(headlines);
    console.log(`Generated ${probes.length} dimension-tagged news probes`);
    return probes;
  } catch (e) {
    console.error('fetchNewsProbes error:', (e as Error).message);
    return [];
  }
}
