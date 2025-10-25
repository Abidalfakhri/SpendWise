import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FiMoon, FiSun, FiGlobe, FiDollarSign, FiShield, FiLock } from 'react-icons/fi';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const [language, setLanguage] = useState('id');
  const [currency, setCurrency] = useState('IDR');
  const [enable2FA, setEnable2FA] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 text-white">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-slate-400 text-sm">
          Sesuaikan pengalaman penggunaan aplikasi sesuai keinginanmu.
        </p>
      </div>

      {/* Kartu Pengaturan */}
      <div className="space-y-6">
        {/* 🔆 Tema */}
        <SettingCard
          title="Tema Aplikasi"
          description="Pilih mode tampilan aplikasi yang kamu sukai."
        >
          <button
            onClick={toggle}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2"
          >
            {theme === 'dark' ? <FiMoon /> : <FiSun />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </SettingCard>

        {/* 👤 Akun */}
        <SettingCard
          title="Informasi Akun"
          description="Atur data pribadi dan keamanan akun kamu."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || '/src/assets/avatar-default.png'}
                alt="Avatar"
                className="h-16 w-16 rounded-full border-2 border-emerald-500 object-cover"
              />
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <button className="text-xs text-emerald-400 hover:underline mt-1">
                  Ganti Foto
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-3 py-1.5 bg-slate-700 rounded hover:bg-slate-600 transition text-sm">
                Ubah Nama / Email
              </button>
              <button className="px-3 py-1.5 bg-slate-700 rounded hover:bg-slate-600 transition text-sm">
                <FiLock className="inline mr-1" /> Ubah Password
              </button>
            </div>
          </div>
        </SettingCard>

        {/* 🛡️ Keamanan */}
        <SettingCard
          title="Keamanan"
          description="Tingkatkan keamanan akun kamu dengan fitur tambahan."
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={() => setEnable2FA(!enable2FA)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span>Aktifkan Autentikasi Dua Faktor (2FA)</span>
            </label>
            <button className="px-3 py-1.5 bg-red-600 rounded hover:bg-red-500 text-sm w-fit">
              <FiShield className="inline mr-1" /> Logout dari semua perangkat
            </button>
          </div>
        </SettingCard>

        {/* 🌐 Preferensi */}
        <SettingCard
          title="Preferensi Aplikasi"
          description="Ubah bahasa dan mata uang default aplikasi."
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1 text-slate-300">
                Bahasa
              </label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-800 rounded p-2 pl-9 border border-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 text-slate-300">
                Mata Uang
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-800 rounded p-2 pl-9 border border-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="IDR">Rupiah (IDR)</option>
                  <option value="USD">Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* 💾 Simpan */}
        <motion.div
          className="flex justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm">
            Reset
          </button>
          <button className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">
            Simpan Perubahan
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function SettingCard({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-5 shadow border border-slate-700"
    >
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <div>{children}</div>
    </motion.div>
  );
}
