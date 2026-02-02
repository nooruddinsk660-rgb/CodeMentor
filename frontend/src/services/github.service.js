import { API_BASE_URL } from './api';

export const githubService = {
    /**
     * Trigger a new analysis for a GitHub user
     * POST /api/github/analyze/:username
     */
    analyzeUser: async (username, token) => {
        const response = await fetch(`${API_BASE_URL}/github/analyze/${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            // Handle specific error cases if needed
            if (response.status === 404) throw new Error('User not found');
            throw new Error('Analysis failed');
        }

        return await response.json();
    },

    /**
     * Get existing repository data
     * GET /api/github/repos/:username
     */
    getRepositories: async (username, token) => {
        const response = await fetch(`${API_BASE_URL}/github/repos/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch repositories');
        return await response.json();
    },

    /**
     * Get formatted profile data
     * GET /api/github/profile/:username
     */
    getProfile: async (username, token) => {
        const response = await fetch(`${API_BASE_URL}/github/profile/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    },

    /**
     * Get repository file tree
     * GET /api/github/repos/:username/:repoName/tree
     */
    getRepoTree: async (username, repoName, token) => {
        const response = await fetch(`${API_BASE_URL}/github/repos/${username}/${repoName}/tree`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch repo tree');
        return await response.json();
    }
};
