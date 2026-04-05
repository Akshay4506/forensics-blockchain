import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Moon, Sun, ShieldCheck, Database, Network } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const [colorTheme, setTheme] = useDarkMode();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Navbar */}
            <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
                            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                ForensicChain
                            </span>
                        </Link>

                        {/* Right side controls */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setTheme(colorTheme)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            >
                                {colorTheme === 'light' ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            {user ? (
                                <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                    Enterprise Digital Forensics
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
                    The immutable, decentralized ledger for digital evidence management. Secure your chain of custody mathematically using Hyperledger Fabric architecture.
                </p>
                {user ? (
                    <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-colors shadow-lg inline-flex items-center">
                        Go to Dashboard
                    </Link>
                ) : (
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-colors shadow-lg inline-flex items-center">
                        Login
                    </Link>
                )}
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        Everything Your Operation Needs
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="mx-auto w-14 h-14 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Immutable Evidence</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                100% mathematical certainty. Track your evidence hash fingerprints securely so they can never be altered without detection.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                                <Database className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Strict Endorsements</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Pre-configured MSP rules. Ensure that only ECU can create evidence and only LAB/COURT can mathematically verify it.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="mx-auto w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                                <Network className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Network Visualization</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                See your blockchain grow. Visualize the hash tree locally to spot broken blocks and compromised ledgers instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 text-center dark:bg-gray-900">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Secure Your Evidence?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Join the decentralized forensic network running on Hyperledger-inspired architecture.</p>
                {user ? (
                    <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
                        Go to Dashboard
                    </Link>
                ) : (
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
                        Get Started
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Landing;
