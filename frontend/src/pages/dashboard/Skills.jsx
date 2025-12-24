import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
// ✅ IMPORT getMasterSkillList HERE
import { getAllSkills, updateUserSkills, getMasterSkillList } from "../../services/userSkills.service";
import SkillsHeader from "../../components/dashboard/skills/SkillsHeader";
import SkillsSection from "../../components/dashboard/SkillsSection"; 
import { Toaster, toast } from 'react-hot-toast';

export default function SkillsPage() {
  const { token } = useAuth();
  
  const [skills, setSkills] = useState([]);
  // ✅ ADD THIS STATE to hold the 50+ master skills
  const [globalSkills, setGlobalSkills] = useState([]); 
  
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Skills on Mount
  useEffect(() => {
    if (!token) return;

    setLoadingSkills(true);
    
    Promise.all([
      getAllSkills(token),
      getMasterSkillList(token) // <--- PASS THE TOKEN HERE!
    ])
    .then(([userData, masterData]) => {
      setSkills(userData || []);
      setGlobalSkills(masterData || []); 
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to load skills");
    })
    .finally(() => {
      setLoadingSkills(false);
    });
  }, [token]);

  // 2. Add Skill Logic
  const handleAddSkill = async (newSkillObj) => {
    // Prevent duplicates
    if (skills.some(s => s.name.toLowerCase() === newSkillObj.name.toLowerCase())) {
        toast.error("Skill already exists!");
        return;
    }

    setSaving(true);
    const updatedList = [...skills, newSkillObj]; 
    setSkills(updatedList); // Optimistic update

    try {
        await updateUserSkills(token, updatedList);
        toast.success("Skill added to Neural Matrix");
    } catch (err) {
        console.error(err);
        setSkills(skills); // Revert on failure
        toast.error("Sync failed");
    } finally {
        setSaving(false);
    }
  };

  // 3. Remove Skill Logic
  const handleRemoveSkill = async (skillName) => {
    const originalList = [...skills];
    const updatedList = skills.filter(s => s.name !== skillName);
    setSkills(updatedList); // Optimistic UI update

    try {
        await updateUserSkills(token, updatedList);
        toast.success("Skill removed");
    } catch (err) {
        console.error(err);
        toast.error("Failed to delete");
        setSkills(originalList); // Revert
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] p-8 lg:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1F2937', color: '#fff' }}}/>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <SkillsHeader />
        
        <section>
          {loadingSkills ? (
            <div className="text-blue-400 animate-pulse text-center py-10">Initializing Neural Link...</div>
          ) : (
            <SkillsSection 
                userSkills={skills} 
                setUserSkills={setSkills}
                // ✅ PASS THE MASTER LIST HERE
                availableSkills={globalSkills} 
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                isSaving={saving}
            />
          )}
        </section>
      </div>
    </div>
  );
}