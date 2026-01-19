import React, { createContext, useReducer, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  INITIALIZE: 'INITIALIZE',
  SET_LOADING: 'SET_LOADING',
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.INITIALIZE:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context with default value to prevent "must be used within AuthProvider" errors
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => ({ success: false, error: 'Not initialized' }),
  impersonate: async () => ({ success: false, error: 'Not initialized' }),
  register: async () => ({ success: false, error: 'Not initialized' }),
  logout: async () => ({ success: false }),
  clearError: () => {},
  refreshUser: async () => ({ success: false, error: 'Not initialized' }),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const impersonateToken = url.searchParams.get('impersonateToken');
        if (impersonateToken) {
          sessionStorage.setItem('authToken', impersonateToken); 
          sessionStorage.setItem('impersonating', 'true'); 
          
          apiClient.setAuthToken(impersonateToken);
          const profile = await apiClient.get(API_ENDPOINTS.PROFILE);
          if (profile?.success && profile?.data?.user) {
            const userData = profile.data.user;
            if (!userData.uiUserType && userData.role && userData.departmentType) {
              const { getUserTypeForRole } = await import('../constants/auth');
              userData.uiUserType = getUserTypeForRole(userData.role, userData.departmentType);
            }
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
          
          url.searchParams.delete('impersonateToken');
          window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
        }

        const isImpersonating = sessionStorage.getItem('impersonating') === 'true';
        const token = (isImpersonating ? sessionStorage.getItem('authToken') : null) || apiClient.getAuthToken();
        const user = isImpersonating
          ? JSON.parse(sessionStorage.getItem('user') || 'null')
          : JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token && user) {
          // Ensure uiUserType is set if missing
          if (!user.uiUserType && user.role && user.departmentType) {
            const { getUserTypeForRole } = await import('../constants/auth');
            user.uiUserType = getUserTypeForRole(user.role, user.departmentType);
          }
          
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE,
            payload: {
              user,
              isAuthenticated: true,
            },
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOGOUT,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({
          type: AUTH_ACTIONS.LOGOUT,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      if (response.success && response.data) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('impersonating');
        sessionStorage.removeItem('user');
        
        apiClient.setAuthToken(response.data.token);
        
        // Fetch latest user profile to ensure we have updated username/email
        let userData = response.data.user;
        try {
          const profile = await apiClient.get(API_ENDPOINTS.PROFILE);
          if (profile?.success && profile?.data?.user) {
            userData = profile.data.user;
          }
        } catch (profileError) {
          console.warn('Failed to fetch profile after login, using login response data:', profileError);
          // Continue with login response data if profile fetch fails
        }
        
        // Ensure uiUserType is set if missing
        if (!userData.uiUserType && userData.role && userData.departmentType) {
          const { getUserTypeForRole } = await import('../constants/auth');
          userData.uiUserType = getUserTypeForRole(userData.role, userData.departmentType);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: userData,
          },
        });
        return { success: true, user: userData, token: response.data.token };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: {
          error: error.message || 'Login failed',
        },
      });
      return { success: false, error: error.message };
    }
  };

  // Impersonate (SuperAdmin only) - DO NOT mutate current tab state/storage
  const impersonate = async (email) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.IMPERSONATE, {
        email,
      });
      if (response.success && response.data) {
        return { success: true, user: response.data.user, token: response.data.token };
      }
      return { success: false, error: response.error || 'Impersonation failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function (for SuperAdmin to create users)
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
      
      if (response.success && response.data) {
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: {
          error: error.message || 'Registration failed',
        },
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    
    apiClient.removeAuthToken();
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    return { success: true };
  };


  // Clear error function
  const clearError = () => {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: {
        error: null,
      },
    });
  };

  // Refresh user data from profile API (useful after username/email updates)
  const refreshUser = async () => {
    try {
      const profile = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (profile?.success && profile?.data?.user) {
        const userData = profile.data.user;
        // Ensure uiUserType is set if missing
        if (!userData.uiUserType && userData.role && userData.departmentType) {
          const { getUserTypeForRole } = await import('../constants/auth');
          userData.uiUserType = getUserTypeForRole(userData.role, userData.departmentType);
        }
        
        // Update localStorage
        const isImpersonating = sessionStorage.getItem('impersonating') === 'true';
        if (isImpersonating) {
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Update AuthContext
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: userData,
          },
        });
        
        return { success: true, user: userData };
      }
      return { success: false, error: 'Failed to fetch profile' };
    } catch (error) {
      console.error('Error refreshing user:', error);
      return { success: false, error: error.message || 'Failed to refresh user' };
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    impersonate,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

