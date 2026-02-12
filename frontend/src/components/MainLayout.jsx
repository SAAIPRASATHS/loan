import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bot, Globe } from 'lucide-react';
import Navbar from './Navbar';
import FloatingBot from './FloatingBot';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Professional Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Persistent AI Assistant Bubble */}
            <FloatingBot />

            {/* Professional Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
                                    <Bot size={20} />
                                </div>
                                <span className="text-lg font-bold">FinBridge AI</span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-xs">
                                {t('footer.tagline')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('footer.features')}</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.advisor')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.eligibility')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.emi')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.health')}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('footer.company')}</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.about')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.privacy')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.terms')}</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">{t('footer.links.support')}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('footer.connect')}</h4>
                            <div className="flex gap-4">
                                {/* Social icons placeholder */}
                                <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors flex items-center justify-center">
                                    <Globe size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium tracking-wide">
                        <span>{t('footer.copyright')}</span>
                        <div className="flex gap-6">
                            <span className="hover:text-slate-600 cursor-pointer">{t('footer.security')}</span>
                            <span className="hover:text-slate-600 cursor-pointer">{t('footer.compliance')}</span>
                            <span className="hover:text-slate-600 cursor-pointer">{t('footer.contact')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
