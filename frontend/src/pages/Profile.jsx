import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldAlert, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            return setError('New passwords do not match');
        }

        setLoading(true);

        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone
            };
            if (formData.newPassword) {
                updatePayload.oldPassword = formData.oldPassword;
                updatePayload.newPassword = formData.newPassword;
            }

            const res = await api.put('/auth/profile', updatePayload);
            setSuccess(res.data.message || 'Profile updated successfully');

            // Clear password fields on success
            setFormData({
                ...formData,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Identity Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your MSP enrollment details</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium text-sm flex items-center border border-red-100 dark:border-red-800/30"><ShieldAlert className="w-5 h-5 mr-2" />{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl font-medium text-sm flex items-center border border-green-100 dark:border-green-800/30"><CheckCircle className="w-5 h-5 mr-2" />{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">

                {/* Immutable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                        <p className="text-gray-800 dark:text-gray-200 font-medium px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Organization Role</label>
                        <p className="text-indigo-700 dark:text-indigo-400 font-bold px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">{user?.role}</p>
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 pl-3 mb-4">Update Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text" required
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
                            <input
                                type="tel" required
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-l-4 border-gray-400 dark:border-gray-600 pl-3 mb-2">Security</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Leave fields blank if you do not wish to change your password.</p>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                        <input
                            type="password"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            value={formData.oldPassword} onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium p-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
