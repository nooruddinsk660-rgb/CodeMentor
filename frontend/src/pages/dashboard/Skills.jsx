import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // Animation Engine
import { useAuth } from "../../auth/AuthContext";
import { getAllSkills, updateUserSkills, getMasterSkillList } from "../../services/userSkills.service";
import Sidebar from "../../components/dashboard/Sidebar"; // ✅ Sidebar Added
import SkillsHeader from "../../components/dashboard/skills/SkillsHeader";
import SkillsSection from "../../components/dashboard/SkillsSection";
import { Toaster, toast } from 'react-hot-toast';

export default function SkillsPage() {
  const { token } = useAuth();

  const [skills, setSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Skills on Mount
  useEffect(() => {
    if (!token) return;
    setLoadingSkills(true);

    Promise.all([
      getAllSkills(token),
      getMasterSkillList(token)
    ])
      .then(([userData, masterData]) => {
        setSkills(userData || []);
        setGlobalSkills(masterData || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Neural Link Failed");
      })
      .finally(() => {
        setLoadingSkills(false);
      });
  }, [token]);

  // 2. Add Skill Logic
  const handleAddSkill = async (newSkillObj) => {
    if (skills.some(s => s.name.toLowerCase() === newSkillObj.name.toLowerCase())) {
      toast.error("Duplicate Protocol Detected");
      return;
    }
    setSaving(true);
    const updatedList = [...skills, newSkillObj];
    setSkills(updatedList);

    try {
      await updateUserSkills(token, updatedList);
      toast.success("Protocol Installed Successfully");
    } catch (err) {
      setSkills(skills);
      toast.error("Sync Error: Connection Lost");
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
      toast.success("Protocol Purged");
    } catch (err) {
      toast.error("Purge Failed");
      setSkills(originalList);
    }
  };

  // --- 📊 CALCULATE DIAGNOSTICS ---

  // 1. Calculate Gravity based on Proficiency
  // Beginner = 10pts, Intermediate = 25pts, Advanced = 50pts, Expert = 100pts
  const calculateGravity = () => {
    const weights = { beginner: 10, intermediate: 25, advanced: 50, expert: 100 };
    return skills.reduce((total, skill) => {
      const level = skill.proficiency?.toLowerCase() || 'beginner';
      return total + (weights[level] || 10);
    }, 0);
  };

  // 2. Calculate Load
  // We assume a healthy developer can maintain about 40 active skills before burnout.
  const calculateLoad = () => {
    const maxCapacity = 40;
    const usage = (skills.length / maxCapacity) * 100;
    return Math.min(100, Math.round(usage));
  };

  // Execute Calculations
  const totalGravity = calculateGravity();
  const expertCount = skills.filter(s => s.proficiency === 'expert').length;
  const systemLoad = calculateLoad();

  // Dynamic Color for Load (Green = Good, Red = Burnout)
  const loadColor = systemLoad > 80 ? "text-red-400" : systemLoad > 50 ? "text-amber-400" : "text-emerald-400";
  const loadBg = systemLoad > 80 ? "bg-red-500/10" : systemLoad > 50 ? "bg-amber-500/10" : "bg-emerald-500/10";
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#030712] overflow-hidden selection:bg-cyan-500/30 transition-colors duration-500">

      {/* ✅ 1. SIDEBAR INTEGRATION */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        {/* Background Ambience */}
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-900/10 blur-[120px] rounded-full transition-colors duration-500" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-900/10 blur-[120px] rounded-full transition-colors duration-500" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1F2937', color: '#fff', border: '1px solid #374151' } }} />

          {/* ✅ 2. NEURAL DIAGNOSTICS DECK (Exciting Visuals) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <DiagnosticCard
              label="System Gravity"
              value={totalGravity}
              icon="deployed_code"
              color="text-cyan-400"
              bg="bg-cyan-500/10"
              borderColor="border-cyan-500/20"
            />
            <DiagnosticCard
              label="Mastery Nodes"
              value={`${expertCount} / ${skills.length}`}
              icon="hotel_class"
              color="text-amber-400"
              bg="bg-amber-500/10"
              borderColor="border-amber-500/20"
            />
            <DiagnosticCard
              label="Cognitive Load"
              value={`${systemLoad}%`}
              icon="memory"
              color={loadColor}
              bg={loadBg}
              borderColor="border-gray-200 dark:border-white/10"
            />
          </motion.div>

          <SkillsHeader />

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-[#0B0F19]/50 backdrop-blur-sm border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl dark:shadow-2xl"
          >
            {loadingSkills ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></span>
                <p className="text-cyan-400 font-mono text-sm animate-pulse">ESTABLISHING NEURAL HANDSHAKE...</p>
              </div>
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
          </motion.section>
        </div>
      </main>
    </div>
  );
}

// ✅ 3. REUSABLE DIAGNOSTIC COMPONENT
function DiagnosticCard({ label, value, icon, color, bg, borderColor }) {
  return (
    <div className={`p-5 rounded-2xl border ${borderColor} ${bg} flex items-center gap-4 relative overflow-hidden group transition-colors`}>
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className={`p-3 rounded-xl bg-white dark:bg-[#030712] border border-gray-100 dark:border-white/10 ${color} shadow-sm dark:shadow-none`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">{label}</p>
        <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
      </div>
    </div>
  );
}