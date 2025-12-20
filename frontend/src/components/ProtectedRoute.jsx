import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🔍 DEBUG (TEMPORARY)
  console.log("PROTECTED ROUTE TOKEN:", token);


  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
