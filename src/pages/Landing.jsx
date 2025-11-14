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
            className="px-6 py-3 bg-emerald-600 rounded-xl text-lg font-medium hover:bg-emerald-500 transition-transform transform hover:scale-105 shadow-md shadow-emerald-900/30"
          >
            Daftar Sekarang
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-700 rounded-xl text-lg font-medium hover:bg-slate-600 transition-transform transform hover:scale-105"
          >
            Masuk
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-slate-600 rounded-xl text-lg font-medium hover:bg-slate-800 transition-transform transform hover:scale-105"
          >
            Coba Sebagai Tamu
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 animate-bounce text-emerald-400 text-3xl">↓</div>
      </motion.div>

      {/* Fitur Unggulan */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 z-10 px-6 max-w-5xl">
        {[
          { icon: "💰", title: "Pantau Transaksi", desc: "Lacak pengeluaran dan pemasukan secara real-time." },
          { icon: "🎯", title: "Tujuan Finansial", desc: "Buat dan capai target menabung dengan mudah." },
          { icon: "📊", title: "Laporan Visual", desc: "Grafik dan insight keuangan yang mudah dipahami." },
        ].map((f, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-xl shadow-md shadow-slate-900/30 text-center hover:shadow-lg hover:shadow-emerald-700/20 transition-all">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Testimoni */}
      <div className="mt-20 z-10 max-w-xl text-center px-6">
        <h2 className="text-2xl font-semibold mb-6 text-emerald-400">Apa Kata Mereka?</h2>
        <div className="bg-slate-800 p-6 rounded-xl shadow-md shadow-slate-900/30">
          <p className="italic text-slate-300">“SpendWise sangat membantu saya menabung untuk liburan impian!”</p>
          <p className="mt-2 text-sm text-slate-400">— Rina, Freelancer</p>
        </div>
      </div>

      {/* Footer kecil */}
      <div className="absolute bottom-5 text-slate-500 text-sm">
        © {new Date().getFullYear()} SpendWise — Smart Finance Management
      </div>
    </div>
  );
}