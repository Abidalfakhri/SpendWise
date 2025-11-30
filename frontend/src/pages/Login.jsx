import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Lock, Loader, Zap, BarChart2 } from "lucide-react"; 
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setLoading(false);
        return setError(data.message || "Login gagal");
      }

      // Backend: { success, message, data:{ token, user } }
      const token = data.data.token;
      const user = data.data.user;

      // Simpan token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi handleGuestLogin telah dihapus

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Efek Blur yang Lebih Halus */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch justify-center gap-12 z-10 max-w-5xl w-full">
        
        {/* Kiri: Branding & Slogan */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col justify-center text-left text-slate-200 max-w-xs p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">
                SW
            </div>
            <span className="text-4xl font-extrabold text-white tracking-tighter">SpendWise</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 leading-snug">
            Kelola Uangmu, Raih Kebebasan Finansial.
          </h1>
          <p className="text-slate-400 text-lg">
            Sistem pencatatan transaksi yang cepat dan visualisasi data yang intuitif.
          </p>
          
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-center text-emerald-400 gap-2">
                <Zap className="w-5 h-5" />
                <span>Pencatatan cepat dan mudah.</span>
            </div>
            <div className="flex items-center text-emerald-400 gap-2">
                <BarChart2 className="w-5 h-5" />
                <span>Analisis pengeluaran visual.</span>
            </div>
          </div>
        </motion.div>

        {/* Kanan: Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-center mb-7 text-white flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-emerald-400" />
            Masuk ke Akun Anda
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Input: Nama Pengguna */}
          <Input
            label="Nama Pengguna"
            type="text"
            icon={User}
            placeholder="Masukkan username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mb-4"
          />

          {/* Input: Password */}
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Masukkan password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-6"
          />

          {/* Button: Login (Tanpa "ATAU" dan Coba Demo) */}
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
                "Masuk"
            )}
          </Button>
          
          {/* Bagian ATAU dan Coba Demo telah dihapus */}

          <div className="mt-6 text-center text-sm text-slate-400 border-t border-slate-700/50 pt-4">
            Belum punya akun?{" "}
            <Link to="/register" className="text-emerald-400 hover:underline font-medium">
              Daftar Sekarang
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}