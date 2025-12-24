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

// Replace with your actual logo or a placeholder
const BRAND_AVATAR = "https://ui-avatars.com/api/?name=Code+Mentor&background=0D8ABC&color=fff";

// --- Configuration ---
const groupsInitial = [
  {
    id: "general",
    title: "General",
    items: [{ to: "/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    id: "mentorship",
    title: "Mentorship",
    items: [
      { to: "/find-mentor", label: "Find a Mentor", icon: "group" },
      { to: "/connections", label: "My Connections", icon: "hub" }, // Added Connections
      { to: "/dashboard/skills", label: "Skills Matrix", icon: "menu_book" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: "person" },
      { to: "/settings", label: "Settings", icon: "settings" },
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
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600/90 backdrop-blur-xl border border-white/20 text-white shadow-2xl shadow-blue-500/40 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
          <span className="text-sm font-bold uppercase tracking-wider">Menu</span>
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
              className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-[#0B0F19] border-r border-white/10 shadow-2xl"
            >
              <SidebarContent
                collapsed={collapsed}
                toggleGroup={toggleGroup}
                handleLogout={handleLogout}
                mobileClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Desktop Sidebar --- */}
      <aside
        onMouseMove={handleMouseMove}
        className="hidden lg:flex w-72 flex-shrink-0 bg-[#0B0F19] relative overflow-hidden border-r border-white/5 flex-col h-screen"
      >
        <SpotlightBackground mouseX={mouseX} mouseY={mouseY} />
        
        <div className="relative z-10 flex flex-col h-full p-5">
          <SidebarContent
            collapsed={collapsed}
            toggleGroup={toggleGroup}
            handleLogout={handleLogout}
          />
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
            rgba(56, 189, 248, 0.08),
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
      {/* Brand Header */}
      <div className="flex items-center gap-4 px-2 py-6 mb-6">
        <div className="relative">
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
            <img 
                src={BRAND_AVATAR} 
                alt="Brand" 
                className="relative w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg" 
            />
        </div>
        <div>
          <h1 className="text-white font-black tracking-wide text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CodeMentor
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase">Systems Online</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        {groupsInitial.map((group, groupIdx) => {
          const isCollapsed = !!collapsed[group.id];
          
          return (
            <motion.div 
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
            >
              {/* Group Title */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors group mb-2"
              >
                <span>{group.title}</span>
                <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>
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
      <div className="mt-6 pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="group relative flex items-center gap-3 w-full px-4 py-3.5 text-gray-400 hover:text-white rounded-xl overflow-hidden transition-all duration-300"
        >
           <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
           <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1 group-hover:text-red-400">logout</span>
           <span className="text-sm font-medium z-10 group-hover:text-red-400">Disconnect</span>
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
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-600/5 border-l-2 border-blue-500 rounded-r-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Hover Background */}
      {!active && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-200" />
      )}

      <div className={`relative z-10 flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 ${
        active ? "text-white translate-x-1" : "text-gray-400 group-hover:text-gray-200"
      }`}>
        <span className={`material-symbols-outlined text-[20px] transition-colors ${
           active ? "text-blue-400" : "text-gray-500 group-hover:text-white"
        }`}>
          {item.icon}
        </span>
        <span className="text-sm font-medium">{item.label}</span>
      </div>
    </NavLink>
  );
}