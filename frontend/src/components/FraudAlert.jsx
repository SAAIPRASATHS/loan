import React from 'react';
import { AlertTriangle, ExternalLink, Phone } from 'lucide-react';

const FraudAlert = ({ alerts = [], riskLevel = 'low', riskScore = 0, overallMessage = '', guidelines = {} }) => {
    const riskColors = {
        high: 'border-red-500 bg-red-50 dark:bg-red-950/30',
        medium: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
        low: 'border-green-500 bg-green-50 dark:bg-green-950/30'
    };

    const severityBadge = {
        high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        low: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
    };

    if (!alerts || alerts.length === 0) return null;

    return (
        <div className={`rounded-2xl border-2 p-6 ${riskColors[riskLevel]} transition-all`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}>
                    <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Fraud Risk Assessment</h3>
                    <p className="text-sm opacity-70">{overallMessage}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${severityBadge[riskLevel]}`}>
                        Risk: {riskLevel}
                    </span>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {alerts.map((alert, idx) => (
                    <div key={idx} className="card p-4">
                        <div className="flex items-start gap-3">
                            <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityBadge[alert.severity]}`}>
                                {alert.severity}
                            </span>
                            <div>
                                <h4 className="font-semibold text-sm">{alert.title}</h4>
                                <p className="text-xs opacity-70 mt-1">{alert.message}</p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                                    💡 {alert.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {guidelines && (
                <div className="flex flex-wrap gap-3 text-xs">
                    {guidelines.helpline && (
                        <a href={`tel:${guidelines.helpline.split(' ')[0]}`} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                            <Phone size={12} /> {guidelines.helpline}
                        </a>
                    )}
                    {guidelines.rbiComplaintPortal && (
                        <a href={guidelines.rbiComplaintPortal} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                            <ExternalLink size={12} /> RBI Complaint Portal
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default FraudAlert;
