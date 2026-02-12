import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(form.name, form.email, form.password);
            } else {
                await login(form.email, form.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await login('demo@finbridge.ai', 'demo123');
            navigate('/dashboard');
        } catch (err) {
            setError('Demo login failed. Please register a new account.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass rounded-3xl p-8 w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                        <Bot size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">FinBridge AI</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {isRegister ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div className="relative">
                            <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className={inputClass} />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" required className={inputClass} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Password" required minLength={6} className={inputClass} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                                {isRegister ? 'Create Account' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400">or</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Demo Login */}
                <button onClick={handleDemoLogin} disabled={loading}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    🎮 Try Demo Account
                </button>

                {/* Toggle */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-indigo-600 dark:text-indigo-400 font-medium ml-1 hover:underline">
                        {isRegister ? 'Sign In' : 'Register'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
