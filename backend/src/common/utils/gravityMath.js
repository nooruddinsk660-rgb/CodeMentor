/**
 * Calculates Skill Gravity (Gs)
 * Formula: Gs = (Proficiency * IndustryWeight * (1 + Consistency)) / (1 + (Time * Decay))
 */
const calculateGravity = (skill, lastActivityDate, streakCount = 0) => {
  const NOW = new Date();
  const ONE_DAY = 1000 * 60 * 60 * 24;
  
  // 1. Time Component (T) - Days since last active
  const lastActive = lastActivityDate ? new Date(lastActivityDate) : NOW;
  const daysInactive = Math.max(0, (NOW - lastActive) / ONE_DAY);

  // 2. Proficiency (P) - Normalize 0-100 to 0-1
  // If your DB stores 'Expert', map it: Expert=1.0, Intermediate=0.6, Beginner=0.3
  let P = 0.1; 
  if (typeof skill.level === 'number') P = skill.level / 100; // Assuming 0-100 scale
  // Add mapping logic here if skill.level is a string

  // 3. Decay Constant (Lambda)
  // Frameworks decay fast (0.05), Core languages slow (0.001)
  const fastDecay = ['react', 'vue', 'angular', 'nextjs', 'aws'];
  const lambda = fastDecay.some(k => skill.name.toLowerCase().includes(k)) ? 0.05 : 0.01;

  // 4. Consistency Multiplier (C)
  // Small boost for keeping a streak
  const C = Math.min(streakCount * 0.05, 0.5); // Max 50% boost

  // 5. Industry Weight (I)
  // For now, default to 1. In Phase 2, we fetch this from AI service.
  const I = 1.0;

  // THE FORMULA
  const denominator = 1 + (daysInactive * lambda);
  const numerator = (P * I) * (1 + C);
  
  const gravity = numerator / denominator;

  return {
    gravity: parseFloat(gravity.toFixed(4)),
    daysInactive: Math.floor(daysInactive),
    decayFactor: lambda
  };
};

module.exports = { calculateGravity };