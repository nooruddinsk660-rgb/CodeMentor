import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import DashboardPage from "./pages/DashboardPage";
import SkillsPage from "./pages/dashboard/Skills";
import Analysis from "./pages/dashboard/Analysis";

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

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/skills"
        element={
          <ProtectedRoute>
            <SkillsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/analysis"
        element={
          <ProtectedRoute>
            <Analysis />
          </ProtectedRoute>
        }
      />

      <Route path="/test" element={<TestAPI />} />
    </Routes>
  );
}
