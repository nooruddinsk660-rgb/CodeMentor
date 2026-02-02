import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import Sidebar from "../../components/dashboard/Sidebar";
import QuestCard from "../../components/dashboard/mentorship/QuestCard";
import MentorshipModals from "../../components/dashboard/mentorship/layout/MentorshipModals";
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export default function BountyBoard() {
    const { token, user } = useAuth();
    const [bounties, setBounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Modal States for applying/managing
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [showQuestModal, setShowQuestModal] = useState(false); // For creating new bounties
    const [newQuest, setNewQuest] = useState({ title: '', description: '', difficulty: 'intermediate' });

    useEffect(() => {
        fetchBounties();
    }, [token]);

    const fetchBounties = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/quests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBounties(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch bounties", error);
            toast.error("GUILD NETWORK OFFLINE");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuest = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/quests`, newQuest, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("NEW BOUNTY POSTED", { icon: '🛡️' });
            setShowQuestModal(false);
            setNewQuest({ title: '', description: '', difficulty: 'intermediate' });
            fetchBounties();
        } catch (error) {
            toast.error("FAILED TO POST BOUNTY");
        }
    };

    const handleApply = async (quest) => {
        try {
            await axios.post(`${API_URL}/quests/${quest._id}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("CONTRACT PENDING APPROVAL", { icon: '📝' });
            fetchBounties();
        } catch (error) {
            toast.error(error.response?.data?.error || "APPLICATION FAILED");
        }
    };

    const handleDelete = async (quest) => {
        try {
            await axios.delete(`${API_URL}/quests/${quest._id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("CONTRACT TERMINATED");
            setShowManageModal(false);
            fetchBounties();
        } catch (error) {
            toast.error("DELETE FAILED");
        }
    };

    const handleContact = (creatorId, title) => {
        // Simple chat redirect mock
        toast.success(`OPENING SECURE LINE TO CREATOR OF "${title}"...`, { icon: '💬' });
    };

    // Filter Logic
    const filteredBounties = bounties.filter(b => {
        if (filter === 'all') return true;
        // Map backend logic to frontend filters if needed
        // Assuming backend Quests don't explicitly have 'status', we infer it:
        const isAssigned = !!b.assignee;
        if (filter === 'open') return !isAssigned;
        if (filter === 'assigned') return isAssigned;
        if (filter === 'my_bounties') return b.creator?._id === user?._id;
        return true;
    });

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#030712] font-sans text-gray-900 dark:text-slate-200 transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-4xl text-cyan-500 animate-pulse">deployed_code</span>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Active Bounties</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-mono text-xs tracking-wide">
                            // GLOBAL CONTRACT REGISTRY. ACCEPT MISSIONS. MERGE CODE. EARN XP.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowQuestModal(true)}
                            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all font-bold shadow-lg shadow-cyan-900/20 flex items-center gap-2 group"
                        >
                            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                            DEPLOY NEW BOUNTY
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-gray-200 dark:border-white/5">
                    {[
                        { id: 'all', label: 'ALL CONTRACTS' },
                        { id: 'open', label: 'AVAILABLE' },
                        { id: 'assigned', label: 'IN PROGRESS' },
                        { id: 'my_bounties', label: 'MY DEPLOYMENTS' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 border-b-2 transition-all text-xs font-bold tracking-widest ${filter === f.id ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Bounty Grid (Using Real QuestCards) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
                            Scanning Network...
                        </div>
                    ) : filteredBounties.length > 0 ? (
                        filteredBounties.map((quest, i) => (
                            <QuestCard
                                key={quest._id}
                                quest={quest}
                                user={user}
                                index={i}
                                onContact={handleContact}
                                onApply={handleApply}
                                onManage={(q) => {
                                    setSelectedQuest(q);
                                    setShowManageModal(true);
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-transparent">
                            <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600 mb-2">signal_disconnected</span>
                            <p className="text-gray-500 dark:text-gray-500 font-mono">NO ACTIVE CONTRACTS FOUND IN THIS SECTOR.</p>
                        </div>
                    )}
                </div>

                {/* Reusing Mentorship Modals for Create/Manage */}
                <MentorshipModals
                    showQuestModal={showQuestModal}
                    setShowQuestModal={setShowQuestModal}
                    handleCreateQuest={handleCreateQuest}
                    newQuest={newQuest}
                    setNewQuest={setNewQuest}
                    showManageModal={showManageModal}
                    setShowManageModal={setShowManageModal}
                    selectedQuest={selectedQuest}
                    handleDeleteQuest={handleDelete}
                    handleUpdateQuest={() => { }} // simplified for now
                    handleAcceptApplicant={() => { }} // simplified for now
                    user={user}
                    token={token}
                />

            </main>
        </div>
    );
}
