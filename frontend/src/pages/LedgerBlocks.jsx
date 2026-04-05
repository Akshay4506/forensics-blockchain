import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Link2 } from 'lucide-react';
import { formatIST } from '../utils/dateFormatter';

const LedgerBlocks = () => {
    const [blocks, setBlocks] = useState([]);
    const [evidenceMap, setEvidenceMap] = useState({});
    const [selectedCase, setSelectedCase] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [blocksRes, evRes] = await Promise.all([
                    api.get('/ledger/blocks'),
                    api.get('/evidence')
                ]);

                const evMap = {};
                evRes.data.forEach(ev => {
                    evMap[ev._id] = ev.caseName;
                });

                setBlocks(blocksRes.data);
                setEvidenceMap(evMap);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Determine cases for each block
    const blocksWithCases = blocks.map(block => {
        if (block.isHidden) return { ...block, cases: [] };
        const caseSet = new Set();
        block.transactions?.forEach(tx => {
            const evId = tx.payload.evidenceId || tx.payload.id;
            if (tx.action === 'CREATE' && tx.payload.caseName) {
                caseSet.add(tx.payload.caseName);
            } else if (evId && evidenceMap[evId]) {
                caseSet.add(evidenceMap[evId]);
            }
        });
        return { ...block, cases: Array.from(caseSet) };
    });

    const uniqueCases = ['All', ...new Set(blocksWithCases.flatMap(b => b.cases).filter(Boolean))];
    const filteredBlocks = selectedCase === 'All'
        ? blocksWithCases
        : blocksWithCases.filter(b => b.cases.includes(selectedCase));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Ordering Service Ledger</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 uppercase text-[10px] font-black">Raw block data appended to FORENSIC_CHANNEL</p>
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex-1 md:w-48">
                        <select
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white outline-none transition-all text-sm font-medium"
                            value={selectedCase}
                            onChange={(e) => setSelectedCase(e.target.value)}
                        >
                            {uniqueCases.map(caseName => (
                                <option key={caseName} value={caseName}>{caseName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hidden sm:block">
                        <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Syncing nodes...</div>
            ) : (
                <div className="space-y-6">
                    {filteredBlocks.map(block => (
                        <div key={block._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gray-800 dark:bg-gray-900 text-white p-4 flex justify-between items-center border-b border-transparent dark:border-gray-700">
                                <h3 className="font-bold">Block #{block.blockNumber} {block.isHidden && <span className="ml-2 text-xs text-gray-500 uppercase tracking-widest">(Hidden Content)</span>}</h3>
                                <div className="flex items-center space-x-4">
                                    {block.cases && block.cases.length > 0 && (
                                        <span className="hidden sm:inline-block px-2 text-[10px] uppercase font-bold tracking-wider rounded-md border border-gray-600 bg-gray-700 text-gray-300">
                                            {block.cases.join(', ')}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">{formatIST(block.timestamp)}</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center mb-1">
                                            <Link2 className="w-3 h-3 mr-1" /> Previous Block Hash
                                        </p>
                                        <p className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">{block.previousBlockHash}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg border ${block.isHidden ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'}`}>
                                        <p className={`text-xs font-bold uppercase mb-1 ${block.isHidden ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {block.isHidden ? 'Encrypted State Hash' : 'Block Hash'}
                                        </p>
                                        <p className={`font-mono text-xs font-bold break-all ${block.isHidden ? 'text-amber-700 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'}`}>
                                            {block.blockHash}
                                        </p>
                                    </div>
                                </div>

                                {block.isHidden ? (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                                            Forensic access restricted: Asset outside organization jurisdiction.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transactions Extracted ({block.transactions?.length || 0})</p>
                                        <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                                            <pre className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                                                {JSON.stringify(block.transactions, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredBlocks.length === 0 && (
                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No forensic records found matching this jurisdiction.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LedgerBlocks;
