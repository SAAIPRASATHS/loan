import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Trash2, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
            </div>
            <div className="flex gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="w-2 h-2 rounded-full bg-indigo-500 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 typing-dot" />
            </div>
        </div>
    </div>
);

const Message = ({ content, role, onSpeak }) => {
    const isBot = role === 'assistant';
    let messageText = content;
    let structuredData = null;

    // Try parsing structured data if it's an object or JSON string
    if (typeof content === 'object' && content !== null) {
        messageText = content.text;
        structuredData = content.structured;
    } else if (typeof content === 'string' && content.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(content);
            messageText = parsed.text;
            structuredData = parsed.structured;
        } catch (e) {
            // fallback plain text
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} mb-4 px-4`}
        >
            {isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-white" />
                </div>
            )}
            <div className={`max-w-[85%] lg:max-w-[70%] group relative ${isBot
                ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                : 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white'
                } rounded-2xl px-5 py-4 shadow-sm`}
            >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{messageText}</p>

                {/* Structured Loan Card */}
                {isBot && structuredData && structuredData.type === 'loan_recommendation' && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-indigo-700 dark:text-indigo-400">{structuredData.loanType}</h4>
                                <span className="text-xs text-slate-500">{structuredData.suggestedScheme}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-indigo-100 shadow-sm">
                                <span className="text-xs font-bold text-emerald-600">{structuredData.eligibilityScore}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500">Eligible Amount</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">₹{(structuredData.eligibleAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500">Est. EMI</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">₹{(structuredData.estimatedEMI || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {structuredData.tips?.length > 0 && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                {structuredData.tips.map((tip, idx) => (
                                    <p key={idx} className="flex gap-1.5 align-top">
                                        <span className="text-indigo-500">💡</span> {tip}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isBot && (
                    <button
                        onClick={() => onSpeak(messageText)}
                        className="absolute -bottom-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-500"
                    >
                        <Volume2 size={14} />
                    </button>
                )}
            </div>
            {!isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-white" />
                </div>
            )}
        </motion.div>
    );
};

const Chat = () => {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const { user } = useAuth();

    // ... existing setup ...
    const [lang, setLang] = useState(i18n.language || 'en');
    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'ta', label: 'தமிழ்' },
        { code: 'te', label: 'తెలుగు' },
    ];

    useEffect(() => {
        setLang(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript, true);
                setIsRecording(false);
            };
            recognitionRef.current.onerror = () => setIsRecording(false);
            recognitionRef.current.onend = () => setIsRecording(false);
        }
    }, [lang]);

    const handleChangeLanguage = (e) => {
        const newLang = e.target.value;
        setLang(newLang);
        i18n.changeLanguage(newLang);
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
        utterance.lang = langMap[lang] || 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.includes(utterance.lang));
        if (voice) utterance.voice = voice;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        if (!recognitionRef.current) return alert('Voice not supported in this browser.');
        const langMap = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
        recognitionRef.current.lang = langMap[lang] || 'en-US';
        try { recognitionRef.current.start(); setIsRecording(true); } catch { }
    };

    const handleSend = async (text = input, isVoice = false) => {
        if (!text?.trim()) return;
        const userMsg = { role: 'user', content: text, isVoice };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const { data } = await api.post('/chat', { text, language: lang, isVoice });

            // Backend now returns JSON object in data.message if structured
            const aiContent = data.message;

            setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);

            // Speak only the text part
            if (isVoice) {
                const textToSpeak = typeof aiContent === 'object' ? aiContent.text : aiContent;
                speak(textToSpeak);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your request. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('Clear chat history?')) return;
        try { await api.delete('/chat/history'); setMessages([]); } catch { }
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
                            <Bot size={22} className="text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-slate-800 dark:text-white">{t('chat.header_title')}</h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Always Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={lang}
                        onChange={handleChangeLanguage}
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                    {isSpeaking && (
                        <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <VolumeX size={18} />
                        </button>
                    )}
                    <button onClick={handleClear} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-slate-800" title="Clear chat">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6 px-2 scroll-smooth">
                {messages.length === 0 && (
                    <div className="text-center mt-20 px-4">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
                            <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Bot size={48} className="text-indigo-500 dark:text-indigo-400" />
                            </div>
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">{t('chat.welcome_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">{t('chat.welcome_subtitle')}</p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                            {[t('chat.prompts.loans'), t('chat.prompts.eligibility'), t('chat.prompts.schemes'), t('chat.prompts.cibil')].map(q => (
                                <button key={q} onClick={() => handleSend(q)} className="text-xs font-medium px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <AnimatePresence>
                    {messages.map((msg, i) => <Message key={i} {...msg} onSpeak={speak} />)}
                </AnimatePresence>
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 px-4 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 mb-safe">
                <div className="max-w-3xl mx-auto flex items-center gap-3 relative">
                    <button
                        onClick={isRecording ? () => recognitionRef.current?.stop() : startRecording}
                        className={`p-3 rounded-full transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isRecording ? t('chat.listening') : t('chat.input_placeholder')}
                            disabled={isRecording}
                            className="w-full px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400"
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:scale-90 transition-all shadow-lg shadow-indigo-500/30"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {isRecording && <p className="text-center text-[10px] text-red-500 font-bold mt-2 animate-pulse">Recording...</p>}
            </div>
        </div>
    );
};

export default Chat;
