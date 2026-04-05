import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldAlert, ArrowDown } from 'lucide-react';
import { formatIST } from '../utils/dateFormatter';

const EvidenceAudit = () => {
    const { id } = useParams();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await api.get(`/ledger/evidence/${id}/audit`);
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Querying ledger...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custody Audit Trail</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Immutable ledger history for Evidence ID: {id}</p>
                </div>
                <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">Back to Dashboard</Link>
            </div>

            <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

                {logs.map((log, index) => (
                    <div key={log._id} className="relative flex flex-col md:flex-row items-start md:space-x-8">
                        <div className="hidden md:flex flex-col items-center z-10">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 p-2 text-center text-[10px] leading-tight break-words">
                                    Block<br />#{log.blockNumber}
                                </span>
                            </div>
                            {index !== logs.length - 1 && <ArrowDown className="w-5 h-5 text-gray-300 dark:text-gray-700 mt-4" />}
                        </div>

                        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full mb-4 md:mb-0">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.action === 'CREATE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                    log.action === 'TRANSFER' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                    }`}>
                                    {log.action}
                                </span>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                    {formatIST(log.timestamp)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actor (From User)</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{log.fromUser?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{log.fromUser?.organization}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receiver (To User)</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{log.toUser?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{log.toUser?.organization}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 space-y-2">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Previous Hash</p>
                                    <p className="font-mono text-[11px] text-gray-600 dark:text-gray-400 break-all">{log.previousHash}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-wider">Current Log Hash</p>
                                    <p className="font-mono text-[11px] text-blue-700 dark:text-blue-400 break-all font-semibold">{log.currentHash}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {logs.length === 0 && (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <ShieldAlert className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No custody logs found on ledger.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvidenceAudit;
