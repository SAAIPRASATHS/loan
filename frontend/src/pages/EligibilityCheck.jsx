import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertCircle, Lightbulb, IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import CircularScore from '../components/CircularScore';

const EligibilityCheck = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        monthlyIncome: 35000, existingEMIs: 5000,
        employmentType: 'employed', loanAmount: 200000,
        creditScore: 720, tenure: 60
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/eligibility', form);
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                    <ShieldCheck className="text-emerald-500" size={28} />
                    {t('eligibility.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('eligibility.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('schemes.income_label')}</label>
                        <input type="number" value={form.monthlyIncome} onChange={e => handleChange('monthlyIncome', +e.target.value)} className={inputClass} placeholder="e.g., 35000" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('eligibility.existing_emis')}</label>
                        <input type="number" value={form.existingEMIs} onChange={e => handleChange('existingEMIs', +e.target.value)} className={inputClass} placeholder="e.g., 5000" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('schemes.employment_label')}</label>
                        <select value={form.employmentType} onChange={e => handleChange('employmentType', e.target.value)} className={inputClass}>
                            <option value="employed">{t('schemes.types.employed')}</option>
                            <option value="self-employed">{t('schemes.types.self_employed')}</option>
                            <option value="business">{t('schemes.types.business')}</option>
                            <option value="student">{t('schemes.types.student')}</option>
                            <option value="unemployed">{t('schemes.types.unemployed')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('eligibility.loan_amount')}</label>
                        <input type="number" value={form.loanAmount} onChange={e => handleChange('loanAmount', +e.target.value)} className={inputClass} placeholder="e.g., 200000" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('eligibility.credit_score')} <span className="text-slate-400">(optional)</span></label>
                        <input type="number" value={form.creditScore} onChange={e => handleChange('creditScore', +e.target.value)} className={inputClass} placeholder="e.g., 720" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('eligibility.tenure')}</label>
                        <input type="number" value={form.tenure} onChange={e => handleChange('tenure', +e.target.value)} className={inputClass} placeholder="e.g., 60" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                        {loading ? t('eligibility.checking') : t('eligibility.check_btn')}
                    </button>
                </motion.form>

                {/* Results */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {result ? (
                        <>
                            {/* Score Circle */}
                            <div className="card p-6 flex flex-col items-center">
                                <div className="relative">
                                    <CircularScore score={result.eligibilityScore} label={t('eligibility.approval_chance')?.split(' ')[0]} color="auto" size={180} />
                                </div>
                                <p className="text-lg font-bold mt-4 text-indigo-600 dark:text-indigo-400">{result.approvalProbability}</p>
                            </div>

                            {/* Details */}
                            <div className="card p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-cyan-500" /> {t('eligibility.analysis_details')}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {result.details && Object.entries({
                                        [t('eligibility.monthly_income')]: `₹${result.details.monthlyIncome?.toLocaleString('en-IN')}`,
                                        [t('eligibility.existing_emis')]: `₹${result.details.existingEMIs?.toLocaleString('en-IN')}`,
                                        [t('eligibility.disposable_income')]: `₹${result.details.disposableIncome?.toLocaleString('en-IN')}`,
                                        [t('dashboard.est_emi')]: `₹${result.details.estimatedEMI?.toLocaleString('en-IN')}`,
                                        [t('dashboard.current_foir')]: result.details.currentFOIR,
                                        [t('dashboard.projected_foir')]: result.details.projectedFOIR,
                                    }).map(([k, v]) => (
                                        <div key={k} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{k}</span>
                                            <span className="text-xs font-semibold">{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <IndianRupee size={16} className="text-indigo-600" />
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{t('eligibility.max_loan')}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{(result.eligibleAmount || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="card p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <Lightbulb size={18} className="text-amber-500" /> {t('eligibility.improvement_suggestions')}
                                </h3>
                                <div className="space-y-2">
                                    {result.suggestions?.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-amber-500 mt-0.5">💡</span>
                                            <span className="text-slate-600 dark:text-slate-400">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card p-12 text-center">
                            <ShieldCheck size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 dark:text-slate-500">{t('eligibility.fill_details_hint')}</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default EligibilityCheck;
