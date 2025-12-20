import React from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import SkillsHeader from "../../components/dashboard/skills/SkillsHeader";
import SkillsInput from "../../components/dashboard/skills/SkillsInput";
import SkillsList from "../../components/dashboard/skills/SkillsList";

export default function SkillsPage() {
  return (
    <div className="min-h-screen flex bg-background-dark">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <SkillsHeader />

          <div className="mt-6 space-y-6">
            <SkillsInput />
            <SkillsList />
          </div>
        </div>
      </main>
    </div>
  );
}
