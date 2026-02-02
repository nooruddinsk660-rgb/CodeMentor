const mongoose = require('mongoose');
require('dotenv').config();
const Roadmap = require('../modules/roadmaps/roadmap.model');
const config = require('../core/config/env');

const roadmaps = [
    {
        career_id: 'fullstack',
        title: 'Senior Full Stack Engineer',
        description: 'Master Scalability, Architecture, and AI-Augmented Development.',
        missions: [
            { step: 1, label: 'The Core 3', description: 'Master HTML5 (Semantic), CSS3 (Grid/Flexbox), and Modern JavaScript (ES6+).', topics: ['HTML5', 'CSS3', 'JavaScript'], difficulty: 1, xp_reward: 100 },
            { step: 2, label: 'TypeScript Mastery', description: 'Move from JS to TS for enterprise-level type safety.', topics: ['TypeScript', 'Interfaces', 'Generics'], difficulty: 2, requires: [1], xp_reward: 150 },
            { step: 3, label: 'Frontend Architecture', description: 'Master React 19 (or Next.js 15) and State Management (Zustand/Redux).', topics: ['React', 'Next.js', 'State Management'], difficulty: 3, requires: [2], xp_reward: 200 },
            { step: 4, label: 'Backend & DB', description: 'Deep dive into Node.js/NestJS. Learn PostgreSQL and MongoDB.', topics: ['Node.js', 'PostgreSQL', 'MongoDB'], difficulty: 3, requires: [3], xp_reward: 250 },
            { step: 5, label: 'System Design', description: 'Design distributed systems, Load Balancers, and Caching (Redis).', topics: ['System Design', 'Redis', 'Microservices'], difficulty: 4, requires: [4], xp_reward: 400 },
            { step: 6, label: 'AI Integration', description: 'Integrate LLM APIs (OpenAI/Gemini) into your applications.', topics: ['LLMs', 'OpenAI API', 'Vector DBs'], difficulty: 5, requires: [5], xp_reward: 500 }
        ]
    },
    {
        career_id: 'ai_ml',
        title: 'AI & Machine Learning Engineer',
        description: 'Turning data into intelligent, predictive systems.',
        missions: [
            { step: 1, label: 'Python for Data Science', description: 'Learn NumPy, Pandas, and Matplotlib.', topics: ['Python', 'NumPy', 'Pandas'], difficulty: 1, xp_reward: 100 },
            { step: 2, label: 'Mathematics Foundation', description: 'Linear Algebra, Probability, Statistics, and Calculus.', topics: ['Linear Algebra', 'Calculus', 'Statistics'], difficulty: 2, requires: [1], xp_reward: 150 },
            { step: 3, label: 'Classic ML', description: 'Master Scikit-Learn for Regression, Classification, and Clustering.', topics: ['Scikit-Learn', 'Regression', 'Classification'], difficulty: 3, requires: [2], xp_reward: 200 },
            { step: 4, label: 'Deep Learning', description: 'Learn Neural Networks using PyTorch or TensorFlow.', topics: ['PyTorch', 'TensorFlow', 'Neural Networks'], difficulty: 4, requires: [3], xp_reward: 300 },
            { step: 5, label: 'NLP & LLMs', description: 'Focus on Transformers and Large Language Models.', topics: ['NLP', 'Transformers', 'HuggingFace'], difficulty: 5, requires: [4], xp_reward: 450 },
            { step: 6, label: 'MLOps', description: 'Deploy models using Docker and monitor them in production.', topics: ['Docker', 'MLOps', 'Deployment'], difficulty: 4, requires: [5], xp_reward: 400 }
        ]
    },
    {
        career_id: 'devops',
        title: 'DevOps & Cloud Architect',
        description: 'Automation, Reliability, and Infrastructure.',
        missions: [
            { step: 1, label: 'Linux & Scripting', description: 'Master the Linux Command Line and Bash/Python scripting.', topics: ['Linux', 'Bash', 'Python'], difficulty: 1, xp_reward: 100 },
            { step: 2, label: 'Version Control', description: 'Advanced Git (Rebase, Cherry-picking, Workflows).', topics: ['Git', 'GitHub'], difficulty: 1, requires: [1], xp_reward: 100 },
            { step: 3, label: 'Networking & Security', description: 'Understand DNS, HTTP/S, SSL, and Firewalls.', topics: ['Networking', 'Security', 'Protocols'], difficulty: 2, requires: [2], xp_reward: 150 },
            { step: 4, label: 'Containers', description: 'Master Docker and Kubernetes (K8s) for orchestration.', topics: ['Docker', 'Kubernetes'], difficulty: 4, requires: [3], xp_reward: 300 },
            { step: 5, label: 'Infrastructure as Code', description: 'Learn Terraform or Pulumi.', topics: ['Terraform', 'Pulumi', 'IaC'], difficulty: 4, requires: [4], xp_reward: 350 },
            { step: 6, label: 'Cloud Providers', description: 'Master AWS, Azure, or Google Cloud.', topics: ['AWS', 'Cloud Architecture'], difficulty: 5, requires: [5], xp_reward: 500 }
        ]
    },
    {
        career_id: 'blockchain',
        title: 'Blockchain Developer',
        description: 'Decentralized protocols and Smart Contracts.',
        missions: [
            { step: 1, label: 'Web Fundamentals', description: 'Master JavaScript/Node.js first.', topics: ['JavaScript', 'Node.js'], difficulty: 1, xp_reward: 100 },
            { step: 2, label: 'Blockchain Theory', description: 'Understand Hash functions, Cryptography, and Consensus.', topics: ['Cryptography', 'Blockchain Theory', 'Consensus'], difficulty: 2, requires: [1], xp_reward: 150 },
            { step: 3, label: 'Smart Contracts', description: 'Learn Solidity (Ethereum) or Rust (Solana).', topics: ['Solidity', 'Rust', 'Smart Contracts'], difficulty: 4, requires: [2], xp_reward: 300 },
            { step: 4, label: 'Web3 Integration', description: 'Learn Ethers.js or Viem to connect frontends.', topics: ['Ethers.js', 'Web3.js', 'DApps'], difficulty: 3, requires: [3], xp_reward: 250 },
            { step: 5, label: 'DApp Security', description: 'Audit contracts and prevent exploits.', topics: ['Security', 'Auditing'], difficulty: 5, requires: [4], xp_reward: 400 }
        ]
    },
    {
        career_id: 'backend',
        title: 'Backend Systems Engineer',
        description: 'Low-latency, high-performance server logic.',
        missions: [
            { step: 1, label: 'Heavy Language', description: 'Master Go (Golang) or Java (Spring Boot).', topics: ['Go', 'Java', 'Spring Boot'], difficulty: 2, xp_reward: 150 },
            { step: 2, label: 'Advanced Databases', description: 'Indexing, Sharding, and Replication.', topics: ['SQL', 'NoSQL', 'Database Tuning'], difficulty: 3, requires: [1], xp_reward: 200 },
            { step: 3, label: 'API Design', description: 'Master REST, GraphQL, and gRPC.', topics: ['REST', 'GraphQL', 'gRPC'], difficulty: 3, requires: [2], xp_reward: 250 },
            { step: 4, label: 'Concurrency', description: 'Handle high RPS using threads or coroutines.', topics: ['Concurrency', 'Multithreading'], difficulty: 5, requires: [3], xp_reward: 400 },
            { step: 5, label: 'Messaging Queues', description: 'Implement Kafka or RabbitMQ.', topics: ['Kafka', 'RabbitMQ', 'Event Driven'], difficulty: 4, requires: [4], xp_reward: 350 }
        ]
    },
    {
        career_id: 'datascientist',
        title: 'Data Scientist',
        description: 'Extracting insights and storytelling through data.',
        missions: [
            { step: 1, label: 'SQL Mastery', description: 'Advanced SQL queries and data fetching.', topics: ['SQL', 'PostgreSQL'], difficulty: 2, xp_reward: 150 },
            { step: 2, label: 'EDA', description: 'Exploratory Data Analysis to find patterns.', topics: ['EDA', 'Python'], difficulty: 2, requires: [1], xp_reward: 200 },
            { step: 3, label: 'Statistics', description: 'Master Hypothesis Testing and A/B Testing.', topics: ['Statistics', 'Math'], difficulty: 3, requires: [2], xp_reward: 250 },
            { step: 4, label: 'Visualization', description: 'Tell stories with Tableau, PowerBI, or Seaborn.', topics: ['Tableau', 'Seaborn', 'Data Vis'], difficulty: 2, requires: [3], xp_reward: 200 },
            { step: 5, label: 'Big Data', description: 'Spark or Snowflake for massive datasets.', topics: ['Spark', 'Snowflake', 'Big Data'], difficulty: 4, requires: [4], xp_reward: 400 }
        ]
    }
];

const seedRoadmaps = async () => {
    try {
        await mongoose.connect(config.mongo.uri);
        console.log('Connected to MongoDB');

        // Clear existing roadmaps
        await Roadmap.deleteMany({});
        console.log('Cleared existing roadmaps');

        // Insert new roadmaps
        await Roadmap.insertMany(roadmaps);
        console.log('Seeded 6 Career Roadmaps');

        mongoose.disconnect();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedRoadmaps();
