import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

export default function GitHubSyncButton() {
  const { token } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Get current user's GitHub username
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      if (!userData.data.githubData?.username) {
        alert("Please connect your GitHub account first");
        return;
      }

      // Trigger analysis
      await fetch(
        `${import.meta.env.VITE_API_URL}/github/analyze/${userData.data.githubData.username}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLastSync(new Date().toLocaleString());
      alert("✅ GitHub data synced successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 
        border border-white/10 text-white font-bold hover:scale-105 transition-all
        disabled:opacity-50 disabled:cursor-wait flex items-center gap-3"
    >
      <img src="https://cdn.simpleicons.org/github/white" className="w-5 h-5" />
      {syncing ? "Syncing..." : lastSync ? `Synced ${lastSync}` : "Sync GitHub"}
    </button>
  );
}