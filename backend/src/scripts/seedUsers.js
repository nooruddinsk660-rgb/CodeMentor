const mongoose = require('mongoose');
const User = require('../modules/users/user.model');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Try loading from standard location
if (!process.env.MONGODB_URI) {
    // Fallback for different execution contexts
    dotenv.config();
}

const dummyUsers = [
    {
        username: 'neo_coder',
        email: 'neo@matrix.com',
        password: 'password123',
        fullName: 'Thomas Anderson',
        bio: 'Looking for the One. Expert in simulated realities and Java.',
        skills: [], // Will need valid ObjectIds, but leaving empty for now or skipping
        xp: 5000,
        level: 10,
        company: 'MetaCortex',
        location: 'Lower Downtown',
        skillEmbedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Dummy vector
    },
    {
        username: 'trinity_sec',
        email: 'trinity@zion.org',
        password: 'password123',
        fullName: 'Trinity',
        bio: 'Hacker. Unix expert. I can fly helicopters.',
        xp: 8000,
        level: 15,
        company: 'Zion Defense',
        location: 'Nebuchadnezzar',
        skillEmbedding: [0.2, 0.3, 0.1, 0.9, 0.8]
    },
    {
        username: 'morpheus_lead',
        email: 'morpheus@zion.org',
        password: 'password123',
        fullName: 'Morpheus',
        bio: 'Dreaming of a better world. Leadership mentor.',
        xp: 12000,
        level: 20,
        company: 'Zion command',
        location: 'Zion',
        skillEmbedding: [0.9, 0.9, 0.9, 0.9, 0.9]
    },
    {
        username: 'cypher_traitor',
        email: 'cypher@matrix.com',
        password: 'password123',
        fullName: 'Cypher',
        bio: 'Ignorance is bliss. Python expert.',
        xp: 4000,
        level: 8,
        company: 'Steakhouse',
        location: 'Matrix Link',
        skillEmbedding: [0.1, 0.1, 0.1, 0.1, 0.1]
    },
    {
        username: 'agent_smith',
        email: 'smith@matrix.com',
        password: 'password123',
        fullName: 'Agent Smith',
        bio: 'I want to get out of here. System architecture expert.',
        xp: 99999,
        level: 99,
        company: 'The System',
        location: 'Everywhere',
        skillEmbedding: [0.5, 0.5, 0.5, 0.5, 0.5]
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean existing users? Maybe better not to delete EVERYTHING in prod, but for dev ok.
        // await User.deleteMany({ email: { $in: dummyUsers.map(u => u.email) } });

        for (const user of dummyUsers) {
            const exists = await User.findOne({ email: user.email });
            if (!exists) {
                await User.create(user);
                console.log(`Created user: ${user.username}`);
            } else {
                console.log(`User exists: ${user.username}`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
