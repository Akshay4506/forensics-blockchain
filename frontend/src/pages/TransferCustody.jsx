import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { AuthContext } from '../context/AuthContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../blockchain/constants';

const TransferCustody = () => {
    const { account, signer } = useContext(WalletContext);
    const { user: currentUser } = useContext(AuthContext);
    const [evidenceList, setEvidenceList] = useState([]);
    const [selectedCase, setSelectedCase] = useState('All');
    const [evidenceId, setEvidenceId] = useState('');
    const [newOwnerEmail, setNewOwnerEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const res = await api.get('/evidence');
                const owned = res.data.filter(ev => ev.ownerOrg === currentUser?.organization);
                setEvidenceList(owned);
            } catch (err) {
                console.error(err);
            }
        };
        if (currentUser) fetchEvidence();
    }, [currentUser]);

    const uniqueCases = ['All', ...new Set(evidenceList.map(item => item.caseName).filter(Boolean))];
    const filteredEvidence = evidenceList.filter(item => item.caseName === selectedCase);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!account) return setError('Please connect your MetaMask wallet first.');

        const selectedEv = evidenceList.find(ev => ev._id === evidenceId);
        if (!selectedEv?.blockchainInfo?.tokenId) {
            return setError('This evidence is not registered on the blockchain.');
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const userRes = await api.get(`/auth/user/${newOwnerEmail}`);
            const recipient = userRes.data;

            // --- FORENSIC PROTOCOL VALIDATION ---
            const senderOrg = currentUser.organization;
            const recipientOrg = recipient.organization;

            if (senderOrg === 'ECU') {
                if (recipientOrg === 'COURT') {
                    throw new Error('Forensic Protocol Violation: ECU cannot transfer directly to COURT. Route through LAB.');
                }
            }

            if (senderOrg === 'LAB') {
                if (recipientOrg !== 'ECU' && recipientOrg !== 'COURT') {
                    throw new Error('Forensic Protocol Violation: LAB can only release to ECU or COURT.');
                }
            }

            if (senderOrg === 'COURT') {
                if (recipientOrg !== 'LAB' && recipientOrg !== 'ECU') {
                    throw new Error('Forensic Protocol Violation: COURT must return to LAB or ECU.');
                }
            }

            const roleFallbacks = {
                'ECU': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                'LAB': '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                'COURT': '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
            };

            const recipientWallet = recipient.walletAddress || roleFallbacks[recipient.organization] || roleFallbacks[recipient.role];

            if (!recipientWallet) {
                throw new Error('Could not determine a target blockchain address.');
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tx = await contract.transferEvidence(recipientWallet, selectedEv.blockchainInfo.tokenId);
            await tx.wait();

            await api.post('/evidence/sync-transfer', {
                evidenceId: selectedEv._id,
                newOwnerId: recipient._id,
                newOwnerOrg: recipient.organization,
                newOwnerAddress: recipientWallet,
                transactionHash: tx.hash
            });

            setSuccess('Transfer successful. Ownership updated on ledger.');
            setEvidenceId('');
            setNewOwnerEmail('');

            const res = await api.get('/evidence');
            setEvidenceList(res.data.filter(ev => ev.ownerOrg === currentUser?.organization));

        } catch (err) {
            console.error("Transfer Error:", err);

            // Professional MetaMask Interceptor
            if (err.code === 'ACTION_REJECTED' || (err.info?.error?.code === 4001)) {
                setError('Custody transfer rejected by the current custodian.');
            } else {
                setError(err.response?.data?.message || err.message || 'Transfer failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transfer Evidence Custody</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Coordinate the formal handover of on-chain forensic assets.</p>

            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100 dark:border-red-800/50">{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 font-medium text-sm border border-green-100 dark:border-green-800/50 flex items-center">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Case</label>
                    <select
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white outline-none transition-all"
                        value={selectedCase}
                        onChange={(e) => {
                            setSelectedCase(e.target.value);
                            setEvidenceId('');
                            setNewOwnerEmail('');
                        }}
                    >
                        {uniqueCases.map(caseName => (
                            <option key={caseName} value={caseName}>{caseName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Evidence</label>
                    <select
                        required
                        disabled={selectedCase === 'All'}
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white outline-none transition-all ${selectedCase === 'All' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={evidenceId}
                        onChange={(e) => {
                            setEvidenceId(e.target.value);
                            setNewOwnerEmail('');
                        }}
                    >
                        <option value="">-- Choose Asset --</option>
                        {filteredEvidence.map(ev => (
                            <option key={ev._id} value={ev._id}>{ev.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recipient Email</label>
                    <input
                        type="email"
                        required
                        disabled={!evidenceId}
                        placeholder="custodian@forensic.gov"
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white outline-none transition-all ${!evidenceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={newOwnerEmail}
                        onChange={e => setNewOwnerEmail(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !newOwnerEmail || !evidenceId}
                    className="w-full bg-indigo-600 text-white font-medium p-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing Transfer...' : 'Initiate Blockchain Handover'}
                </button>
            </form>
        </div>
    );
};

export default TransferCustody;
