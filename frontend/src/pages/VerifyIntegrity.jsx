import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const VerifyIntegrity = () => {
    const [evidenceList, setEvidenceList] = useState([]);
    const [selectedCase, setSelectedCase] = useState('All');
    const [evidenceId, setEvidenceId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const res = await api.get('/evidence');
                setEvidenceList(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEvidence();
    }, []);

    const uniqueCases = ['All', ...new Set(evidenceList.map(item => item.caseName).filter(Boolean))];
    const filteredEvidence = selectedCase === 'All'
        ? evidenceList
        : evidenceList.filter(item => item.caseName === selectedCase);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.post('/transaction/propose', {
                action: 'VERIFY',
                payload: { evidenceId }
            });
            setSuccess(res.data.message || 'Verification successful. Integrity confirmed.');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification rejected. LAB endorsement required.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Evidence Integrity</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Submit a VERIFY transaction. Requires LAB/COURT role endorsement.</p>

            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100 dark:border-red-800/50">{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 font-medium text-sm border border-green-100 dark:border-green-800/50 flex items-center">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Case</label>
                    <select
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none transition-all"
                        value={selectedCase}
                        onChange={(e) => {
                            setSelectedCase(e.target.value);
                            setEvidenceId(''); // Reset selection when filter changes
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
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none transition-all ${selectedCase === 'All' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={evidenceId} onChange={e => setEvidenceId(e.target.value)}
                    >
                        <option value="" className="dark:text-gray-400">-- Choose Evidence --</option>
                        {filteredEvidence.map(ev => (
                            <option key={ev._id} value={ev._id}>{ev.title}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit" disabled={loading || !evidenceId}
                    className="w-full bg-emerald-600 text-white font-medium p-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Run Integrity Check'}
                </button>
            </form>
        </div>
    );
};

export default VerifyIntegrity;
