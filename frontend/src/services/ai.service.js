import { apiRequest } from "../api/client"; // Import your helper

export const getDashboardIntelligence = async () => {
  try {
    const result = await apiRequest("/skills/intelligence");
    return result; 
  } catch (error) {
    console.error("Failed to fetch intelligence:", error);
    return { 
      intelligence: { 
        drift_warnings: [], 
        trajectory: 'unavailable', 
        ai_analysis: 'Intelligence service is connecting...',
        gravity_index: 0
      }
    };
  }
};