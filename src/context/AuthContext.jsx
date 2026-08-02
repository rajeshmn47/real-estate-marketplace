import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('housing_token') || '');
  const [loading, setLoading] = useState(true);

  const setApiToken = (tokenValue) => {
    if (tokenValue) {
      api.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  };

  useEffect(() => {
    if (token) {
      setApiToken(token);
      api
        .get('/auth/profile')
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setApiToken('');
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: authToken, user: authUser } = response.data;
    localStorage.setItem('housing_token', authToken);
    setToken(authToken);
    setUser(authUser);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token: authToken, user: authUser } = response.data;
    localStorage.setItem('housing_token', authToken);
    setToken(authToken);
    setUser(authUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('housing_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
