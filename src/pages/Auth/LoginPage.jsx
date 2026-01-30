import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { validateForm, LOGIN_VALIDATION_RULES } from '../../utils/validation';

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = (i) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.35 } });

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
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

  const handleLogin = async (emailVal, passwordVal) => {
    clearError();
    await login(emailVal, passwordVal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidateForm()) {
      handleLogin(email, password);
    }
  };

  const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Same gradient as landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial="initial"
        animate="animate"
        variants={{ initial: {}, animate: {} }}
      >
        {/* Logo — same as landing */}
        <motion.div className="mb-6 text-center" variants={fadeInUp}>
          <a href="/" className="inline-block focus:outline-none">
            <img
              src={ANOCAB_LOGO}
              alt="Anocab"
              className="h-12 mx-auto mb-2 drop-shadow-sm object-contain cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
          <p className="text-slate-500 text-xs font-medium tracking-wide">A Positive Connection...</p>
        </motion.div>

        {/* Single card - form + tagline in one block */}
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200/80 p-6 sm:p-8"
          variants={fadeInUp}
        >
          <div className="mb-6">
            <motion.h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1.5" variants={stagger(0)}>
              Welcome Back
            </motion.h1>
            <motion.p className="text-slate-600 text-sm" variants={stagger(1)}>
              Sign in to your dashboard
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={stagger(2)}>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                    errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </motion.div>

            <motion.div variants={stagger(3)}>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-slate-50/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                    errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </motion.div>

            {error && (
              <motion.div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-red-600 text-sm" variants={stagger(4)}>
                {error}
              </motion.div>
            )}

            <motion.div variants={stagger(5)}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Inline tagline - part of same card, no second panel */}
          <p className="text-center text-slate-500 text-xs mt-6 pt-5 border-t border-slate-100">
            Your Digital Business Hub · Analytics · Customer Management · Performance
          </p>
        </motion.div>

        {/* Small feature row below card - same background, no strip feel */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-6 text-slate-600"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
        >
          {[
            { icon: Zap, label: 'Analytics' },
            { icon: Users, label: 'CRM' },
            { icon: Award, label: 'Performance' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium">
              <item.icon className="w-3.5 h-3.5 text-blue-500" />
              {item.label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
