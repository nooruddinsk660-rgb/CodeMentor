const path = require('path');
// Ensure env vars are loaded from the backend root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 

const mongoose = require("mongoose");
// Make sure this path points to your actual model file
const Skill = require("../modules/skills/skill.model"); 
const config = require("../core/config/env");

const skills = [
  // --- FRONTEND ---
  { name: "React", intensity: 90, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Angular", intensity: 60, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
  { name: "Vue.js", intensity: 60, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
  { name: "Next.js", intensity: 85, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Svelte", intensity: 50, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" },
  { name: "TypeScript", intensity: 80, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "JavaScript", intensity: 90, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "HTML5", intensity: 95, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3", intensity: 90, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "Tailwind CSS", intensity: 85, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" },
  { name: "Bootstrap", intensity: 80, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "Sass", intensity: 70, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
  { name: "Redux", intensity: 80, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" },
  { name: "jQuery", intensity: 50, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg" },
  { name: "Material UI", intensity: 75, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" },
  { name: "Three.js", intensity: 40, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },

  // --- BACKEND & LANGUAGES ---
  { name: "Node.js", intensity: 85, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Python", intensity: 80, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "Java", intensity: 75, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "C", intensity: 60, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { name: "C++", intensity: 70, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "C#", intensity: 65, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  { name: "Go", intensity: 60, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg" },
  { name: "Rust", intensity: 50, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" },
  { name: "PHP", intensity: 65, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
  { name: "Ruby", intensity: 40, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" },
  { name: "Express.js", intensity: 85, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
  { name: "Django", intensity: 70, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
  { name: "Flask", intensity: 60, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
  { name: "Spring Boot", intensity: 65, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { name: "Laravel", intensity: 60, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
  { name: "GraphQL", intensity: 70, category: "API", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },

  // --- DATABASE ---
  { name: "PostgreSQL", intensity: 75, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "MongoDB", intensity: 85, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "MySQL", intensity: 70, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "Redis", intensity: 60, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  { name: "SQLite", intensity: 50, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
  { name: "Firebase", intensity: 75, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Oracle", intensity: 40, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" },

  // --- DEVOPS & CLOUD ---
  { name: "Docker", intensity: 70, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kubernetes", intensity: 50, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
  { name: "AWS", intensity: 65, category: "Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Google Cloud", intensity: 50, category: "Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" },
  { name: "Azure", intensity: 45, category: "Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
  { name: "Heroku", intensity: 70, category: "Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/heroku/heroku-original.svg" },
  { name: "Nginx", intensity: 55, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" },
  { name: "Jenkins", intensity: 45, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" },

  // --- MOBILE ---
  { name: "Flutter", intensity: 60, category: "Mobile", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
  { name: "Dart", intensity: 60, category: "Mobile", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg" },
  { name: "React Native", intensity: 80, category: "Mobile", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Swift", intensity: 40, category: "Mobile", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
  { name: "Kotlin", intensity: 45, category: "Mobile", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },

  // --- TOOLS & OTHERS ---
  { name: "Git", intensity: 90, category: "Tools", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "Linux", intensity: 75, category: "Tools", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
  { name: "Figma", intensity: 60, category: "Design", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { name: "Postman", intensity: 80, category: "Tools", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
  { name: "WordPress", intensity: 50, category: "CMS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg" },
  { name: "Unity", intensity: 30, category: "Game Dev", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg" },
  { name: "Unreal Engine", intensity: 20, category: "Game Dev", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unrealengine/unrealengine-original.svg" },
  { name: "TensorFlow", intensity: 30, category: "AI/ML", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "Pandas", intensity: 40, category: "AI/ML", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" }
];

(async () => {
  try {
    // FIX: Changed config.db.uri -> config.mongo.uri
    console.log("Connecting to database...");
    await mongoose.connect(config.mongo.uri); 
    
    console.log("Clearing old skills...");
    await Skill.deleteMany();
    
    console.log("Inserting new skills...");
    await Skill.insertMany(skills);
    
    console.log("Skills seeded successfully");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
})();