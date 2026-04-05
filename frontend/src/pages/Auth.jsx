import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const AuthParams = ({ type }) => {
    const isLogin = type === 'login';
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [colorTheme, setTheme] = useDarkMode();
    const [loginMethod, setLoginMethod] = useState('email');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'ECU'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const credentials = { password: formData.password };
                if (loginMethod === 'email') credentials.email = formData.email;
                else credentials.phone = formData.phone;
                await login(credentials);
            } else {
                await register(formData);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4 transition-colors">
            {/* Theme Toggle Absolute Absolute Position */}
            <button
                onClick={() => setTheme(colorTheme)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-700 transition-all z-50"
            >
                {colorTheme === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-transparent dark:border-gray-700">
                <div className="flex flex-col items-center mb-8">
                    <Link to="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity mb-2">
                        <Shield className="w-10 h-10 text-blue-600 dark:text-blue-500" />
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            ForensicChain
                        </span>
                    </Link>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm text-center">{isLogin ? 'Sign in to access the MSP node' : 'Register your organization identity'}</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    {!isLogin ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </>
                    ) : loginMethod === 'phone' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                required
                                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {isLogin && (
                        <div className="flex justify-start mt-1">
                            <button
                                type="button"
                                onClick={() => setLoginMethod(prev => prev === 'email' ? 'phone' : 'email')}
                                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                                {loginMethod === 'email' ? 'Login with Mobile' : 'Login with Email'}
                            </button>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Role</label>
                            <select
                                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white outline-none transition-all"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="ECU">Evidence Collection Unit (ECU)</option>
                                <option value="LAB">Forensic Lab (LAB)</option>
                                <option value="COURT">Court of Law (COURT)</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-all shadow-md mt-4"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
                    <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                        {isLogin ? 'Register' : 'Login'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthParams;
