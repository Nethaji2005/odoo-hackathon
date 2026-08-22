/**
 * AuthContext — Minimal auth context for Employee Profile + Payroll module.
 *
 * INTEGRATION NOTE FOR MEMBER 1 (Auth):
 * ─────────────────────────────────────
 * This context reads a JWT from localStorage at key "dayflow_token".
 * It decodes the payload and exposes:
 *
 *   user = { id, role }   where role is "employee" | "admin" | "hr"
 *   token = "<jwt string>"
 *
 * Member 1 should:
 *   1. Keep the same localStorage key "dayflow_token".
 *   2. Ensure the JWT payload contains { id, role }.
 *   3. Optionally replace this file with a richer implementation that
 *      also handles login/logout/refresh, but keep the same exports:
 *      useAuth() returning { user, token, loading, login, logout }
 */

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification is done server-side. This is only for
 * reading the claims to render the UI appropriately.
 */
function decodeToken(token) {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    // Check expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("dayflow_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dayflow_token");
    return stored ? decodeToken(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Keep user in sync when token changes
  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, [token]);

  /**
   * login(jwtToken) — call this after receiving a token from the auth API.
   * Member 1's login page should call this.
   */
  const login = (jwtToken) => {
    localStorage.setItem("dayflow_token", jwtToken);
    setToken(jwtToken);
  };

  /**
   * logout() — clears token from storage.
   */
  const logout = () => {
    localStorage.removeItem("dayflow_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() — hook to access auth context in any component.
 *
 * Returns:
 *   user    — { id, role, ...jwtClaims } | null
 *   token   — JWT string | null
 *   loading — boolean
 *   login   — (token) => void
 *   logout  — () => void
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
