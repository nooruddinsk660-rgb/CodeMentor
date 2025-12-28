const User = require('../users/user.model'); // Adjust path to your existing User model
const SkillEvent = require('./skillEvent.model');
const { calculateGravity } = require('../../common/utils/gravityMath');

const runGravityCycle = async () => {
  console.log("🪐 Starting Gravity Cycle...");
  
  // 1. Get all users
  const users = await User.find({});
  
  for (const user of users) {
    if (!user.skills || user.skills.length === 0) continue;
    
    let userChanged = false;

    // 2. Iterate through every skill
    for (let i = 0; i < user.skills.length; i++) {
      const skill = user.skills[i];
      
      // Calculate physics
      const physics = calculateGravity(
        skill, 
        skill.lastUsed || user.updatedAt, // Fallback if specific skill date missing
        user.streak || 0
      );

      // Check if gravity changed significantly (optimization)
      const currentScore = skill.gravityScore || (skill.level / 100); 
      const delta = physics.gravity - currentScore;

      if (Math.abs(delta) > 0.001) {
        // Record the event
        await SkillEvent.create({
          userId: user._id,
          skillName: skill.name,
          eventType: delta < 0 ? 'DECAY' : 'GROWTH',
          delta: delta,
          currentGravity: physics.gravity
        });

        // Update the user object in memory
        user.skills[i].gravityScore = physics.gravity; // You need to add this field to User schema
        userChanged = true;
      }
    }

    // 3. Save User if changed
    if (userChanged) {
      await user.save();
      console.log(`Updated gravity for user: ${user.username}`);
    }
  }
  console.log("🪐 Gravity Cycle Complete.");
};

module.exports = { runGravityCycle };