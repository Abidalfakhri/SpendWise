import React, { useState, useEffect } from "react";
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
  Target,
  RefreshCw,
  Download,
  Activity,
  DollarSign,
  BarChart2,
  Search,
  Loader,
} from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function Laporan() {
  const [filter, setFilter] = useState("bulan-ini");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("terbesar");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // State untuk data dari API
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });

  // Fetch data dari backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch user data
      const userRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      if (userData.success) {
        setUserData(userData.data);
        setSummary({
          income: parseFloat(userData.data.total_income || 0),
          expense: parseFloat(userData.data.total_expense || 0),
          balance: parseFloat(userData.data.balance || 0)
        });
      }

      // Fetch transactions
      const transRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const transData = await transRes.json();
      
      if (transData.success) {
        setTransactions(transData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group transactions by category
  const groupByCategory = (type) => {
    const filtered = transactions.filter((t) => t.type === type);
    const grouped = {};
    
    filtered.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + parseFloat(t.amount);
    });
    
    return Object.entries(grouped).map(([name, value]) => ({ 
      name, 
      value,
      target: value * 0.9 
    }));
  };

  // Group transactions by month
  const groupByMonth = () => {
    const monthlyData = {};
    
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].income += parseFloat(t.amount);
      } else {
        monthlyData[monthKey].expense += parseFloat(t.amount);
      }
    });

    // Convert to array and format
    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return {
          bulan: monthNames[parseInt(month) - 1],
          income: data.income,
          expense: data.expense,
          saving: data.income - data.expense
        };
      });
  };

  const dataKategori = groupByCategory("expense");
  const dataBulanan = groupByMonth();
  
  // Calculate financial ratios
  const rasioTabungan = summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(1) : 0;
  const rasioEfisiensi = summary.income > 0 ? ((summary.expense / summary.income) * 100).toFixed(1) : 0;
  
  // Mock data for assets & liabilities (can be extended to real data)
  const aset = summary.balance > 0 ? summary.balance * 5 : 10000000;
  const liabilitas = aset * 0.2;
  const kekayaanBersih = aset - liabilitas;
  const rasioHutang = ((liabilitas / aset) * 100).toFixed(1);

  const kategoriFiltered = dataKategori
    .filter((d) => d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (sortType === "terbesar" ? b.value - a.value : a.value - b.value));

  // Radar chart data
  const dataRadar = dataKategori.slice(0, 5).map(cat => ({
    subject: cat.name,
    A: cat.value / 10000, // Scale down for better visualization
    fullMark: cat.value / 5000
  }));

  // Comparison data (current vs previous period)
  const currentMonthExpense = dataBulanan[dataBulanan.length - 1]?.expense || 0;
  const previousMonthExpense = dataBulanan[dataBulanan.length - 2]?.expense || 0;
  const dataPerbandingan = [
    { name: "Bulan Lalu", value: previousMonthExpense },
    { name: "Bulan Ini", value: currentMonthExpense },
  ];

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
    fetchData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-gray-400">Memuat laporan keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                Laporan Keuangan
              </h1>
              <p className="text-slate-600 dark:text-gray-400 mt-2">
                Analisis lengkap keuangan Anda - {userData?.name || 'User'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-lg transition-all text-slate-700 dark:text-gray-300"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
          {["overview", "detail", "analisis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard
                label="Total Pemasukan"
                value={summary.income}
                icon={<TrendingUp className="w-6 h-6 md:w-8 md:h-8" />}
                color="text-emerald-600"
                trend={dataBulanan.length >= 2 ? 
                  (((dataBulanan[dataBulanan.length-1]?.income - dataBulanan[dataBulanan.length-2]?.income) / dataBulanan[dataBulanan.length-2]?.income) * 100).toFixed(1) : null}
              />
              <StatCard
                label="Total Pengeluaran"
                value={summary.expense}
                icon={<TrendingDown className="w-6 h-6 md:w-8 md:h-8" />}
                color="text-red-600"
                trend={dataBulanan.length >= 2 ? 
                  (((dataBulanan[dataBulanan.length-1]?.expense - dataBulanan[dataBulanan.length-2]?.expense) / dataBulanan[dataBulanan.length-2]?.expense) * 100).toFixed(1) : null}
              />
              <StatCard
                label="Saldo"
                value={summary.balance}
                icon={<Wallet className="w-6 h-6 md:w-8 md:h-8" />}
                color="text-blue-600"
              />
              <StatCard
                label="Kekayaan Bersih"
                value={kekayaanBersih}
                icon={<DollarSign className="w-6 h-6 md:w-8 md:h-8" />}
                color="text-purple-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Bulanan */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">
                  Trend Bulanan
                </h3>
                <ResponsiveContainer width="100%" height={300}>
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
                    <XAxis dataKey="bulan" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
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

              {/* Kategori Pengeluaran */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">
                  Kategori Pengeluaran
                </h3>
                {dataKategori.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dataKategori}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dataKategori.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-gray-500">
                    Belum ada data pengeluaran
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detail Tab */}
        {activeTab === "detail" && (
          <div className="space-y-6">
            {/* Search & Sort */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="terbesar">Terbesar</option>
                  <option value="terkecil">Terkecil</option>
                </select>
              </div>
            </div>

            {/* Kategori Detail */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">
                Detail Pengeluaran per Kategori
              </h3>
              {kategoriFiltered.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={kategoriFiltered}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Pengeluaran" />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Target"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 dark:text-gray-500">
                  Tidak ada data yang cocok
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analisis Tab */}
        {activeTab === "analisis" && (
          <div className="space-y-6">
            {/* Rasio Keuangan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">Rasio Tabungan</h4>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{rasioTabungan}%</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-gray-400 mt-2">
                  {rasioTabungan > 20 ? "Sangat Baik! ✅" : "Perlu Ditingkatkan 📈"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">Rasio Hutang</h4>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">{rasioHutang}%</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-gray-400 mt-2">
                  {rasioHutang < 30 ? "Aman ✅" : "Perhatian! ⚠️"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">Efisiensi Pengeluaran</h4>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-purple-600">{rasioEfisiensi}%</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-gray-400 mt-2">
                  {rasioEfisiensi < 70 ? "Efisien ✅" : "Perlu Evaluasi 📊"}
                </p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">
                Analisis Pola Pengeluaran
              </h3>
              {dataRadar.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={dataRadar}>
                    <PolarGrid stroke="#94a3b8" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis stroke="#94a3b8" />
                    <Radar
                      name="Pengeluaran"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 dark:text-gray-500">
                  Belum ada data untuk analisis
                </div>
              )}
            </div>

            {/* Perbandingan */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">
                Perbandingan Periode
              </h3>
              {dataPerbandingan.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataPerbandingan}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-gray-500">
                  Belum cukup data untuk perbandingan
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}