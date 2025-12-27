import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/auth/AuthCallback";

import DashboardPage from "./pages/DashBoardPage";
import SkillsPage from "./pages/dashboard/Skills";
import Analysis from "./pages/dashboard/Analysis";
import ProfilePage from "./pages/dashboard/ProfilePage";
import FindMentorPage from "./pages/dashboard/FindMentorPage";
import ConnectionsPage from "./pages/dashboard/ConnectionsPage";
import PublicProfilePage from "./pages/dashboard/PublicProfilePage";

import ProtectedRoute from "./auth/ProtectedRoute";
import TestAPI from "./components/TestAPI";

export default function App() {
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
      <Route path="/find-mentor" element={<ProtectedRoute><FindMentorPage /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />


      <Route path="/test" element={<TestAPI />} />
    </Routes>
  );
}
