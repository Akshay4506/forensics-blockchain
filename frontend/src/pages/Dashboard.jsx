import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { Database, FileText, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [evidenceList, setEvidenceList] = useState([]);
    const [selectedCase, setSelectedCase] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const res = await api.get('/evidence');
                setEvidenceList(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvidence();
    }, []);

    const uniqueCases = ['All', ...new Set(evidenceList.map(item => item.caseName).filter(Boolean))];
    const filteredEvidence = selectedCase === 'All'
        ? evidenceList
        : evidenceList.filter(item => item.caseName === selectedCase);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MSP Node Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Overview of channel FORENSIC_CHANNEL activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Evidence</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEvidence.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                    <label className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Filter by Case</label>
                    <select
                        className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        value={selectedCase}
                        onChange={(e) => setSelectedCase(e.target.value)}
                    >
                        {uniqueCases.map(caseName => (
                            <option key={caseName} value={caseName}>{caseName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Evidence on Ledger</h2>
                    {user?.organization === 'ECU' && (
                        <Link to="/evidence/create" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                            + Propose New Evidence
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Querying ledger state...</div>
                ) : evidenceList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">No evidence found on the channel.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Case Name</th>
                                    <th className="px-6 py-4">File Hash Snapshot</th>
                                    <th className="px-6 py-4">Creator Org</th>
                                    <th className="px-6 py-4">Current Custody</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredEvidence.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {item.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-100 dark:border-purple-800/30 text-xs font-bold shadow-sm whitespace-nowrap">
                                                {item.caseName || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 w-48 truncate block" title={item.fileHash}>
                                            {item.fileHash.substring(0, 16)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                                                {item.createdBy.organization}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                                                {item.currentOwner.organization}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <Link to={`/evidence/${item._id}/vault`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold hover:underline text-[10px] uppercase tracking-wider">
                                                View Vault
                                            </Link>
                                            <span className="text-gray-300 dark:text-gray-700">|</span>
                                            <Link to={`/evidence/${item._id}/audit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline text-[10px] uppercase tracking-wider">
                                                Audit Trail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
