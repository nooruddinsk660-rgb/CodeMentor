import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/auth/AuthCallback";

import DashboardPage from "./pages/DashBoardPage";
import SkillsPage from "./pages/dashboard/Skills";
import Analysis from "./pages/dashboard/Analysis";
import ProfilePage from "./pages/dashboard/ProfilePage";
import Mentorship from "./pages/dashboard/Mentorship";
import ConnectionsPage from "./pages/dashboard/ConnectionsPage";
import PublicProfilePage from "./pages/dashboard/PublicProfilePage";
import CodeGalaxy from "./pages/dashboard/CodeGalaxy";
import CareerGalaxy from "./pages/dashboard/CareerGalaxy";
import MockInterviewArena from "./pages/dashboard/MockInterviewArena";
import BountyBoard from "./pages/dashboard/BountyBoard";
import SettingsPage from "./pages/dashboard/SettingsPage";

import ProtectedRoute from "./auth/ProtectedRoute";
import TestAPI from "./components/TestAPI";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Global cleanup: Remove 'crt-overlay' unless we are on a page that specifically requests it.
    // Currently, only SettingsPage *might* want it, but it handles its own state.
    // This ensures that if we navigate away from a "God Mode" page, the effect is cleared.
    if (location.pathname !== '/dashboard/settings') {
      document.body.classList.remove('crt-overlay');
    }
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/skills" element={<ProtectedRoute><SkillsPage></SkillsPage></ProtectedRoute>} />
      <Route path="/dashboard/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/find-mentor" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
      <Route path="/dashboard/galaxy" element={<ProtectedRoute><CodeGalaxy /></ProtectedRoute>} />
      <Route path="/dashboard/career" element={<ProtectedRoute><CareerGalaxy /></ProtectedRoute>} />
      <Route path="/dashboard/arena" element={<ProtectedRoute><MockInterviewArena /></ProtectedRoute>} />
      <Route path="/dashboard/bounties" element={<ProtectedRoute><BountyBoard /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="/test" element={<TestAPI />} />
    </Routes>
  );
}
