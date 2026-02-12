import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bot, Globe, User, LogOut, Menu, X, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { language, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const navigate = useNavigate();

    const navLinks = [
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.chat'), path: '/dashboard/chat' },
        { name: t('nav.emi'), path: '/emi' },
        { name: t('nav.eligibility'), path: '/eligibility' },
        { name: t('nav.health'), path: '/dashboard' },
    ];

    const searchableItems = [
        { title: 'Personal Loan', path: '/schemes', type: 'Loan' },
        { title: 'Home Loan', path: '/schemes', type: 'Loan' },
        { title: 'Education Loan', path: '/schemes', type: 'Loan' },
        { title: 'Business Loan', path: '/schemes', type: 'Loan' },
        { title: 'EMI Calculator', path: '/emi', type: 'Tool' },
        { title: 'Eligibility Check', path: '/eligibility', type: 'Tool' },
        { title: 'Chat Assistant', path: '/dashboard/chat', type: 'Feature' },
        { title: 'PM Mudra Yojana', path: '/schemes', type: 'Scheme' },
        { title: 'PMAY Housing', path: '/schemes', type: 'Scheme' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Search Logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        const results = searchableItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
    }, [searchQuery]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' }
    ];

    const currentLangName = languages.find(l => l.code === language)?.name || 'English';

    return (
        <nav className="glass sticky top-0 z-50 border-b border-white/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                            <Bot size={24} />
                        </div>
                        <div className="flex flex-col leading-none hidden sm:flex">
                            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors">
                                FinBridge
                            </span>
                            <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase">
                                AI Advisor
                            </span>
                        </div>
                    </NavLink>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-md mx-8 relative" ref={searchRef}>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('nav.search_placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/50 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-300 outline-none transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchOpen && searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                >
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                navigate(result.path);
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center justify-between group"
                                        >
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{result.title}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">{result.type}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex items-center gap-1 bg-white/50 p-1.5 rounded-2xl border border-white/40 backdrop-blur-sm">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative border-2 ${isActive
                                        ? 'text-slate-900 bg-white border-blue-600 shadow-md transform scale-105'
                                        : 'text-slate-600 border-transparent hover:text-indigo-600 hover:bg-white/40'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/60 bg-white/50 hover:bg-white text-slate-600 hover:text-indigo-600 transition-all text-sm font-medium shadow-sm"
                            >
                                <Globe size={18} />
                                <span>{currentLangName}</span>
                                <ChevronDown size={14} />
                            </button>

                            <AnimatePresence>
                                {isLangDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                                    >
                                        {languages.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    changeLanguage(lang.code);
                                                    setIsLangDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 flex items-center justify-between
                                                    ${language === lang.code ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'}
                                                `}
                                            >
                                                {lang.name}
                                                {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border border-slate-200/60 bg-white/50 hover:bg-white hover:shadow-md transition-all group"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border-2 border-white">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <span className="hidden md:block text-sm font-semibold text-slate-700 group-hover:text-indigo-700">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400 group-hover:text-indigo-500" />
                                </button>

                                <AnimatePresence>
                                    {isUserDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-56 glass-card rounded-2xl overflow-hidden z-50 origin-top-right"
                                        >
                                            <div className="p-4 border-b border-slate-100/50 bg-gradient-to-b from-white/80 to-transparent">
                                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Signed in as</div>
                                                <div className="text-sm font-bold text-slate-900 truncate">{user?.email}</div>
                                            </div>
                                            <div className="p-2">
                                                <button
                                                    onClick={() => navigate('/dashboard/profile')}
                                                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3"
                                                >
                                                    <User size={18} /> {t('nav.profile_settings')}
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3 mt-1"
                                                >
                                                    <LogOut size={18} /> {t('nav.sign_out')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
                            >
                                {t('nav.sign_in')}
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden glass border-t border-white/20 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {/* Mobile Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 border border-transparent outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-4 py-3.5 rounded-2xl text-base font-semibold transition-all ${isActive
                                                ? 'text-indigo-700 bg-indigo-50/80 border border-indigo-100'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                            }`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
