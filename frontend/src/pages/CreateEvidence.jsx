import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateHash } from '../utils/hashUtil';
import { WalletContext } from '../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../blockchain/constants';
import { FileUp, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Coins } from 'lucide-react';

const CreateEvidence = () => {
    const { account, signer, connectWallet } = useContext(WalletContext);
    const { user: currentUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({ title: '', caseName: '', description: '', file: null });
    const [status, setStatus] = useState('idle'); // idle, hashing, uploading, minting, syncing, success
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState('');
    const navigate = useNavigate();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setStatus('hashing');
            try {
                const fileBuffer = await file.arrayBuffer();
                const hash = await generateHash(fileBuffer);
                setFormData({ ...formData, file, fileHash: hash });
                setStatus('idle');
            } catch (err) {
                setError("Failed to hash file. Please try again.");
                setStatus('idle');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!account) return setError('Please connect your MetaMask wallet first.');
        if (!formData.fileHash) return setError('File hash missing. Please upload a file.');

        setError('');

        try {
            // STEP 1: Upload File to Vault
            setStatus('uploading');
            const uploadData = new FormData();
            uploadData.append('file', formData.file);
            const uploadRes = await api.post('/evidence/upload', uploadData);
            const { fileName, fileSize, mimeType } = uploadRes.data;

            // STEP 2: Mint on Blockchain
            setStatus('minting');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tx = await contract.mintEvidence(account, formData.title, formData.fileHash);
            setTxHash(tx.hash);

            const receipt = await tx.wait();

            // Extract TokenID from events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed.name === 'EvidenceMinted';
                } catch (e) { return false; }
            });
            const tokenId = Number(contract.interface.parseLog(event).args.tokenId);

            // STEP 3: Sync Metadata to MongoDB
            setStatus('syncing');
            await api.post('/evidence/sync-mint', {
                title: formData.title,
                caseName: formData.caseName,
                description: formData.description,
                fileHash: formData.fileHash,
                fileName,
                fileOriginalName: formData.file.name,
                fileSize,
                mimeType,
                tokenId,
                transactionHash: tx.hash,
                ownerAddress: account
            });

            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (err) {
            console.error("Forensic Sync Error:", err);

            // Professional MetaMask Interceptor
            if (err.code === 'ACTION_REJECTED' || (err.info?.error?.code === 4001)) {
                setError('Evidence registration rejected by the user.');
            } else {
                setError(err.response?.data?.message || err.message || 'Blockchain transaction failed');
            }

            setStatus('idle');
        }
    };

    if (currentUser?.organization !== 'ECU') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                    <ShieldCheck className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Restricted Authority</h1>
                <div className="max-w-md bg-white dark:bg-gray-800 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-xl shadow-red-500/5">
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-4">
                        Forensic secondary units (<span className="text-red-500 font-bold">{currentUser?.organization}</span>) do not have the legal clearance to mint primary evidence.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                        <AlertCircle className="w-3 h-3" /> System Policy: ECU-PRIMARY-MINT-ONLY
                    </div>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Evidence Minted!</h1>
                <p className="text-gray-500 dark:text-gray-400">The forensic asset is now permanently recorded on the blockchain.</p>
                <p className="text-xs font-mono text-emerald-600 mt-4 truncate max-w-md">TX: {txHash}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register New Evidence</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Blockchain-first registration with bit-level binary integrity.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {!account ? (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-8 rounded-3xl text-center">
                    <Coins className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wallet Disconnected</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Evidence registration requires a cryptographic signature from your MetaMask wallet to ensure non-repudiation.
                    </p>
                    <button
                        onClick={connectWallet}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Connect MetaMask
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Case Identifier</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. CASE-2024-001"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                    value={formData.caseName} onChange={e => setFormData({ ...formData, caseName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Evidence Title</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. CCTV Footage - Entrance"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Description & Context</label>
                            <textarea
                                required rows="4"
                                placeholder="Describe the evidence collection context and specifics..."
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Master Digital Asset</label>
                            <div className={`relative border-2 border-dashed rounded-3xl transition-all ${formData.file ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'}`}>
                                <input
                                    type="file" required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                />
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className={`p-3 rounded-2xl mb-4 ${formData.file ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    {formData.file ? (
                                        <>
                                            <p className="font-bold text-gray-900 dark:text-white">{formData.file.name}</p>
                                            <p className="text-xs text-emerald-600 font-mono mt-1">HASH: {formData.fileHash?.substring(0, 32)}...</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-gray-900 dark:text-white">Click or drag binary file</p>
                                            <p className="text-xs text-gray-500 mt-1">Automatic bit-level SHA-256 generation</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status !== 'idle' || !formData.file}
                        className="w-full bg-indigo-600 text-white font-black p-5 rounded-3xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-indigo-500/30 disabled:opacity-50"
                    >
                        {status === 'idle' && (
                            <>
                                <ShieldCheck className="w-6 h-6" />
                                <span>MINT SECURE EVIDENCE</span>
                            </>
                        )}
                        {status !== 'idle' && (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="uppercase tracking-widest font-bold">
                                    {status === 'hashing' && 'Calculating Integrity...'}
                                    {status === 'uploading' && 'Staging Binary Data...'}
                                    {status === 'minting' && 'Waiting for Blockchain Confirmation...'}
                                    {status === 'syncing' && 'Finalizing Ledger Sync...'}
                                </span>
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default CreateEvidence;
