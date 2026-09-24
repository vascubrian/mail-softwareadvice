import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);
const readUser = () => JSON.parse(localStorage.getItem('leadflow_user') || sessionStorage.getItem('leadflow_user') || 'null');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const signIn = async (email, password, remember = true) => {
    const response = await authService.login({ email, password });
    const storage = remember ? localStorage : sessionStorage;
    localStorage.removeItem('leadflow_token'); localStorage.removeItem('leadflow_user');
    sessionStorage.removeItem('leadflow_token'); sessionStorage.removeItem('leadflow_user');
    storage.setItem('leadflow_token', response.data.token);
    storage.setItem('leadflow_user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  };
  const signOut = () => {
    localStorage.removeItem('leadflow_token'); localStorage.removeItem('leadflow_user');
    sessionStorage.removeItem('leadflow_token'); sessionStorage.removeItem('leadflow_user');
    setUser(null);
  };
  return <AuthContext.Provider value={useMemo(() => ({ user, signIn, signOut }), [user])}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
