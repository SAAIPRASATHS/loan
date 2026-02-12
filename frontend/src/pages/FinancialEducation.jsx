import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle, XCircle, Trophy, Star, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';

const MODULES = [
    {
        id: 'emi',
        title: 'What is EMI?',
        icon: '💰',
        color: 'from-indigo-500 to-purple-600',
        explanation: `EMI stands for Equated Monthly Installment. It is the fixed amount you pay to the bank every month until the full loan is repaid.

EMI has two parts:
1. Principal – the actual loan amount
2. Interest – the cost of borrowing

Example: If you borrow ₹1,00,000 at 10% interest for 12 months, your EMI would be approximately ₹8,792 per month. Over 12 months you'd pay back ₹1,05,500 total.

Simple tip: Lower the interest rate and longer the tenure = Lower EMI, but more total interest paid.`,
        quiz: [
            { q: 'What does EMI stand for?', options: ['Extra Money Interest', 'Equated Monthly Installment', 'Easy Monthly Income', 'Effective Money Index'], correct: 1 },
            { q: 'Which part of EMI is the cost of borrowing?', options: ['Principal', 'Interest', 'Tenure', 'Balance'], correct: 1 },
            { q: 'What happens if you increase the tenure?', options: ['EMI increases', 'EMI stays the same', 'EMI decreases but total interest increases', 'Nothing changes'], correct: 2 },
        ]
    },
    {
        id: 'cibil',
        title: 'What is CIBIL Score?',
        icon: '📊',
        color: 'from-emerald-500 to-teal-600',
        explanation: `CIBIL Score is a 3-digit number (300-900) that represents your credit trustworthiness.

Score ranges:
• 750-900: Excellent – Easy loan approvals, low rates
• 650-749: Good – Most loans approved
• 550-649: Fair – Higher interest rates
• 300-549: Poor – Loan approvals difficult

How to improve your CIBIL Score:
1. Pay all bills on time
2. Keep credit card usage below 30%
3. Don't apply for too many loans at once
4. Maintain a mix of credit types
5. Keep old credit accounts open`,
        quiz: [
            { q: 'What is the maximum CIBIL score?', options: ['100', '500', '750', '900'], correct: 3 },
            { q: 'What is considered a good CIBIL score?', options: ['Below 500', 'Above 750', 'Exactly 600', 'Above 300'], correct: 1 },
            { q: 'How can you improve your CIBIL score?', options: ['Take more loans', 'Pay bills on time', 'Close all accounts', 'Never use credit cards'], correct: 1 },
        ]
    },
    {
        id: 'interest',
        title: 'Simple vs Compound Interest',
        icon: '📈',
        color: 'from-amber-500 to-orange-600',
        explanation: `Interest is the cost of borrowing money.

Simple Interest: Calculated only on the original amount (principal)
Formula: SI = (P × R × T) / 100
Example: ₹10,000 at 10% for 2 years = ₹2,000 interest

Compound Interest: Calculated on principal + accumulated interest
This means interest earns interest!
Example: ₹10,000 at 10% compounded yearly for 2 years = ₹2,100 interest

Why it matters:
• Savings accounts use compound interest – good for you!
• Some loans use compound interest – costs you more
• Always check if your loan uses simple or compound interest`,
        quiz: [
            { q: 'Simple Interest is calculated on?', options: ['Principal + Interest', 'Only Principal', 'Only Interest', 'Market Rate'], correct: 1 },
            { q: 'Which type of interest makes your savings grow faster?', options: ['Simple Interest', 'Compound Interest', 'No Interest', 'Flat Rate'], correct: 1 },
            { q: 'In compound interest, interest is earned on?', options: ['Only principal', 'Only previous interest', 'Principal + accumulated interest', 'Nothing'], correct: 2 },
        ]
    }
];

const FinancialLearning = () => {
    const [currentModule, setCurrentModule] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [points, setPoints] = useState(() => parseInt(localStorage.getItem('finbridge-points') || '0'));
    const [completedModules, setCompletedModules] = useState(() => {
        const saved = localStorage.getItem('finbridge-completed');
        return saved ? JSON.parse(saved) : [];
    });
    const [showBadge, setShowBadge] = useState(false);

    const totalPoints = MODULES.length * 30; // 10 points per correct answer, 3 questions each

    const startModule = (mod) => {
        setCurrentModule(mod);
        setQuizMode(false);
        setCurrentQ(0);
        setAnswers([]);
    };

    const startQuiz = () => {
        setQuizMode(true);
        setCurrentQ(0);
        setAnswers([]);
    };

    const answerQuestion = (optionIdx) => {
        const isCorrect = optionIdx === currentModule.quiz[currentQ].correct;
        const newAnswers = [...answers, { selected: optionIdx, correct: isCorrect }];
        setAnswers(newAnswers);

        if (isCorrect) {
            const newPoints = points + 10;
            setPoints(newPoints);
            localStorage.setItem('finbridge-points', newPoints.toString());
        }

        setTimeout(() => {
            if (currentQ < currentModule.quiz.length - 1) {
                setCurrentQ(currentQ + 1);
            } else {
                // Module complete
                const correctCount = newAnswers.filter(a => a.correct).length;
                if (correctCount >= 2 && !completedModules.includes(currentModule.id)) {
                    const updated = [...completedModules, currentModule.id];
                    setCompletedModules(updated);
                    localStorage.setItem('finbridge-completed', JSON.stringify(updated));
                    setShowBadge(true);
                    setTimeout(() => setShowBadge(false), 3000);
                }
            }
        }, 1000);
    };

    const resetProgress = () => {
        setPoints(0);
        setCompletedModules([]);
        localStorage.removeItem('finbridge-points');
        localStorage.removeItem('finbridge-completed');
        setCurrentModule(null);
    };

    const quizComplete = answers.length === currentModule?.quiz?.length;
    const correctCount = answers.filter(a => a.correct).length;

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Badge Animation */}
            <AnimatePresence>
                {showBadge && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setShowBadge(false)}
                    >
                        <div className="text-center badge-unlock">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                                <Trophy size={64} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Badge Unlocked! 🎉</h2>
                            <p className="text-lg text-amber-300">You've mastered "{currentModule?.title}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                    <GraduationCap className="text-purple-500" size={28} />
                    Financial Learning
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Learn financial concepts through simple explanations and quizzes</p>
            </motion.div>

            {/* Points & Progress */}
            <div className="card p-4 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Star className="text-amber-500" size={20} />
                        <span className="font-bold text-lg">{points} Points</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <Trophy className="text-emerald-500" size={18} />
                        <span className="text-sm text-slate-500">{completedModules.length}/{MODULES.length} Badges</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Progress Bar */}
                    <div className="w-40 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${(completedModules.length / MODULES.length) * 100}%` }} />
                    </div>
                    <button onClick={resetProgress} className="text-slate-400 hover:text-red-500 transition-colors" title="Reset progress">
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {!currentModule ? (
                /* Module Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MODULES.map((mod, idx) => (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => startModule(mod)}
                            className="card p-6 cursor-pointer group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mod.color}`} />
                            <div className="text-4xl mb-3">{mod.icon}</div>
                            <h3 className="font-bold text-lg mb-2">{mod.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">3 questions • 30 points possible</p>
                            <div className="flex items-center justify-between">
                                {completedModules.includes(mod.id) ? (
                                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                                        <CheckCircle size={14} /> Completed
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400">Not started</span>
                                )}
                                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* Module Content */
                <div>
                    <button onClick={() => setCurrentModule(null)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-1">
                        ← Back to Modules
                    </button>

                    {!quizMode ? (
                        /* Explanation */
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">{currentModule.icon}</span>
                                <h2 className="text-2xl font-bold">{currentModule.title}</h2>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                {currentModule.explanation.split('\n').map((line, i) => (
                                    <p key={i} className={`${line.startsWith('•') || line.match(/^\d\./) ? 'ml-4' : ''} ${line === '' ? 'mb-2' : 'mb-1'} text-slate-700 dark:text-slate-300 text-sm leading-relaxed`}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                            <button onClick={startQuiz} className={`px-8 py-3 rounded-xl bg-gradient-to-r ${currentModule.color} text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2`}>
                                <BookOpen size={18} /> Start Quiz
                            </button>
                        </motion.div>
                    ) : (
                        /* Quiz */
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 max-w-3xl">
                            {!quizComplete ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-sm text-slate-500">Question {currentQ + 1} of {currentModule.quiz.length}</span>
                                        <div className="flex gap-1">
                                            {currentModule.quiz.map((_, i) => (
                                                <div key={i} className={`w-8 h-1.5 rounded-full ${i < answers.length ? (answers[i].correct ? 'bg-emerald-500' : 'bg-red-400') : i === currentQ ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-6">{currentModule.quiz[currentQ].q}</h3>
                                    <div className="space-y-3">
                                        {currentModule.quiz[currentQ].options.map((opt, i) => {
                                            const answered = answers.length > currentQ;
                                            const isCorrect = i === currentModule.quiz[currentQ].correct;
                                            const isSelected = answered && answers[currentQ]?.selected === i;

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => !answered && answerQuestion(i)}
                                                    disabled={answered}
                                                    className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center gap-3
                                                        ${answered
                                                            ? isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                                                : isSelected ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-400 text-red-600 dark:text-red-300'
                                                                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50'
                                                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
                                                        }`}
                                                >
                                                    {answered && isCorrect && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
                                                    {answered && isSelected && !isCorrect && <XCircle size={18} className="text-red-400 shrink-0" />}
                                                    {!answered && <span className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + i)}</span>}
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                /* Quiz Results */
                                <div className="text-center py-8">
                                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${correctCount >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                        {correctCount >= 2 ? <Trophy size={40} className="text-emerald-500" /> : <Star size={40} className="text-amber-500" />}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        {correctCount === 3 ? 'Perfect Score! 🎉' : correctCount >= 2 ? 'Well Done! 👏' : 'Keep Learning! 📚'}
                                    </h3>
                                    <p className="text-lg mb-2">{correctCount}/{currentModule.quiz.length} correct answers</p>
                                    <p className="text-sm text-slate-500 mb-6">+{correctCount * 10} points earned</p>
                                    <div className="flex gap-3 justify-center">
                                        <button onClick={() => startModule(currentModule)} className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                                            Review Topic
                                        </button>
                                        <button onClick={() => setCurrentModule(null)} className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                                            Next Module
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialLearning;
