import React from 'react';
import { CheckCircle, Circle, FileCheck, BadgeCheck, TrendingUp, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReadinessScore = ({ items = [], score = 0 }) => {
    const { t } = useTranslation();
    const defaultItems = items.length > 0 ? items : [
        { label: t('readiness.items.docs'), completed: false, icon: FileCheck },
        { label: t('readiness.items.income'), completed: false, icon: BadgeCheck },
        { label: t('readiness.items.emi_ratio'), completed: false, icon: TrendingUp },
        { label: t('readiness.items.credit'), completed: false, icon: CreditCard },
    ];

    const completedCount = defaultItems.filter(i => i.completed).length;
    const calculatedScore = score || Math.round((completedCount / defaultItems.length) * 100);

    return (
        <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BadgeCheck size={20} className="text-indigo-500" />
                {t('readiness.title')}
            </h3>

            {/* Score bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('readiness.app_readiness')}</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{calculatedScore}/100</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${calculatedScore}%` }}
                    />
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                {defaultItems.map((item, idx) => {
                    const Icon = item.icon || Circle;
                    return (
                        <div key={idx} className="flex items-center gap-3">
                            {item.completed ? (
                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                            ) : (
                                <Circle size={18} className="text-slate-400 shrink-0" />
                            )}
                            <span className={`text-sm ${item.completed ? 'text-green-700 dark:text-green-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReadinessScore;
