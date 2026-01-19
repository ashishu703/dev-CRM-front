import React, { useState } from 'react';
import { Eye, EyeOff, Users, BarChart3, Award, Zap, Settings, Grid3x3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { validateForm, LOGIN_VALIDATION_RULES } from '../../utils/validation';

// Left Login Component (Light Theme)
const LoginSection = ({ onLogin, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleValidateForm = () => {
    const formData = { email, password };
    const validation = validateForm(formData, LOGIN_VALIDATION_RULES);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidateForm()) {
      onLogin(email, password);
    }
  };

  return (
    <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 sm:mb-8 text-center">
          <img 
            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" 
            alt="Logo" 
            className="h-10 sm:h-12 mx-auto mb-3 sm:mb-4"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 sm:mb-3">Welcome Back</h1>
          <p className="text-gray-600 text-sm leading-relaxed px-2">
            Sign in to access your personalized dashboard and
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            manage your work and department operations
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Field */}
          <div>
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <label className="text-gray-700 text-sm font-medium">Email</label>
            </div>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-gray-700 placeholder-gray-400 bg-gray-50 transition-all duration-200 ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 rounded-full mr-2" />
                <label className="text-gray-700 text-sm font-medium">Password</label>
              </div>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-gray-700 placeholder-gray-400 bg-gray-50 pr-12 transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <span className="text-red-600 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              <>
                <span className="text-lg">→</span>
                <span>Sign in to Dashboard</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

// Right Business Hub Component (Dark/Blue Theme)
const BusinessHubSection = () => {
  return (
    <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden min-h-[400px] md:min-h-0">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-24 sm:w-32 h-24 sm:h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-32 sm:w-40 h-32 sm:h-40 bg-white rounded-full blur-xl"></div>
      </div>

      <div className="text-center max-w-lg relative z-10 w-full">
        {/* CRM Diagram */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl relative border border-white/20">
            <div className="absolute top-4 right-4">
              <div className="text-xs text-gray-500 font-medium">SERVICE</div>
              <div className="text-xs text-blue-600 font-bold">MANAGEMENT</div>
            </div>
            
            {/* Central CRM Hub */}
            <div className="relative flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-24 h-14 sm:w-32 sm:h-20 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"></div>
                <span className="text-white text-xl sm:text-2xl font-bold relative z-10">CRM</span>
              </div>
              
              {/* Connected Icons with Animation - Hidden on very small screens */}
              <div className="hidden sm:block absolute -top-8 -left-4 animate-pulse">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="w-px h-6 bg-blue-300 mx-auto mt-1"></div>
                <div className="w-8 h-px bg-blue-300"></div>
              </div>
              
              <div className="hidden sm:block absolute top-12 -right-8 animate-pulse" style={{animationDelay: '0.5s'}}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                </div>
                <div className="w-6 h-px bg-blue-300"></div>
              </div>
              
              <div className="hidden sm:block absolute -bottom-8 left-8 animate-pulse" style={{animationDelay: '1s'}}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <Grid3x3 className="w-4 h-4 text-white" />
                </div>
                <div className="w-px h-6 bg-blue-300 mx-auto"></div>
              </div>
              
              <div className="hidden md:block absolute bottom-4 -right-12 animate-pulse" style={{animationDelay: '1.5s'}}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
                </div>
                <div className="w-6 h-px bg-blue-300"></div>
              </div>
              
              <div className="hidden md:block absolute -bottom-4 left-12 animate-pulse" style={{animationDelay: '2s'}}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  <Settings className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg px-2">Your Digital Business Hub</h2>
        <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed drop-shadow-sm px-2">
          Access your centralized dashboard to efficiently
          <span className="hidden sm:inline"><br /></span>
          <span className="sm:hidden"> </span>
          manage your work and department operations
        </p>

        {/* Feature Cards */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 px-2">
          <div className="text-center group cursor-pointer flex-1 min-w-[100px] sm:flex-none">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-xl group-hover:scale-110 transition-all duration-300">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xs sm:text-sm text-white font-medium drop-shadow-sm">Real-time Analytics</div>
            <div className="text-xs text-blue-200">& Insights</div>
          </div>
          
          <div className="text-center group cursor-pointer flex-1 min-w-[100px] sm:flex-none">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-xl group-hover:scale-110 transition-all duration-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xs sm:text-sm text-white font-medium drop-shadow-sm">Customer</div>
            <div className="text-xs text-blue-200">Management Tools</div>
          </div>
          
          <div className="text-center group cursor-pointer flex-1 min-w-[100px] sm:flex-none">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-xl group-hover:scale-110 transition-all duration-300">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xs sm:text-sm text-white font-medium drop-shadow-sm">Service Performance</div>
            <div className="text-xs text-blue-200">Tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Login Page Component
const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email, password) => {
    clearError(); // Clear any previous errors
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard or handle successful login
      console.log('Login successful:', result.user);
      // You can add navigation logic here
      // navigate('/dashboard');
    }
    // Error handling is done in the context
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginSection onLogin={handleLogin} isLoading={isLoading} error={error} />
      <BusinessHubSection />
    </div>
  );
};

export default LoginPage;
