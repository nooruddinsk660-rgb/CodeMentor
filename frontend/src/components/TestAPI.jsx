import { useEffect } from "react";
import { healthCheck } from "../services/api";

export default function TestAPI() {
  useEffect(() => {
    healthCheck().then(console.log);
  }, []);

  return <h2>Backend Integration Test</h2>;
}
