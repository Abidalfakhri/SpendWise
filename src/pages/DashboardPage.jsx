import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Activity,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  CreditCard,
  Receipt,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";


import  dummyTransactions  from "../data/dummyTransactions";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [categorySummary, setCategorySummary] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insight, setInsight] = useState("");
  const [savingsRate, setSavingsRate] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(2000000);
  const [timeOfDay, setTimeOfDay] = useState("pagi");

  useEffect(() => {
    // Tentukan waktu
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("pagi");
    else if (hour < 18) setTimeOfDay("siang");
    else setTimeOfDay("malam");

    // Hitung total income dan expense
    const incomeTotal = dummyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = dummyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncome(incomeTotal);
    setExpense(expenseTotal);

    // Hitung savings rate
    const rate = ((incomeTotal - expenseTotal) / incomeTotal) * 100;
    setSavingsRate(rate.toFixed(1));

    // Hitung pengeluaran per kategori
    const categoryMap = {};
    dummyTransactions.forEach((t) => {
      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });
    const summary = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));
    setCategorySummary(summary);

    // Data tren 7 hari
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const trendData = days.map((day, i) => ({
      day,
      income: 600000 + Math.random() * 400000,
      expense: 400000 + Math.random() * 300000,
    }));
    setTrend(trendData);

    // Transaksi terakhir
    setRecentTransactions(dummyTransactions.slice(0, 5));

    // Insight otomatis
    if (expenseTotal > incomeTotal) {
      setInsight("⚠️ Pengeluaran melebihi pemasukan! Kurangi pengeluaran non-esensial segera.");
    } else if (rate > 40) {
      setInsight("🎉 Luar biasa! Kamu menabung lebih dari 40% penghasilan. Pertahankan!");
    } else if (rate > 20) {
      setInsight("💪 Bagus! Kamu menabung " + rate + "% dari penghasilan. Target ideal 30-40%.");
    } else {
      setInsight("📊 Tingkatkan tabungan dengan mengurangi 15-20% pengeluaran kategori terbesar.");
    }
  }, []);

  const balance = income - expense;
  const goalProgress = (expense / monthlyGoal) * 100;

  // Data untuk radar chart (Financial Health Score)
  const healthData = [
    { subject: "Tabungan", score: Math.min(savingsRate * 2, 100) },
    { subject: "Pengeluaran", score: expense < income * 0.7 ? 85 : 60 },
    { subject: "Pemasukan", score: income > 5000000 ? 90 : 70 },
    { subject: "Budget", score: goalProgress < 100 ? 80 : 50 },
    { subject: "Investasi", score: 65 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER WITH GREETING */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                👋
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-4">
                  Selamat datang, {user?.name || "Tamu"} 👋
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {new Date().toLocaleDateString("id-ID", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/settings')}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* MAIN BALANCE CARD - HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Saldo Bersih
                </p>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-3">
                  {formatCurrency(balance)}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-emerald-100">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Pemasukan: {formatCurrency(income)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-100">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Pengeluaran: {formatCurrency(expense)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Savings Rate Indicator */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-50 text-sm font-medium">Tingkat Tabungan</span>
                <span className="text-white font-bold text-lg">{savingsRate}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-emerald-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(savingsRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-emerald-100 text-xs mt-2">
                {savingsRate > 30 ? "Sangat Baik! 🎉" : savingsRate > 20 ? "Bagus! 👍" : "Perlu Ditingkatkan 💪"}
              </p>
            </div>
          </div>
        </div>

        {/* INSIGHT CARD */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 p-5 rounded-2xl">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                Insight
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">AI</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>

        {/* STAT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Pemasukan Bulan Ini"
            value={formatCurrency(income)}
            change="+12.5%"
            positive={true}
            color="emerald"
          />
          <StatCard
            icon={<TrendingDown className="w-6 h-6" />}
            title="Pengeluaran Bulan Ini"
            value={formatCurrency(expense)}
            change="-5.3%"
            positive={true}
            color="rose"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Target Budget"
            value={`${goalProgress.toFixed(0)}%`}
            change={`${formatCurrency(monthlyGoal - expense)} tersisa`}
            positive={goalProgress < 100}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Transaksi Minggu Ini"
            value="24"
            change="+8 dari minggu lalu"
            positive={true}
            color="purple"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TREN MINGGUAN - Larger */}
          <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Tren Keuangan 7 Hari
                </h2>
                <p className="text-slate-400 text-sm mt-1">Perbandingan pemasukan & pengeluaran</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium">
                  Mingguan
                </button>
                <button 
                  onClick={() => navigate('/laporan')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-300 rounded-lg text-xs font-medium transition-all"
                >
                  Bulanan
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="url(#incomeGradient)"
                  strokeWidth={3}
                  name="Pemasukan"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="url(#expenseGradient)"
                  strokeWidth={3}
                  name="Pengeluaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* FINANCIAL HEALTH SCORE */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Skor Kesehatan
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={healthData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar
                  name="Skor"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">Skor: 78/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DISTRIBUSI PENGELUARAN */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Kategori Pengeluaran
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(entry) => entry.name}
                      labelLine={false}
                    >
                      {categorySummary.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                      }}
                      formatter={(v) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {categorySummary.slice(0, 5).map((cat, i) => {
                  const percentage = ((cat.value / expense) * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        ></div>
                        <span className="text-slate-300 text-sm">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">{formatCurrency(cat.value)}</p>
                        <p className="text-slate-400 text-xs">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TRANSAKSI TERBARU */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Transaksi Terbaru
              </h2>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-blue-400 text-sm font-medium hover:text-blue-300 transition flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => navigate('/transactions')}
                  className="flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        tx.type === "income"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-blue-300 transition">
                        {tx.category}
                      </p>
                      <p className="text-xs text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction 
            icon={<DollarSign />} 
            label="Tambah Pemasukan" 
            color="emerald"
            onClick={() => navigate('/transactions?type=income')}
          />
          <QuickAction 
            icon={<CreditCard />} 
            label="Catat Pengeluaran" 
            color="rose"
            onClick={() => navigate('/transactions?type=expense')}
          />
          <QuickAction 
            icon={<Target />} 
            label="Atur Target" 
            color="blue"
            onClick={() => navigate('/target-keuangan')}
          />
          <QuickAction 
            icon={<BarChart3 />} 
            label="Lihat Laporan" 
            color="purple"
            onClick={() => navigate('/laporan')}
          />
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */
function StatCard({ icon, title, value, change, positive, color }) {
  const colorMap = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} backdrop-blur-xl border rounded-2xl p-5 hover:scale-105 transition-all cursor-pointer shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 bg-slate-800/50 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold mb-2">{value}</p>
      <div className="flex items-center gap-1 text-xs">
        {positive ? (
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-rose-400" />
        )}
        <span className={positive ? "text-emerald-400" : "text-rose-400"}>{change}</span>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
    rose: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400",
    blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <button 
      onClick={onClick}
      className={`${colorMap[color]} backdrop-blur-xl border rounded-xl p-4 hover:scale-105 transition-all flex flex-col items-center gap-2 group`}
    >
      <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-white text-sm font-medium">{label}</span>
    </button>
  );
}