import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import ProgressSection from "../components/dashboard/ProgressSection";
import SkillsGrid from "../components/dashboard/SkillsGrid";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentMatches from "../components/dashboard/RecentMatches";
import Footer from "../components/dashboard/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex bg-background-dark">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Header />
          <ProgressSection />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-white text-[22px] font-bold mb-4">Your Skills</h2>
                <SkillsGrid />
              </section>
              <section>
                <h2 className="text-white text-[22px] font-bold mb-4">Last 30 Days Activity</h2>
                <ActivityChart />
              </section>
            </div>
            <aside className="lg:col-span-1">
              <RecentMatches />
            </aside>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
