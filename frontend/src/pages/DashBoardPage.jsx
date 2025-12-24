import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAllSkills, updateUserSkills, getMasterSkillList } from "../services/userSkills.service";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import ProgressSection from "../components/dashboard/ProgressSection";
import SkillsSection from "../components/dashboard/SkillsSection";
import ActivityChart from "../components/dashboard/ActivityChart";
import NeuralMatchDeck from "../components/dashboard/NeuralMatchDeck"; 
import Footer from "../components/dashboard/Footer";
import { Toaster, toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { token } = useAuth();
  
  const [skills, setSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]); 
  
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Skills (User + Master List) on Mount
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
      toast.error("Failed to load skills");
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
    <div className="min-h-screen flex bg-[#030712]">
      <Sidebar />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1F2937', color: '#fff' }}}/>
      
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Header onSearch={handleClientSearch} />
          <ProgressSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-white text-[22px] font-bold mb-4">Your Skills</h2>
                {loadingSkills ? (
                  <div className="text-blue-400 animate-pulse">Loading skills...</div>
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
                <h2 className="text-white text-[22px] font-bold mb-4">Last 30 Days Activity</h2>
                <ActivityChart />
              </section>
            </div>
            
            {/* --- REPLACED SIDEBAR COMPONENT --- */}
            <aside className="lg:col-span-1">
              <NeuralMatchDeck />  {/* <--- 2. UPDATED COMPONENT */}
            </aside>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}