/**
 * App context — token-based authentication with role-protected access
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, UserRole } from './api';
import { authMe, authLogout } from './api';

interface AppContextType {
  // Auth state
  token: string | null;
  user: AuthUser | null;
  role: UserRole;
  // Derived helpers (backward-compat with existing pages)
  studentId: number | null;
  teacherId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  setAuth: (token: string, user: AuthUser) => void;
  signOut: () => void;
  // Legacy setters kept for ProfilePage etc. — they are no-ops for auth but can update local user state
  setRole: (role: UserRole) => void;
  setStudentId: (id: number | null) => void;
  setTeacherId: (id: number | null) => void;
}

const AppContext = createContext<AppContextType>({
  token: null,
  user: null,
  role: 'student',
  studentId: null,
  teacherId: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: () => {},
  signOut: () => {},
  setRole: () => {},
  setStudentId: () => {},
  setTeacherId: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('campushub_token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, if token exists try to restore session from backend
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    authMe()
      .then((u) => {
        setUser(u);
        setIsLoading(false);
      })
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem('campushub_token');
        setToken(null);
        setUser(null);
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAuth = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('campushub_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = () => {
    authLogout().catch(() => {}); // fire-and-forget
    localStorage.removeItem('campushub_token');
    setToken(null);
    setUser(null);
  };

  // Derived values
  const role: UserRole = user?.role ?? 'student';
  const studentId = role === 'student' ? (user?.profile_id ?? null) : null;
  const teacherId = role === 'teacher' ? (user?.profile_id ?? null) : null;
  const isAuthenticated = Boolean(token && user);

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        role,
        studentId,
        teacherId,
        isAuthenticated,
        isLoading,
        setAuth,
        signOut,
        // Legacy no-ops kept for compatibility
        setRole: () => {},
        setStudentId: () => {},
        setTeacherId: () => {},
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export type { UserRole };
export const useApp = () => useContext(AppContext);
