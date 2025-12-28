export const generateDailyQuests = (intelligence, skills, streak) => {
  const quests = [];

  // 1. URGENT: Fix Decaying Skills (Drift Warnings)
  if (intelligence?.drift_warnings?.length > 0) {
    // Extract the skill name from the warning string (e.g., "⚠️ High Decay in React...")
    const warning = intelligence.drift_warnings[0]; 
    // Simple regex to find the skill name if it matches your warning format
    const skillName = warning.split(' in ')[1]?.split(':')[0] || "Core Skill";
    
    quests.push({
      id: 'drift-fix',
      type: 'RECOVERY',
      title: `Revive ${skillName}`,
      desc: 'Your proficiency is high but gravity is low. Build something small today.',
      xp: 50,
      icon: 'ambulance'
    });
  }

  // 2. MOMENTUM: Push High Gravity Skills
  const topSkill = skills.reduce((prev, current) => 
    (prev.gravityScore > current.gravityScore) ? prev : current
  , { gravityScore: 0 });

  if (topSkill.name && topSkill.gravityScore > 0.7) {
    quests.push({
      id: 'momentum',
      type: 'DEEP_DIVE',
      title: `Master ${topSkill.name}`,
      desc: `You are on fire with ${topSkill.name}. Learn one advanced concept today.`,
      xp: 30,
      icon: 'rocket_launch'
    });
  }

  // 3. CONSISTENCY: GitHub Activity
  quests.push({
    id: 'consistency',
    type: 'ROUTINE',
    title: 'Commit Code',
    desc: `Keep your ${streak}-day streak alive. Push at least one commit.`,
    xp: 20,
    icon: 'commit'
  });

  // 4. EXPLORATION: If mostly stable, suggest something new
  if (quests.length < 3) {
    quests.push({
      id: 'explore',
      type: 'DISCOVERY',
      title: 'Explore System Design',
      desc: 'Read one article about Scalability or Microservices.',
      xp: 25,
      icon: 'menu_book'
    });
  }

  return quests;
};