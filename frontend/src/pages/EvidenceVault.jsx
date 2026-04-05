import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Shield, ShieldX, ShieldCheck, Download, Lock, FileText, ArrowLeft, Clock, User, Building, AlertCircle } from 'lucide-react';
import { generateHash } from '../utils/hashUtil';

const EvidenceVault = () => {
    const { id } = useParams();
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, loading, success, fail
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/evidence/${id}`);
                setEvidence(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch evidence details from ledger.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSecureView = async () => {
        setVerifying(true);
        setVerificationStatus('loading');
        try {
            // 1. Download file content as array buffer
            const res = await api.get(`/evidence/${id}/download`, { responseType: 'arraybuffer' });
            const buffer = res.data;

            // 2. Re-calculate hash of the fetched file
            const localHash = await generateHash(buffer);

            // 3. Compare with Ledger Hash
            if (localHash === evidence.fileHash) {
                setVerificationStatus('success');
                // Trigger Actual Download
                const blob = new Blob([buffer]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = evidence.fileOriginalName;
                a.click();
            } else {
                setVerificationStatus('fail');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Vault access denied or file missing.';
            setError(msg);
            setVerificationStatus('idle');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] animate-pulse text-gray-400">Decrypting vault data...</div>;
    if (error) return <div className="p-8 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl border border-red-100 dark:border-red-800/50">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 dark:border-blue-800/30">
                                    Secure Vault Record
                                </span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200 dark:border-purple-800/30">
                                    {evidence.caseName}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{evidence.title}</h1>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Blockchain ID</p>
                             <p className="font-mono text-xs text-gray-500 dark:text-gray-400 font-bold">{evidence._id.substring(0, 16)}...</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                Description
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                {evidence.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                    <User className="w-3 h-3 mr-2 text-indigo-500" /> Collector
                                </h4>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{evidence.createdBy.name}</p>
                                    <p className="text-xs text-gray-500">{evidence.creatorOrg}</p>
                                </div>
                            </div>
                            <div className="space-y-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                    <Building className="w-3 h-3 mr-2 text-emerald-500" /> Current Holder
                                </h4>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{evidence.currentOwner.name}</p>
                                    <p className="text-xs text-gray-500">{evidence.ownerOrg}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center text-center space-y-6 ${
                            verificationStatus === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 
                            verificationStatus === 'fail' ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' :
                            'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 border-dashed'
                        }`}>
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ${
                                verifying ? 'animate-spin' : ''
                            } ${
                                verificationStatus === 'success' ? 'bg-emerald-500 text-white group-hover:scale-110' :
                                verificationStatus === 'fail' ? 'bg-red-500 text-white shimmer' :
                                'bg-blue-600 text-white'
                            }`}>
                                {verificationStatus === 'success' ? <ShieldCheck className="w-10 h-10" /> : 
                                 verificationStatus === 'fail' ? <ShieldX className="w-10 h-10" /> :
                                 <Lock className="w-10 h-10" />}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {verificationStatus === 'success' ? 'Integrity Verified' : 
                                     verificationStatus === 'fail' ? 'Integrity Breach Detected' : 
                                     'Secure Evidence Vault'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                                    {verificationStatus === 'success' ? 'Mathematical hash match found on the channel ledger. Document is genuine.' : 
                                     verificationStatus === 'fail' ? 'ALERT: The document in the vault does not match the ledger hash! It has been tampered with.' : 
                                     'Click below to verify the mathematical fingerprint against the ledger before unlocking.'}
                                </p>
                            </div>

                            <button
                                onClick={handleSecureView}
                                disabled={verifying}
                                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center transition-all shadow-md group ${
                                    verificationStatus === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 
                                    verificationStatus === 'fail' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                    'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {verifying ? 'Calculating Hash...' : 
                                 verificationStatus === 'success' ? <><Download className="w-5 h-5 mr-3" /> Re-Download Document</> :
                                 verificationStatus === 'fail' ? <><AlertCircle className="w-5 h-5 mr-3" /> Verify Again</> :
                                 <><Shield className="w-5 h-5 mr-3 group-hover:animate-pulse" /> Unlock & Verify Document</>}
                            </button>

                            <div className="w-full text-left space-y-2 mt-4 hidden md:block">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ledger Fingerprint (Immutable)</p>
                                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <p className="font-mono text-[9px] text-gray-500 dark:text-gray-400 break-all leading-tight font-bold">
                                        {evidence.fileHash}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceVault;
