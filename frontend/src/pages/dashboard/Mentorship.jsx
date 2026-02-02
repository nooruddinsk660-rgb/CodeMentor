import React from 'react';
import Sidebar from "../../components/dashboard/Sidebar";
import { useMentorship } from '../../hooks/dashboard/useMentorship';

// Imported Components
import MentorshipHeader from '../../components/dashboard/mentorship/layout/MentorshipHeader';
import MentorshipBackground from '../../components/dashboard/mentorship/layout/MentorshipBackground';
import MentorshipModals from '../../components/dashboard/mentorship/layout/MentorshipModals';
import MentorshipContent from '../../components/dashboard/mentorship/layout/MentorshipContent';
import UserProfileModal from '../../components/dashboard/mentorship/layout/UserProfileModal';
import MentorshipTerminalWrapper from '../../components/dashboard/mentorship/layout/MentorshipTerminalWrapper';

export default function Mentorship() {
    const {
        // State
        user, token, matches, quests, loading, viewMode, activeTab, matchMode, connectedIds, ghostMode, showTerminal,
        unreadCount,
        showQuestModal, newQuest,
        showManageModal, selectedQuest,
        showChat, selectedChatUser,

        // Setters
        setViewMode, setActiveTab, setMatchMode, setGhostMode, setShowTerminal,
        setShowQuestModal, setNewQuest, setShowManageModal, setShowChat, setSelectedChatUser,

        // Handlers
        handleSearch, handleCreateQuest, handleContactCreator, handleConnect,
        handleNotificationClick, handleDeleteQuest, handleUpdateQuest, handleApplyQuest,
        handleAcceptApplicant, handleTerminalCommand, handleOpenManageModal, handleNotificationItemClick,
        unreadDetails,
        // Profile
        showProfileModal, setShowProfileModal, selectedProfileUserId, handleViewProfile
    } = useMentorship();

    return (
        <div className={`flex h-screen bg-gray-50 dark:bg-[#050510] text-gray-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-500 ${ghostMode ? 'ghost-mode' : ''}`}>
            <Sidebar />

            <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden isolate">
                <MentorshipBackground />

                {/* STABLE HEADER (Fixed at top) */}
                <MentorshipHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    unreadCount={unreadCount}
                    unreadDetails={unreadDetails}
                    onNotificationClick={handleNotificationClick}
                    onNotificationItemClick={handleNotificationItemClick}
                    showTerminal={showTerminal}
                    setShowTerminal={setShowTerminal}
                    ghostMode={ghostMode}
                    setGhostMode={setGhostMode}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar relative z-10 w-full">
                    <MentorshipContent
                        loading={loading}
                        activeTab={activeTab}
                        quests={quests}
                        user={user}
                        matches={matches}
                        connectedIds={connectedIds}
                        viewMode={viewMode}
                        matchMode={matchMode}
                        setMatchMode={setMatchMode}
                        onSearch={handleSearch}
                        onContactCreator={handleContactCreator}
                        onOpenManageModal={handleOpenManageModal}
                        onOpenCreateModal={() => setShowQuestModal(true)}
                        onApplyQuest={handleApplyQuest}
                        onConnect={handleConnect}
                        onViewProfile={handleViewProfile}
                    />
                </div>

                <MentorshipModals
                    showQuestModal={showQuestModal}
                    setShowQuestModal={setShowQuestModal}
                    handleCreateQuest={handleCreateQuest}
                    newQuest={newQuest}
                    setNewQuest={setNewQuest}
                    showManageModal={showManageModal}
                    setShowManageModal={setShowManageModal}
                    selectedQuest={selectedQuest}
                    handleDeleteQuest={handleDeleteQuest}
                    handleUpdateQuest={handleUpdateQuest}
                    handleAcceptApplicant={handleAcceptApplicant}
                    showChat={showChat}
                    setShowChat={setShowChat}
                    selectedChatUser={selectedChatUser}
                    user={user}
                    token={token}
                />

                {/* User Profile Modal */}
                <UserProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    userId={selectedProfileUserId}
                    currentUserId={user?._id}
                    onConnect={handleConnect}
                    onChat={(id, profile) => {
                        setShowProfileModal(false);
                        setSelectedChatUser(profile);
                        setShowChat(true);
                    }}
                    token={token}
                />

                {/* TERMINAL OVERLAY (Fixed Bottom) */}
                <MentorshipTerminalWrapper
                    showTerminal={showTerminal}
                    onCommand={handleTerminalCommand}
                />
            </main>
        </div>
    );
}
