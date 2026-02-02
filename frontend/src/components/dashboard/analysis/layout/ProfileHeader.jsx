import React from "react";

export default function ProfileHeader({ user, githubProfile, loading }) {
  if (loading) return <div className="h-32 w-full bg-[#0B0F19] rounded-2xl animate-pulse border border-white/5" />;

  return (
    <div className="p-8 bg-[#0B0F19] rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
      
      {/* Identity */}
      <div className="flex items-center gap-6">
        <div className="relative">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-[#0B0F19] p-1 rounded-full">
                <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
            </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {user?.fullName || user?.username}
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20 uppercase tracking-wide">
                PRO ACCOUNT
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">@{githubProfile?.username}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-8 text-center">
         <div>
            <p className="text-2xl font-black text-white">{githubProfile?.publicRepos || 0}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Repos</p>
         </div>
         <div className="w-px bg-white/10 h-8 self-center" />
         <div>
            <p className="text-2xl font-black text-white">{githubProfile?.followers || 0}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Followers</p>
         </div>
      </div>

    </div>
  );
}