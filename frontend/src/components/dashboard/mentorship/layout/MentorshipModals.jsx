import React from 'react';
import CreateQuestModal from '../../mentorship/CreateQuestModal';
import ManageQuestModal from '../../mentorship/ManageQuestModal';
import ChatModal from '../../messaging/ChatModal';

export default function MentorshipModals({
    showQuestModal,
    setShowQuestModal,
    handleCreateQuest,
    newQuest,
    setNewQuest,
    showManageModal,
    setShowManageModal,
    selectedQuest,
    handleDeleteQuest,
    handleUpdateQuest,
    handleAcceptApplicant,
    showChat,
    setShowChat,
    selectedChatUser,
    user,
    token
}) {
    return (
        <>
            {/* MODAL: POST QUEST */}
            <CreateQuestModal
                isOpen={showQuestModal}
                onClose={() => setShowQuestModal(false)}
                onSubmit={handleCreateQuest}
                newQuest={newQuest}
                setNewQuest={setNewQuest}
            />

            {/* MODAL: MANAGE QUEST */}
            <ManageQuestModal
                isOpen={showManageModal}
                onClose={() => setShowManageModal(false)}
                quest={selectedQuest}
                onDelete={handleDeleteQuest}
                onUpdate={handleUpdateQuest}
                onAccept={handleAcceptApplicant}
            />

            {/* CHAT MODAL */}
            {selectedChatUser && (
                <ChatModal
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    recipient={selectedChatUser}
                    currentUser={user}
                    token={token}
                />
            )}
        </>
    );
}
