// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import dummyTransactionsInit from "@/data/dummyTransactions";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  FiEdit2,
  FiSettings,
  FiLogOut,
  FiDownload,
  FiChevronRight,
} from "react-icons/fi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Profile() {
  const { user: authUser, logout, updateUser } = useAuth();
  // Work on a local copy of transactions (so user can see delete etc without backend)
  const [transactions, setTransactions] = useState(dummyTransactionsInit);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    avatar: authUser?.avatar || "/src/assets/avatar-default.png",
  });

  // statistics derived
  const totals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const count = transactions.length;
    const avg = count ? Math.round((totalIncome + totalExpense) / count) : 0;

    // top category (expense)
    const catMap = {};
    transactions.forEach((t) => {
      if (t.type === "expense") catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCategory =
      Object.keys(catMap).length === 0
        ? "-"
        : Object.entries(catMap).sort((a, b) => b[1] - a[1])[0][0];

    return { totalIncome, totalExpense, count, avg, topCategory };
  }, [transactions]);

  // expense distribution for pie chart
  const expenseDistribution = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type === "expense") map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // monthly comparison: sum by YYYY-MM
  const monthComparison = useMemo(() => {
    const sums = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (isNaN(d)) return;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      sums[k] = (sums[k] || 0) + (t.type === "expense" ? t.amount : -t.amount);
    });
    // sort keys descending
    const keys = Object.keys(sums).sort((a, b) => (a < b ? 1 : -1));
    const current = keys[0] || null;
    const prev = keys[1] || null;
    return {
      currentMonth: current ? { key: current, value: sums[current] } : null,
      prevMonth: prev ? { key: prev, value: sums[prev] } : null,
    };
  }, [transactions]);

  useEffect(() => {
    // initialize edit form when authUser changes
    if (authUser) {
      setForm({
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar || "/src/assets/avatar-default.png",
      });
    }
  }, [authUser]);

  // handlers
  function handleDelete(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleExportCSV() {
    const headers = ["id,date,type,category,amount,description"];
    const rows = transactions.map(
      (t) =>
        `${t.id},${t.date},${t.type},${JSON.stringify(t.category)},${t.amount},${JSON.stringify(
          t.description || ""
        )}`
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((p) => ({ ...p, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function handleSaveProfile() {
    // local update (if updateUser exists in context, call it)
    if (updateUser) updateUser(form);
    setEditOpen(false);
  }

  if (!authUser) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Profil Pengguna</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Untuk melihat informasi akun dan statistik keuangan, silakan login terlebih dahulu.
        </p>
        <Link to="/login" className="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition">
          Login Sekarang
        </Link>
        <p className="text-slate-500 text-xs">
          Belum punya akun? <Link to="/register" className="underline text-emerald-400">Daftar di sini</Link>
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{authUser.name}</h1>
          <p className="text-slate-400">Member since {authUser.createdAt || "—"}</p>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={() => setEditOpen(true)} className="btn btn-outline">
            <FiEdit2 className="inline mr-2" /> Edit Profile
          </button>
          <Link to="/settings" className="btn btn-outline">Settings</Link>
          <button onClick={handleExportCSV} className="btn btn-primary">
            <FiDownload className="inline mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Profile card + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="surface p-5 flex flex-col items-center gap-4">
          <img src={form.avatar} alt="avatar" className="h-28 w-28 rounded-full border-2 border-emerald-500 object-cover shadow" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">{authUser.name}</h2>
            <p className="text-slate-400 text-sm">{authUser.email}</p>
          </div>

          <div className="w-full mt-2 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Transaksi</span>
              <strong className="text-white">{totals.count}</strong>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Pemasukan</span>
              <strong className="text-emerald-400">{formatCurrency(totals.totalIncome)}</strong>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Pengeluaran</span>
              <strong className="text-rose-400">{formatCurrency(totals.totalExpense)}</strong>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Rata-rata/transaksi</span>
              <strong className="text-white">{formatCurrency(totals.avg)}</strong>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Kategori terbanyak</span>
              <strong className="text-amber-400">{totals.topCategory}</strong>
            </div>
          </div>
        </div>

        {/* Middle: Pie chart (expense distribution) */}
        <div className="surface p-5 flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Distribusi Pengeluaran</h3>
          {expenseDistribution.length > 0 ? (
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-2/3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseDistribution} dataKey="value" nameKey="name" outerRadius={70} innerRadius={28} paddingAngle={4}>
                      {expenseDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1">
                <ul className="space-y-2">
                  {expenseDistribution.map((row, i) => (
                    <li key={row.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="block w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-slate-300">{row.name}</span>
                      </div>
                      <strong className="text-sm text-white">{formatCurrency(row.value)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Belum ada data pengeluaran untuk menampilkan chart.</p>
          )}
        </div>

        {/* Right: Monthly comparison & quick actions */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-3">Ringkasan Bulanan</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{monthComparison.currentMonth?.key || "Bulan ini"}</span>
                <strong className={`${
                  (monthComparison.currentMonth?.value || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {monthComparison.currentMonth ? formatCurrency(monthComparison.currentMonth.value) : "-"}
                </strong>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>{monthComparison.prevMonth?.key || "Bulan sebelumnya"}</span>
                <strong className={`${
                  (monthComparison.prevMonth?.value || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {monthComparison.prevMonth ? formatCurrency(monthComparison.prevMonth.value) : "-"}
                </strong>
              </div>
              {monthComparison.currentMonth && monthComparison.prevMonth && (
                <div className="mt-2 text-sm text-slate-300">
                  Perubahan:{" "}
                  <strong className={monthComparison.currentMonth.value - monthComparison.prevMonth.value >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {Math.round(((monthComparison.currentMonth.value - monthComparison.prevMonth.value) / Math.max(1, Math.abs(monthComparison.prevMonth.value))) * 100)}%
                  </strong>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link to="/transactions" className="btn btn-outline flex items-center justify-center gap-2">
              Lihat Transaksi <FiChevronRight />
            </Link>
            <Link to="/settings" className="btn btn-outline flex items-center justify-center gap-2">
              Pengaturan Akun <FiSettings />
            </Link>
            <button onClick={() => { logout(); }} className="btn btn-danger w-full">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Recent transactions list */}
      <div className="surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="btn btn-outline text-sm">Export CSV</button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Belum ada transaksi</p>
        ) : (
          <div className="divide-y divide-slate-700">
            {transactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {tx.type === "income" ? "＋" : "−"}
                  </div>
                  <div>
                    <div className="font-medium text-white">{tx.category}</div>
                    <div className="text-xs text-slate-400">{tx.description || "-"}</div>
                    <div className="text-xs text-slate-500">{tx.date}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(tx.amount)}
                  </div>
                  <div className="mt-1 flex gap-2 justify-end">
                    <button onClick={() => handleDelete(tx.id)} className="text-xs text-rose-300 hover:text-rose-400">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-50 w-full max-w-lg surface p-6">
            <h3 className="text-lg font-semibold mb-3">Edit Profil</h3>

            <div className="flex gap-4 items-start">
              <div>
                <img src={form.avatar} alt="avatar" className="h-20 w-20 rounded-full border-2 border-emerald-500 object-cover" />
                <label className="mt-2 block text-sm text-slate-300 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <span className="underline text-emerald-400">Ganti foto</span>
                </label>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Nama</label>
                  <input className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-900 text-white" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <input className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-900 text-white" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditOpen(false)} className="btn btn-outline">Batal</button>
              <button onClick={handleSaveProfile} className="btn btn-primary">Simpan</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
