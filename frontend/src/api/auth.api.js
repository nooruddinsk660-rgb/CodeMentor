import { apiRequest } from "./client";

export const login = (payload) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const register = (payload) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const logout = () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });
