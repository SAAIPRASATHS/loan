import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Calculator, TrendingUp, IndianRupee, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const EMISimulator = () => {
    const { t } = useTranslation();
    const [loanAmount, setLoanAmount] = useState(500000);
    const [interestRate, setInterestRate] = useState(10);
    const [tenure, setTenure] = useState(36);
    const [result, setResult] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartType, setChartType] = useState('bar');

    const calculateEMI = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/emi', { loanAmount, interestRate, tenure });
            setResult(data);
            // Aggregate by year for chart readability
            const yearly = [];
            for (let i = 0; i < data.monthlyBreakdown.length; i += (tenure > 36 ? 12 : tenure > 12 ? 6 : 3)) {
                const slice = data.monthlyBreakdown.slice(i, i + (tenure > 36 ? 12 : tenure > 12 ? 6 : 3));
                const label = tenure > 36 ? `Year ${Math.floor(i / 12) + 1}` : `Month ${i + 1}-${i + slice.length}`;
                yearly.push({
                    name: label,
                    principal: slice.reduce((s, m) => s + m.principal, 0),
                    interest: slice.reduce((s, m) => s + m.interest, 0),
                    balance: slice[slice.length - 1]?.balance || 0
                });
            }
            setChartData(yearly);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate on mount
    useMemo(() => { calculateEMI(); }, []);

    const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                    <Calculator className="text-cyan-500" size={28} />
                    {t('emi.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('emi.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sliders Panel */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 lg:col-span-1">
                    <h3 className="font-bold mb-6">Loan Parameters</h3>

                    {/* Loan Amount */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Loan Amount</label>
                            <span className="text-sm font-bold text-indigo-600">{formatCurrency(loanAmount)}</span>
                        </div>
                        <input
                            type="range" min="50000" max="5000000" step="10000"
                            value={loanAmount}
                            onChange={e => setLoanAmount(+e.target.value)}
                            className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>₹50K</span><span>₹50L</span>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Interest Rate</label>
                            <span className="text-sm font-bold text-indigo-600">{interestRate}% p.a.</span>
                        </div>
                        <input
                            type="range" min="5" max="25" step="0.5"
                            value={interestRate}
                            onChange={e => setInterestRate(+e.target.value)}
                            className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>5%</span><span>25%</span>
                        </div>
                    </div>

                    {/* Tenure */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Tenure</label>
                            <span className="text-sm font-bold text-indigo-600">{tenure} months ({(tenure / 12).toFixed(1)} yrs)</span>
                        </div>
                        <input
                            type="range" min="6" max="360" step="6"
                            value={tenure}
                            onChange={e => setTenure(+e.target.value)}
                            className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>6 mo</span><span>30 yrs</span>
                        </div>
                    </div>

                    <button
                        onClick={calculateEMI}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Calculating...' : 'Calculate EMI'}
                    </button>
                </motion.div>

                {/* Results & Chart */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
                    {/* Result Cards */}
                    {result && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="card p-5 text-center">
                                <IndianRupee size={20} className="text-indigo-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('emi.monthly_emi')}</p>
                                <p className="text-xl font-bold text-indigo-600">{formatCurrency(result.monthlyEMI)}</p>
                            </div>
                            <div className="card p-5 text-center">
                                <TrendingUp size={20} className="text-amber-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('emi.total_interest')}</p>
                                <p className="text-xl font-bold text-amber-600">{formatCurrency(result.totalInterest)}</p>
                            </div>
                            <div className="card p-5 text-center">
                                <Calendar size={20} className="text-emerald-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('emi.total_payable')}</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(result.totalPayable)}</p>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    {chartData.length > 0 && (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Repayment Schedule</h3>
                                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    {['bar', 'area'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === type ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {type === 'bar' ? 'Bar' : 'Area'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(val) => formatCurrency(val)} />
                                        <Legend />
                                        <Bar dataKey="principal" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Principal" />
                                        <Bar dataKey="interest" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Interest" />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(val) => formatCurrency(val)} />
                                        <Legend />
                                        <Area type="monotone" dataKey="principal" fill="#4F46E5" fillOpacity={0.3} stroke="#4F46E5" name="Principal" />
                                        <Area type="monotone" dataKey="interest" fill="#06b6d4" fillOpacity={0.3} stroke="#06b6d4" name="Interest" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default EMISimulator;
