  import { useAuth } from "../contexts/AuthContext";
  import { useNavigate, Link } from "react-router-dom";
  import { useState } from "react";
  import { motion } from "framer-motion";
  import Input from "../components/common/Input";
  import Button from "../components/common/Button";

  export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  
  login(username || "Tamu");
  
  navigate("/dashboard");
};



    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
        {/* Dekorasi background */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-2xl"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 z-10 max-w-5xl w-full">
          {/* Kiri - Ilustrasi */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex flex-col items-center text-center text-slate-200 max-w-sm"
          >
            <img
              src="/src/assets/illustrations/finance.svg"
              alt="Finance Illustration"
              className="w-64 mb-6 drop-shadow-xl"
            />
            <h1 className="text-3xl font-bold mb-2">Selamat Datang di SpendWise</h1>
            <p className="text-slate-400">
              Atur keuanganmu dengan cerdas. Lihat saldo, catat pengeluaran, dan capai tujuan finansialmu.
            </p>
          </motion.div>

          {/* Kanan - Form Login */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-center mb-6 text-white">
              Masuk ke Akun
            </h2>

            <Input
              label="Nama Pengguna"
              type="text"
              placeholder="Masukkan nama..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 transition-all">
              Masuk
            </Button>

            <div className="mt-4 text-center text-sm text-slate-400">
              Belum punya akun?{" "}
              <Link to="/register" className="text-emerald-400 hover:underline">
                Daftar
              </Link>
            </div>

            <div className="mt-2 text-center text-sm">
              <Link
                to="/dashboard"
                className="text-slate-500 hover:text-emerald-400 hover:underline transition"
              >
                Masuk sebagai Tamu
              </Link>
            </div>
          </motion.form>
        </div>
      </div>
    );
  }
