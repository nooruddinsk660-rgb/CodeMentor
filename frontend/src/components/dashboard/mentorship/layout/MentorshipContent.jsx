import React from 'react';
import MatchSection from '../MatchSection';
import QuestSection from '../QuestSection';

export default function MentorshipContent({
    loading,
    activeTab,
    quests,
    user,
    matches,
    connectedIds,
    viewMode,
    matchMode,
    setMatchMode,
    onSearch,
    onContactCreator,
    onOpenManageModal,
    onOpenCreateModal,
    onApplyQuest,
    onConnect,
    onViewProfile
}) {
    if (activeTab === 'quests') {
        return (
            <QuestSection
                loading={loading}
                quests={quests}
                user={user}
                onContact={onContactCreator}
                onManage={onOpenManageModal}
                onOpenCreateModal={onOpenCreateModal}
                onApply={onApplyQuest}
            />
        );
    }

    return (
        <MatchSection
            loading={loading}
            matches={matches}
            connectedIds={connectedIds}
            onConnect={onConnect}
            viewMode={viewMode}
            matchMode={matchMode}
            setMatchMode={setMatchMode}
            onSearch={onSearch}
            onViewProfile={onViewProfile}
        />
    );
}
