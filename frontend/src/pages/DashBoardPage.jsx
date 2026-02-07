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
        setIntelligence(aiData?.intelligence || null);
        setStats(aiData?.stats || null);
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
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden transition-colors duration-500 selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <Sidebar />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0B0F19', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <main className="flex-1 px-4 sm:px-8 py-8 lg:p-10 overflow-y-auto relative z-10 custom-scrollbar">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
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
                    <h2 className="text-white text-xl font-bold flex items-center gap-2 tracking-tight">
                      <span className="material-symbols-outlined text-cyan-400">monitoring</span>
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
                  <h2 className="text-white text-xl font-bold flex items-center gap-2 tracking-tight">
                    <span className="material-symbols-outlined text-purple-400">psychology</span>
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
              <div className="sticky top-8 space-y-6">
                <NeuralMatchDeck />

                <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-mono opacity-50">
                  <span className="border border-white/10 px-2 py-1 rounded">← REJECT</span>
                  <span className="border border-white/10 px-2 py-1 rounded">ACCEPT →</span>
                </div>
              </div>
            </aside>
          </div>
          <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}