// 128-Dimension Human Belief DNA Framework
// Pure domain logic — no framework dependencies

export interface Dimension {
  id: number;      // 4-127
  cat: string;     // category key
  name: string;
  short: string;
  desc: string;
}

export interface Category {
  label: string;
  color: string;
  positions: string;
}

// ── Identity Metadata (positions 0-14) ───────────────────────
// Position 0:    Century (0=1900s, 1=2000s)
// Position 1-2:  Birth year within century (00-99)
// Position 3-4:  Birth month (01-12)
// Position 5-6:  Birth day (01-31)
// Position 7:    Sex (0=F, 1=M, 2=Intersex, 5=PNS, 9=NB)
// Position 8-10: Country code (ISO 3166-1 numeric, e.g. 840=US, 826=GB)
// Position 11-15: Zip/postal code (5 chars)

// ── Belief Dimensions (positions 16-139) ─────────────────────
// Scale: 0=Strongly False/Disagree, 5=Neutral/Superposition, 9=Strongly True/Agree

export const DIMENSIONS: Dimension[] = [
  // ── A: EPISTEMOLOGY & REALITY (4-13)
  { id:4,  cat:'epistemology', name:'Objective Reality Exists',        short:'Obj. Reality',  desc:'External world exists independent of observation' },
  { id:5,  cat:'epistemology', name:'Truth is Absolute',               short:'Abs. Truth',    desc:'Universal truths exist vs truth is relative/contextual' },
  { id:6,  cat:'epistemology', name:'Science as Ultimate Authority',   short:'Sci. Authority',desc:'Scientific method is the best path to truth' },
  { id:7,  cat:'epistemology', name:'Intuition as Valid Knowledge',    short:'Intuition',     desc:'Gut feelings provide real knowledge (System 1 preference)' },
  { id:8,  cat:'epistemology', name:'Multiple Truths Coexist',         short:'Multi-Truth',   desc:'Contradictory statements can both be true — QUANTUM CORE' },
  { id:9,  cat:'epistemology', name:'Personal Experience Over Data',   short:'Experience>Data',desc:'Lived experience trumps statistical evidence' },
  { id:10, cat:'epistemology', name:'Uncertainty is Acceptable',       short:'Uncertainty OK',desc:'Comfortable not having definitive answers' },
  { id:11, cat:'epistemology', name:'Pattern Over Randomness',         short:'Patterns',      desc:'Events happen for reasons vs randomness/chance' },
  { id:12, cat:'epistemology', name:'Tradition Holds Wisdom',          short:'Tradition Wise',desc:'Old ways contain valuable truth' },
  { id:13, cat:'epistemology', name:'Expertise Should Be Trusted',     short:'Trust Experts', desc:'Defer to credentialed experts' },

  // ── B: SPIRITUALITY & METAPHYSICS (14-28)
  { id:14, cat:'spirituality', name:'God/Higher Power Exists',         short:'God Exists',    desc:'Deity or transcendent force exists' },
  { id:15, cat:'spirituality', name:'Organized Religion is Valuable',  short:'Religion Value',desc:'Institutional religion serves important function' },
  { id:16, cat:'spirituality', name:'Afterlife Exists',                short:'Afterlife',     desc:'Consciousness continues after death' },
  { id:17, cat:'spirituality', name:'Soul/Non-Physical Self',          short:'Soul Exists',   desc:'Humans have immaterial essence' },
  { id:18, cat:'spirituality', name:'Prayer/Meditation Has Power',     short:'Prayer Works',  desc:'Contemplative practices affect reality' },
  { id:19, cat:'spirituality', name:'Fate/Destiny is Real',            short:'Fate/Destiny',  desc:'Events are predetermined' },
  { id:20, cat:'spirituality', name:'Karma/Cosmic Justice',            short:'Karma',         desc:'Universe balances moral accounts' },
  { id:21, cat:'spirituality', name:'Supernatural Phenomena Exist',    short:'Supernatural',  desc:'Ghosts, ESP, paranormal are real' },
  { id:22, cat:'spirituality', name:'Sacred Texts Literally True',     short:'Literal Texts', desc:'Religious scriptures are factual' },
  { id:23, cat:'spirituality', name:'Miracles Can Happen',             short:'Miracles',      desc:'Natural laws can be suspended' },
  { id:24, cat:'spirituality', name:'Consciousness is Fundamental',    short:'Consciousness', desc:'Mind/awareness is basic feature of universe' },
  { id:25, cat:'spirituality', name:'Energy/Chi/Life Force Exists',    short:'Life Force',    desc:'Non-physical energy permeates living things' },
  { id:26, cat:'spirituality', name:'Astrology/Cosmic Influence',      short:'Astrology',     desc:'Celestial bodies affect human affairs' },
  { id:27, cat:'spirituality', name:'Reincarnation is Real',           short:'Reincarnation', desc:'Souls inhabit multiple lives' },
  { id:28, cat:'spirituality', name:'Spiritual Practice is Essential', short:'Spiritual Practice', desc:'Regular spiritual discipline necessary for fulfillment' },

  // ── C: MORALITY & ETHICS (29-43)
  { id:29, cat:'morality', name:'Absolute Moral Truth Exists',         short:'Moral Absolutes',desc:'Universal right and wrong vs cultural relativism' },
  { id:30, cat:'morality', name:'Individual Rights Trump Collective',  short:'Individual>Collective',desc:'Personal freedom vs community welfare priority' },
  { id:31, cat:'morality', name:'Intentions > Outcomes',               short:'Intent>Outcome', desc:'Deontological vs consequentialist ethics' },
  { id:32, cat:'morality', name:'Tradition Guides Morality',           short:'Trad. Morality', desc:'Moral wisdom from past vs progressive ethics' },
  { id:33, cat:'morality', name:'Punishment Deters Crime',             short:'Punishment Deters',desc:'Retributive vs rehabilitative justice' },
  { id:34, cat:'morality', name:'Wealth Inequality is Unjust',         short:'Inequality Unjust',desc:'Economic disparity is moral problem' },
  { id:35, cat:'morality', name:'Abortion is Morally Acceptable',      short:'Abortion OK',    desc:'Reproductive autonomy vs fetal rights' },
  { id:36, cat:'morality', name:'Death Penalty is Justified',          short:'Death Penalty',  desc:'State execution is morally permissible' },
  { id:37, cat:'morality', name:'Animals Have Rights',                  short:'Animal Rights',  desc:'Non-human moral consideration' },
  { id:38, cat:'morality', name:'Environmental Protection is Duty',    short:'Env. Duty',      desc:'Stewardship obligation to nature' },
  { id:39, cat:'morality', name:'Sexual Morality is Important',        short:'Sexual Morality',desc:'Sexual behavior has moral dimensions' },
  { id:40, cat:'morality', name:'Lying is Sometimes Necessary',        short:'Situational Honesty',desc:'Situational ethics vs absolute honesty' },
  { id:41, cat:'morality', name:'Self-Interest is Valid',              short:'Self-Interest',  desc:'Rational egoism vs altruism priority' },
  { id:42, cat:'morality', name:'Suffering Builds Character',          short:'Suffering Builds',desc:'Hardship has redemptive value' },
  { id:43, cat:'morality', name:'Forgiveness is Essential',            short:'Forgiveness',    desc:'Letting go of grievance is necessary' },

  // ── D: POLITICAL & GOVERNANCE (44-63)
  { id:44, cat:'politics', name:'Government Should Be Limited',        short:'Small Govt',     desc:'Minimal state vs active government' },
  { id:45, cat:'politics', name:'Democracy is Best System',            short:'Democracy',      desc:'Popular sovereignty vs other governance' },
  { id:46, cat:'politics', name:'Free Markets Work Best',              short:'Free Markets',   desc:'Capitalism vs planned economy' },
  { id:47, cat:'politics', name:'Equality > Freedom',                  short:'Equality>Freedom',desc:'Egalitarianism vs libertarianism' },
  { id:48, cat:'politics', name:'Borders Should Be Protected',         short:'Border Security',desc:'National sovereignty vs open borders' },
  { id:49, cat:'politics', name:'Nationalism is Positive',             short:'Nationalism',    desc:'National identity/pride is good' },
  { id:50, cat:'politics', name:'Military Strength Essential',         short:'Military',       desc:'Strong defense necessary for security' },
  { id:51, cat:'politics', name:'Welfare State is Necessary',          short:'Welfare State',  desc:'Government safety net is essential' },
  { id:52, cat:'politics', name:'Gun Rights are Fundamental',          short:'Gun Rights',     desc:'Individual right to bear arms' },
  { id:53, cat:'politics', name:'Taxation is Theft',                   short:'Tax is Theft',   desc:'Coercive taxation vs social contract' },
  { id:54, cat:'politics', name:'Climate Action Requires Govt',        short:'Govt Climate',   desc:'State intervention needed for environment' },
  { id:55, cat:'politics', name:'Immigration Strengthens Society',     short:'Pro-Immigration',desc:'Diversity/immigration is net positive' },
  { id:56, cat:'politics', name:'Police Powers Should Be Strong',      short:'Strong Police',  desc:'Law enforcement authority vs civil liberties' },
  { id:57, cat:'politics', name:'Regulation Protects People',          short:'Regulation',     desc:'Government oversight vs free market' },
  { id:58, cat:'politics', name:'Meritocracy is Fair',                 short:'Meritocracy',    desc:'Outcomes should reflect ability/effort' },
  { id:59, cat:'politics', name:'Patriotism is Important',             short:'Patriotism',     desc:'Love of country is virtue' },
  { id:60, cat:'politics', name:'Revolution Sometimes Necessary',      short:'Revolution',     desc:'Radical change vs incremental reform' },
  { id:61, cat:'politics', name:'Tradition Should Guide Law',          short:'Originalism',    desc:'Originalism vs living constitution' },
  { id:62, cat:'politics', name:'Free Speech is Absolute',             short:'Free Speech',    desc:'No limits on expression vs hate speech restrictions' },
  { id:63, cat:'politics', name:'Voting is Civic Duty',                short:'Vote Duty',      desc:'Participation obligation in democracy' },

  // ── E: SOCIAL & CULTURAL (64-78)
  { id:64, cat:'social', name:'Traditional Family is Ideal',           short:'Trad. Family',   desc:'Nuclear family vs diverse family structures' },
  { id:65, cat:'social', name:'Gender is Biological',                  short:'Bio. Gender',    desc:'Sex as binary/fixed vs spectrum/fluid' },
  { id:66, cat:'social', name:'Cultural Assimilation is Good',         short:'Assimilation',   desc:'Melting pot vs multiculturalism' },
  { id:67, cat:'social', name:'Meritocracy Explains Success',          short:'Merit=Success',  desc:'Achievement reflects individual merit' },
  { id:68, cat:'social', name:'Systemic Racism Exists',                short:'Systemic Racism',desc:'Structural inequality vs individual prejudice' },
  { id:69, cat:'social', name:'Feminism is Necessary',                 short:'Feminism',       desc:'Gender equality movement value' },
  { id:70, cat:'social', name:'LGBTQ+ Rights are Human Rights',        short:'LGBTQ+ Rights',  desc:'Sexual orientation/gender identity acceptance' },
  { id:71, cat:'social', name:'Traditional Gender Roles Work',         short:'Gender Roles',   desc:'Conventional masculine/feminine division' },
  { id:72, cat:'social', name:'Political Correctness Helps',           short:'PC Culture',     desc:'Inclusive language vs free expression' },
  { id:73, cat:'social', name:'Diversity is Strength',                 short:'Diversity',      desc:'Heterogeneity improves outcomes' },
  { id:74, cat:'social', name:'Colorblindness is Goal',                short:'Colorblindness', desc:'Ignore race vs acknowledge racial identity' },
  { id:75, cat:'social', name:'Cancel Culture is Problem',             short:'Cancel Culture', desc:'Accountability vs mob justice concern' },
  { id:76, cat:'social', name:'Privilege is Real',                     short:'Privilege',      desc:'Unearned advantages exist' },
  { id:77, cat:'social', name:'Tradition Preserves Culture',           short:'Cultural Trad.', desc:'Conservation vs progress in culture' },
  { id:78, cat:'social', name:'Community Over Individualism',          short:'Community',      desc:'Collective identity vs personal autonomy' },

  // ── F: ECONOMICS & WORK (79-88)
  { id:79, cat:'economics', name:'Capitalism is Ethical',              short:'Capitalism OK',  desc:'Market economy morally sound' },
  { id:80, cat:'economics', name:'Workers Deserve Protections',        short:'Labor Rights',   desc:'Labor rights vs business flexibility' },
  { id:81, cat:'economics', name:'Unions are Beneficial',              short:'Unions',         desc:'Collective bargaining value' },
  { id:82, cat:'economics', name:'Universal Basic Income Needed',      short:'UBI',            desc:'Guaranteed income vs work requirement' },
  { id:83, cat:'economics', name:'Corporations Serve Society',         short:'Corp. Duty',     desc:'Stakeholder vs shareholder primacy' },
  { id:84, cat:'economics', name:'Minimum Wage Should Rise',           short:'Min. Wage',      desc:'Wage floor vs market determination' },
  { id:85, cat:'economics', name:'Wealth Should Be Redistributed',     short:'Redistribution', desc:'Progressive taxation, wealth transfer' },
  { id:86, cat:'economics', name:'Inherited Wealth is Fair',           short:'Inheritance',    desc:'Generational transfer vs estate taxes' },
  { id:87, cat:'economics', name:'Profit Motive Drives Innovation',    short:'Profit=Progress',desc:'Capitalism creates progress' },
  { id:88, cat:'economics', name:'Work Defines Worth',                 short:'Work=Worth',     desc:'Protestant work ethic strength' },

  // ── G: SCIENCE & TECHNOLOGY (89-98)
  { id:89, cat:'science_tech', name:'Technology Improves Life',        short:'Tech Optimism',  desc:'Techno-optimism vs skepticism' },
  { id:90, cat:'science_tech', name:'AI Will Help Humanity',           short:'AI Positive',    desc:'Artificial intelligence benefit vs threat' },
  { id:91, cat:'science_tech', name:'Genetic Engineering Acceptable',  short:'Gene Editing',   desc:'CRISPR, human enhancement ethics' },
  { id:92, cat:'science_tech', name:'Space Exploration is Priority',   short:'Space Priority', desc:'Cosmic expansion value' },
  { id:93, cat:'science_tech', name:'Nuclear Power is Safe',           short:'Nuclear Power',  desc:'Nuclear energy acceptance' },
  { id:94, cat:'science_tech', name:'Vaccines Are Essential',          short:'Vaccines',       desc:'Immunization trust' },
  { id:95, cat:'science_tech', name:'Social Media is Net Positive',    short:'Social Media OK',desc:'Digital connection value' },
  { id:96, cat:'science_tech', name:'Privacy > Security',              short:'Privacy>Security',desc:'Surveillance vs safety trade-off' },
  { id:97, cat:'science_tech', name:'Automation Threatens Jobs',       short:'Auto. Threat',   desc:'Technology unemployment concern' },
  { id:98, cat:'science_tech', name:'Human Enhancement is Good',       short:'Enhancement',    desc:'Cybernetics, augmentation acceptance' },

  // ── H: EDUCATION & KNOWLEDGE (99-103)
  { id:99,  cat:'education', name:'College Education is Necessary',    short:'College Needed', desc:'Higher education value' },
  { id:100, cat:'education', name:'Teachers Should Be Trusted',        short:'Trust Teachers', desc:'Educational authority respect' },
  { id:101, cat:'education', name:'Standardized Testing is Fair',      short:'Std. Testing',   desc:'Assessment methodology belief' },
  { id:102, cat:'education', name:'School Choice Improves Education',  short:'School Choice',  desc:'Market vs public education' },
  { id:103, cat:'education', name:'Critical Thinking Over Memorization',short:'Critical Think',desc:'Pedagogy preference' },

  // ── I: HEALTH & BODY (104-108)
  { id:104, cat:'health', name:'Western Medicine is Best',             short:'Western Med.',   desc:'Allopathic vs alternative medicine' },
  { id:105, cat:'health', name:'Mental Health = Physical Health',      short:'Mental Health',  desc:'Mind-body integration' },
  { id:106, cat:'health', name:'Body Autonomy is Absolute',            short:'Body Autonomy',  desc:'Self-determination over physical form' },
  { id:107, cat:'health', name:'Natural is Better',                    short:'Natural>Synth.', desc:'Organic, non-synthetic preference' },
  { id:108, cat:'health', name:'Healthcare is Human Right',            short:'Healthcare Right',desc:'Universal coverage vs market-based' },

  // ── J: PSYCHOLOGY & SELF (109-118)
  { id:109, cat:'psychology', name:'Free Will Exists',                 short:'Free Will',      desc:'Agency vs determinism' },
  { id:110, cat:'psychology', name:'Personality is Fixed',             short:'Fixed Personality',desc:'Traits stable vs growth mindset' },
  { id:111, cat:'psychology', name:'Emotions Should Guide Decisions',  short:'Emotion>Reason', desc:'Affective vs rational choice' },
  { id:112, cat:'psychology', name:'Therapy is Valuable',              short:'Therapy Works',  desc:'Mental health intervention acceptance' },
  { id:113, cat:'psychology', name:'Positive Thinking Works',          short:'Positive Think', desc:'Mindset affects outcomes, manifestation' },
  { id:114, cat:'psychology', name:'Trauma Shapes Identity',           short:'Trauma Shapes',  desc:'Past determines present' },
  { id:115, cat:'psychology', name:'Meditation Changes Brain',         short:'Meditation',     desc:'Contemplative neuroscience acceptance' },
  { id:116, cat:'psychology', name:'Intelligence is Innate',           short:'IQ Fixed',       desc:'Nature vs nurture on cognition' },
  { id:117, cat:'psychology', name:'Consciousness Survives Death',     short:'Conscious.>Death',desc:'Mind-body dualism extreme' },
  { id:118, cat:'psychology', name:'Humans Are Basically Good',        short:'Human Goodness', desc:'Optimistic vs pessimistic human nature' },

  // ── K: RELATIONSHIPS & SOCIETY (119-127)
  { id:119, cat:'relationships', name:'Monogamy is Natural',           short:'Monogamy',       desc:'Pair bonding vs polyamory' },
  { id:120, cat:'relationships', name:'Marriage is Sacred',            short:'Marriage Sacred',desc:'Institution importance' },
  { id:121, cat:'relationships', name:'Children Need Two Parents',     short:'Two Parents',    desc:'Family structure requirement' },
  { id:122, cat:'relationships', name:'Loyalty is Ultimate Virtue',    short:'Loyalty',        desc:'In-group commitment priority' },
  { id:123, cat:'relationships', name:'Forgiveness Requires Repentance',short:'Cond. Forgiveness',desc:'Conditional vs unconditional forgiveness' },
  { id:124, cat:'relationships', name:'Competition Improves People',   short:'Competition',    desc:'Rivalry vs cooperation preference' },
  { id:125, cat:'relationships', name:'Strangers Can Be Trusted',      short:'Trust Strangers',desc:'Default trust vs suspicion, social capital' },
  { id:126, cat:'relationships', name:'Community Service is Obligation',short:'Civic Duty',    desc:'Communitarianism measure' },
  { id:127, cat:'relationships', name:'Suffering Has Meaning',         short:'Suffering=Meaning',desc:'Existential vs nihilistic orientation' },
];

export const CATEGORIES: Record<string, Category> = {
  epistemology:  { label: 'Epistemology',    color: '#6c63ff', positions: '4-13'   },
  spirituality:  { label: 'Spirituality',    color: '#ff9f43', positions: '14-28'  },
  morality:      { label: 'Morality',        color: '#ee5a24', positions: '29-43'  },
  politics:      { label: 'Politics',        color: '#0097e6', positions: '44-63'  },
  social:        { label: 'Social',          color: '#44bd32', positions: '64-78'  },
  economics:     { label: 'Economics',       color: '#e1b12c', positions: '79-88'  },
  science_tech:  { label: 'Science & Tech',  color: '#00d2d3', positions: '89-98'  },
  education:     { label: 'Education',       color: '#c56cf0', positions: '99-103' },
  health:        { label: 'Health',          color: '#ff4757', positions: '104-108'},
  psychology:    { label: 'Psychology',      color: '#2ed573', positions: '109-118'},
  relationships: { label: 'Relationships',   color: '#ff6b81', positions: '119-127'},
};

export function getDimension(id: number): Dimension | undefined {
  return DIMENSIONS.find(d => d.id === id);
}

export function getDimensionsByCategory(cat: string): Dimension[] {
  return DIMENSIONS.filter(d => d.cat === cat);
}
