import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calculator, CheckCircle, BookOpen, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, color }) => (
    <Link to={to} className="block group">
        <div className="h-full p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    </Link>
);

const Home = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-20 py-12">
            {/* Hero Section */}
            <section className="relative px-6 text-center">
                {/* Abstract Background */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        {t('home.hero_badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {t('home.hero_title_1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">{t('home.hero_title_2')}</span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('home.hero_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <Link
                            to="/dashboard/chat"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={20} />
                            {t('home.chat_btn')}
                        </Link>
                        <Link
                            to="/eligibility"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={20} />
                            {t('home.check_btn')}
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid Removed - Accessed via Navbar */}

            {/* Stats Section */}
            <section className="px-6 py-20 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { label: 'Active Users', value: '10,000+' },
                        { label: 'Loans Processed', value: '₹50Cr+' },
                        { label: 'Languages', value: '4+' },
                        { label: 'AI Accuracy', value: '98%' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div >
    );
};

export default Home;
