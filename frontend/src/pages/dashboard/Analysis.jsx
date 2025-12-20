import Sidebar from "../../components/dashboard/Sidebar";
import PageHeading from "../../components/dashboard/analysis/layout/PageHeading";
import ProfileHeader from "../../components/dashboard/analysis/layout/ProfileHeader";
import LanguageDistributionCard from "../../components/dashboard/analysis/card/LanguageDistributionCard";
import RecentActivityCard from "../../components/dashboard/analysis/card/RecentActivityCard";

export default function Analysis() {
  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">

          <PageHeading />

          <ProfileHeader />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mt-8">
            <div className="xl:col-span-3">
              <LanguageDistributionCard />
            </div>

            <div className="xl:col-span-2">
              <RecentActivityCard />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
