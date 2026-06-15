import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Columns, Rows } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
    // Default to 'horizontal' matching Home page
    const [layoutMode, setLayoutMode] = useState(() => {
        return localStorage.getItem('dashboardLayoutMode') || 'horizontal';
    });

    useEffect(() => {
        localStorage.setItem('dashboardLayoutMode', layoutMode);
    }, [layoutMode]);

    const toggleLayout = () => {
        setLayoutMode(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {layoutMode === 'vertical' ? (
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 ml-[72px] lg:ml-[250px] transition-all duration-300 min-h-screen">
                        <Outlet />
                    </main>
                </div>
            ) : (
                <div className="min-h-screen">
                    <Navbar />
                    <main className="container mx-auto px-4 md:px-6 py-8">
                        <Outlet />
                    </main>
                </div>
            )}

            {/* Layout Toggle - Floating Button */}
            <button
                onClick={toggleLayout}
                className="fixed bottom-6 right-6 z-50 p-3 bg-white text-indigo-600 rounded-full shadow-lg border border-indigo-100 hover:scale-110 transition-transform flex items-center gap-2 group"
                title={`Switch to ${layoutMode === 'vertical' ? 'Horizontal' : 'Vertical'} Layout`}
            >
                {layoutMode === 'vertical' ? <Rows size={20} /> : <Columns size={20} />}
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-semibold">
                    Change Layout
                </span>
            </button>
        </div>
    );
};

export default DashboardLayout;
