interface Interpretation {
  pos: string;
  neg: string;
}

const OVERRIDES: Record<string, Interpretation> = {
  "4": {
    pos: "objective reality exists independently of personal perception",
    neg: "reality is shaped by individual perception and context",
  },
  "5": {
    pos: "truth is absolute and universal, not dependent on perspective",
    neg: "truth is subjective and shaped by individual worldview",
  },
  "6": {
    pos: "scientific authority is a reliable guide for understanding the world",
    neg: "scientific authority should be questioned or is limited in scope",
  },
  "7": {
    pos: "intuition is a valid and trustworthy source of knowledge",
    neg: "intuition is unreliable and should not guide decisions",
  },
  "8": {
    pos: "multiple truths can coexist across different perspectives",
    neg: "there is one correct truth, not multiple valid versions",
  },
  "9": {
    pos: "personal experience is more valuable than data and statistics",
    neg: "data and evidence matter more than personal experience",
  },
  "10": {
    pos: "uncertainty is acceptable and a natural part of knowledge",
    neg: "certainty and clear answers are important and preferable",
  },
  "11": {
    pos: "meaningful patterns exist rather than random chance",
    neg: "events are largely random, not guided by hidden patterns",
  },
  "12": {
    pos: "traditional wisdom holds valuable knowledge worth preserving",
    neg: "traditional wisdom is outdated and should be revised",
  },
  "13": {
    pos: "experts and authorities should be trusted on their subjects",
    neg: "experts can be wrong and should be questioned critically",
  },
  "14": {
    pos: "God or a higher power exists",
    neg: "God or a higher power does not exist or is unlikely",
  },
  "15": {
    pos: "organized religion provides meaningful value to society",
    neg: "organized religion does more harm than good",
  },
  "16": {
    pos: "an afterlife or continued existence after death is real",
    neg: "there is no afterlife; death is final",
  },
  "17": {
    pos: "humans have a soul or spiritual essence beyond the physical",
    neg: "the soul is a concept, not a real entity",
  },
  "18": {
    pos: "prayer or spiritual petition has real effects",
    neg: "prayer has no measurable impact on outcomes",
  },
  "19": {
    pos: "fate or destiny guides life events and purpose",
    neg: "life events are not predetermined; people shape their own path",
  },
  "20": {
    pos: "karma — what goes around comes around — is a real force",
    neg: "karma is not a real mechanism; outcomes are unrelated to actions",
  },
  "21": {
    pos: "supernatural phenomena beyond science can and do occur",
    neg: "nothing supernatural exists; everything has a natural explanation",
  },
  "22": {
    pos: "sacred religious texts contain divine or ultimate truth",
    neg: "sacred texts are human-written and not divinely inspired",
  },
  "23": {
    pos: "miracles — events defying natural law — genuinely occur",
    neg: "miracles do not happen; extraordinary events have natural causes",
  },
  "24": {
    pos: "consciousness is more than physical brain activity",
    neg: "consciousness is purely a product of brain chemistry",
  },
  "25": {
    pos: "a life force or vital energy exists beyond physical matter",
    neg: "there is no life force beyond biological processes",
  },
  "26": {
    pos: "astrology and cosmic forces influence human behavior",
    neg: "astrology has no real influence on people's lives",
  },
  "27": {
    pos: "reincarnation or rebirth after death is possible",
    neg: "reincarnation is not real; life happens only once",
  },
  "28": {
    pos: "regular spiritual practice enriches life and wellbeing",
    neg: "spiritual practices are unnecessary for a fulfilled life",
  },
  "29": {
    pos: "moral rules are absolute and apply universally",
    neg: "morality is relative and depends on context and culture",
  },
  "30": {
    pos: "individual rights and freedoms should outweigh collective needs",
    neg: "collective welfare should take priority over individual interests",
  },
  "31": {
    pos: "good intentions matter more than the outcome of actions",
    neg: "outcomes and consequences matter more than intentions",
  },
  "32": {
    pos: "traditional moral values provide the best ethical framework",
    neg: "moral frameworks should evolve beyond traditional standards",
  },
  "33": {
    pos: "punishment effectively deters people from harmful behavior",
    neg: "punishment is not effective at preventing bad behavior",
  },
  "34": {
    pos: "social and economic inequality is fundamentally unjust",
    neg: "some inequality is natural and not inherently unjust",
  },
  "35": {
    pos: "abortion is an acceptable and personal choice",
    neg: "abortion is morally wrong and should be restricted",
  },
  "36": {
    pos: "the death penalty is a justified form of punishment",
    neg: "the death penalty is wrong and should be abolished",
  },
  "37": {
    pos: "animals have rights that deserve strong legal protection",
    neg: "human needs take clear priority over animal rights",
  },
  "38": {
    pos: "people have a moral duty to protect the environment",
    neg: "environmental protection should not override economic needs",
  },
  "39": {
    pos: "sexual behavior should follow traditional moral standards",
    neg: "sexual morality is personal and should not be judged by tradition",
  },
  "40": {
    pos: "honesty can be flexible depending on the situation",
    neg: "honesty should be absolute regardless of circumstances",
  },
  "41": {
    pos: "acting in self-interest is natural and acceptable",
    neg: "self-interest should be subordinated to the greater good",
  },
  "42": {
    pos: "suffering and hardship build character and resilience",
    neg: "suffering is not necessary for growth and should be minimized",
  },
  "43": {
    pos: "forgiveness is essential and should always be offered",
    neg: "forgiveness is not always appropriate or required",
  },
  "44": {
    pos: "a smaller, less intrusive government is preferable",
    neg: "a larger, more active government better serves the people",
  },
  "45": {
    pos: "democracy is the best system of governance",
    neg: "democracy has serious flaws and may not always be ideal",
  },
  "46": {
    pos: "free markets produce the best economic outcomes",
    neg: "free markets need significant regulation and intervention",
  },
  "47": {
    pos: "equality is more important than individual freedom",
    neg: "individual freedom should take priority over enforced equality",
  },
  "48": {
    pos: "strong border security and immigration control are important",
    neg: "borders should be more open with fewer restrictions",
  },
  "49": {
    pos: "national identity and pride are positive values",
    neg: "nationalism is divisive and should be de-emphasized",
  },
  "50": {
    pos: "a strong military is essential for national security",
    neg: "military spending should be reduced in favor of other priorities",
  },
  "51": {
    pos: "a welfare state providing social safety nets is important",
    neg: "welfare programs create dependency and should be limited",
  },
  "52": {
    pos: "individuals should have the right to own firearms",
    neg: "gun ownership should be heavily regulated or restricted",
  },
  "53": {
    pos: "taxation is essentially taking from people against their will",
    neg: "taxation is a necessary contribution to shared public services",
  },
  "54": {
    pos: "government should take strong action on climate change",
    neg: "government climate action is overreach or unnecessary",
  },
  "55": {
    pos: "immigration benefits society and should be welcomed",
    neg: "immigration should be more tightly controlled",
  },
  "56": {
    pos: "strong policing and law enforcement keep communities safe",
    neg: "policing systems need major reform or alternatives",
  },
  "57": {
    pos: "business regulation protects consumers and society",
    neg: "excessive regulation stifles innovation and growth",
  },
  "58": {
    pos: "success is primarily earned through hard work and merit",
    neg: "meritocracy is a myth; success depends on systemic factors",
  },
  "59": {
    pos: "patriotism and love of country are admirable qualities",
    neg: "patriotism can be harmful and blind people to national flaws",
  },
  "60": {
    pos: "revolutionary change is sometimes necessary for progress",
    neg: "gradual reform is preferable to revolutionary upheaval",
  },
  "61": {
    pos: "laws should be interpreted as originally written and intended",
    neg: "legal interpretation should evolve with changing times",
  },
  "62": {
    pos: "free speech should be protected even when offensive",
    neg: "speech that causes harm should have limits and consequences",
  },
  "63": {
    pos: "voting is a civic duty that everyone should fulfill",
    neg: "voting is a right, not an obligation",
  },
  "64": {
    pos: "traditional family structures are ideal for raising children",
    neg: "families come in many forms, all equally valid",
  },
  "65": {
    pos: "biological sex determines gender identity",
    neg: "gender identity is separate from and not defined by biology",
  },
  "66": {
    pos: "immigrants should assimilate into the dominant culture",
    neg: "multicultural coexistence is preferable to assimilation",
  },
  "67": {
    pos: "personal merit is the main driver of success",
    neg: "systemic advantages and disadvantages shape outcomes more than merit",
  },
  "68": {
    pos: "systemic racism exists and is a significant societal problem",
    neg: "racism is individual, not systemic; the system is fair",
  },
  "69": {
    pos: "feminism is a necessary and positive movement for equality",
    neg: "feminism has gone too far or is no longer needed",
  },
  "70": {
    pos: "LGBTQ+ rights should be fully protected and expanded",
    neg: "LGBTQ+ rights conflict with traditional values",
  },
  "71": {
    pos: "traditional gender roles serve society well",
    neg: "rigid gender roles are outdated and limiting",
  },
  "72": {
    pos: "political correctness promotes respect and inclusion",
    neg: "political correctness has gone too far and limits expression",
  },
  "73": {
    pos: "diversity in all forms strengthens communities and organizations",
    neg: "diversity efforts can be forced and counterproductive",
  },
  "74": {
    pos: "treating everyone the same regardless of race is the ideal",
    neg: "colorblindness ignores real disparities that need addressing",
  },
  "75": {
    pos: "holding people publicly accountable for harmful speech is justified",
    neg: "cancel culture is excessive and threatens open discourse",
  },
  "76": {
    pos: "privilege based on identity is real and affects opportunity",
    neg: "privilege is overstated; individual effort matters more",
  },
  "77": {
    pos: "preserving cultural traditions is important for identity",
    neg: "cultures should evolve and not cling to outdated practices",
  },
  "78": {
    pos: "strong community bonds are essential for wellbeing",
    neg: "individual autonomy is more important than community ties",
  },
  "79": {
    pos: "capitalism is the best economic system available",
    neg: "capitalism creates inequality and needs fundamental reform",
  },
  "80": {
    pos: "workers' rights and protections should be strong",
    neg: "labor regulations can hinder business and economic growth",
  },
  "81": {
    pos: "labor unions are important for protecting workers",
    neg: "unions have too much power and can harm efficiency",
  },
  "82": {
    pos: "universal basic income is a viable solution to poverty",
    neg: "UBI discourages work and is economically unsustainable",
  },
  "83": {
    pos: "corporations have a duty to serve society, not just shareholders",
    neg: "a corporation's primary duty is to its owners and profits",
  },
  "84": {
    pos: "a higher minimum wage helps workers and the economy",
    neg: "minimum wage increases hurt businesses and cost jobs",
  },
  "85": {
    pos: "wealth redistribution is necessary for a fair society",
    neg: "wealth redistribution is unfair and reduces incentive",
  },
  "86": {
    pos: "inheriting wealth is a legitimate right that should be preserved",
    neg: "large inheritances perpetuate inequality and should be taxed",
  },
  "87": {
    pos: "profit-driven enterprise drives progress and innovation",
    neg: "the profit motive often comes at the cost of social good",
  },
  "88": {
    pos: "a person's worth is strongly tied to their work and productivity",
    neg: "human value exists independently of work and economic output",
  },
  "89": {
    pos: "technology is making the world better overall",
    neg: "technology brings as many problems as it solves",
  },
  "90": {
    pos: "artificial intelligence will have a net positive impact",
    neg: "AI poses significant risks that outweigh its benefits",
  },
  "91": {
    pos: "gene editing has great potential to improve human life",
    neg: "gene editing is dangerous and crosses ethical boundaries",
  },
  "92": {
    pos: "space exploration should be a high priority for humanity",
    neg: "space spending should be redirected to problems on Earth",
  },
  "93": {
    pos: "nuclear power is a safe and important energy source",
    neg: "nuclear power is too risky and should be phased out",
  },
  "94": {
    pos: "vaccines are safe, effective, and essential for public health",
    neg: "vaccine safety concerns are valid and should be taken seriously",
  },
  "95": {
    pos: "social media is a net positive for connection and information",
    neg: "social media is harmful to mental health and society",
  },
  "96": {
    pos: "individual privacy should be protected even at the cost of security",
    neg: "security needs can justify some limits on personal privacy",
  },
  "97": {
    pos: "automation and job displacement are serious threats",
    neg: "automation creates more opportunities than it eliminates",
  },
  "98": {
    pos: "human enhancement through technology is desirable",
    neg: "human enhancement raises serious ethical concerns",
  },
  "99": {
    pos: "a college degree is necessary for a successful career",
    neg: "success is achievable without a college education",
  },
  "100": {
    pos: "teachers are trusted professionals who deserve autonomy",
    neg: "teachers should be held to stricter accountability measures",
  },
  "101": {
    pos: "standardized testing effectively measures student ability",
    neg: "standardized tests are flawed and fail to capture true learning",
  },
  "102": {
    pos: "parents should be able to choose their children's school",
    neg: "public education should be the focus rather than school choice",
  },
  "103": {
    pos: "critical thinking skills are more important than memorized knowledge",
    neg: "foundational knowledge and facts are essential building blocks",
  },
  "104": {
    pos: "Western medicine is the most reliable approach to healthcare",
    neg: "alternative and holistic medicine deserves equal consideration",
  },
  "105": {
    pos: "mental health is as important as physical health",
    neg: "mental health concerns can be overstated or over-diagnosed",
  },
  "106": {
    pos: "individuals should have full autonomy over their own bodies",
    neg: "society has a legitimate interest in regulating bodily choices",
  },
  "107": {
    pos: "natural remedies and products are preferable to synthetic ones",
    neg: "synthetic and manufactured solutions are often more effective",
  },
  "108": {
    pos: "healthcare is a fundamental right for all people",
    neg: "healthcare is a service that individuals should secure themselves",
  },
  "109": {
    pos: "humans have genuine free will to make their own choices",
    neg: "human behavior is largely determined by biology and circumstances",
  },
  "110": {
    pos: "personality traits are mostly fixed and unchangeable",
    neg: "personality can be significantly changed and developed over time",
  },
  "111": {
    pos: "emotions are often more reliable guides than pure logic",
    neg: "rational thinking should override emotional responses",
  },
  "112": {
    pos: "therapy and counseling are effective for improving mental health",
    neg: "therapy is overvalued; people can resolve issues on their own",
  },
  "113": {
    pos: "positive thinking has real power to improve life outcomes",
    neg: "positive thinking is overrated and can be toxic or dismissive",
  },
  "114": {
    pos: "past trauma significantly shapes who a person becomes",
    neg: "people can fully overcome trauma; it doesn't define them",
  },
  "115": {
    pos: "meditation and mindfulness have genuine mental health benefits",
    neg: "meditation is overhyped and not meaningfully different from rest",
  },
  "116": {
    pos: "intelligence is largely fixed from birth",
    neg: "intelligence can be significantly developed through effort",
  },
  "117": {
    pos: "consciousness may continue in some form after physical death",
    neg: "consciousness ends completely when the brain dies",
  },
  "118": {
    pos: "humans are fundamentally good-natured",
    neg: "humans are primarily self-serving and need external constraints",
  },
  "119": {
    pos: "monogamy is the ideal form of romantic partnership",
    neg: "monogamy is not the only valid relationship structure",
  },
  "120": {
    pos: "marriage is a sacred or deeply meaningful institution",
    neg: "marriage is just a legal arrangement, not inherently sacred",
  },
  "121": {
    pos: "children are best raised by two parents in a stable home",
    neg: "children can thrive in many family configurations",
  },
  "122": {
    pos: "loyalty to people and institutions is a core virtue",
    neg: "loyalty should be conditional and not demanded unconditionally",
  },
  "123": {
    pos: "forgiveness should be conditional on the offender's actions",
    neg: "forgiveness should be offered freely regardless of circumstances",
  },
  "124": {
    pos: "healthy competition drives people to do their best",
    neg: "competition is often harmful and cooperation is preferable",
  },
  "125": {
    pos: "most strangers can generally be trusted",
    neg: "caution around strangers is wise; trust must be earned",
  },
  "126": {
    pos: "people have a duty to contribute to civic life and society",
    neg: "civic participation is optional, not obligatory",
  },
  "127": {
    pos: "suffering can give life deeper meaning and purpose",
    neg: "suffering has no inherent meaning and should be avoided",
  },
};

function getIntensity(displayVal: number): string {
  const abs = Math.abs(displayVal);
  if (abs < 0.6) return "are fairly split on whether";
  if (abs < 1.8) return "slightly lean toward the view that";
  if (abs < 3.0) return "generally lean toward the view that";
  return "strongly lean toward the view that";
}

const CATEGORY_INTERPRETATIONS: Record<string, Interpretation> = {
  epistemology: {
    pos: "knowledge comes from established authorities, tradition, and clear absolutes",
    neg: "knowledge is subjective, experiential, and open to multiple perspectives",
  },
  spirituality: {
    pos: "spiritual and religious beliefs play a meaningful role in life",
    neg: "secular, materialist views over spiritual or religious frameworks",
  },
  morality: {
    pos: "traditional, absolute moral standards and personal responsibility",
    neg: "progressive, contextual ethics and collective moral frameworks",
  },
  politics: {
    pos: "conservative governance, free markets, strong national identity, and individual liberty",
    neg: "progressive governance, regulation, social programs, and collective equality",
  },
  social: {
    pos: "traditional social structures, cultural preservation, and conventional norms",
    neg: "progressive social change, diversity initiatives, and evolving cultural norms",
  },
  economics: {
    pos: "free-market capitalism, limited regulation, and merit-based outcomes",
    neg: "economic regulation, worker protections, and wealth redistribution",
  },
  science_tech: {
    pos: "technology optimism, embracing innovation, and scientific progress",
    neg: "caution toward technology, concern about risks, and skepticism of tech solutions",
  },
  education: {
    pos: "traditional education models, standardized measures, and institutional trust",
    neg: "educational reform, critical thinking emphasis, and alternative approaches",
  },
  health: {
    pos: "conventional medicine, institutional healthcare, and established treatments",
    neg: "holistic health approaches, body autonomy, and alternative wellness",
  },
  psychology: {
    pos: "fixed traits, free will, positive thinking, and spiritual consciousness",
    neg: "growth mindset, determinism, evidence-based therapy, and material consciousness",
  },
  relationships: {
    pos: "traditional relationship structures, loyalty, and conventional family values",
    neg: "flexible relationship models, conditional commitments, and individualism",
  },
};

export function getCategoryInterpretation(categoryKey: string, displayVal: number, groupLabel: string): string {
  const cat = CATEGORY_INTERPRETATIONS[categoryKey];
  if (!cat) return "";

  const abs = Math.abs(displayVal);
  if (abs < 0.6) {
    return `${groupLabel} is fairly split on these topics — no clear lean in either direction.`;
  }

  const intensity = getIntensity(displayVal);
  const statement = displayVal > 0 ? cat.pos : cat.neg;
  return `${groupLabel} ${intensity} ${statement}.`;
}

export function getBeliefInterpretation(dimId: string, displayVal: number): string {
  const override = OVERRIDES[dimId];
  if (!override) return "";

  const abs = Math.abs(displayVal);
  if (abs < 0.6) {
    return `Respondents are fairly split on this topic — no clear lean in either direction.`;
  }

  const intensity = getIntensity(displayVal);
  const statement = displayVal > 0 ? override.pos : override.neg;
  return `Respondents ${intensity} ${statement}.`;
}
