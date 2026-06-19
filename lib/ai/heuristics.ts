export const COHORTS = {
  BEAUTY_PERSONAL_CARE: 'Beauty & Personal Care',
  FASHION_LIFESTYLE: 'Fashion & Lifestyle',
  FITNESS_WELLNESS: 'Fitness & Wellness',
  FOOD_COOKING: 'Food & Cooking',
  TECH_GADGETS: 'Tech & Gadgets',
  TRAVEL: 'Travel',
  ENTERTAINMENT_COMEDY: 'Entertainment & Comedy',
  EDUCATION_KNOWLEDGE: 'Education & Knowledge',
  PARENTING_FAMILY: 'Parenting & Family',
  DEVOTIONAL_SPIRITUAL: 'Devotional & Spiritual',
};

// Default demographic baselines by cohort
const COHORT_BASELINES = {
  [COHORTS.BEAUTY_PERSONAL_CARE]: { female: 85.0, male: 10.0, undisclosed: 5.0 },
  [COHORTS.FASHION_LIFESTYLE]: { female: 75.0, male: 20.0, undisclosed: 5.0 },
  [COHORTS.PARENTING_FAMILY]: { female: 80.0, male: 15.0, undisclosed: 5.0 },
  [COHORTS.FITNESS_WELLNESS]: { female: 45.0, male: 50.0, undisclosed: 5.0 },
  [COHORTS.TECH_GADGETS]: { female: 15.0, male: 80.0, undisclosed: 5.0 },
  [COHORTS.FOOD_COOKING]: { female: 60.0, male: 30.0, undisclosed: 10.0 },
  [COHORTS.TRAVEL]: { female: 50.0, male: 40.0, undisclosed: 10.0 },
  [COHORTS.ENTERTAINMENT_COMEDY]: { female: 40.0, male: 50.0, undisclosed: 10.0 },
  [COHORTS.EDUCATION_KNOWLEDGE]: { female: 40.0, male: 50.0, undisclosed: 10.0 },
  [COHORTS.DEVOTIONAL_SPIRITUAL]: { female: 50.0, male: 40.0, undisclosed: 10.0 },
};

const DEFAULT_BASELINE = { female: 50.0, male: 40.0, undisclosed: 10.0 };

export function analyzeBioHeuristics(bio: string, externalUrl: string | null) {
  const text = (bio || '').toLowerCase();
  const link = (externalUrl || '').toLowerCase();

  const scores = {
    [COHORTS.BEAUTY_PERSONAL_CARE]: 0,
    [COHORTS.FASHION_LIFESTYLE]: 0,
    [COHORTS.FITNESS_WELLNESS]: 0,
    [COHORTS.FOOD_COOKING]: 0,
    [COHORTS.TECH_GADGETS]: 0,
    [COHORTS.TRAVEL]: 0,
    [COHORTS.ENTERTAINMENT_COMEDY]: 0,
    [COHORTS.EDUCATION_KNOWLEDGE]: 0,
    [COHORTS.PARENTING_FAMILY]: 0,
    [COHORTS.DEVOTIONAL_SPIRITUAL]: 0,
  };

  let femaleShift = 0;
  let maleShift = 0;

  // 1. Niche Tokens
  const nicheTokens = [
    { words: ['skincare', 'makeup', 'beauty', 'cosmetics', 'lipstick', 'salon', 'nail'], cohort: COHORTS.BEAUTY_PERSONAL_CARE, femaleShift: +15 },
    { words: ['ootd', 'fashion', 'styling', 'wardrobe', 'outfit', 'stylist', 'apparel'], cohort: COHORTS.FASHION_LIFESTYLE, femaleShift: +10 },
    { words: ['gym', 'yoga', 'nutrition', 'workout', 'diet', 'coach', 'fitness', 'athlete'], cohort: COHORTS.FITNESS_WELLNESS, maleShift: +5 },
    { words: ['recipe', 'foodie', 'cooking', 'chef', 'bake', 'cuisine', 'gourmet', 'eat'], cohort: COHORTS.FOOD_COOKING, femaleShift: +5 },
    { words: ['travel', 'wanderlust', 'trip', 'mountains', 'backpacker', 'adventure'], cohort: COHORTS.TRAVEL, maleShift: 0 },
    { words: ['mom', 'parenting', 'motherhood', 'toddler', 'baby', 'family'], cohort: COHORTS.PARENTING_FAMILY, femaleShift: +20 },
    { words: ['dad', 'fatherhood'], cohort: COHORTS.PARENTING_FAMILY, maleShift: +20 },
    { words: ['faith', 'devotional', 'spiritual', 'prayer', 'blessed', 'god', 'church'], cohort: COHORTS.DEVOTIONAL_SPIRITUAL, femaleShift: 0 },
    { words: ['comedy', 'funny', 'actor', 'comedian', 'memes', 'laugh', 'joke'], cohort: COHORTS.ENTERTAINMENT_COMEDY, maleShift: 0 },
  ];

  for (const token of nicheTokens) {
    for (const word of token.words) {
      if (text.includes(word)) {
        scores[token.cohort] += 10;
        femaleShift += (token as any).femaleShift || 0;
        maleShift += (token as any).maleShift || 0;
      }
    }
  }

  // 2. Authority Tokens
  const authorityTokens = [
    { words: ['iit', 'iim', 'b.tech', 'btech', 'ai', 'developer', 'software', 'programming', 'coder', 'technology', 'gadget'], cohort: COHORTS.TECH_GADGETS, maleShift: +15 },
    { words: ['founder', 'build in public', 'ceo', 'entrepreneur', 'startup'], cohort: COHORTS.TECH_GADGETS, maleShift: +10 },
    { words: ['educator', 'mentor', 'upsc', 'finance', 'investing', 'knowledge', 'science', 'learn'], cohort: COHORTS.EDUCATION_KNOWLEDGE, maleShift: +5 },
  ];

  for (const token of authorityTokens) {
    for (const word of token.words) {
      if (text.includes(word)) {
        scores[token.cohort] += 10;
        femaleShift += (token as any).femaleShift || 0;
        maleShift += (token as any).maleShift || 0;
      }
    }
  }

  // 3. Link Demographics
  if (link) {
    if (link.includes('github.com') || link.includes('linkedin.com') || link.includes('substack.com')) {
      scores[COHORTS.TECH_GADGETS] += 15;
      scores[COHORTS.EDUCATION_KNOWLEDGE] += 10;
      maleShift += 10;
    } else if (link.includes('linktr.ee') || link.includes('msha.ke')) {
      scores[COHORTS.FASHION_LIFESTYLE] += 5;
      scores[COHORTS.ENTERTAINMENT_COMEDY] += 5;
    } else if (link.includes('youtube.com')) {
      scores[COHORTS.ENTERTAINMENT_COMEDY] += 5;
    }
  }

  // Identify primary cohort
  let primaryCohort = COHORTS.FASHION_LIFESTYLE;
  let maxScore = 0;
  for (const [c, s] of Object.entries(scores)) {
    if (s > maxScore) {
      maxScore = s;
      primaryCohort = c;
    }
  }

  // Calculate demographics
  let demographics = { ...(COHORT_BASELINES[primaryCohort] || DEFAULT_BASELINE) };

  if (femaleShift > maleShift) {
    demographics.female = Math.min(95.0, demographics.female + femaleShift);
    demographics.male = Math.max(2.0, 100.0 - demographics.female - demographics.undisclosed);
  } else if (maleShift > femaleShift) {
    demographics.male = Math.min(95.0, demographics.male + maleShift);
    demographics.female = Math.max(2.0, 100.0 - demographics.male - demographics.undisclosed);
  }

  return {
    cohort: primaryCohort,
    femalePct: parseFloat(demographics.female.toFixed(2)),
    malePct: parseFloat(demographics.male.toFixed(2)),
    undisclosedPct: parseFloat(demographics.undisclosed.toFixed(2)),
  };
}
