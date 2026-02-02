import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAllSkills, updateUserSkills, getMasterSkillList } from "../services/userSkills.service";
import { getDashboardIntelligence } from "../services/ai.service";

import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import DirectiveHero from "../components/dashboard/DirectiveHero";
import ProgressSection from "../components/dashboard/ProgressSection";
import SkillsSection from "../components/dashboard/SkillsSection";
import CodePulseMatrix from "../components/dashboard/CodePulseMatrix";
import NeuralMatchDeck from "../components/dashboard/NeuralMatchDeck";
import Footer from "../components/dashboard/Footer";
import GravityField from "../components/dashboard/GravityField";
import TrajectoryCard from "../components/dashboard/TrajectoryCard";

import { Toaster, toast } from 'react-hot-toast';
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [stats, setStats] = useState(null);

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentStreak = user?.dailyLog?.currentStreak || 0;

  useEffect(() => {
    if (!token) return;

    setLoadingSkills(true);

    Promise.all([
      getAllSkills(token),
      getMasterSkillList(token),
      getDashboardIntelligence() // 5. Fetch Intelligence
    ])
      .then(([userData, masterData, aiData]) => {
        setSkills(userData || []);
        setGlobalSkills(masterData || []);
        // aiData returns { stats: ..., intelligence: ... }
        setIntelligence(aiData?.intelligence || null);
        setStats(aiData?.stats || null); // <--- Save the stats here!
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load dashboard data");
      })
      .finally(() => {
        setLoadingSkills(false);
      });
  }, [token]);

  // 2. Add Skill Logic
  const handleAddSkill = async (newSkillObj) => {
    if (skills.some(s => s.name.toLowerCase() === newSkillObj.name.toLowerCase())) {
      toast.error("Skill already exists!");
      return;
    }

    setSaving(true);
    const updatedList = [...skills, newSkillObj];
    setSkills(updatedList);

    try {
      await updateUserSkills(token, updatedList);
      toast.success("Skill added to Neural Matrix");
    } catch (err) {
      console.error(err);
      setSkills(skills);
      toast.error("Sync failed");
    } finally {
      setSaving(false);
    }
  };

  // 3. Remove Skill Logic
  const handleRemoveSkill = async (skillName) => {
    const originalList = [...skills];
    const updatedList = skills.filter(s => s.name !== skillName);
    setSkills(updatedList);

    try {
      await updateUserSkills(token, updatedList);
      toast.success("Skill removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
      setSkills(originalList);
    }
  };

  const handleClientSearch = (query) => {
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#030712] relative overflow-hidden selection:bg-blue-500/30 transition-colors duration-500">

      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
      </div>

      <Sidebar />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1F2937', color: '#fff' } }} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <Header onSearch={handleClientSearch} />

          <ProgressSection />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DirectiveHero streak={currentStreak || 0} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-8">

              {/* --- NEW: INTELLIGENCE LAYER --- */}
              {intelligence && (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-900 dark:text-white text-[22px] font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-500 dark:text-cyan-400">monitoring</span>
                      Skill Intelligence
                    </h2>
                  </div>

                  {/* 1. Trajectory Insight */}
                  <TrajectoryCard intelligence={intelligence} stats={stats} />

                  {/* 2. Gravity Physics Visualizer */}
                  <GravityField
                    skills={skills}
                    driftWarnings={intelligence.drift_warnings}
                    stats={stats}
                  />
                </motion.section>
              )}
              {/* ------------------------------- */}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900 dark:text-white text-[22px] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500 dark:text-purple-400">psychology</span>
                    Skill Matrix
                  </h2>
                </div>

                {loadingSkills ? (
                  <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                ) : (
                  <SkillsSection
                    userSkills={skills}
                    setUserSkills={setSkills}
                    availableSkills={globalSkills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                    isSaving={saving}
                  />
                )}
              </section>

              <section>
                <CodePulseMatrix />
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <NeuralMatchDeck />

                <div className="flex justify-center gap-4 mt-4 text-[10px] text-gray-500 font-mono opacity-50">
                  <span className="border border-gray-700 px-2 py-1 rounded">← NOPE</span>
                  <span className="border border-gray-700 px-2 py-1 rounded">CONNECT →</span>
                </div>
              </div>
            </aside>
          </div>
          <div className="mt-3">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}