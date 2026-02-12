import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, MessageSquare, Calculator, ShieldCheck,
    Landmark, GraduationCap, FileUp, Sun, Moon, LogOut,
    ChevronLeft, ChevronRight, Bot
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/chat', icon: MessageSquare, label: 'Chat Assistant' },
    { path: '/emi', icon: Calculator, label: 'EMI Simulator' },
    { path: '/eligibility', icon: ShieldCheck, label: 'Eligibility Check' },
    { path: '/schemes', icon: Landmark, label: 'Schemes' },
    { path: '/learning', icon: GraduationCap, label: 'Financial Learning' },
    { path: '/documents', icon: FileUp, label: 'Documents' },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
            ${collapsed ? 'w-[72px]' : 'w-[250px]'}
            bg-[#0f172a] text-white`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shrink-0">
                    <Bot size={22} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-lg font-bold tracking-tight leading-tight">FinBridge</h1>
                        <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">AI Advisor</p>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-indigo-600/30 text-cyan-300 shadow-lg shadow-indigo-500/10'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-white/10 space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
