import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Upload, CheckCircle, AlertTriangle, File, X } from 'lucide-react';
import api from '../services/api';
import FraudAlert from '../components/FraudAlert';

const Documents = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileRef = useRef();

    // Fraud check state
    const [fraudForm, setFraudForm] = useState({ interestRate: '', processingFee: '', offerDescription: '' });
    const [fraudResult, setFraudResult] = useState(null);
    const [fraudLoading, setFraudLoading] = useState(false);

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
        setResult(null);
        if (f.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(f);
        } else {
            setPreview(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('document', file);
            const { data } = await api.post('/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(data);
        } catch (err) {
            setResult({ success: false, message: 'Failed to process document. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFraudCheck = async () => {
        setFraudLoading(true);
        try {
            const { data } = await api.post('/fraud-check', fraudForm);
            setFraudResult(data);
        } catch (err) { console.error(err); }
        finally { setFraudLoading(false); }
    };

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                    <FileUp className="text-blue-500" size={28} />
                    Document Verification
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Upload salary slips for OCR verification and check loan offers for fraud</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* OCR Upload */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4">📄 Salary Slip OCR</h3>

                        {/* Drop Zone */}
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                                ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.bmp,.tiff"
                                onChange={(e) => handleFile(e.target.files[0])}
                                className="hidden"
                            />
                            <Upload size={32} className="text-slate-400 mx-auto mb-3" />
                            <p className="text-sm font-medium mb-1">Drop your salary slip here or click to upload</p>
                            <p className="text-xs text-slate-400">Supports JPG, PNG, PDF, BMP, TIFF (max 10MB)</p>
                        </div>

                        {/* Selected File */}
                        {file && (
                            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                    <File size={24} className="text-slate-400" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="text-slate-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing OCR...' : 'Verify Document'}
                        </button>
                    </div>

                    {/* OCR Result */}
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                {result.verified ? (
                                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                        <CheckCircle size={24} className="text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                        <AlertTriangle size={24} className="text-amber-500" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold">{result.verificationBadge}</h4>
                                    <p className="text-xs text-slate-500">Confidence: {result.confidence}%</p>
                                </div>
                            </div>

                            {result.salaryAmount && (
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 mb-4">
                                    <p className="text-xs text-slate-500 mb-1">Extracted Salary</p>
                                    <p className="text-2xl font-bold text-indigo-600">₹{result.salaryAmount.toLocaleString('en-IN')}</p>
                                </div>
                            )}

                            <p className="text-sm text-slate-600 dark:text-slate-400">{result.message}</p>

                            {result.extractedText && (
                                <details className="mt-4">
                                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-indigo-500">View extracted text</summary>
                                    <pre className="mt-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                                        {result.extractedText}
                                    </pre>
                                </details>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Fraud Check */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4">🔍 Fraud Alert Check</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Check if a loan offer is safe based on RBI guidelines</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                                <input type="number" value={fraudForm.interestRate} onChange={e => setFraudForm({ ...fraudForm, interestRate: e.target.value })} placeholder="e.g., 15"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Processing Fee (%)</label>
                                <input type="number" value={fraudForm.processingFee} onChange={e => setFraudForm({ ...fraudForm, processingFee: e.target.value })} placeholder="e.g., 2"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Offer Description <span className="text-slate-400">(optional)</span></label>
                                <textarea value={fraudForm.offerDescription} onChange={e => setFraudForm({ ...fraudForm, offerDescription: e.target.value })} placeholder="Paste the loan offer text here..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                            </div>
                            <button onClick={handleFraudCheck} disabled={fraudLoading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                                {fraudLoading ? 'Checking...' : 'Check for Fraud'}
                            </button>
                        </div>
                    </div>

                    {fraudResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <FraudAlert
                                alerts={fraudResult.alerts}
                                riskLevel={fraudResult.riskLevel}
                                riskScore={fraudResult.riskScore}
                                overallMessage={fraudResult.overallMessage}
                                guidelines={fraudResult.guidelines}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Documents;
