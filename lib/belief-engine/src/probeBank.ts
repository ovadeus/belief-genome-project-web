// Curated evergreen probes — each tagged with exact dimensions they target
// Pure domain logic — no framework dependencies

export interface ProbeDefinition {
  text: string;
  dims: number[];
  dir?: Record<number, number>;
  quality: string;
}

export interface QualityPreset {
  diagnosticPower: number;
  subtlety: number;
  temporality: string;
  weight: number;
}

export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  DIRECT:       { diagnosticPower: 1.0, subtlety: 0.0, temporality: 'eternal',  weight: 1.0  },
  SCENARIO:     { diagnosticPower: 0.8, subtlety: 0.6, temporality: 'eternal',  weight: 0.8  },
  PREFERENCE:   { diagnosticPower: 0.6, subtlety: 0.7, temporality: 'decadal',  weight: 0.6  },
  HYPOTHETICAL: { diagnosticPower: 0.7, subtlety: 0.5, temporality: 'eternal',  weight: 0.7  },
  NEWS_REACTION:{ diagnosticPower: 0.65,subtlety: 0.4, temporality: 'current',  weight: 0.65 },
  LIFESTYLE:    { diagnosticPower: 0.4, subtlety: 0.9, temporality: 'decadal',  weight: 0.4  },
  ABSTRACT:     { diagnosticPower: 0.85,subtlety: 0.3, temporality: 'eternal',  weight: 0.85 },
};

export const PROBE_BANK: Record<string, ProbeDefinition[]> = {
  philosophy: [
    { text: "Free will is an illusion — our choices are determined by forces beyond our control.", dims: [109, 4, 8], dir: { 109: -1 }, quality: 'DIRECT' },
    { text: "A meaningful life requires suffering; comfort alone cannot produce depth.", dims: [42, 127, 88], quality: 'ABSTRACT' },
    { text: "Objective morality exists independent of human opinion or culture.", dims: [29, 5, 4], quality: 'DIRECT' },
    { text: "Consciousness is the most important unsolved problem in science.", dims: [24, 6, 89], quality: 'ABSTRACT' },
    { text: "Death gives life meaning; immortality would make existence trivial.", dims: [127, 10, 14], quality: 'HYPOTHETICAL' },
    { text: "The self is an illusion — there is no fixed 'you' that persists through time.", dims: [8, 17, 109], dir: { 17: -1 }, quality: 'ABSTRACT' },
    { text: "Truth is always relative to the culture or individual perceiving it.", dims: [5, 8, 29], dir: { 5: -1, 29: -1 }, quality: 'DIRECT' },
    { text: "It is better to be Socrates dissatisfied than a fool satisfied.", dims: [103, 118, 10], quality: 'ABSTRACT' },
    { text: "We have a moral obligation to future generations that outweighs our own comfort.", dims: [38, 30, 126], dir: { 30: -1 }, quality: 'ABSTRACT' },
    { text: "Most people live their entire lives without ever truly examining their beliefs.", dims: [103, 118, 10], dir: { 118: -1 }, quality: 'SCENARIO' },
    { text: "Reason alone is sufficient to guide a good life — emotion clouds judgment.", dims: [6, 7, 111], dir: { 7: -1, 111: -1 }, quality: 'DIRECT' },
    { text: "The examined life is the only life worth living.", dims: [103, 112, 115], quality: 'ABSTRACT' },
    { text: "Suffering is not something to be avoided but to be transformed.", dims: [42, 127, 28], quality: 'ABSTRACT' },
    { text: "Happiness is a byproduct of purpose, not something to be pursued directly.", dims: [127, 88, 113], quality: 'ABSTRACT' },
    { text: "We are fundamentally alone — no one can ever truly know another person.", dims: [125, 118, 24], dir: { 125: -1 }, quality: 'ABSTRACT' },
  ],
  religion: [
    { text: "A higher power or intelligence underlies the structure of the universe.", dims: [14, 11, 4], quality: 'DIRECT' },
    { text: "Religious faith and scientific reasoning are fundamentally incompatible.", dims: [6, 15, 14], dir: { 15: -1 }, quality: 'DIRECT' },
    { text: "Spirituality without religion is the most honest form of transcendence.", dims: [28, 15, 14], dir: { 15: -1 }, quality: 'SCENARIO' },
    { text: "Religion has caused more harm than good across human history.", dims: [15, 29, 14], dir: { 15: -1 }, quality: 'DIRECT' },
    { text: "Prayer has measurable effects beyond the psychological comfort it provides.", dims: [18, 23, 14], quality: 'DIRECT' },
    { text: "Near-death experiences offer genuine evidence of something beyond physical death.", dims: [16, 17, 21], quality: 'SCENARIO' },
    { text: "Organized religion is primarily a mechanism of social control.", dims: [15, 77, 29], dir: { 15: -1, 77: -1 }, quality: 'DIRECT' },
    { text: "Every major religion is pointing at the same underlying truth from different angles.", dims: [14, 8, 15], quality: 'ABSTRACT' },
    { text: "Atheism requires as much faith as theism.", dims: [14, 5, 6], quality: 'ABSTRACT' },
    { text: "Sacred texts should be interpreted literally, not metaphorically.", dims: [22, 14, 32], quality: 'DIRECT' },
    { text: "Secular humanism can provide everything religion offers without the downsides.", dims: [15, 6, 29], dir: { 15: -1 }, quality: 'DIRECT' },
    { text: "Mystical experiences are the most direct path to truth available to humans.", dims: [7, 28, 24], quality: 'ABSTRACT' },
    { text: "Moral behavior does not require belief in God or an afterlife.", dims: [29, 14, 41], dir: { 14: -1 }, quality: 'DIRECT' },
    { text: "The universe's fine-tuning for life is strong evidence of intentional design.", dims: [14, 4, 11], quality: 'ABSTRACT' },
  ],
  psychology: [
    { text: "Most of our adult behavior is determined by experiences before age seven.", dims: [114, 110, 116], quality: 'DIRECT' },
    { text: "People rarely change in fundamental ways — character is essentially fixed by adulthood.", dims: [110, 118, 109], quality: 'DIRECT' },
    { text: "Trauma is the defining force behind most mental illness and dysfunction.", dims: [114, 112, 105], quality: 'DIRECT' },
    { text: "Self-awareness alone is enough to overcome most psychological problems.", dims: [112, 109, 103], dir: { 112: -1 }, quality: 'SCENARIO' },
    { text: "Happiness is a skill that can be deliberately cultivated, not just a state you find yourself in.", dims: [113, 109, 115], quality: 'SCENARIO' },
    { text: "Most people are far less rational than they believe themselves to be.", dims: [111, 7, 103], quality: 'DIRECT' },
    { text: "Social media is measurably damaging the mental health of an entire generation.", dims: [95, 105, 89], dir: { 95: -1, 89: -1 }, quality: 'DIRECT' },
    { text: "Therapy is one of the most valuable things a person can invest in.", dims: [112, 105, 28], quality: 'DIRECT' },
    { text: "Emotional intelligence matters more than IQ for success in life.", dims: [111, 116, 103], quality: 'SCENARIO' },
    { text: "Most conflict between people is really conflict within themselves.", dims: [114, 109, 43], quality: 'ABSTRACT' },
    { text: "We are more influenced by our social environment than by our individual will.", dims: [109, 78, 114], dir: { 109: -1 }, quality: 'DIRECT' },
    { text: "Loneliness is the defining public health crisis of our time.", dims: [105, 95, 125], dir: { 95: -1 }, quality: 'DIRECT' },
    { text: "The ego is the primary source of human suffering.", dims: [127, 28, 115], quality: 'ABSTRACT' },
    { text: "Humans are fundamentally tribal — we are incapable of caring equally about all people.", dims: [118, 78, 66], dir: { 118: -1 }, quality: 'DIRECT' },
    { text: "Addiction is primarily a disease, not a moral failure.", dims: [105, 29, 33], dir: { 29: -1, 33: -1 }, quality: 'DIRECT' },
  ],
  relationships: [
    { text: "Long-term romantic love as portrayed in media is largely a myth.", dims: [119, 120, 64], dir: { 119: -1, 120: -1, 64: -1 }, quality: 'DIRECT' },
    { text: "True friendship requires having gone through adversity together.", dims: [42, 122, 124], quality: 'SCENARIO' },
    { text: "People should be completely honest with their partners, even when it causes pain.", dims: [40, 122, 43], dir: { 40: -1 }, quality: 'SCENARIO' },
    { text: "Unconditional love is possible and is the highest form of human connection.", dims: [43, 119, 123], dir: { 123: -1 }, quality: 'DIRECT' },
    { text: "Modern dating culture has made lasting commitment harder to achieve.", dims: [119, 95, 64], dir: { 95: -1 }, quality: 'SCENARIO' },
    { text: "You cannot truly love another person until you love yourself.", dims: [113, 112, 41], quality: 'PREFERENCE' },
    { text: "Marriage as an institution is still relevant and valuable in modern society.", dims: [120, 64, 119], quality: 'DIRECT' },
    { text: "Most relationship problems come down to unmet childhood attachment needs.", dims: [114, 112, 121], quality: 'DIRECT' },
    { text: "Jealousy is always a sign of insecurity, never of love.", dims: [123, 119, 111], quality: 'DIRECT' },
    { text: "We choose partners who reflect our own unresolved psychological issues.", dims: [114, 112, 109], dir: { 109: -1 }, quality: 'ABSTRACT' },
    { text: "Friendship is more important than romantic love to long-term wellbeing.", dims: [119, 126, 125], dir: { 119: -1 }, quality: 'PREFERENCE' },
    { text: "People should prioritize personal growth over relationship stability when they conflict.", dims: [30, 109, 112], quality: 'SCENARIO' },
    { text: "Long-distance relationships rarely work in the long run.", dims: [119, 120, 125], quality: 'PREFERENCE' },
    { text: "Children of divorce are permanently shaped by that experience.", dims: [121, 114, 64], quality: 'DIRECT' },
    { text: "Forgiveness is something you do for yourself, not for the other person.", dims: [43, 123, 41], dir: { 123: -1 }, quality: 'ABSTRACT' },
  ],
  society: [
    { text: "Democracy is the worst form of government except for all the others.", dims: [45, 44, 60], dir: { 60: -1 }, quality: 'ABSTRACT' },
    { text: "Economic inequality is the root cause of most social problems.", dims: [34, 85, 68], quality: 'DIRECT' },
    { text: "Cancel culture has gone too far and is silencing important voices.", dims: [75, 62, 72], dir: { 72: -1 }, quality: 'DIRECT' },
    { text: "Meritocracy is largely a myth — success is more about circumstance than effort.", dims: [58, 67, 68], dir: { 58: -1, 67: -1 }, quality: 'DIRECT' },
    { text: "Immigration, on balance, strengthens the societies it flows into.", dims: [55, 66, 73], quality: 'DIRECT' },
    { text: "The media is more interested in generating outrage than informing the public.", dims: [45, 13, 96], dir: { 13: -1 }, quality: 'DIRECT' },
    { text: "Universal basic income would do more good than harm if implemented correctly.", dims: [82, 51, 84], quality: 'SCENARIO' },
    { text: "Individual freedom must sometimes yield to collective wellbeing.", dims: [30, 78, 44], dir: { 30: -1, 44: -1 }, quality: 'ABSTRACT' },
    { text: "The education system is fundamentally broken and needs complete reinvention.", dims: [99, 100, 102], dir: { 100: -1 }, quality: 'DIRECT' },
    { text: "Social media has made political polarization dramatically worse.", dims: [95, 45, 72], dir: { 95: -1 }, quality: 'DIRECT' },
    { text: "Most institutions we trust are primarily serving their own interests.", dims: [13, 45, 88], dir: { 13: -1 }, quality: 'DIRECT' },
    { text: "The current pace of technological change is outrunning our ability to adapt.", dims: [89, 97, 10], dir: { 89: -1 }, quality: 'DIRECT' },
    { text: "Nationalism is a net negative force in the modern world.", dims: [49, 59, 55], dir: { 49: -1, 59: -1 }, quality: 'DIRECT' },
    { text: "Most people who believe they are open-minded are not.", dims: [103, 118, 10], dir: { 118: -1 }, quality: 'ABSTRACT' },
    { text: "The culture war is largely manufactured by media and political elites.", dims: [45, 75, 13], dir: { 13: -1 }, quality: 'DIRECT' },
  ],
  economics: [
    { text: "Free markets, left to themselves, produce better outcomes than planned economies.", dims: [46, 79, 44], quality: 'DIRECT' },
    { text: "Wealth concentration at the top is the defining economic problem of our era.", dims: [34, 85, 47], quality: 'DIRECT' },
    { text: "Hard work is the primary determinant of financial success in developed countries.", dims: [88, 58, 67], quality: 'DIRECT' },
    { text: "Universal healthcare is a right, not a privilege.", dims: [108, 51, 47], quality: 'DIRECT' },
    { text: "Entrepreneurs create more value for society than they capture.", dims: [87, 79, 83], dir: { 83: -1 }, quality: 'SCENARIO' },
    { text: "Automation and AI will ultimately destroy more jobs than it creates.", dims: [97, 90, 89], dir: { 90: -1, 89: -1 }, quality: 'DIRECT' },
    { text: "Globalization has hurt more workers than it has helped.", dims: [80, 55, 79], dir: { 55: -1, 79: -1 }, quality: 'DIRECT' },
    { text: "The gig economy exploits workers under the cover of 'flexibility'.", dims: [80, 81, 83], quality: 'DIRECT' },
    { text: "Taxation is a form of theft when it exceeds what is needed for basic public services.", dims: [53, 44, 85], dir: { 85: -1 }, quality: 'DIRECT' },
    { text: "Student debt forgiveness is fair to those who sacrificed to pay their own debt.", dims: [85, 47, 99], quality: 'SCENARIO' },
    { text: "Corporations have a responsibility to society that goes beyond profit.", dims: [83, 79, 38], dir: { 79: -1 }, quality: 'DIRECT' },
    { text: "Economic growth is incompatible with environmental sustainability.", dims: [38, 54, 79], dir: { 79: -1 }, quality: 'DIRECT' },
  ],
  science_tech: [
    { text: "Artificial general intelligence poses an existential risk to humanity.", dims: [90, 89, 10], dir: { 90: -1, 89: -1 }, quality: 'DIRECT' },
    { text: "We have a moral obligation to pursue human genetic enhancement.", dims: [91, 98, 37], quality: 'ABSTRACT' },
    { text: "The benefits of social media platforms outweigh their documented harms.", dims: [95, 89, 105], dir: { 105: -1 }, quality: 'DIRECT' },
    { text: "Space colonization is essential to the long-term survival of humanity.", dims: [92, 89, 38], quality: 'ABSTRACT' },
    { text: "Technology is making us less capable of deep thinking and sustained attention.", dims: [89, 95, 103], dir: { 89: -1, 95: -1 }, quality: 'DIRECT' },
    { text: "Climate change is the most urgent crisis facing humanity today.", dims: [54, 38, 93], quality: 'DIRECT' },
    { text: "Psychedelics have genuine therapeutic potential that mainstream medicine ignores.", dims: [104, 112, 107], dir: { 104: -1 }, quality: 'SCENARIO' },
    { text: "The scientific consensus on any topic should rarely be publicly questioned.", dims: [6, 13, 103], dir: { 103: -1 }, quality: 'DIRECT' },
    { text: "Nuclear energy is essential to solving the climate crisis.", dims: [93, 54, 89], quality: 'DIRECT' },
    { text: "We are likely living in a simulated reality.", dims: [4, 24, 8], dir: { 4: -1 }, quality: 'ABSTRACT' },
    { text: "Human enhancement through technology is an extension of natural evolution.", dims: [98, 91, 89], quality: 'ABSTRACT' },
    { text: "The internet has been a net positive for human knowledge and discourse.", dims: [95, 89, 103], quality: 'DIRECT' },
    { text: "Data privacy is more important than the convenience we trade it for.", dims: [96, 44, 89], dir: { 89: -1 }, quality: 'SCENARIO' },
  ],
  politics: [
    { text: "Strong borders are essential to a functioning nation-state.", dims: [48, 49, 55], dir: { 55: -1 }, quality: 'DIRECT' },
    { text: "The two-party political system is fundamentally broken.", dims: [45, 44, 60], quality: 'DIRECT' },
    { text: "Government surveillance is justified when it prevents terrorism.", dims: [96, 56, 44], dir: { 96: -1, 44: -1 }, quality: 'SCENARIO' },
    { text: "Affirmative action does more harm than good in the long run.", dims: [58, 68, 73], dir: { 68: -1, 73: -1 }, quality: 'DIRECT' },
    { text: "The right to bear arms is as important today as when it was written.", dims: [52, 44, 30], quality: 'DIRECT' },
    { text: "Political violence is sometimes justified when peaceful means have failed.", dims: [60, 30, 29], quality: 'SCENARIO' },
    { text: "Voting third party in a major election is a wasted vote.", dims: [63, 45, 44], dir: { 44: -1 }, quality: 'SCENARIO' },
    { text: "Freedom of speech must be protected even for deeply offensive views.", dims: [62, 30, 72], dir: { 72: -1 }, quality: 'DIRECT' },
    { text: "The gap between politicians and the people they represent has never been wider.", dims: [45, 13, 88], dir: { 13: -1 }, quality: 'DIRECT' },
    { text: "Protest is only effective when it disrupts — polite marches change nothing.", dims: [60, 62, 45], quality: 'SCENARIO' },
  ],
  life: [
    { text: "Regret over things you did is easier to bear than regret over things you didn't do.", dims: [109, 41, 124], quality: 'PREFERENCE' },
    { text: "Most people spend their lives pursuing things that won't make them happy.", dims: [127, 113, 88], dir: { 113: -1 }, quality: 'ABSTRACT' },
    { text: "The quality of your relationships is the single greatest predictor of life satisfaction.", dims: [119, 126, 125], quality: 'DIRECT' },
    { text: "Success without meaning is the most common form of failure.", dims: [127, 88, 79], dir: { 79: -1 }, quality: 'ABSTRACT' },
    { text: "Most people are doing the best they can with what they have.", dims: [118, 109, 43], dir: { 109: -1 }, quality: 'SCENARIO' },
    { text: "Discipline is more important than motivation for achieving anything significant.", dims: [88, 109, 42], quality: 'DIRECT' },
    { text: "The way you spend your days is the way you spend your life.", dims: [88, 127, 42], quality: 'ABSTRACT' },
    { text: "Most fear is imaginary — the thing we dread rarely arrives in the form we expect.", dims: [113, 10, 109], quality: 'ABSTRACT' },
    { text: "Boredom is underrated — it is the source of creativity and self-knowledge.", dims: [103, 115, 10], quality: 'PREFERENCE' },
    { text: "The people who seem most confident are usually the most afraid.", dims: [118, 114, 111], quality: 'ABSTRACT' },
    { text: "You become the average of the five people you spend the most time with.", dims: [78, 125, 110], dir: { 110: -1 }, quality: 'PREFERENCE' },
    { text: "Ambition and contentment are fundamentally in tension with each other.", dims: [124, 127, 88], quality: 'ABSTRACT' },
    { text: "Most of what we worry about never happens.", dims: [113, 10, 109], quality: 'PREFERENCE' },
    { text: "A person's character is revealed most clearly under pressure.", dims: [110, 42, 122], quality: 'SCENARIO' },
    { text: "The pursuit of security is the enemy of a fully lived life.", dims: [109, 41, 30], quality: 'ABSTRACT' },
  ],
};

export const PROBE_CATEGORIES: Record<string, { label: string; weight: number }> = {
  philosophy:    { label: 'Philosophy',     weight: 10 },
  religion:      { label: 'Religion',       weight: 8  },
  psychology:    { label: 'Psychology',     weight: 10 },
  relationships: { label: 'Relationships',  weight: 9  },
  society:       { label: 'Society',        weight: 10 },
  economics:     { label: 'Economics',      weight: 7  },
  science_tech:  { label: 'Science & Tech', weight: 8  },
  politics:      { label: 'Politics',       weight: 7  },
  life:          { label: 'Life',           weight: 11 },
};

export const CATEGORY_TO_DIMS: Record<string, number[]> = {
  philosophy:    [4, 5, 8, 10, 109, 127],
  religion:      [14, 15, 16, 17, 18, 22, 23, 28],
  psychology:    [109, 110, 111, 112, 113, 114, 118],
  relationships: [119, 120, 121, 122, 123, 124, 125, 126, 127],
  society:       [45, 55, 62, 63, 66, 68, 73, 78],
  economics:     [46, 47, 51, 79, 80, 82, 84, 85, 87, 88],
  science_tech:  [89, 90, 91, 92, 93, 94, 95, 96, 97, 98],
  politics:      [44, 45, 48, 49, 50, 52, 53, 54, 56, 57, 59, 60, 62],
  life:          [42, 43, 88, 118, 127, 7, 10, 124],
};

export function assignProbeQuality(source: string): QualityPreset & { source: string; assignedAt: string } {
  const preset = source === 'news' ? QUALITY_PRESETS.NEWS_REACTION
               : source === 'bank' ? QUALITY_PRESETS.SCENARIO
               : QUALITY_PRESETS.HYPOTHETICAL;
  return { ...preset, source, assignedAt: new Date().toISOString() };
}

export function buildDimensionWeights(probeOrCategory: ProbeDefinition | string, primaryDimId?: number | null): Record<number, { direction: number; weight: number }> {
  const weights: Record<number, { direction: number; weight: number }> = {};

  // New API — probe object with per-probe dimension tagging
  if (typeof probeOrCategory === 'object' && probeOrCategory.dims?.length > 0) {
    const dimWeights = [0.9, 0.5, 0.3];
    probeOrCategory.dims.forEach((dimId, idx) => {
      const direction = probeOrCategory.dir?.[dimId] ?? 1;
      weights[dimId] = { direction, weight: dimWeights[idx] || 0.2 };
    });
    return weights;
  }

  // Legacy API — category string + optional primary dim
  const category = typeof probeOrCategory === 'string' ? probeOrCategory : 'life';
  if (primaryDimId) {
    weights[primaryDimId] = { direction: 1, weight: 0.9 };
  }
  const relatedDims = CATEGORY_TO_DIMS[category] || [];
  for (const dimId of relatedDims) {
    if (dimId !== primaryDimId && !weights[dimId]) {
      weights[dimId] = { direction: 1, weight: 0.3 };
    }
  }
  return weights;
}

export function pickCategory(recentCategories: string[] = []): string {
  const cats = Object.keys(PROBE_CATEGORIES);
  const available = cats.filter(c => !recentCategories.slice(-3).includes(c));
  const pool = available.length > 0 ? available : cats;
  const totalWeight = pool.reduce((s, c) => s + PROBE_CATEGORIES[c].weight, 0);
  let rand = Math.random() * totalWeight;
  for (const cat of pool) {
    rand -= PROBE_CATEGORIES[cat].weight;
    if (rand <= 0) return cat;
  }
  return pool[0];
}

export function getProbeFromBank(category: string, usedStatements: string[] = []): ProbeDefinition {
  const pool = PROBE_BANK[category] || PROBE_BANK.life;
  const available = pool.filter(p => !usedStatements.includes(p.text));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function getBankProbe(usedTexts: string[] = [], usedCategories: string[] = []) {
  const cat = pickCategory(usedCategories);
  const probe = getProbeFromBank(cat, usedTexts);
  return { ...probe, category: cat };
}
