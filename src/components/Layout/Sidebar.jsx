import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPieChart,
  FiList,
  FiTag,
  FiSettings,
  FiRepeat,
  FiTarget,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";
import { FaWallet } from "react-icons/fa";

const linkBase =
  "flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200";
const activeLink =
  "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-inner shadow-emerald-400/30";

export default function Sidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed top-0 left-0 w-72 z-50 min-h-screen border-r border-slate-800 bg-slate-950 flex flex-col justify-between shadow-2xl"
          >
            {/* Bagian atas: logo & navigasi */}
            <div className="p-5">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 mb-6"
              >
                <img
                  src="/src/assets/logo.svg"
                  alt="SpendWise"
                  className="h-9 w-9"
                />
                <h1 className="text-xl font-bold text-white tracking-wide">
                  SpendWise
                </h1>
              </Link>

              <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                Navigasi
              </div>

              <nav className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiPieChart size={18} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/transactions"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiList size={18} />
                  <span>Transaksi</span>
                </NavLink>

                <NavLink
                  to="/mutasi"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiRepeat size={18} />
                  <span>Mutasi</span>
                </NavLink>

                <NavLink
                  to="/dompet"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FaWallet size={18} />
                  <span>Dompet</span>
                </NavLink>

                <NavLink
                  to="/target-keuangan"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiTarget size={18} />
                  <span>Target Keuangan</span>
                </NavLink>

                <NavLink
                  to="/laporan"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiBarChart2 size={18} />
                  <span>Laporan Analitik</span>
                </NavLink>

                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeLink : ""}`
                  }
                  onClick={onClose}
                >
                  <FiTag size={18} />
                  <span>Kategori</span>
                </NavLink>
              </nav>
            </div>

            {/* Bagian bawah: settings dan logout */}
            <div className="p-5 border-t border-slate-800 space-y-2">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? activeLink : ""}`
                }
                onClick={onClose}
              >
                <FiSettings size={18} />
                <span>Pengaturan</span>
              </NavLink>

              <button
                onClick={() => alert("Fitur logout belum diimplementasi")}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
              >
                <FiLogOut size={18} />
                <span>Keluar</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}