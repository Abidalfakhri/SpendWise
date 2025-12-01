import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
  Activity,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  Receipt,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

// Komponen Dashboard UTAMA
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [categorySummary, setCategorySummary] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insight, setInsight] = useState("");
  const [savingsRate, setSavingsRate] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(2000000); 
  const [timeOfDay, setTimeOfDay] = useState("pagi");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Status untuk tombol refresh

  // --- LOGIC FUNCTIONS ---
  
  const useFallbackTrend = (userData) => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const avgIncome = (userData?.total_income || 0) / 4; 
    const avgExpense = (userData?.total_expense || 0) / 4;
    
    const fallbackTrendData = days.map((d, index) => {
      const variationFactor = 0.8 + (Math.random() * 0.4); 
      return {
        day: d,
        income: avgIncome * (index === 6 ? 1.1 : variationFactor) * 0.25, 
        expense: avgExpense * variationFactor * 0.25,
      }
    });
    setTrend(fallbackTrendData);
  };
    
  const generateInsight = (inc, exp) => {
    if (exp > inc) {
      setInsight("⚠️ Pengeluaran melebihi pemasukan! Kurangi pengeluaran tidak penting.");
    } else if (exp < inc * 0.3) { 
      setInsight("🎉 Luar biasa! Kamu menghemat lebih dari 70% penghasilan. Tetap pertahankan!");
    } else if (exp < inc * 0.7) {
      setInsight("👍 Kondisi keuangan baik. Tingkat tabunganmu di atas rata-rata! Coba alokasikan ke investasi.");
    } else {
      setInsight("💡 Pertahankan kebiasaan baikmu. Coba tingkatkan tabungan 5% lagi untuk mencapai tujuanmu.");
    }
  };


  const fetchDashboard = async (userId) => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      
      const userRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!userRes.ok) {
        throw new Error(`User API error: ${userRes.status}`);
      }
      
      const userData = await userRes.json();

      if (userData.success) {
        const totalIncome = parseFloat(userData.data.total_income) || 0;
        const totalExpense = parseFloat(userData.data.total_expense) || 0;
        const currentBalance = parseFloat(userData.data.balance) || 0; 

        setBalance(currentBalance);
        setIncome(totalIncome);
        setExpense(totalExpense);

        if (totalIncome > 0) {
          const rate = (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1);
          setSavingsRate(Math.max(0, parseFloat(rate)));
        } else {
            setSavingsRate(0);
        }
        
        generateInsight(totalIncome, totalExpense);

      } else {
        console.warn("⚠️ User API returned success=false");
      }

      // --- Fetch Category Summary ---
      try {
        const categoryRes = await fetch(
          `https://spend-wisee-backend-awdsa.vercel.app/api/analytics/expenses-by-category/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          if (categoryData.success && categoryData.data) {
            const summary = categoryData.data.map((cat) => ({
              name: cat.category,
              value: parseFloat(cat.total) || 0, 
            })).filter(cat => cat.value > 0); 
            setCategorySummary(summary);
          }
        }
      } catch (err) {
        console.warn("⚠️ Category API error:", err.message);
      }

      // --- Fetch Recent Transactions ---
      try {
        const transactionsRes = await fetch(
          `https://spend-wisee-backend-awdsa.vercel.app/api/transactions?userId=${userId}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          if (transactionsData.success && transactionsData.data) {
            setRecentTransactions(transactionsData.data || []);
          }
        }
      } catch (err) {
        console.warn("⚠️ Transactions API error:", err.message);
      }

      // --- Fetch Weekly Trend ---
      try {
        const trendRes = await fetch(
          `https://spend-wisee-backend-awdsa.vercel.app/api/analytics/weekly-trend/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          if (trendData.success && trendData.data && trendData.data.length > 0) {
            setTrend(trendData.data);
          } else {
            useFallbackTrend(userData.data);
          }
        } else {
          useFallbackTrend(userData.data);
        }
      } catch (err) {
        console.warn("⚠️ Trend API error:", err.message);
        useFallbackTrend(userData.data);
      }

      // Determine time of day
      const hour = new Date().getHours();
      setTimeOfDay(hour < 12 ? "pagi" : hour < 18 ? "siang" : "malam");

    } catch (err) {
      console.error("❌ Gagal fetch dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Extract userId from JWT & Initial Fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId || payload.id; 
      
      if (!userId) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      setUser({ ...payload, userId });
      fetchDashboard(userId); 
    } catch (err) {
      console.error("❌ JWT error:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Auto-refresh when returning from transactions page
  useEffect(() => {
    if (location.state?.refresh && user?.userId) { 
      fetchDashboard(user.userId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, navigate, location.pathname]);


  // Manual refresh function
  const handleRefresh = () => {
    if (user?.userId && !refreshing) {
      setRefreshing(true);
      fetchDashboard(user.userId);
    }
  };

  // --- DERIVED STATE ---
  const goalProgress = useMemo(() => {
    if (monthlyGoal === 0) return 0;
    return Math.min((expense / monthlyGoal) * 100, 100); 
  }, [expense, monthlyGoal]);
  
  const healthData = useMemo(() => {
    const totalScore = (
      Math.min(savingsRate, 50) * 2 + 
      (expense < income * 0.7 ? 20 : 0) + 
      (income > 5000000 ? 10 : 0) + 
      (goalProgress < 100 ? 10 : -10) 
    );
    Math.max(50, Math.min(totalScore, 100)); 

    return [
      { subject: "Tabungan", score: Math.min(savingsRate * 2, 100) }, 
      { subject: "Pengeluaran", score: expense < income * 0.7 ? 90 : 50 }, 
      { subject: "Pemasukan", score: income > 1000000 ? 80 : 50 }, 
      { subject: "Budget", score: goalProgress < 90 ? 85 : 40 },
      { subject: "Likuiditas", score: balance > 0 ? 95 : 50 }, 
    ];
  }, [savingsRate, expense, income, goalProgress, balance]);
  
  const averageHealthScore = useMemo(() => {
    const sum = healthData.reduce((acc, item) => acc + item.score, 0);
    return (sum / healthData.length).toFixed(0);
  }, [healthData]);


  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#a8a29e"];
  // -----------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <div className="text-slate-100 text-xl">Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER WITH GREETING */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <span className="animate-wave inline-block">👋</span>
                Selamat {timeOfDay}, {user?.name || "Tamu"}
              </h1>
              <p className="text-slate-400">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Quick Actions - Tombol Refresh */}
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing} 
                className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} /> 
              </button>
              {/* Settings */}
              <button
                onClick={() => navigate("/settings")}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN BALANCE CARD - HERO */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-6 h-6" />
              <p className="text-emerald-100 font-medium">Saldo Bersih Saat Ini</p>
            </div>
            <h2 className="text-5xl font-bold mb-6">{formatCurrency(balance)}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-emerald-100 text-sm mb-1">Pemasukan Bulan Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(income)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-emerald-100 text-sm mb-1">Pengeluaran Bulan Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(expense)}</p>
              </div>
            </div>

            {/* Savings Rate Indicator */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Tingkat Tabungan (Bulan Ini)</p>
                <p className="text-xl font-bold">{savingsRate}%</p>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(savingsRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-emerald-100">
                {savingsRate >= 40 
                  ? "Sangat Baik! 🎉 Target 50/30/20 tercapai."
                  : savingsRate >= 20
                  ? "Bagus! 👍 Mendekati rekomendasi 20% tabungan."
                  : "Perlu Ditingkatkan 💪 Coba kurangi pengeluaran tidak penting."}
              </p>
            </div>
          </div>
        </div>

        {/* INSIGHT CARD */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Insight AI
                <Info className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="text-slate-300">{insight}</p>
            </div>
          </div>
        </div>

        {/* STAT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Pemasukan Total"
            value={formatCurrency(income)}
            change={income > 0 ? "Bulan ini" : "Belum ada data"}
            positive={income > 0}
            color="emerald"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            title="Pengeluaran Total"
            value={formatCurrency(expense)}
            change={expense > 0 ? "Bulan ini" : "Belum ada data"}
            positive={false} 
            color="rose"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            title="Target Budget"
            value={`${goalProgress.toFixed(0)}%`}
            change={`${formatCurrency(Math.max(0, monthlyGoal - expense))} tersisa`}
            positive={expense <= monthlyGoal} 
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            title="Tingkat Tabungan"
            value={`${savingsRate}%`}
            change={savingsRate >= 20 ? "Tujuan tercapai" : "Perlu ditingkatkan"}
            positive={savingsRate >= 20}
            color="purple"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WEEKLY TREND */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Tren Keuangan 7 Hari
                </h3>
                <p className="text-sm text-slate-400">Perbandingan pemasukan & pengeluaran mingguan</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v, 0)} /> 
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* FINANCIAL HEALTH SCORE */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Skor Kesehatan Finansial
            </h3>
            <p className="text-sm text-slate-400 mb-4">Skor: {averageHealthScore}/100</p> 

            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={healthData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" /> 
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
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value.toFixed(0)}/100`, "Skor"]} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EXPENSE DISTRIBUTION */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Kategori Pengeluaran Teratas
            </h3>

            {categorySummary.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                    >
                      {categorySummary.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-3 w-full sm:w-auto mt-4 sm:mt-0">
                  {categorySummary.slice(0, 5).map((cat, i) => {
                    const totalExpense = expense > 0 ? expense : 1; 
                    const percentage = ((cat.value / totalExpense) * 100).toFixed(1);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          ></div>
                          <span className="text-sm text-slate-300">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(cat.value)}</p>
                          <p className="text-xs text-slate-400">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Belum ada data pengeluaran</p>
            )}
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Transaksi Terbaru
              </h3>
              <button
                onClick={() => navigate("/transactions")}
                className="text-blue-400 text-sm font-medium hover:text-blue-300 transition flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => navigate("/transactions")}
                    className="flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === "income"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.category || tx.description || 'Transaksi'}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Belum ada transaksi terbaru. Ayo catat transaksi pertamamu!</p>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={<TrendingUp className="w-5 h-5" />}
            label="Tambah Pemasukan"
            color="emerald"
            onClick={() => navigate("/transactions?type=income")}
          />
          <QuickAction
            icon={<TrendingDown className="w-5 h-5" />}
            label="Catat Pengeluaran"
            color="rose"
            onClick={() => navigate("/transactions?type=expense")}
          />
          <QuickAction
            icon={<Target className="w-5 h-5" />}
            label="Atur Target"
            color="blue"
            onClick={() => navigate("/target-keuangan")} 
          />
          <QuickAction
            icon={<BarChart3 className="w-5 h-5" />}
            label="Lihat Laporan"
            color="purple"
            onClick={() => navigate("/laporan")} 
          />
        </div>
      </div>
    </div>
  );
}


// StatCard dan QuickAction tetap sama dan berada di luar fungsi utama
function StatCard({ icon, title, value, change, positive, color }) {
  const colorMap = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <div className="flex items-center gap-1 text-xs">
        <span className={positive ? "text-emerald-400" : "text-rose-400"}>
            {positive ? (
                <ArrowUpRight className="w-4 h-4 inline" />
            ) : (
                <ArrowDownRight className="w-4 h-4 inline" />
            )}
        </span>
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
      className={`${colorMap[color]} border rounded-xl p-4 transition-all hover:scale-105 flex flex-col items-center gap-2 group`}
    >
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}