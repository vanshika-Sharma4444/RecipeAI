import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('recipeai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('recipeai_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Validate session on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('recipeai_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('recipeai_token', jwtToken);
        localStorage.setItem('recipeai_user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('recipeai_token', jwtToken);
        localStorage.setItem('recipeai_user', JSON.stringify(userData));
        toast.success(`Welcome to RecipeAI, ${userData.name}!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('recipeai_token');
    localStorage.removeItem('recipeai_user');
    toast.info('You have been logged out.');
  };

  const isFavourited = (recipeId) => {
    if (!user || !user.favourites) return false;
    return user.favourites.some(
      (f) => (typeof f === 'string' ? f : f._id) === recipeId
    );
  };

  const toggleFavourite = async (recipeId) => {
    if (!user) {
      toast.info('Please log in to save recipes to your favourites!');
      return false;
    }

    const currentlyFav = isFavourited(recipeId);

    try {
      if (currentlyFav) {
        await api.delete(`/favourites/${recipeId}`);
        const updatedFavs = user.favourites.filter(
          (f) => (typeof f === 'string' ? f : f._id) !== recipeId
        );
        const updatedUser = { ...user, favourites: updatedFavs };
        setUser(updatedUser);
        localStorage.setItem('recipeai_user', JSON.stringify(updatedUser));
        toast.info('Removed from favourites.');
      } else {
        await api.post(`/favourites/${recipeId}`);
        const updatedFavs = [...(user.favourites || []), recipeId];
        const updatedUser = { ...user, favourites: updatedFavs };
        setUser(updatedUser);
        localStorage.setItem('recipeai_user', JSON.stringify(updatedUser));
        toast.success('Saved to favourites! ❤️');
      }
      return true;
    } catch (err) {
      toast.error(err.message || 'Could not update favourites.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        toggleFavourite,
        isFavourited,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

