import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  userId: string | null;
  token: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  setup: (username: string, password: string) => Promise<string>;
  completeSetup: () => void;
  logout: () => Promise<void>;
  hasUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "dental_session_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasUsers, setHasUsers] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { has_users } = await api.auth.hasUsers();
        setHasUsers(has_users);

        if (has_users) {
          const storedToken = localStorage.getItem(SESSION_KEY);
          if (storedToken) {
            try {
              const response = await api.auth.verifySession(storedToken);
              setToken(response.token);
              setUsername(response.username);
              setUserId(response.user_id);
              setIsAuthenticated(true);
              localStorage.setItem(SESSION_KEY, response.token);
            } catch {
              localStorage.removeItem(SESSION_KEY);
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean) => {
      const response = await api.auth.login({ username, password }, rememberMe);
      setToken(response.token);
      setUsername(response.username);
      setUserId(response.user_id);
      setIsAuthenticated(true);
      setHasUsers(true);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, response.token);
      }
    },
    [],
  );

  const setup = useCallback(
    async (username: string, password: string) => {
      const response = await api.auth.setup({ username, password });
      setToken(response.token);
      setUsername(response.username);
      setUserId(response.user_id);
      localStorage.setItem(SESSION_KEY, response.token);
      return response.recovery_key;
    },
    [],
  );

  const completeSetup = useCallback(() => {
    setHasUsers(true);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.auth.logout(token);
      } catch {
        // Ignore logout errors
      }
    }
    setToken(null);
    setUsername(null);
    setUserId(null);
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, username, userId, token, login, setup, completeSetup, logout, hasUsers }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
