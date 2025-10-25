import React, { useState } from "react";
import {
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownRight,
  Target,
  Info,
  RefreshCw,
  Download,
  Activity,
  DollarSign,
  Layers,
  BarChart2,
  Search,
  SortAsc,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";

import dummyTransactions, { getSummary, groupByCategory, groupByDate, financialPosition, dataRadar,dataPerbandingan } 
  from "../data/dummyTransactions";

const summary = getSummary(dummyTransactions);
const pemasukan = summary.income;
const pengeluaran = summary.expense;
const saldo = summary.balance;
const { aset, liabilitas } = financialPosition;
const kekayaanBersih = aset - liabilitas;

const dataKategori = groupByCategory(dummyTransactions, "expense");

const dataBulanan = groupByDate(dummyTransactions);




export default function Laporan() {
  const [filter, setFilter] = useState("bulan-ini");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("terbesar");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const rasioTabungan = ((saldo / pemasukan) * 100).toFixed(1);
  const rasioHutang = ((liabilitas / aset) * 100).toFixed(1);
  const rasioEfisiensi = ((pengeluaran / pemasukan) * 100).toFixed(1);
  const rataRataPengeluaran = pengeluaran / dataKategori.length;

  const kategoriFiltered = dataKategori
  .filter((d) => d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a, b) => (sortType === "terbesar" ? b.value - a.value : a.value - b.value))
  .map((d) => ({
    name: d.name,
    value: d.value,
    target: d.target ?? d.value * 0.9, // biar ga error saat render
  }));



  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const handleExportCSV = () => {
    const header = ["Bulan,Pemasukan,Pengeluaran,Tabungan"];
    const rows = dataBulanan.map(
      (d) => `${d.bulan},${d.income},${d.expense},${d.saving}`
    );
    const csvContent = [...header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan_keuangan_lengkap.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ label, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
          <h3 className={`text-2xl font-bold ${color}`}>
            {formatCurrency(value)}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-xs ${
                  trend > 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {Math.abs(trend)}% dari bulan lalu
              </span>
            </div>
          )}
        </div>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Laporan Keuangan Lengkap
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analisis mendalam keuangan Anda
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm font-medium shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm font-medium shadow-md"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="bulan-ini">Bulan Ini</option>
            <option value="3-bulan">3 Bulan</option>
            <option value="6-bulan">6 Bulan</option>
            <option value="1-tahun">1 Tahun</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        {[
          { id: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
          { id: "charts", label: "Grafik", icon: <PieChartIcon className="w-4 h-4" /> },
          { id: "analysis", label: "Analisis", icon: <Activity className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Pemasukan"
              value={pemasukan}
              icon={<Wallet className="w-8 h-8" />}
              color="text-emerald-500"
              trend={12.5}
            />
            <StatCard
              label="Total Pengeluaran"
              value={pengeluaran}
              icon={<TrendingDown className="w-8 h-8" />}
              color="text-red-500"
              trend={-5.3}
            />
            <StatCard
              label="Saldo Akhir"
              value={saldo}
              icon={<TrendingUp className="w-8 h-8" />}
              color={saldo >= 0 ? "text-emerald-500" : "text-red-500"}
              trend={8.7}
            />
            <StatCard
              label="Kekayaan Bersih"
              value={kekayaanBersih}
              icon={<Layers className="w-8 h-8" />}
              color="text-blue-600"
              trend={15.2}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="text-blue-600 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Arus Kas Bulanan
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                Update: {new Date().toLocaleTimeString("id-ID")}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dataBulanan}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bulan" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Pemasukan"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Pengeluaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
              <DollarSign className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">Rasio Tabungan</p>
              <h2 className="text-4xl font-bold">{rasioTabungan}%</h2>
              <div className="flex items-center gap-1 mt-3">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">
                  {Number(rasioTabungan) >= 20 ? "Sangat Baik" : "Perlu Ditingkatkan"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
              <ArrowDownRight className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">Rasio Hutang</p>
              <h2 className="text-4xl font-bold">{rasioHutang}%</h2>
              <div className="flex items-center gap-1 mt-3">
                {Number(rasioHutang) < 35 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-xs">
                  {Number(rasioHutang) < 35 ? "Aman" : "Tinggi"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <Target className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">Efisiensi Keuangan</p>
              <h2 className="text-4xl font-bold">{rasioEfisiensi}%</h2>
              <div className="flex items-center gap-1 mt-3">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">
                  {Number(rasioEfisiensi) <= 70 ? "Efisien" : "Perlu Perbaikan"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <BarChart2 className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">Rata-rata Pengeluaran</p>
              <h2 className="text-2xl font-bold">
                {formatCurrency(rataRataPengeluaran)}
              </h2>
              <p className="text-xs opacity-80 mt-3">Per kategori</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "charts" && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="text-blue-600 w-5 h-5" /> Pengeluaran per Kategori
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <input
                    placeholder="Cari kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm outline-none w-32 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() =>
                    setSortType(sortType === "terbesar" ? "terkecil" : "terbesar")
                  }
                  className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-all"
                >
                  <SortAsc className="w-4 h-4" />
                  {sortType === "terbesar" ? "Terkecil" : "Terbesar"}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                  Grafik Batang
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={kategoriFiltered}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                      }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      name="Pengeluaran"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                  Diagram Lingkaran
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={kategoriFiltered}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.name}
                    >
                      {kategoriFiltered.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                      }}
                      formatter={(v) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="text-blue-600 w-5 h-5" /> Perbandingan Budget vs Aktual
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={dataPerbandingan}>
                <XAxis dataKey="category" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Legend />
                <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actual" fill="#f59e0b" name="Aktual" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-blue-600 w-5 h-5" /> Skor Kesehatan Keuangan
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={dataRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar
                  name="Skor"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <Info className="absolute right-4 top-4 opacity-10 w-32 h-32" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> Analisis Lengkap & Rekomendasi
              </h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="opacity-95">
                  📊 <strong>Rasio Tabungan:</strong> Dengan {rasioTabungan}%, kemampuan
                  menabung Anda{" "}
                  {Number(rasioTabungan) >= 20 ? "sangat baik" : "perlu ditingkatkan"}.
                  Target ideal adalah di atas 20%.
                </p>
                <p className="opacity-95">
                  💳 <strong>Rasio Hutang:</strong> {rasioHutang}% dari total aset Anda adalah
                  hutang. Ini masih{" "}
                  {Number(rasioHutang) < 35 ? "dalam batas aman" : "cukup tinggi dan perlu perhatian"}.
                </p>
                <p className="opacity-95">
                  🎯 <strong>Pengeluaran Terbesar:</strong> Kategori{" "}
                  <strong>{kategoriFiltered[0]?.name}</strong> menghabiskan{" "}
                  <strong>{formatCurrency(kategoriFiltered[0]?.value)}</strong>. Pertimbangkan
                  untuk mengurangi 10-15% di kategori ini.
                </p>
                <p className="opacity-95">
                  ⚡ <strong>Efisiensi Keuangan:</strong> {rasioEfisiensi}%{" "}
                  {Number(rasioEfisiensi) <= 70
                    ? "menunjukkan pengelolaan yang hemat dan produktif."
                    : "menandakan perlu pengaturan ulang anggaran bulanan untuk meningkatkan efisiensi."}
                </p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="font-semibold mb-2">💡 Rekomendasi Aksi:</p>
                  <ul className="space-y-1 ml-4 opacity-90">
                    <li>• Tingkatkan alokasi tabungan minimal 5% dari pendapatan</li>
                    <li>• Kurangi pengeluaran di kategori {kategoriFiltered[0]?.name}</li>
                    <li>• Prioritaskan pembayaran hutang dengan bunga tertinggi</li>
                    <li>• Review dan sesuaikan budget bulanan setiap minggu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Detail Kategori Pengeluaran
            </h2>
            <div className="space-y-4">
              {kategoriFiltered.map((item) => {
                const percentage = ((item.value / pengeluaran) * 100).toFixed(1);
                const isOverBudget = item.value > item.target;
                return (
                  <div
                    key={item.name}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {percentage}% dari total pengeluaran
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(item.value)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Target: {formatCurrency(item.target)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? "bg-red-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                      />
                    </div>
                    {isOverBudget && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Melebihi budget {formatCurrency(item.value - item.target)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}