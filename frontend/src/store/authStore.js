import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { data, token } = response.data;
          
          set({
            user: data,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.error || 'Login failed' 
          };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { data, token } = response.data;
          
          set({
            user: data,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.error || 'Registration failed' 
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });

          // Remove auth header
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', profileData);
          const { data } = response.data;
          
          set({
            user: data,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.error || 'Profile update failed' 
          };
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          const { data } = response.data;
          
          set({
            user: data,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          // Token is invalid, clear auth
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
          
          delete api.defaults.headers.common['Authorization'];
          return false;
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        delete api.defaults.headers.common['Authorization'];
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
