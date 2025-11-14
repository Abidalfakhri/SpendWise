import { useEffect, useState } from "react";
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
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaWallet } from "react-icons/fa";

export default function Sidebar({ open, onClose }) {
  // baca tema sidebar dari localStorage, default = dark
  const [sidebarTheme, setSidebarTheme] = useState(() => {
    try {
      return localStorage.getItem("sidebarTheme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebarTheme", sidebarTheme);
    } catch {}
  }, [sidebarTheme]);

  const toggleSidebarTheme = () => {
    setSidebarTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  // kelas utama bergantung pada tema sidebar
  const asideClass =
    sidebarTheme === "light"
      ? "fixed top-0 left-0 w-72 z-50 min-h-screen border-r bg-white border-slate-300 flex flex-col justify-between shadow-2xl"
      : "fixed top-0 left-0 w-72 z-50 min-h-screen border-r bg-slate-950 border-slate-800 flex flex-col justify-between shadow-2xl";

  const titleClass = sidebarTheme === "light" ? "text-slate-800" : "text-white";
  const sectionLabelClass =
    sidebarTheme === "light" ? "text-slate-500" : "text-slate-400";

  // link base (text color + hover) disesuaikan
  const linkBase = (isActive) =>
    sidebarTheme === "light"
      ? `flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 ${isActive ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-inner shadow-emerald-400/30" : ""}`
      : `flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 ${isActive ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-inner shadow-emerald-400/30" : ""}`;

  const bottomBorderClass = sidebarTheme === "light" ? "border-t border-slate-200" : "border-t border-slate-800";

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
            className={asideClass}
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
                <h1 className={`text-xl font-bold tracking-wide ${titleClass}`}>
                  SpendWise
                </h1>
              </Link>

              <div className={`text-xs uppercase tracking-wider mb-3 ${sectionLabelClass}`}>
                Navigasi
              </div>

              <nav className="space-y-1">
                <NavLink to="/dashboard" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiPieChart size={18} />
                      <span>Dashboard</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/transactions" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiList size={18} />
                      <span>Transaksi</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/mutasi" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiRepeat size={18} />
                      <span>Mutasi</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/dompet" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FaWallet size={18} />
                      <span>Dompet</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/target-keuangan" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiTarget size={18} />
                      <span>Target Keuangan</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/laporan" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiBarChart2 size={18} />
                      <span>Laporan Analitik</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/categories" onClick={onClose}>
                  {({ isActive }) => (
                    <div className={linkBase(isActive)}>
                      <FiTag size={18} />
                      <span>Kategori</span>
                    </div>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* Bagian bawah: theme toggle, settings dan logout */}
            <div className={`p-5 ${bottomBorderClass} space-y-2`}>
              {/* Theme toggle khusus sidebar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  {sidebarTheme === "light" ? (
                    <FiSun size={18} className="text-amber-500" />
                  ) : (
                    <FiMoon size={18} className="text-slate-300" />
                  )}
                  <div className={sidebarTheme === "light" ? "text-slate-700" : "text-slate-300"}>
                    Mode Sidebar
                    <div className="text-xs text-slate-400">{sidebarTheme === "light" ? "Terang" : "Gelap"}</div>
                  </div>
                </div>

                <button
                  onClick={toggleSidebarTheme}
                  aria-label="Toggle sidebar theme"
                  className={sidebarTheme === "light"
                    ? "px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition"
                    : "px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition"}
                >
                  {sidebarTheme === "light" ? <FiMoon /> : <FiSun />}
                </button>
              </div>

              <NavLink to="/settings" onClick={onClose}>
                {({ isActive }) => (
                  <div className={linkBase(isActive)}>
                    <FiSettings size={18} />
                    <span>Pengaturan</span>
                  </div>
                )}
              </NavLink>

              <button
                onClick={() => alert("Fitur logout belum diimplementasi")}
                className={
                  sidebarTheme === "light"
                    ? "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-slate-200 transition-all duration-200"
                    : "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
                }
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
