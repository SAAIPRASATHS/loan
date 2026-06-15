import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ExternalLink, CheckCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Schemes = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ income: 35000, employment: 'employed', purpose: 'personal' });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const purposes = ['personal', 'home', 'education', 'business', 'startup', 'working-capital'];

    const handleSearch = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/schemes', form);
            setResults(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                    <Landmark className="text-amber-500" size={28} />
                    {t('schemes.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('schemes.subtitle')}</p>
            </motion.div>

            {/* Search Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1 block text-slate-500 dark:text-slate-400">{t('schemes.income_label')}</label>
                        <input type="number" value={form.income} onChange={e => setForm({ ...form, income: +e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block text-slate-500 dark:text-slate-400">{t('schemes.employment_label')}</label>
                        <select value={form.employment} onChange={e => setForm({ ...form, employment: e.target.value })} className={inputClass}>
                            <option value="employed">{t('schemes.types.employed')}</option>
                            <option value="self-employed">{t('schemes.types.self_employed')}</option>
                            <option value="business">{t('schemes.types.business')}</option>
                            <option value="student">{t('schemes.types.student')}</option>
                            <option value="unemployed">{t('schemes.types.unemployed')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block text-slate-500 dark:text-slate-400">{t('schemes.purpose_label')}</label>
                        <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className={inputClass}>
                            {purposes.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSearch} disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                            <Search size={16} /> {loading ? t('schemes.searching') : t('schemes.search_btn')}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            {results && (
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {t('schemes.found_prefix')} <span className="font-bold text-indigo-600">{results.totalSchemes}</span> {t('schemes.found_suffix')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.recommendations?.map((scheme, idx) => (
                            <motion.div
                                key={scheme.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="card p-6 hover:border-amber-300 dark:hover:border-amber-700"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-lg leading-tight pr-3">{scheme.name}</h3>
                                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                        Match: {scheme.matchScore}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{scheme.description}</p>

                                {/* Categories */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {scheme.categories?.map((cat, i) => (
                                        <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                {/* Benefits */}
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('schemes.benefits')}</p>
                                    <div className="space-y-1.5">
                                        {scheme.benefits?.map((b, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                                <span className="text-slate-600 dark:text-slate-400">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Why Qualifies */}
                                {scheme.whyQualifies?.length > 0 && (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 mb-4">
                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{t('schemes.why_qualify')}</p>
                                        {scheme.whyQualifies.map((r, i) => (
                                            <p key={i} className="text-xs text-emerald-600 dark:text-emerald-400">✓ {r}</p>
                                        ))}
                                    </div>
                                )}

                                <a href={scheme.link} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                    Visit Official Site <ExternalLink size={14} />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!results && (
                <div className="card p-12 text-center">
                    <Landmark size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">{t('schemes.no_results')}</p>
                </div>
            )}
        </div>
    );
};

export default Schemes;
