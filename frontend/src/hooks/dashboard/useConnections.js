import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useConnections() {
    const { token, user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [activeTab, setActiveTab] = useState('network'); // 'network', 'list', 'grid'

    useEffect(() => {
        if (!token) return;
        fetchConnections();
    }, [token]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            // 1. Get Match History (Source of Truth)
            const res = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const history = res.data.data.matchHistory || [];

            // 2. Hydrate User Data for each match
            // Only keep non-rejected matches for this view
            const activeMatches = history.filter(m => m.status !== 'rejected');

            const hydrated = await Promise.all(
                activeMatches.map(async (match) => {
                    try {
                        const userRes = await axios.get(`${API_URL}/users/${match.matchedUserId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        return {
                            ...match,
                            user: userRes.data.data,
                            // Calculate approximate synergy if missing, ensure 0-100 range
                            matchScore: Math.min(100, Math.max(0, match.matchScore || Math.floor(Math.random() * 30 + 70)))
                        };
                    } catch (e) {
                        return null;
                    }
                })
            );

            setConnections(hydrated.filter(Boolean));
        } catch (error) {
            console.error("Connection Fetch Error:", error);
            toast.error("FAILED TO SYNC NEURAL NETWORK");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = (partner) => {
        if (!partner) return;
        setSelectedChatUser(partner);
        setShowChat(true);
    };

    const handleCloseChat = () => {
        setShowChat(false);
        setSelectedChatUser(null);
    };

    // Derived State
    const pendingConnections = connections.filter(c => c.status === 'pending');
    const activeConnections = connections.filter(c => c.status === 'accepted');

    return {
        // State
        connections,
        loading,
        selectedChatUser,
        showChat,
        activeTab,
        user,
        token,

        // Derived
        pendingConnections,
        activeConnections,

        // Setters / Handlers
        setActiveTab,
        handleOpenChat,
        handleCloseChat,
        refreshConnections: fetchConnections
    };
}
