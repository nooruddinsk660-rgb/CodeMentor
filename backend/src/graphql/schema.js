const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    fullName: String
    bio: String
    avatar: String
    skills: [Skill!]!
    xp: Int!
    level: Int!
    skillCount: Int!
    githubData: GitHubData
    statistics: Statistics!
    createdAt: String!
  }

  type Skill {
    name: String!
    proficiency: String!
    category: String!
    source: String!
    yearsOfExperience: Int
  }

  type GitHubData {
    username: String
    profileUrl: String
    avatarUrl: String
    bio: String
    publicRepos: Int
    followers: Int
    following: Int
    totalStars: Int
    topLanguages: [Language!]
  }

  type Language {
    language: String!
    percentage: Float!
    linesOfCode: Int!
  }

  type Statistics {
    totalMatches: Int!
    successfulMatches: Int!
    projectsCompleted: Int!
    hoursContributed: Int!
  }

  type MatchRecommendation {
    user: User!
    score: Float!
    breakdown: ScoreBreakdown!
    complementarySkills: [String!]!
    commonSkills: [String!]!
  }

  type ScoreBreakdown {
    embeddings: Float!
    complementarity: Float!
    overlap: Float!
    experience: Float!
  }

  type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, page: Int): UserConnection!
    searchUsers(query: String!, limit: Int): [User!]!
    topUsers(limit: Int): [User!]!
    recommendations(limit: Int, minScore: Float): [MatchRecommendation!]!
    skillGraph(userId: ID): SkillGraph
  }

  type UserConnection {
    users: [User!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type SkillGraph {
    userId: ID!
    skills: [GraphSkill!]!
  }

  type GraphSkill {
    skill: String!
    proficiency: String!
    category: String!
  }

  input UpdateProfileInput {
    fullName: String
    bio: String
    avatar: String
  }

  input SkillInput {
    name: String!
    proficiency: String!
    category: String
    yearsOfExperience: Int
  }

  type Mutation {
    updateProfile(input: UpdateProfileInput!): User!
    updateSkills(skills: [SkillInput!]!): User!
    analyzeGitHub(username: String!): User!
  }
`;

module.exports = typeDefs;