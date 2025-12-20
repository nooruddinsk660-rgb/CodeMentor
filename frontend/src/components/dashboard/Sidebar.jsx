import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useMotionTemplate 
} from "framer-motion";
import { readCollapsedState, writeCollapsedState } from "../../utils/sidebar"; 
import { logout } from "../../utils/auth";

const BRAND_AVATAR = "/mnt/data/5aac0a6a-21b0-444e-a313-1ee4ce16044c.png";

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
      { to: "/dashboard/skills", label: "Skills", icon: "menu_book" },
      { to: "/dashboard/analysis", label: "Analysis", icon: "analytics" },
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
  
  // Mouse tracking for the global spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => writeCollapsedState(collapsed), [collapsed]);
  useEffect(() => setMobileOpen(false), [loc.pathname]);

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleGroup = (id) => {
    setCollapsed((s) => {
      const next = { ...s, [id]: !s[id] };
      writeCollapsedState(next);
      return next;
    });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Overlay & Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0B0F19] border-r border-white/10"
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

      {/* Desktop Sidebar (The Impressive Part) */}
      <aside
        onMouseMove={handleMouseMove}
        className="hidden md:flex w-72 flex-shrink-0 bg-[#0B0F19] relative overflow-hidden border-r border-white/10 flex-col h-screen"
      >
        {/* The "Spotlight" Background Layer */}
        <SpotlightBackground mouseX={mouseX} mouseY={mouseY} />
        
        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full p-4">
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

// --- Components ---

function SpotlightBackground({ mouseX, mouseY }) {
  return (
    <motion.div
      className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            650px circle at ${mouseX}px ${mouseY}px,
            rgba(56, 189, 248, 0.1),
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
      {/* Header / Brand */}
      <div className="flex items-center gap-4 px-2 py-6 mb-2">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <img 
                src={BRAND_AVATAR} 
                alt="Brand" 
                className="relative w-10 h-10 rounded-full object-cover border border-white/10" 
            />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-wide text-lg">CodeMentor</h1>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            <p className="text-xs text-gray-400 font-medium">AI Active</p>
          </div>
        </div>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
        {groupsInitial.map((group) => {
          const isCollapsed = !!collapsed[group.id];
          
          return (
            <div key={group.id}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors group"
              >
                <span>{group.title}</span>
                <motion.span
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  expand_more
                </motion.span>
              </button>

              {/* Animated Group Items */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 mt-1 px-1">
                      {group.items.map((item, idx) => (
                        <MenuItem
                          key={item.to}
                          item={item}
                          active={isActive(item.to)}
                          idx={idx} // Used for staggering effect
                          onClick={mobileClose}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-3 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
        >
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">logout</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ item, active, onClick, idx }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className="relative block group"
    >
      {/* Background shape that appears on Hover/Active */}
      {active ? (
        <motion.div
          layoutId="activeNavParams"
          className="absolute inset-0 bg-blue-600/10 border border-blue-500/30 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.15)] z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      ) : (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-200 z-0" />
      )}

      {/* The Content */}
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 + idx * 0.05 }} // Staggered entrance
        className={`relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
          active ? "text-white" : "text-gray-400 group-hover:text-gray-100"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] transition-colors ${
            active ? "text-blue-400" : "text-gray-500 group-hover:text-white"
          }`}
        >
          {item.icon}
        </span>
        <span className="text-sm font-medium">{item.label}</span>
        
        {/* Optional: Arrow that appears on hover */}
        {!active && (
           <motion.span 
             initial={{ opacity: 0, x: -5 }}
             whileHover={{ opacity: 1, x: 0 }}
             className="ml-auto text-gray-600 material-symbols-outlined text-[14px]"
           >
             chevron_right
           </motion.span>
        )}
      </motion.div>
    </NavLink>
  );
}