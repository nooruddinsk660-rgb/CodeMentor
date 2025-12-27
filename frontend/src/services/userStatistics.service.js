import { apiRequest } from "../api/client";

/**
 * Fetches user statistics including XP, Level, and Streak
 * Endpoint: GET /users/me/statistics
 */
export const getUserStatistics = async (token, userId = null) => {
  // We prioritize the 'me' endpoint for the dashboard
  const endpoint = userId ? `/users/${userId}/statistics` : '/users/me/statistics';
  
  try {
    const response = await apiRequest(endpoint, {
      method: "GET",
      // token is handled by apiRequest automatically if stored in localStorage,
      // but if your client.js requires it in headers manually, ensure it's passed.
    });
    
    return response; 
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return null; // Return null so the UI can handle the fallback
  }
};