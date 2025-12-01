import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Download,
  Loader,
  Trash2,
  User,
  Mail,
  AtSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  X
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "../utils/formatCurrency"; // Pastikan path utils benar

// --- KONSTANTA WARNA CHART ---
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

export default function Profile() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state untuk edit profile
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
  });

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // 1. Fetch User Profile
      const userRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (userRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const userData = await userRes.json();
      
      if (userData.success && userData.data) {
        setUser(userData.data);
        setForm({
          name: userData.data.name,
          email: userData.data.email,
          username: userData.data.username,
        });
        // Update local storage agar sinkron
        localStorage.setItem("user", JSON.stringify(userData.data));
      }

      // 2. Fetch Transactions
      const transRes = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (transRes.ok) {
        const transData = await transRes.json();
        if (transData.success) {
          setTransactions(transData.data || []);
        }
      }

    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial Load
  useEffect(() => {
    // Cek data di localStorage dulu untuk render instan (Optimistic UI)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setForm({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            username: parsedUser.username || "",
        });
        setLoading(false); // Bisa set false dulu biar ga loading lama
      } catch (e) { console.error("Error parsing stored user", e); }
    }
    
    // Fetch data segar dari API
    fetchData();
  }, [fetchData]);


  
  // 1. Ringkasan Statistik
  const stats = useMemo(() => {
    if (!transactions.length) return { totalIncome: 0, totalExpense: 0, count: 0, balance: 0 };

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: transactions.length
    };
  }, [transactions]);

  // 2. Distribusi Pengeluaran untuk Chart
  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (!expenses.length) return [];

    const categoryMap = expenses.reduce((acc, curr) => {
      const amount = parseFloat(curr.amount);
      acc[curr.category] = (acc[curr.category] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Urutkan dari terbesar
  }, [transactions]);


  // --- EVENT HANDLERS ---

  const handleSaveProfile = async () => {
    if (!form.name || !form.email || !form.username) {
        alert("Semua field harus diisi!");
        return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data)); // Update storage
        setEditOpen(false);
        alert("Profil berhasil diperbarui!");
      } else {
        alert(data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    
    const prevTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Gagal menghapus");
      
      // Refresh data user (saldo) karena transaksi dihapus
      fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Gagal menghapus transaksi");
      setTransactions(prevTransactions); // Rollback jika gagal
    }
  };

  const handleExportCSV = () => {
    if (!transactions.length) return alert("Tidak ada data untuk diexport");

    const headers = ["ID,Tanggal,Tipe,Kategori,Nominal,Deskripsi"];
    const rows = transactions.map((t) =>
      `${t.id},${t.date},${t.type},${t.category},${t.amount},"${t.description || ""}"`
    );
    const csvContent = [headers, ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transaksi_${user.username}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };


  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Memuat profil...</p>
      </div>
    );
  }

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Profil Saya</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola informasi akun dan tinjau aktivitas keuangan Anda.</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all shadow-sm"
                >
                    <Edit2 className="w-4 h-4" /> <span>Edit Profil</span>
                </button>
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                    <Download className="w-4 h-4" /> <span>Export CSV</span>
                </button>
            </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. PROFILE CARD */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center h-fit">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-1 mb-4 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        {/* Placeholder Avatar - Bisa diganti img src */}
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-500 to-cyan-600">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">@{user.username}</p>

                <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                            <p className="text-sm font-medium truncate max-w-[200px]">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Saldo Saat Ini</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(user.balance || stats.balance)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. STATISTICS & CHART AREA (Spans 2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-emerald-400/80 text-sm font-medium mb-1">Total Pemasukan</p>
                            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalIncome)}</h3>
                        </div>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="p-5 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-2xl flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-rose-400/80 text-sm font-medium mb-1">Total Pengeluaran</p>
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats.totalExpense)}</h3>
                        </div>
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-6">Analisis Pengeluaran</h3>
                    {expenseData.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="w-full md:w-1/2 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseData}
                                            cx="50%" cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-3">
                                {expenseData.slice(0, 5).map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                            <p>Belum ada data pengeluaran</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Aktivitas Terbaru</h3>
                        <button 
                            onClick={() => navigate('/transactions')}
                            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1"
                        >
                            Lihat Semua <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} dark:bg-opacity-20`}>
                                        {tx.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{tx.category}</p>
                                        <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    <button 
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <p className="text-center text-slate-400 py-4">Tidak ada transaksi terbaru</p>
                        )}
                    </div>
                </div>

            </div>
        </div>

        {/* EDIT MODAL */}
        {editOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Edit Profil</h3>
                        <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Nama Anda"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={form.username}
                                    onChange={(e) => setForm({...form, username: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="email" 
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="email@contoh.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={() => setEditOpen(false)}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}