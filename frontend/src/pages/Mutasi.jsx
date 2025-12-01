import React, { useState, useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Search,
  RotateCcw,
  BarChart2,
  FileDown,
  Calendar,
  Filter,
  Loader,
  X,
} from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Utility untuk format mata uang
const formatCurrency = (value) => {
  if (value === null || value === undefined) return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Tooltip kustom untuk Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-sm text-xs text-white">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.stroke }}>
            {item.name}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function untuk memformat angka dengan titik pemisah ribuan
const formatRupiah = (numberString) => {
  // 1. Hapus semua karakter non-digit (termasuk titik/koma sebelumnya)
  let cleanNumber = numberString.replace(/\D/g, '');
  if (cleanNumber === "") return "";

  // 2. Tambahkan titik sebagai pemisah ribuan
  let formatted = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted;
};

// Helper function untuk membersihkan nilai terformat kembali menjadi angka
const cleanRupiah = (formattedString) => {
  return formattedString.replace(/\./g, '');
};


export default function Mutasi() {
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  // Simpan nilai nominal dalam format terformat untuk tampilan
  const [minAmountFormatted, setMinAmountFormatted] = useState("");
  const [maxAmountFormatted, setMaxAmountFormatted] = useState("");
  // Simpan nilai nominal dalam bentuk angka bersih untuk filtering
  const [minAmountClean, setMinAmountClean] = useState("");
  const [maxAmountClean, setMaxAmountClean] = useState("");

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const userRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      if (userData.success) {
        setUserData(userData.data);
      }

      const transRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const transData = await transRes.json();
      
      if (transData.success) {
        setTransactions(transData.data.map(tx => ({...tx, id: tx.id || Math.random().toString(36)})));
      }
    } catch (error) {
      // Handle error fetching data
    } finally {
      setLoading(false);
    }
  };
  
  // Handler untuk input nominal dengan formatting
  const handleAmountChange = (e, setterFormatted, setterClean) => {
    const rawValue = e.target.value;
    const formatted = formatRupiah(rawValue);
    const clean = cleanRupiah(formatted);
    
    setterFormatted(formatted);
    setterClean(clean);
  };


  const filteredTx = transactions
    .filter((tx) => (filterType === "all" ? true : tx.type === filterType))
    .filter((tx) =>
      tx.category?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((tx) =>
      (minAmountClean ? parseFloat(tx.amount) >= Number(minAmountClean) : true) &&
      (maxAmountClean ? parseFloat(tx.amount) <= Number(maxAmountClean) : true)
    )
    .filter((tx) => {
      if (!dateRange.from && !dateRange.to) return true;
      const date = new Date(tx.date);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      
      const txDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const isAfterFrom = from ? txDateOnly >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) : true;
      const isBeforeTo = to ? txDateOnly <= new Date(to.getFullYear(), to.getMonth(), to.getDate()) : true;
      
      return isAfterFrom && isBeforeTo;
    })
    .sort((a, b) => {
      if (sort === "asc") return new Date(a.date) - new Date(b.date);
      else return new Date(b.date) - new Date(a.date);
    });

  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = userData?.balance || (totalIncome - totalExpense); 

  const groupedByDate = {};
  transactions.forEach((t) => {
    const d = new Date(t.date).toISOString().split('T')[0];
    if (!groupedByDate[d]) groupedByDate[d] = { date: d, income: 0, expense: 0 };
    if (t.type === "income") groupedByDate[d].income += parseFloat(t.amount);
    else groupedByDate[d].expense += parseFloat(t.amount);
  });
  const chartData = Object.values(groupedByDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);

  const resetFilters = () => {
    setFilterType("all");
    setSearch("");
    setSort("desc");
    setMinAmountFormatted("");
    setMinAmountClean("");
    setMaxAmountFormatted("");
    setMaxAmountClean("");
    setDateRange({ from: "", to: "" });
    setIsFilterPanelOpen(false);
  };

  const downloadCSV = () => {
    const headers = ["Tanggal", "Tipe", "Kategori", "Nominal", "Deskripsi"];
    const rows = filteredTx.map((tx) => [
      new Date(tx.date).toISOString().split('T')[0],
      tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      tx.category,
      tx.amount,
      `"${tx.description?.replace(/"/g, '""') || "-"}"`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mutasi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Memuat data mutasi keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 md:px-8 py-8 md:py-12 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header dan Aksi Cepat */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Wallet className="w-8 h-8 text-emerald-400 p-1 bg-slate-800 rounded-full" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Riwayat Mutasi</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsFilterPanelOpen(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition font-medium ${
                isFilterPanelOpen ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" /> 
              Filter Lanjutan
            </button>
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition font-medium"
            >
              <FileDown className="w-4 h-4" /> 
              Download CSV
            </button>
          </div>
        </div>
        
        {/* Ringkasan Keuangan Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-800 rounded-2xl border-l-4 border-white shadow-xl">
            <p className="text-sm text-gray-400 mb-1 font-medium">Saldo Saat Ini</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p>
          </div>
          <div className="p-5 bg-slate-800 rounded-2xl border-l-4 border-emerald-500 shadow-xl">
            <p className="text-sm text-gray-400 mb-1 font-medium">Pemasukan (Terfilter)</p>
            <p className="text-3xl font-bold text-emerald-500">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-5 bg-slate-800 rounded-2xl border-l-4 border-red-500 shadow-xl">
            <p className="text-sm text-gray-400 mb-1 font-medium">Pengeluaran (Terfilter)</p>
            <p className="text-3xl font-bold text-red-500">-{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        {/* Panel Filter Lanjutan (Diperbaiki) */}
        {isFilterPanelOpen && (
          <div className="bg-slate-800 p-5 rounded-2xl shadow-2xl space-y-4 border border-slate-700">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-400" />
                    Opsi Filter Lanjutan
                </h3>
                <button 
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition p-1 rounded hover:bg-slate-700"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                
                {/* Tipe Transaksi */}
                <div className="flex flex-col">
                    <label className="text-gray-400 mb-1 text-xs font-medium">Tipe</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">Semua</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                </div>
                
                {/* Filter Tanggal Dari */}
                <div className="flex flex-col">
                    <label className="text-gray-400 mb-1 text-xs font-medium">Dari Tanggal</label>
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                
                {/* Filter Tanggal Sampai */}
                <div className="flex flex-col">
                    <label className="text-gray-400 mb-1 text-xs font-medium">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                
                {/* Nominal Minimum (dengan formatting) */}
                <div className="flex flex-col">
                    <label className="text-gray-400 mb-1 text-xs font-medium">Nominal Min</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
                        <input
                            type="tel" // Menggunakan tel agar keyboard numerik muncul di mobile
                            value={minAmountFormatted}
                            onChange={(e) => handleAmountChange(e, setMinAmountFormatted, setMinAmountClean)}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
                
                {/* Nominal Maksimum (dengan formatting) */}
                <div className="flex flex-col">
                    <label className="text-gray-400 mb-1 text-xs font-medium">Nominal Max</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
                        <input
                            type="tel" // Menggunakan tel agar keyboard numerik muncul di mobile
                            value={maxAmountFormatted}
                            onChange={(e) => handleAmountChange(e, setMaxAmountFormatted, setMaxAmountClean)}
                            placeholder="99.999.999"
                            className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Urutan Sortir */}
                <button
                    onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                    className="flex items-center justify-center gap-2 border border-slate-600 rounded-lg px-4 py-2 hover:bg-slate-700 text-emerald-400 mt-auto transition h-[40px]"
                >
                    <Calendar className="w-4 h-4" />
                    {sort === "asc" ? "Terlama Dulu" : "Terbaru Dulu"}
                </button>
            </div>
          </div>
        )}

        {/* --- Daftar Mutasi (ATAS - Fokus) --- */}
        <div className="space-y-5">
            {/* Search Bar */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 border border-slate-600 rounded-xl p-2 bg-slate-700/50">
                    <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari kategori atau deskripsi transaksi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="p-1">
                            <X className="w-4 h-4 text-gray-400 hover:text-red-400 transition" />
                        </button>
                    )}
                </div>
            </div>

            {/* Daftar Transaksi Utama */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl min-h-[400px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                    <h3 className="font-bold text-lg text-white">Riwayat ({filteredTx.length} Transaksi Terfilter)</h3>
                    <p className="text-sm text-gray-400">Net Mutasi: {formatCurrency(totalIncome - totalExpense)}</p>
                </div>

                {filteredTx.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-center text-gray-500 italic">
                            Tidak ada transaksi yang cocok dengan filter.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                        <ul className="divide-y divide-slate-700">
                            {filteredTx.map((tx) => (
                                <li
                                    key={tx.id}
                                    className="flex justify-between items-center py-4 hover:bg-slate-700/50 rounded-lg px-2 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === "income" ? 'bg-emerald-600/20' : 'bg-red-600/20'}`}>
                                            {tx.type === "income" ? (
                                                <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <ArrowDownCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-white">{tx.category}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                {tx.description || "Detail tidak tersedia"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p
                                            className={`font-extrabold text-base ${
                                                tx.type === "income" ? "text-emerald-400" : "text-red-400"
                                            }`}
                                        >
                                            {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.date)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
        
        {/* --- Grafik (BAWAH) --- */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold text-white text-base">Tren Keuangan (30 Hari Terakhir)</h2>
            </div>
            {chartData.length > 0 ? (
                <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#64748b"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(dateStr) => formatDate(dateStr).split(' ')[0]}
                            />
                            <YAxis 
                                stroke="#64748b"
                                tickFormatter={(value) => (value / 1000000) + ' Jt'}
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="income" 
                                stroke="#10b981" 
                                strokeWidth={2} 
                                name="Pemasukan"
                                dot={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="expense" 
                                stroke="#ef4444" 
                                strokeWidth={2} 
                                name="Pengeluaran" 
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500 italic text-sm">
                    Tidak ada data grafik yang cukup (30 hari terakhir).
                </div>
            )}
        </div>

      </div>
    </div>
  );
}