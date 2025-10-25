import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Wallet,
  Search,
  Filter,
  ChevronDown,
  FileDown,
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import dummyTransactions from "@/data/dummyTransactions";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Mutasi() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Filter data transaksi
  const filteredTx = dummyTransactions
    .filter((tx) => (filter === "all" ? true : tx.type === filter))
    .filter((tx) =>
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((tx) =>
      (minAmount ? tx.amount >= Number(minAmount) : true) &&
      (maxAmount ? tx.amount <= Number(maxAmount) : true)
    )
    .filter((tx) => {
      if (!dateRange.from && !dateRange.to) return true;
      const date = new Date(tx.date);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      return (!from || date >= from) && (!to || date <= to);
    })
    .sort((a, b) => {
      if (sort === "asc") return new Date(a.date) - new Date(b.date);
      else return new Date(b.date) - new Date(a.date);
    });

  // Hitung total
  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Data grafik
  const groupedByDate = {};
  dummyTransactions.forEach((t) => {
    const d = t.date;
    if (!groupedByDate[d]) groupedByDate[d] = { date: d, income: 0, expense: 0 };
    if (t.type === "income") groupedByDate[d].income += t.amount;
    else groupedByDate[d].expense += t.amount;
  });
  const chartData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Reset semua filter
  const resetFilters = () => {
    setFilter("all");
    setSearch("");
    setSort("desc");
    setMinAmount("");
    setMaxAmount("");
    setDateRange({ from: "", to: "" });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Riwayat Mutasi</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            <FileDown className="w-4 h-4" /> Download Data CSV
          </button>
          <button className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Saldo Sekarang</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(balance)}</p>
        </div>
        <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pemasukan</p>
          <p className="text-2xl font-bold text-emerald-500">+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-500">-{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Grafik */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Grafik Keuangan</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === t
                    ? t === "income"
                      ? "bg-emerald-600 text-white"
                      : t === "expense"
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Filter Lanjutan */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex flex-col">
            <label className="text-gray-500 dark:text-gray-400">Dari Tanggal</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 dark:text-gray-400">Sampai</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 dark:text-gray-400">Nominal Minimum</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="contoh: 10000"
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 dark:text-gray-400">Nominal Maksimum</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="contoh: 1000000"
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            />
          </div>
          <button
            onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Calendar className="w-4 h-4" />
            {sort === "asc" ? "Terlama" : "Terbaru"} <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daftar Transaksi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Semua Transaksi</h2>
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <Filter className="w-4 h-4" />
            {filteredTx.length} transaksi
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <p className="text-center text-gray-400 italic py-10">Tidak ada transaksi ditemukan.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTx.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
              >
                <div className="flex items-center gap-3">
                  {tx.type === "income" ? (
                    <ArrowUpCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tx.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.description || "Tanpa deskripsi"}</p>
                    <p className="text-xs text-gray-400 mt-1">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold text-lg ${
                      tx.type === "income" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
