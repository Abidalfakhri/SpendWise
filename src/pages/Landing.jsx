import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Efek blur background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        className="text-center z-10 px-6 md:px-10 max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/src/assets/illustrations/finance.svg"
          alt="Finance Illustration"
          className="w-52 md:w-64 mx-auto mb-6 opacity-95 drop-shadow-lg"
        />

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
          Kelola Keuangan <span className="text-emerald-400">Lebih Cerdas</span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
          SpendWise membantu kamu mengatur keuangan, menabung untuk tujuan, dan
          memantau setiap transaksi secara efisien dan profesional.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            to="/register"
            className="px-6 py-3 bg-emerald-600 rounded-xl text-lg font-medium hover:bg-emerald-500 transition-all shadow-md shadow-emerald-900/30"
          >
            Daftar Sekarang
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-700 rounded-xl text-lg font-medium hover:bg-slate-600 transition-all"
          >
            Masuk
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-slate-600 rounded-xl text-lg font-medium hover:bg-slate-800 transition-all"
          >
            Coba Sebagai Tamu
          </Link>
        </div>
      </motion.div>

      {/* Footer kecil */}
      <div className="absolute bottom-5 text-slate-500 text-sm">
        © {new Date().getFullYear()} SpendWise — Smart Finance Management
      </div>
    </div>
  );
}
