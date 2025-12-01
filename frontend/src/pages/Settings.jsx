import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiMoon, FiSun, FiGlobe, FiDollarSign, FiLock, 
    FiLoader, FiCheck, FiSave, FiUser 
} from 'react-icons/fi';

// --- HELPER LOKAL ---

const getLocalSettings = () => {
    try {
        const storedSettings = localStorage.getItem('appSettings');
        return storedSettings ? JSON.parse(storedSettings) : {
            theme: 'light',
            language: 'id', 
            currency: 'IDR',
        };
    } catch (e) {
        return { theme: 'light', language: 'id', currency: 'IDR' };
    }
};

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

function SettingCard({ icon: Icon, title, description, children }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{description}</p>
            <div>{children}</div>
        </div>
    );
}

// --- KOMPONEN UTAMA SETTINGS ---
export default function Settings() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(getLocalSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Nilai awal settings untuk membandingkan perubahan
    const initialLocalSettings = useMemo(getLocalSettings, []);

    // --- FETCH PROFIL PENGGUNA ---
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            setLoading(false);
            return;
        }

        try {
            const userRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (userRes.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login"); // LOGOUT / REDIRECT TERJADI DI SINI
                return;
            }

            const userData = await userRes.json();
            
            if (userData.success && userData.data) {
                setUser(userData.data);
                localStorage.setItem("user", JSON.stringify(userData.data));
            } else {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } catch (error) {
            // Gagal koneksi
            localStorage.removeItem("token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Pemuatan Awal
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) { /* no-op */ }
        }
        
        applyTheme(settings.theme);
        fetchProfile();
    }, [fetchProfile, settings.theme]);

    // Cek Perubahan Lokal
    const hasLocalChanges = useMemo(() => {
        return (
            settings.theme !== initialLocalSettings.theme ||
            settings.language !== initialLocalSettings.language ||
            settings.currency !== initialLocalSettings.currency
        );
    }, [settings, initialLocalSettings]);


    // --- EVENT HANDLERS ---
    
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (saveSuccess) setSaveSuccess(false); 

        if (key === 'theme') applyTheme(value);
    };

    const handleSaveChanges = async () => {
        if (!hasLocalChanges) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
            Object.assign(initialLocalSettings, settings);
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert("Gagal menyimpan preferensi lokal.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Yakin ingin keluar dari akun?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        }
    };


    // --- RENDER LOADING ---
    if (loading && !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <FiLoader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Memuat profil...</p>
            </div>
        );
    }

    if (!user) return null; // Sudah di-redirect di fetchProfile

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 text-slate-900 dark:text-slate-100">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Pengaturan Aplikasi ⚙️</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Sesuaikan tampilan dan akun Anda.</p>
                </div>

                {/* --- 1. INFO PROFIL (Read-Only) --- */}
                <SettingCard
                    icon={FiUser}
                    title="Informasi Profil"
                    description="Data yang diambil langsung dari server."
                >
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="mt-4 px-4 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-white"
                    >
                        Kelola Profil (Edit Data)
                    </button>
                </SettingCard>
                
<hr className="border-slate-200 dark:border-slate-700"/>

                {/* --- 2. TEMA APLIKASI (Lokal) --- */}
                <SettingCard
                    icon={settings.theme === 'dark' ? FiMoon : FiSun}
                    title="Tema Tampilan"
                    description="Ubah mode tampilan aplikasi. Perubahan disimpan di browser."
                >
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSettingChange('theme', 'light')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                                settings.theme === 'light' 
                                ? 'bg-yellow-500 text-white font-bold' 
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            <FiSun className="w-5 h-5" /> Terang
                        </button>
                        <button
                            onClick={() => handleSettingChange('theme', 'dark')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                                settings.theme === 'dark' 
                                ? 'bg-indigo-600 text-white font-bold' 
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            <FiMoon className="w-5 h-5" /> Gelap
                        </button>
                    </div>
                </SettingCard>

                {/* --- 3. PREFERENSI LOKAL --- */}
                <SettingCard
                    icon={FiGlobe}
                    title="Preferensi Default"
                    description="Tentukan bahasa dan mata uang default aplikasi."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bahasa</label>
                            <div className="relative">
                                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleSettingChange('language', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                >
                                    <option value="id">Bahasa Indonesia</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Uang Default</label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                >
                                    <option value="IDR">Rupiah (IDR)</option>
                                    <option value="USD">Dollar (USD)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </SettingCard>

                {/* --- SIMPAN & LOGOUT --- */}
                <div className="pt-4 space-y-4">
                    <div className="flex justify-end gap-3">
                        {/* Status Simpan */}
                        <div
                            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 font-medium transition-opacity duration-300 ${saveSuccess 
                                ? 'opacity-100 text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' 
                                : 'opacity-0 h-0 w-0 p-0 overflow-hidden'}`
                            }
                        >
                            <FiCheck className="w-5 h-5"/> Berhasil Disimpan Lokal!
                        </div>

                        {/* Tombol Simpan */}
                        <button 
                            onClick={handleSaveChanges}
                            disabled={!hasLocalChanges || isSaving}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition flex items-center gap-2 shadow-md shadow-emerald-500/30"
                        >
                            {isSaving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                            {isSaving ? "Menyimpan..." : "Simpan Preferensi"}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleLogout}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-rose-500/30"
                        >
                            <FiLock className="w-4 h-4" /> Keluar (Logout)
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
}