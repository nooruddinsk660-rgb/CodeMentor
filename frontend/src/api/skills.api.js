import { apiRequest } from "./client";

export const fetchAllSkills = () => {
  return apiRequest("/skills");
};

export const searchSkills = (query) => {
  return apiRequest(`/skills/search?q=${encodeURIComponent(query)}`);
};
