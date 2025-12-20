import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import DashboardPage from "./pages/DashboardPage";
import SkillsPage from "./pages/dashboard/Skills";
import Analysis from "./pages/dashboard/Analysis";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Application */}
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
      </Routes>
    </BrowserRouter>
  );
}
