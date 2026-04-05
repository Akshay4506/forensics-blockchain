import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { Shield, LayoutDashboard, FilePlus, ArrowRightLeft, CheckCircle, Database, Network, User, LogOut, Sun, Moon, Bell, Clock, Wallet } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const Layout = () => {
    const { user, logout, notifications, markNotificationAsRead, clearAllNotifications, updateWallet } = useContext(AuthContext);
    const { account, connectWallet, isConnecting } = useContext(WalletContext);
    const navigate = useNavigate();

    // Auto-link wallet to profile if different
    React.useEffect(() => {
        if (user && account && user.walletAddress !== account) {
            updateWallet(account).catch(err => console.error("Auto-link failed", err));
        }
    }, [account, user, updateWallet]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const [colorTheme, setTheme] = useDarkMode();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 shadow-xl dark:shadow-none border-r border-transparent dark:border-gray-800 flex flex-col hidden md:flex transition-colors">
                <Link to="/" className="h-20 px-6 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity cursor-pointer">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        ForensicChain
                    </h1>
                </Link>

                <nav className="flex-1 p-4 flex flex-col space-y-2 text-gray-600 dark:text-gray-300">
                    <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    {user?.organization === 'ECU' && (
                        <Link to="/evidence/create" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                            <FilePlus className="w-5 h-5" />
                            <span>Create Evidence</span>
                        </Link>
                    )}
                    <Link to="/evidence/transfer" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                        <ArrowRightLeft className="w-5 h-5" />
                        <span>Transfer Custody</span>
                    </Link>
                    {user?.organization !== 'ECU' && (
                        <Link to="/evidence/verify" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                            <CheckCircle className="w-5 h-5" />
                            <span>Verify Integrity</span>
                        </Link>
                    )}
                    <Link to="/ledger/blocks" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                        <Database className="w-5 h-5" />
                        <span>Ledger Blocks</span>
                    </Link>
                    <Link to="/ledger/visualizer" className="flex items-center space-x-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium">
                        <Network className="w-5 h-5" />
                        <span>Network Visualizer</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <p className="text-xs text-center text-gray-400">ForensicChain v1.0</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden dark:bg-gray-900">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-900 h-20 px-8 shadow-sm border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-40 transition-colors">
                    <Link to="/" className="flex md:hidden items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">ForensicChain</span>
                    </Link>
                    <div className="hidden md:block">
                        <h2 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Active Network Node: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.role}</span></h2>
                    </div>

                    {/* Controls Area */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setTheme(colorTheme)}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        >
                            {colorTheme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* MetaMask Connect Button */}
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                account 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                            }`}
                        >
                            <Wallet className="w-4 h-4" />
                            <span>
                                {isConnecting ? 'Connecting...' : account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
                            </span>
                            {account && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown Area */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-xl transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.organization}</p>
                                </div>
                                <div className="relative">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center rounded-full font-bold border-2 border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    {notifications?.length > 0 && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    )}
                                </div>
                            </button>

                             {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                                    {/* Notifications Section */}
                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between text-gray-900 dark:text-white mb-1">
                                            <div className="flex items-center space-x-2">
                                                <Bell className="w-4 h-4" />
                                                <span className="font-bold text-sm">Notifications</span>
                                            </div>
                                            {notifications?.length > 0 && (
                                                <div className="flex items-center space-x-3">
                                                    <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-[10px] text-white font-bold rounded-full">
                                                        {notifications.length}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); clearAllNotifications(); }}
                                                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-wider"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications?.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-gray-400">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif._id}
                                                    onClick={async () => {
                                                        await markNotificationAsRead(notif._id);
                                                        setDropdownOpen(false);
                                                        navigate(`/evidence/${notif.evidenceId}/audit`);
                                                    }}
                                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                                                >
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-1">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center text-[10px] text-gray-400">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                                        >
                                            <User className="w-4 h-4 mr-3 text-gray-400" />
                                            View Profile
                                        </Link>
                                        <button
                                            onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                            className="flex w-full items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left font-medium"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
