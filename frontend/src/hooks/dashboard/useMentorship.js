import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useMentorship() {
    const { token, user } = useAuth();

    // UI State
    const [matches, setMatches] = useState([]);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [connectedIds, setConnectedIds] = useState(new Set());
    const [ghostMode, setGhostMode] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [activeTab, setActiveTab] = useState('matches');
    const [matchMode, setMatchMode] = useState('project');

    // Notification State
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadDetails, setUnreadDetails] = useState([]);
    const [latestSender, setLatestSender] = useState(null);

    // Modal States
    const [showQuestModal, setShowQuestModal] = useState(false);
    const [newQuest, setNewQuest] = useState({ title: '', description: '', difficulty: 'intermediate' });
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);

    // --- Effects ---

    // 1. Initial Data (Connections)
    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await axios.get(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const history = res.data.data.matchHistory || [];
                const accepted = history.filter(m => m.status === 'accepted').map(m => m.matchedUserId);
                setConnectedIds(new Set(accepted));
            } catch (err) {
                console.error("Failed to load connections:", err);
            }
        };
        fetchConnections();
    }, [token]);

    // 2. Data Fetching (Matches/Quests)
    useEffect(() => {
        if (activeTab === 'matches') {
            fetchMatches();
        } else if (activeTab === 'quests') {
            fetchQuests();
        }
    }, [activeTab, matchMode, token]);

    // 3. Unread Messages Polling
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await axios.get(`${API_URL}/messages/unread`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(res.data.count || 0);
                if (res.data.details) {
                    setUnreadDetails(res.data.details);
                }
            } catch (e) {
                console.error("Unread fetch error:", e);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [token]);


    // --- Handlers ---

    const fetchMatches = async (isManualScan = false) => {
        if (isManualScan) setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/matchmaking/browse?mode=${matchMode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const rawData = response.data.data || [];
            // Flatten the structure: { user: {...}, score: ... } -> { ...user, matchScore: ... }
            const flatMatches = rawData.map(item => ({
                ...item.user,
                matchScore: item.matchScore,
                breakdown: item.breakdown,
                // Ensure _id is preserved at top level
                _id: item.user?._id || item._id
            }));
            setMatches(flatMatches);
            if (isManualScan) toast.success("SCAN COMPLETE: New Nodes Acquired");
        } catch (error) {
            console.error("Matchmaking Error:", error);
            if (error.response?.status !== 404) {
                toast.error("NEURAL LINK FAILED: Signal Lost.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchQuests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/quests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuests(response.data.data || []);
        } catch (error) {
            console.error("Quest Fetch Error:", error);
            toast.error("GUILD UPLINK FAILED");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query) {
            fetchMatches();
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/users/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const searchResults = response.data.data.map(u => ({ ...u, matchScore: null }));
            setMatches(searchResults);
        } catch (error) {
            console.error("Search Error:", error);
            toast.error("SCAN FAILED: TARGET NOT FOUND");
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuest = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/quests`, newQuest, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("BOUNTY POSTED TO GUILD BOARD", { icon: '🛡️' });
            setShowQuestModal(false);
            setNewQuest({ title: '', description: '', difficulty: 'intermediate' });
            fetchQuests();
        } catch (error) {
            console.error("Post Quest Error:", error);
            const msg = error.response?.data?.message || "FAILED TO POST BOUNTY";
            toast.error(msg);
        }
    };

    const handleContactCreator = async (creatorId, questTitle) => {
        if (creatorId === user._id) {
            toast("YOU CANNOT ACCEPT YOUR OWN BOUNTY", { icon: '🚫' });
            return;
        }

        if (connectedIds.has(creatorId)) {
            try {
                const res = await axios.get(`${API_URL}/users/${creatorId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedChatUser(res.data.data);
                setShowChat(true);
                toast.success("SECURE LINK ESTABLISHED", { icon: '💬' });
            } catch (e) {
                toast.error("FAILED TO OPEN CHAT UPLINK");
            }
        } else {
            await handleConnect(creatorId, "Quest Creator");
        }
    };

    const handleConnect = async (candidateId, name) => {
        if (connectedIds.has(candidateId)) return;

        console.log("Attempting Connection:", { name }); // DEBUG LOG

        try {
            await axios.post(`${API_URL}/connect/request`,
                { recipientId: candidateId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setConnectedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(candidateId);
                return newSet;
            });

            toast.success(`HANDSHAKE ESTABLISHED: Uplink synced with ${name}`, {
                icon: '🔗',
                style: {
                    background: '#0B0F19',
                    color: '#4ade80',
                    border: '1px solid #4ade80',
                    fontFamily: 'monospace'
                }
            });
        } catch (error) {
            console.error("Connection Error:", error);
            const msg = error.response?.data?.message || "Uplink Failed";
            toast.error(`CONNECTION FAILED: ${msg}`);
        }
    };

    const handleNotificationClick = async () => {
        if (latestSender) {
            setSelectedChatUser(latestSender);
            setShowChat(true);
        } else {
            try {
                const res = await axios.get(`${API_URL}/messages/unread`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.latestSender) {
                    setSelectedChatUser(res.data.latestSender);
                    setShowChat(true);
                } else {
                    toast("NO ACTIVE SIGNAL FOUND", { icon: '📡' });
                }
            } catch (e) {
                toast.error("SIGNAL INTERFERENCE DETECTED");
            }
        }
    };

    const handleDeleteQuest = async (quest) => {
        try {
            await axios.delete(`${API_URL}/quests/${quest._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("BOUNTY TERMINATED", { icon: '🗑️' });
            setShowManageModal(false);
            setSelectedQuest(null);
            fetchQuests();
        } catch (error) {
            console.error("Delete Quest Error:", error);
            toast.error("FAILED TO TERMINATE BOUNTY");
        }
    };

    const handleUpdateQuest = async (quest, formData) => {
        try {
            await axios.put(`${API_URL}/quests/${quest._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("BOUNTY SPECIFICATIONS UPDATED", { icon: '⚡' });
            setShowManageModal(false);
            fetchQuests();
        } catch (error) {
            console.error("Update Quest Error:", error);
            toast.error("FAILED TO UPDATE BOUNTY");
        }
    };

    const handleApplyQuest = async (quest) => {
        try {
            await axios.post(`${API_URL}/quests/${quest._id}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("APPLICATION TRANSMITTED", { icon: '📨' });
            fetchQuests();
        } catch (error) {
            console.error("Apply Error:", error);
            toast.error(error.response?.data?.error || "APPLICATION FAILED");
        }
    };

    const handleAcceptApplicant = async (quest, applicantId) => {
        try {
            await axios.post(`${API_URL}/quests/${quest._id}/accept`, { applicantId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("OPERATIVE ASSIGNED", { icon: '🤝' });
            setShowManageModal(false);
            fetchQuests();
        } catch (error) {
            console.error("Accept Error:", error);
            toast.error(error.response?.data?.error || "ASSIGNMENT FAILED");
        }
    };

    const handleViewProfile = (userId) => {
        if (!userId) return;
        setSelectedProfileUserId(userId);
        setShowProfileModal(true);
    };

    const handleTerminalCommand = (cmd) => {
        const command = cmd.toLowerCase().trim();

        if (command === '/scan') {
            fetchMatches(true);
            return;
        }
        if (command === '/quests') {
            setActiveTab('quests');
            return;
        }
        if (command === '/post') {
            setShowQuestModal(true);
            return;
        }
        if (command === '/ghost') {
            setGhostMode(prev => !prev);
            toast("GHOST PROTOCOL TOGGLED", { icon: '👻' });
            return;
        }
        if (command.startsWith('/connect ')) {
            const targetName = cmd.split(' ')[1];
            toast.success(`SEARCHING FOR NODE: ${targetName}...`, { icon: '🔍' });
            return;
        }

        toast.error(`ERROR: Unknown Command "${command}"`);
    };

    const handleNotificationItemClick = (sender) => {
        setSelectedChatUser(sender);
        setShowChat(true);
    };

    return {
        // State
        user, token, matches, quests, loading, viewMode, activeTab, matchMode, connectedIds, ghostMode, showTerminal,
        unreadCount, unreadDetails, latestSender,
        showQuestModal, newQuest,
        showManageModal, selectedQuest,
        showChat, selectedChatUser,

        // Setters
        setViewMode, setActiveTab, setMatchMode, setGhostMode, setShowTerminal,
        setShowQuestModal, setNewQuest, setShowManageModal, setShowChat, setSelectedChatUser,

        // Handlers
        handleSearch, handleCreateQuest, handleContactCreator, handleConnect,
        handleNotificationClick, handleDeleteQuest, handleUpdateQuest, handleApplyQuest,
        handleAcceptApplicant, handleTerminalCommand, handleNotificationItemClick,
        handleOpenManageModal: (q) => {
            setSelectedQuest(q);
            setShowManageModal(true);
        },
        // Profile
        showProfileModal, setShowProfileModal, selectedProfileUserId, handleViewProfile
    };
}
