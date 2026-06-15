import React from 'react';

const CircularScore = ({ score = 0, size = 140, strokeWidth = 10, label = 'Score', color = '#4F46E5' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const center = size / 2;

    const getColor = () => {
        if (score >= 75) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const actualColor = color === 'auto' ? getColor() : color;

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={center} cy={center} r={radius}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={center} cy={center} r={radius}
                    stroke={actualColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ animation: 'score-fill 1.5s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-3xl font-bold" style={{ color: actualColor }}>{score}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
        </div>
    );
};

export default CircularScore;
