import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
// Import ikon yang diperlukan
import { User, Mail, Lock, Loader, Zap, BarChart2, CheckCircle } from "lucide-react"; 
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi semua field wajib
    if (!name || !email || !username || !password) {
      return setError("Semua field wajib diisi");
    }

    try {
      setLoading(true);

      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mendaftar");
      }

      // Register berhasil → simpan token & user
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Trigger event untuk update komponen lain (Navbar, dll)
      window.dispatchEvent(new Event('auth-change'));

      // Redirect ke dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Register error:", err);
      setError(err.message || "Terjadi kesalahan saat mendaftar ke server."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Efek Blur: Mengubah warna Blue menjadi Emerald yang lebih halus */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-stretch justify-center gap-12 z-10 max-w-5xl w-full">
        
        {/* Kanan: Branding & Slogan (Penyesuaian Warna Aksen) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col justify-center text-left text-slate-200 max-w-xs p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">
                SW
            </div>
            <span className="text-4xl font-extrabold text-white tracking-tighter">Mulai Hari Ini</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 leading-snug">
            Cukup 1 Menit, Keuanganmu Terkendali.
          </h1>
          <p className="text-slate-400 text-lg">
            Daftar gratis, tanpa kartu kredit, dan langsung mulai mengelola uangmu.
          </p>
          
          <div className="mt-8 space-y-3 text-sm">
            {/* Mengubah warna aksen dari blue-400 menjadi emerald-400 */}
            <div className="flex items-center text-emerald-400 gap-2"> 
                <CheckCircle className="w-5 h-5" />
                <span>Selamanya Gratis</span>
            </div>
            <div className="flex items-center text-emerald-400 gap-2">
                <Zap className="w-5 h-5" />
                <span>Pencatatan super cepat</span>
            </div>
            <div className="flex items-center text-emerald-400 gap-2">
                <BarChart2 className="w-5 h-5" />
                <span>Visualisasi Laporan</span>
            </div>
          </div>
        </motion.div>

        {/* Kiri: Form Registrasi */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-center mb-7 text-white flex items-center justify-center gap-2">
            {/* Mengubah warna ikon dari blue-400 menjadi emerald-400 */}
            <User className="w-6 h-6 text-emerald-400" /> 
            Daftar Akun Baru
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Inputs (Tetap sama) */}
          <Input
            label="Nama Lengkap"
            type="text"
            icon={User}
            placeholder="Masukkan nama lengkap..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mb-4"
          />

          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="Masukkan email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4"
          />

          <Input
            label="Username"
            type="text"
            icon={User}
            placeholder="Pilih username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mb-4"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Buat password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-6"
          />

          {/* Button: Daftar (Warna sudah emerald) */}
          <Button
            type="submit"
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 transition-all font-semibold"
            disabled={loading}
          >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Memproses...
                </div>
            ) : (
                "Daftar"
            )}
          </Button>

          <div className="mt-6 text-center text-sm text-slate-400 border-t border-slate-700/50 pt-4">
            Sudah punya akun?{" "}
            {/* Mengubah warna link dari blue-400 menjadi emerald-400 */}
            <Link to="/login" className="text-emerald-400 hover:underline font-medium"> 
              Masuk
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}