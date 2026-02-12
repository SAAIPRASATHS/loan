import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp, Landmark, Calculator, ShieldCheck, FileCheck,
    ArrowRight, Bot, Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import CircularScore from '../components/CircularScore';
import ReadinessScore from '../components/ReadinessScore';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Demo profile
    const demoProfile = {
        income: 35000, emi: 5000, loanAmount: 200000, creditScore: 720,
        employment: 'employed'
    };

    const [eligibility, setEligibility] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [eligRes, schemeRes] = await Promise.all([
                api.post('/eligibility', {
                    monthlyIncome: demoProfile.income,
                    existingEMIs: demoProfile.emi,
                    employmentType: demoProfile.employment,
                    loanAmount: demoProfile.loanAmount,
                    creditScore: demoProfile.creditScore
                }),
                api.post('/schemes', {
                    income: demoProfile.income,
                    employment: demoProfile.employment,
                    purpose: 'personal'
                })
            ]);
            setEligibility(eligRes.data);
            setSchemes(schemeRes.data.recommendations?.slice(0, 6) || []);
        } catch (err) {
            console.error('Dashboard data fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const readinessItems = [
        { label: t('dashboard.docs_uploaded'), completed: false, icon: FileCheck },
        { label: t('dashboard.income_verified'), completed: false, icon: ShieldCheck },
        { label: t('dashboard.emi_healthy'), completed: (demoProfile.emi / demoProfile.income) < 0.4, icon: TrendingUp },
        { label: t('dashboard.credit_acceptable'), completed: demoProfile.creditScore >= 650, icon: ShieldCheck },
    ];

    const quickActions = [
        { label: t('dashboard.action_chat'), icon: Bot, path: '/dashboard/chat', color: 'from-indigo-500 to-purple-600' },
        { label: t('dashboard.action_emi'), icon: Calculator, path: '/emi', color: 'from-cyan-500 to-blue-600' },
        { label: t('dashboard.action_check'), icon: ShieldCheck, path: '/eligibility', color: 'from-emerald-500 to-green-600' },
        { label: t('dashboard.action_schemes'), icon: Landmark, path: '/schemes', color: 'from-amber-500 to-orange-600' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="text-indigo-500" size={28} />
                    {t('dashboard.welcome')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map(action => (
                    <motion.button
                        key={action.path}
                        variants={item}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(action.path)}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white flex flex-col items-start gap-3 shadow-lg hover:shadow-xl transition-shadow`}
                    >
                        <action.icon size={28} />
                        <span className="font-semibold text-sm">{action.label}</span>
                        <ArrowRight size={16} className="mt-auto opacity-70" />
                    </motion.button>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Health Score */}
                <motion.div variants={item} initial="hidden" animate="show" className="card p-6">
                    <h3 className="font-bold text-lg mb-4">{t('dashboard.health_score')}</h3>
                    <div className="flex justify-center relative">
                        <CircularScore
                            score={eligibility?.eligibilityScore || 0}
                            label={t('dashboard.readiness_score')?.split(' ')[0] || "Health"}
                            color="auto"
                            size={160}
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {eligibility?.approvalProbability || t('dashboard.calculating')}
                        </p>
                    </div>
                </motion.div>

                {/* Eligibility Summary */}
                <motion.div variants={item} initial="hidden" animate="show" className="card p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-500" />
                        {t('dashboard.eligibility_summary')}
                    </h3>
                    {eligibility ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.eligible_amount')}</span>
                                <span className="font-bold text-emerald-600">₹{(eligibility.eligibleAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.current_foir')}</span>
                                <span className="font-semibold">{eligibility.details?.currentFOIR}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.projected_foir')}</span>
                                <span className="font-semibold">{eligibility.details?.projectedFOIR}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.est_emi')}</span>
                                <span className="font-semibold">₹{(eligibility.details?.estimatedEMI || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                {eligibility.suggestions?.slice(0, 2).map((s, i) => (
                                    <p key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1 mt-1">
                                        <span>💡</span> {s}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />)}
                        </div>
                    )}
                </motion.div>

                {/* Readiness Score */}
                <motion.div variants={item} initial="hidden" animate="show">
                    <ReadinessScore items={readinessItems} />
                </motion.div>
            </div>

            {/* Suggested Schemes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Landmark size={20} className="text-amber-500" />
                    {t('dashboard.suggested_schemes')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                            </div>
                        ))
                    ) : schemes.length > 0 ? schemes.map(scheme => (
                        <div key={scheme.id} className="card p-5 hover:border-indigo-300 dark:hover:border-indigo-600">
                            <h4 className="font-bold text-sm mb-2">{scheme.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{scheme.description}</p>
                            {scheme.whyQualifies?.slice(0, 1).map((reason, i) => (
                                <p key={i} className="text-xs text-emerald-600 dark:text-emerald-400">✓ {reason}</p>
                            ))}
                            <button
                                onClick={() => navigate('/schemes')}
                                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                Learn More <ArrowRight size={12} />
                            </button>
                        </div>
                    )) : (
                        <div className="card p-5 col-span-3 text-center text-slate-500">
                            <p>{t('dashboard.view_schemes')}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
