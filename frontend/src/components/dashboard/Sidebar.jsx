import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate
} from "framer-motion";
import { readCollapsedState, writeCollapsedState } from "../../utils/sidebar";
import { logout } from "../../utils/auth";
import { Lock, Menu, Power } from "lucide-react"; // Added consistent icons

// --- Configuration ---
const groupsInitial = [
  {
    id: "general",
    title: "System Parameters",
    items: [
      { to: "/dashboard", label: "Command Center", icon: "dashboard" },
      { to: "/dashboard/analysis", label: "Neural Analysis", icon: "query_stats" },
      { to: "/dashboard/galaxy", label: "Code Galaxy", icon: "orbit" },
      { to: "/dashboard/career", label: "Career Galaxy", icon: "rocket_launch" }
    ],
  },
  {
    id: "mentorship",
    title: "Network Nodes",
    items: [
      { to: "/find-mentor", label: "Find Mentors", icon: "group" },
      { to: "/connections", label: "Connections", icon: "hub" },
      { to: "/dashboard/skills", label: "Skill Matrix", icon: "menu_book" },
    ],
  },
  {
    id: "account",
    title: "Configuration",
    items: [
      { to: "/profile", label: "Identity", icon: "person" },
      { to: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
  {
    id: "economy",
    title: "Economy",
    items: [
      { to: "/dashboard/arena", label: "Interview Arena", icon: "swords" },
      { to: "/dashboard/bounties", label: "Bounty Board", icon: "monetization_on" },
    ],
  },
];

export default function Sidebar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => readCollapsedState());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mouse tracking for the spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => writeCollapsedState(collapsed), [collapsed]);
  useEffect(() => setMobileOpen(false), [loc.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleGroup = (id) => {
    setCollapsed((s) => ({ ...s, [id]: !s[id] }));
  };

  return (
    <>
      {/* --- Mobile Trigger (Floating Pill) --- */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#030712]/90 backdrop-blur-xl border border-cyan-500/30 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest">System Menu</span>
        </button>
      </div>

      {/* --- Mobile Drawer (Glass Overlay) --- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-[#030712] border-r border-white/10 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Header Branding */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-cyan-400">deployed_code</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">DevOS <span className="text-cyan-500 text-xs align-top">MOBILE</span></h2>
                    <div className="h-0.5 w-12 bg-cyan-500/50 mt-1" />
                  </div>
                </div>

                <SidebarContent
                  collapsed={collapsed}
                  toggleGroup={toggleGroup}
                  handleLogout={handleLogout}
                  mobileClose={() => setMobileOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Desktop Sidebar (Floating Glass) --- */}
      <aside
        onMouseMove={handleMouseMove}
        className="hidden lg:flex w-72 flex-shrink-0 relative z-50 h-screen p-4 pl-4"
      >
        {/* The FLOATING Container */}
        <div className="relative flex flex-col w-full h-full rounded-[20px] overflow-hidden border border-white/5 bg-[#030712]/80 shadow-2xl backdrop-blur-xl">

          <SpotlightBackground mouseX={mouseX} mouseY={mouseY} />

          <div className="relative z-10 flex flex-col h-full">
            <SidebarContent
              collapsed={collapsed}
              toggleGroup={toggleGroup}
              handleLogout={handleLogout}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

// --- Visual Components ---

function SpotlightBackground({ mouseX, mouseY }) {
  return (
    <motion.div
      className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            600px circle at ${mouseX}px ${mouseY}px,
            rgba(6, 182, 212, 0.05),
            transparent 80%
          )
        `,
      }}
    />
  );
}

function SidebarContent({ collapsed, toggleGroup, handleLogout, mobileClose }) {
  const location = useLocation();

  const isActive = (to) => {
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <div className="flex flex-col h-full">

      {/* --- BRANDING --- */}
      <div className="p-6 pb-2 hidden lg:block">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center shadow-lg ring-1 ring-cyan-500/20">
            <span className="material-symbols-outlined text-cyan-400 text-lg">deployed_code</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              Dev<span className="text-cyan-400">OS</span>
            </h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mt-0.5">
              Neural Interface
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-4" />
      </div>
      {/* --------------------------------------------------- */}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar space-y-6 mt-4">
        {groupsInitial.map((group, groupIdx) => {
          const isCollapsed = !!collapsed[group.id];

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
            >
              {/* Group Title */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] hover:text-cyan-400 transition-colors group mb-1"
              >
                <span>{group.title}</span>
                <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"} opacity-50 group-hover:opacity-100`}>
                  expand_more
                </span>
              </button>

              {/* Links */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-1"
                  >
                    {group.items.map((item) => (
                      <MenuItem
                        key={item.to}
                        item={item}
                        active={isActive(item.to)}
                        onClick={mobileClose}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer / User Info */}
      <div className="mt-auto p-3 border-t border-white/5 mx-2 mb-2">
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center lg:justify-start gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
        >
          <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Terminate Session</span>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ item, active, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className="relative block group"
    >
      {/* Background & Glow Effect */}
      {active && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-cyan-500/10 border-l-[3px] border-cyan-400 rounded-r-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div className={`relative z-10 flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 ${active ? "text-white translate-x-1" : "text-gray-400 group-hover:text-gray-200 group-hover:translate-x-1"
        }`}>
        <span className={`material-symbols-outlined text-[18px] transition-colors ${active ? "text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-gray-500 group-hover:text-white"
          }`}>
          {item.icon}
        </span>
        <span className="text-sm font-medium tracking-wide">{item.label}</span>
      </div>
    </NavLink>
  );
}