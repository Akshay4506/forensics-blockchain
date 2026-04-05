import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Network, SearchX, Lock, Shield, Cpu, Activity, Database, Key, Box, EyeOff } from 'lucide-react';
import { formatIST } from '../utils/dateFormatter';

const BlockchainVisualization = () => {
    const [blocks, setBlocks] = useState([]);
    const [evidenceMap, setEvidenceMap] = useState({});
    const [selectedCase, setSelectedCase] = useState('All');
    const [invalidBlocks, setInvalidBlocks] = useState(new Set());
    const [selectedBlock, setSelectedBlock] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [blocksRes, evRes] = await Promise.all([
                    api.get('/ledger/blocks'),
                    api.get('/evidence')
                ]);
                const data = blocksRes.data;
                setBlocks(data);

                const evMap = {};
                evRes.data.forEach(ev => {
                    evMap[ev._id] = ev.caseName;
                });
                setEvidenceMap(evMap);

                const invalid = new Set();
                for (let i = 1; i < data.length; i++) {
                    if (data[i].previousBlockHash !== data[i - 1].blockHash) {
                        invalid.add(data[i]._id);
                    }
                }
                setInvalidBlocks(invalid);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Extract cases and filter blocks
    const blocksWithCases = blocks.map(block => {
        if (block.isHidden) return { ...block, cases: [] };
        const caseSet = new Set();
        block.transactions?.forEach(tx => {
            if (tx.action === 'CREATE' && tx.payload.caseName) {
                caseSet.add(tx.payload.caseName);
            } else if (tx.payload.evidenceId || tx.payload.id) {
                const evId = tx.payload.evidenceId || tx.payload.id;
                const cName = evidenceMap[evId];
                if (cName) caseSet.add(cName);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Blockchain Network Visualizer</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 uppercase text-[10px] font-black">
                        {selectedCase === 'All' ? 'Interactive cryptographically secured vertical tree.' : `Secured timeline isolated for Case: ${selectedCase}`}
                    </p>
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex-1 md:w-48">
                        <select
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white outline-none transition-all text-sm font-medium"
                            value={selectedCase}
                            onChange={(e) => setSelectedCase(e.target.value)}
                        >
                            {uniqueCases.map(caseName => (
                                <option key={caseName} value={caseName}>{caseName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl hidden sm:block">
                        <Network className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-5xl mx-auto py-12 px-4 sm:px-8">
                {filteredBlocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Cpu className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />
                        <p className="font-medium text-lg text-gray-800 dark:text-gray-300">No blocks to visualize</p>
                        <p className="text-sm mt-1 opacity-70 max-w-sm uppercase text-[10px] font-black tracking-widest">Access restricted or ledger is empty.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Central Spine Baseline */}
                        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-800 transform -translate-x-1/2 rounded-full z-0"></div>
                        <div className="block md:hidden absolute left-8 top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>

                        {filteredBlocks.map((block, index) => {
                            const isLeft = index % 2 === 0;
                            const isInvalid = invalidBlocks.has(block._id);
                            const nextBlock = index < filteredBlocks.length - 1 ? filteredBlocks[index + 1] : null;

                            return (
                                <div key={block._id} className={`relative flex flex-col md:flex-row items-center justify-between w-full mb-12 md:mb-20 ${!isLeft ? 'md:flex-row-reverse' : ''}`}>

                                    {/* Center Node (Spine Dot) */}
                                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                                        <div className={`w-10 h-10 rounded-full border-4 border-white dark:border-[#0B0F19] shadow-md flex items-center justify-center ${block.isHidden ? 'bg-gray-400' : isInvalid ? 'bg-red-500' : 'bg-indigo-500'}`}>
                                            {block.isHidden ? <Lock className="w-5 h-5 text-white" /> : isInvalid ? <SearchX className="w-5 h-5 text-white" /> : <Network className="w-5 h-5 text-white" />}
                                        </div>
                                    </div>

                                    {/* Spine Bridge to next node */}
                                    {nextBlock && (
                                        <div className={`absolute z-10 border-l-[4px] 
                                            ${(selectedCase === 'All' && (nextBlock.isHidden || block.isHidden)) ? 'border-dashed border-gray-300 dark:border-gray-700' : 'border-solid border-indigo-500'} 
                                            /* Desktop */ md:left-1/2 md:w-1 md:-ml-[2px] md:top-10 md:h-[calc(100%+4rem)]
                                            /* Mobile  */ left-8 w-1 -ml-[2px] top-10 h-[calc(100%+2rem)]
                                        `}>
                                        </div>
                                    )}

                                    {/* Block Card Container */}
                                    <div className={`w-full md:w-5/12 ml-20 md:ml-0 flex ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                        <div
                                            onClick={() => !block.isHidden && setSelectedBlock(block)}
                                            className={`relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-md border-2 transition-all z-10 
                                                ${block.isHidden ? 'border-gray-200 dark:border-gray-700 opacity-70 grayscale' : isInvalid ? 'border-red-500/50 hover:border-red-500 cursor-pointer hover:-translate-y-1' : 'border-indigo-500/30 hover:border-indigo-500 cursor-pointer hover:-translate-y-1'}
                                            `}
                                        >
                                            {/* Connecting line from card to dot (Desktop only) */}
                                            <div className={`hidden md:block absolute top-[18px] w-6 border-t-[3px] border-dashed ${isLeft ? '-right-6' : '-left-6'} ${block.isHidden ? 'border-gray-300' : isInvalid ? 'border-red-500/50' : 'border-indigo-500/50'}`}></div>

                                            {/* Card Header */}
                                            <div className={`p-4 rounded-t-[14px] font-bold flex items-center justify-between border-b ${block.isHidden ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400' : isInvalid ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400'}`}>
                                                <div className="flex items-center gap-2 uppercase tracking-tighter">
                                                    {block.isHidden ? <EyeOff className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                                                    <span className="tracking-wide">BLOCK #{block.blockNumber} {block.isHidden && '(HIDDEN)'}</span>
                                                </div>
                                                {!block.isHidden && <Shield className={`w-4 h-4 ${isInvalid ? 'text-red-500' : 'text-emerald-500'}`} />}
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-4 flex flex-col gap-3">
                                                {block.isHidden ? (
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic py-4 text-center">
                                                        Jurisdiction restricted
                                                    </p>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                                                                <Database className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                                                                {block.transactions?.length || 0} Txns
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                {formatIST(block.timestamp)}
                                                            </span>
                                                        </div>

                                                        <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 flex items-center gap-2 border border-gray-100 dark:border-gray-700/50">
                                                            <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                                                {block.blockHash.substring(0, 24)}...
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empty flex spacer for Desktop to maintain center */}
                                    <div className="hidden md:block w-5/12"></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Popover for Hashes */}
            {selectedBlock && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in"
                    onClick={() => setSelectedBlock(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Popup Header */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                                    <Key className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight uppercase">Block #{selectedBlock.blockNumber}</h3>
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Cryptographic Seal</p>
                                </div>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="p-8 space-y-6">
                            {/* Hashes Section */}
                            <div className="space-y-4">
                                <div className="group transition-all">
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 ml-1">Previous Block Link</p>
                                    <div className="font-mono text-[11px] p-3.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 break-all leading-relaxed group-hover:border-indigo-500/30 transition-colors">
                                        {selectedBlock.previousBlockHash}
                                    </div>
                                </div>

                                <div className="group transition-all">
                                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mb-2 ml-1">Current State Hash</p>
                                    <div className="font-mono text-[11px] p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-bold break-all leading-relaxed group-hover:bg-indigo-50 transition-colors">
                                        {selectedBlock.blockHash}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Summary Section */}
                            {selectedBlock.transactions?.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3 ml-1 flex items-center">
                                        <Activity className="w-3 h-3 mr-2" /> Registered Transactions
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedBlock.transactions.map((tx, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${tx.action === 'CREATE' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase">{tx.action}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {tx.txHash?.substring(0, 10)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Popup Footer */}
                        <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                            <button 
                                onClick={() => setSelectedBlock(null)} 
                                className="px-12 py-3 bg-gray-900 dark:bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockchainVisualization;
