import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingBot = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Simple Direct Chat Button */}
            <motion.button
                whileHover={{ scale: 1.1, translateY: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/dashboard/chat')}
                className="w-16 h-16 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white relative group"
            >
                <MessageSquare size={28} />

                {/* Badge/Pulse */}
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
                </span>

                {/* Tooltip */}
                <div className="absolute right-full mr-4 whitespace-nowrap bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 pointer-events-none">
                    Start Chatting ✨
                </div>
            </motion.button>
        </div>
    );
};

export default FloatingBot;
