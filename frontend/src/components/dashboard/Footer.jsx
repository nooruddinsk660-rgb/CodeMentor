import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0B0F19] pt-12 pb-8 px-6 md:px-12 mt-auto text-gray-900 dark:text-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* 1. BRAND & MISSION (Institutional) */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-gray-900 dark:text-white text-lg font-black tracking-tight flex items-center gap-2">
              Dev<span className="text-blue-600 dark:text-blue-500">OS</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-500 text-xs leading-relaxed mt-4 max-w-xs">
              The operating system for engineering growth. Built for long-term technical mastery, not shortcuts.
            </p>

            {/* System Status Indicator */}
            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                System Operational
              </span>
            </div>
          </div>

          {/* 2. NAVIGATION (Semantic) */}
          <nav className="col-span-1 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">

            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Neural Sync</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Gravity Field</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Organization</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Mission</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Engineering Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Governance</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy Protocol</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>

          </nav>
        </div>

        {/* 3. SUB-FOOTER (Closure) */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-600 text-xs">
            © {currentYear} DevOS Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-700 font-mono">v2.4.0 (Stable)</span>
            <span className="text-[10px] text-gray-700 font-mono">IND-WB-10</span>
          </div>
        </div>

      </div>
    </footer>
  );
}