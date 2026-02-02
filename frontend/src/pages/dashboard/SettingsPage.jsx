import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../components/dashboard/Sidebar";

import { useAuth } from "../../auth/AuthContext";
import { apiRequest } from "../../api/client";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        fullName: "",
        title: "",
        bio: "",
        location: "",
        avatar: ""
    });

    // Password State
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Initialize state from auth user
    useEffect(() => {
        if (user) {
            setProfile({
                fullName: user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.username,
                title: user.title || "Developer",
                bio: user.bio || "",
                location: user.location || "",
                avatar: user.avatar || ""
            });
        }
    }, [user]);

    // Neural Interface (Appearance) State - Persist locally
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('orbitdev_settings');
        return saved ? JSON.parse(saved) : {
            darkMode: true,
            godMode: false,
            ghostMode: false,
            reducedMotion: false,
            soundEffects: true
        };
    });

    // Update Global Settings
    useEffect(() => {
        localStorage.setItem('orbitdev_settings', JSON.stringify(settings));
        const root = document.documentElement;

        if (settings.darkMode) root.classList.add('dark');
        else root.classList.remove('dark');

        if (settings.godMode) document.body.classList.add('crt-overlay');
        else document.body.classList.remove('crt-overlay');

        if (settings.ghostMode) document.body.classList.add('ghost-mode');
        else document.body.classList.remove('ghost-mode');

    }, [settings]);


    // HANDLERS
    const handleProfileChange = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

    const saveProfile = async () => {
        setIsLoading(true);
        try {
            // Split name if needed, usually backend handles fullname or specific fields
            // Assuming API accepts these fields directly or we map them
            const payload = {
                fullName: profile.fullName,
                bio: profile.bio,
                avatar: profile.avatar,
                title: profile.title,
                location: profile.location
            };

            const updatedUser = await apiRequest('/users/me', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            updateUser(updatedUser);
            toast.success("Identity matrix updated successfully.");
        } catch (error) {
            console.error("Save Profile Error:", error);
            // Show detailed error if available from backend response
            const msg = error.response?.data?.error || error.message || "Failed to update profile.";
            toast.error(`Update Failed: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        if (passwords.newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters.");
        }

        setIsLoading(true);
        try {
            await apiRequest('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                })
            });
            toast.success("Security credentials rotated.");
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Change Password Error:", error);
            const msg = error.response?.data?.error || error.message || "Password update failed.";
            toast.error(`Security Error: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Identity Matrix', icon: 'face' },
        { id: 'neural', label: 'Neural Interface', icon: 'tune' },
        { id: 'connections', label: 'Uplinks', icon: 'hub' },
        { id: 'account', label: 'Security', icon: 'shield' },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-[#030712] relative overflow-hidden transition-colors duration-500">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <Sidebar />

            <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto relative z-10 text-gray-900 dark:text-gray-100">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="mb-8 px-4">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                SETTINGS
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">System Configuration</p>
                        </div>

                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                                    ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`material-symbols-outlined transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {tab.icon}
                                </span>
                                <span className="font-medium tracking-wide">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative Background Mesh */}
                            <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/[0.05] -z-10" />

                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="space-y-8">
                                    <header className="flex flex-col md:flex-row items-start md:items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-8">
                                        <div className="relative group cursor-pointer shrink-0">
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[3px] shadow-2xl shadow-blue-500/20">
                                                <img
                                                    src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`}
                                                    alt="Avatar"
                                                    className="w-full h-full rounded-full bg-white dark:bg-black object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-white text-3xl">upload</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                                    Digital Persona
                                                </h2>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    Select a "Nano Banana" identity or upload your own.
                                                </p>
                                            </div>

                                            {/* Avatar Selector Presets */}
                                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                                {/* We will populate these with the generated logos */}
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleProfileChange('avatar', `/assets/logos/nano_${i}.png`)}
                                                        className="w-12 h-12 rounded-lg border border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-110 transition-all bg-white dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0"
                                                    >
                                                        <img src={`/assets/logos/nano_${i}.png`} alt={`DevOS Logo ${i}`} className="w-full h-full object-contain p-1" />
                                                    </button>
                                                ))}
                                                <button className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center hover:border-gray-400 dark:hover:border-white/40 transition-colors shrink-0">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Full Name" value={profile.fullName} onChange={(v) => handleProfileChange('fullName', v)} />
                                        <InputGroup label="Title" value={profile.title} onChange={(v) => handleProfileChange('title', v)} />
                                        <div className="md:col-span-2">
                                            <InputGroup label="Bio" value={profile.bio} onChange={(v) => handleProfileChange('bio', v)} multiline />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputGroup label="Avatar URL" value={profile.avatar} onChange={(v) => handleProfileChange('avatar', v)} placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-white/5 flex justify-end">
                                        <button
                                            onClick={saveProfile}
                                            disabled={isLoading}
                                            className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isLoading ? <span className="animate-spin material-symbols-outlined text-sm">rotate_right</span> : <span className="material-symbols-outlined text-sm">save</span>}
                                            SAVE PROFILE
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* NEURAL INTERFACE (APPEARANCE) */}
                            {activeTab === 'neural' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Visual Cortex</h2>
                                        <p className="text-gray-500 dark:text-gray-400">Customize your visual experience.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <ToggleCard
                                            title="Dark Mode"
                                            desc="Enable the standard low-light interface."
                                            icon="dark_mode"
                                            checked={settings.darkMode}
                                            onChange={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                                        />
                                        <ToggleCard
                                            title="God Mode (CRT)"
                                            desc="Enable retro-futuristic CRT scanlines and vignette."
                                            icon="terminal"
                                            highlight
                                            checked={settings.godMode}
                                            onChange={() => setSettings(s => ({ ...s, godMode: !s.godMode }))}
                                        />
                                        <ToggleCard
                                            title="Ghost Mode"
                                            desc="Incognito visual styling (Inverted hues)."
                                            icon="visibility_off"
                                            checked={settings.ghostMode}
                                            onChange={() => setSettings(s => ({ ...s, ghostMode: !s.ghostMode }))}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* CONNECTIONS */}
                            {activeTab === 'connections' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Uplinks</h2>
                                        <p className="text-gray-500 dark:text-gray-400">Manage external tool integrations.</p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between bg-gray-50 dark:bg-black/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-black rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-3xl">
                                                <i className="devicon-github-original"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">GitHub</h3>
                                                <p className="text-sm text-gray-500">{user?.githubId ? `Connected (ID: ${user.githubId})` : 'Not linked'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all
                                                ${user?.githubId
                                                    ? 'bg-green-500/10 text-green-500 cursor-default'
                                                    : 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                                }`}
                                            disabled={!!user?.githubId}
                                        >
                                            {user?.githubId ? 'LINK ACTIVE' : 'CONNECT GITHUB'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ACCOUNT / SECURITY */}
                            {activeTab === 'account' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Security Protocols</h2>
                                        <p className="text-gray-500 dark:text-gray-400">Manage access credentials.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <InputGroup
                                            label="Current Password"
                                            type="password"
                                            value={passwords.oldPassword}
                                            onChange={(v) => setPasswords({ ...passwords, oldPassword: v })}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup
                                                label="New Password"
                                                type="password"
                                                value={passwords.newPassword}
                                                onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
                                            />
                                            <InputGroup
                                                label="Confirm New Password"
                                                type="password"
                                                value={passwords.confirmPassword}
                                                onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-white/5 flex justify-end">
                                        <button
                                            onClick={changePassword}
                                            disabled={isLoading}
                                            className="px-8 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isLoading ? <span className="animate-spin material-symbols-outlined text-sm">rotate_right</span> : <span className="material-symbols-outlined text-sm">lock_reset</span>}
                                            UPDATE CREDENTIALS
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* The generic "Footer Actions" div is removed as save buttons are now specific to each tab */}
                            {/* <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
                                <button className="px-6 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">save</span>
                                    )}
                                    SAVE CHANGES
                                </button>
                            </div> */}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function InputGroup({ label, value, onChange, multiline, placeholder, type = "text" }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    placeholder={placeholder}
                    className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-gray-900 dark:text-gray-100"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                />
            )}
        </div>
    );
}

function ToggleCard({ title, desc, icon, checked, onChange, highlight }) {
    return (
        <div
            onClick={onChange}
            className={`cursor-pointer group border flex items-center justify-between p-4 rounded-xl transition-all duration-300
                ${checked
                    ? (highlight ? 'bg-purple-500/10 border-purple-500/50' : 'bg-blue-500/10 border-blue-500/50')
                    : 'bg-white dark:bg-black/20 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${checked ? 'text-white bg-blue-500 shadow-lg shadow-blue-500/40' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h3 className={`font-bold ${checked ? 'text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>{title}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
            </div>

            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'left-7' : 'left-1'}`} />
            </div>
        </div>
    );
}
