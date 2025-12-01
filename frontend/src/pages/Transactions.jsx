import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    Calendar,
    X,
    Edit2,
    Trash2,
    Check,
    ArrowLeft,
    Loader,
    DollarSign,
} from "lucide-react";

const formatAmountDisplay = (value) => {
    if (typeof value === 'number') {
        value = value.toString().replace('.', ',');
    }
    if (!value) return "";
    
    let num = value.toString().replace(/[^0-9,]/g, "");
    
    const parts = num.split(",");
    let integerPart = parts[0].replace(/\./g, ""); 
    
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    const decimalPart = parts.length > 1 ? parts[1].substring(0, 2) : '';

    return parts.length > 1 ? integerPart + "," + decimalPart : integerPart;
};

const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return "Rp0";
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        return `Rp${amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    }
};

const TransactionListItem = React.memo(({ tx, handleEdit, handleDelete }) => {
    const isIncome = tx.type === "income";
    const amountColor = isIncome ? "text-emerald-400" : "text-rose-400";
    const iconBg = isIncome ? "bg-emerald-500/20" : "bg-rose-500/20";
    const icon = isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;

    const formattedDate = new Date(tx.date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div
            className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 group"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-xl ${iconBg} ${amountColor} flex-shrink-0`}>
                    {icon}
                </div>

                <div className="min-w-0 truncate">
                    <p className="font-semibold text-lg truncate" title={tx.category}>{tx.category}</p>
                    <p className="text-sm text-slate-400 truncate" title={tx.description || "Tidak ada deskripsi"}>
                        {tx.description || <span className="italic">Tidak ada deskripsi</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <p className={`text-xl md:text-2xl font-bold whitespace-nowrap ${amountColor}`}>
                    {isIncome ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                </p>

                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleEdit(tx)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                        aria-label="Edit Transaksi"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-all"
                        aria-label="Hapus Transaksi"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
});


const TransactionModal = ({ 
    showModal, 
    setShowModal, 
    editingId, 
    formData, 
    setFormData, 
    displayAmount, 
    handleAmountChange, 
    handleSubmit, 
    resetForm,
    dbCategories,
    loadingCategories 
}) => {

    if (!showModal) return null;

    const currentCategories = dbCategories[formData.type] || [];
    const isIncome = formData.type === "income";

    const handleClose = () => {
        setShowModal(false);
        resetForm();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[1000] p-4 pt-10 sm:p-4 overflow-y-auto"
            onClick={handleClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 w-full max-w-sm my-8 transform transition-all"
                onClick={e => e.stopPropagation()} 
            >
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {editingId ? "✍️ Edit Transaksi" : "➕ Tambah Transaksi"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1 ml-4 hover:bg-slate-700 rounded-lg transition-all flex-shrink-0"
                        aria-label="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Tipe Transaksi</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                                    isIncome
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" /> Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                                    !isIncome
                                        ? "bg-rose-600 text-white"
                                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                }`}
                            >
                                <TrendingDown className="w-4 h-4" /> Pengeluaran
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Kategori <span className="text-rose-400">*</span></label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            required
                            disabled={loadingCategories}
                        >
                            <option value="">
                                {loadingCategories ? "Memuat kategori..." : "Pilih Kategori"}
                            </option>
                            
                            {currentCategories.map((catName) => (
                                <option key={catName} value={catName}>
                                    {catName}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Jumlah <span className="text-rose-400">*</span></label>
                        <div className="relative">
                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                             <input
                                 type="text" 
                                 value={displayAmount}
                                 onChange={handleAmountChange} 
                                 placeholder="Cth: 1.000.000,50"
                                 className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 required
                             />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Tanggal <span className="text-rose-400">*</span></label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Catatan tambahan..."
                            rows={2} 
                            className="w-full px-3 py-2.5 text-sm bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            {editingId ? "Update" : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function Transactions() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get("type") || "";

    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState(initialType || "all");
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [dbCategories, setDbCategories] = useState({ income: [], expense: [] });
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        type: initialType || "expense",
        category: "",
        amount: "", 
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

    const [displayAmount, setDisplayAmount] = useState("");

    const resetForm = useCallback(() => {
        setFormData({
            type: initialType || "expense",
            category: "",
            amount: "",
            date: new Date().toISOString().split("T")[0],
            description: "",
        });
        setEditingId(null);
        setDisplayAmount(""); 
    }, [initialType]);

    const handleAmountChange = useCallback((e) => {
        const rawValue = e.target.value;

        const formattedValue = formatAmountDisplay(rawValue);
        setDisplayAmount(formattedValue);

        let cleanedValue = rawValue.toString().replace(/\./g, "").replace(",", ".");
        
        if (isNaN(parseFloat(cleanedValue)) && cleanedValue !== "") {
            cleanedValue = "";
        } else if (cleanedValue === ".") {
            cleanedValue = ""; 
        }
        
        setFormData(prev => ({ 
            ...prev, 
            amount: cleanedValue 
        }));
    }, []);

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.success) {
                const groupedCategories = data.data.reduce((acc, cat) => {
                    acc[cat.type].push(cat.name);
                    return acc;
                }, { income: [], expense: [] });

                setDbCategories(groupedCategories);
            } else {
                console.error("❌ Error fetching categories:", data.message);
            }
        } catch (err) {
            console.error("❌ Error fetching categories:", err);
        } finally {
            setLoadingCategories(false);
        }
    }, []);
    
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setLoading(false);
                navigate("/login");
                return;
            }
            
            const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions`, { 
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                console.error("❌ Unauthorized - token invalid");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            const data = await res.json();
            
            if (data.success) {
                setTransactions(data.data || []);
            } else {
                console.error("❌ Error:", data.message);
            }
        } catch (err) {
            console.error("❌ Error fetching transactions:", err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

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
                console.error("❌ No userId found in token");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setUser({ ...payload, userId });
            
            fetchTransactions();
            fetchCategories(); 
            
        } catch (err) {
            console.error("❌ JWT error:", err);
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [navigate, fetchCategories, fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        if (filterType !== "all") {
            filtered = filtered.filter((t) => t.type === filterType);
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.category.toLowerCase().includes(lowerSearchTerm) ||
                    t.description?.toLowerCase().includes(lowerSearchTerm)
            );
        }

        return filtered;
    }, [searchTerm, filterType, transactions]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = filteredTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const expense = filteredTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        return { 
            totalIncome: income, 
            totalExpense: expense, 
            balance: income - expense 
        };
    }, [filteredTransactions]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Sesi telah berakhir. Silakan login kembali.");
            navigate("/login");
            return;
        }
        
        const trimmedCategory = formData.category.trim();
        const amountFloat = Number(formData.amount); 

        if (!trimmedCategory || amountFloat <= 0 || isNaN(amountFloat)) {
            alert("Kategori dan jumlah harus diisi dengan benar dan lebih dari nol!");
            return;
        }

        try {
            const url = editingId
                ? `https://spend-wisee-backend-awdsa.vercel.app/api/transactions/${editingId}`
                : "https://spend-wisee-backend-awdsa.vercel.app/api/transactions";

            const method = editingId ? "PUT" : "POST";

            const payload = {
                type: formData.type,
                category: trimmedCategory,
                amount: amountFloat, 
                date: formData.date,
                description: formData.description.trim(),
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (data.success) {
                await fetchTransactions();
                resetForm();
                setShowModal(false);
            } else {
                alert(data.message || "Gagal menyimpan transaksi");
            }
        } catch (err) {
            console.error("❌ Error saving transaction:", err);
            alert("Terjadi kesalahan saat menyimpan transaksi");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.")) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Sesi telah berakhir. Silakan login kembali.");
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/transactions/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (data.success) {
                await fetchTransactions();
            } else {
                alert(data.message || "Gagal menghapus transaksi");
            }
        } catch (err) {
            console.error("❌ Error deleting transaction:", err);
            alert("Terjadi kesalahan saat menghapus transaksi");
        }
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction.id);
        
        const amountStringWithComma = transaction.amount.toString().replace('.', ',');
        
        setFormData({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount.toString(),
            date: transaction.date.split('T')[0],
            description: transaction.description || "",
        });
        
        setDisplayAmount(formatAmountDisplay(amountStringWithComma)); 
        
        setShowModal(true);
    };

    const handleBackToDashboard = () => {
        navigate("/dashboard", { state: { refresh: true } });
    };


    if (loading && transactions.length === 0 || loadingCategories) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-500 animate-spin" />
                    <div className="text-slate-100 text-xl">
                        {loadingCategories ? "Memuat kategori..." : "Memuat transaksi..."}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
            <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-8">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all flex-shrink-0"
                            aria-label="Kembali ke Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">💰 Transaksi Keuangan</h1>
                            <p className="text-slate-400 text-sm">Kelola, filter, dan edit semua catatan keuangan Anda.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/30 w-full sm:w-auto flex-shrink-0"
                        disabled={loadingCategories} 
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Transaksi
                    </button>
                </div>

                <hr className="border-slate-700"/>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 rounded-2xl p-5 md:p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-emerald-300 font-medium">Total Pemasukan</p>
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                            {formatCurrency(totalIncome)}
                        </p>
                    </div>

                    
                    <div className="bg-gradient-to-br from-rose-600/20 to-rose-700/10 border border-rose-500/30 rounded-2xl p-5 md:p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-rose-300 font-medium">Total Pengeluaran</p>
                            <TrendingDown className="w-6 h-6 text-rose-400" />
                        </div>
                        <p className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                            {formatCurrency(totalExpense)}
                        </p>
                    </div>

                    
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/30 rounded-2xl p-5 md:p-6 shadow-xl sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-blue-300 font-medium">Saldo Bersih</p>
                            <DollarSign className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {formatCurrency(balance)}
                        </p>
                    </div>
                </div>

                
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                        <Search className="w-5 h-5 text-slate-400"/> Pencarian & Filter
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className="relative md:col-span-2">
                            <label htmlFor="search-input" className="block text-sm font-medium mb-1 text-slate-300">Cari Kategori/Deskripsi</label>
                            {/* PERBAIKAN: Menggunakan offset yang dikalkulasi untuk sejajar vertikal */}
                            <Search className="absolute left-3 top-[36px] w-5 h-5 text-slate-400" /> 
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Cari transaksi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        
                        <div className="relative">
                            <label htmlFor="filter-type" className="block text-sm font-medium mb-1 text-slate-300">Filter Tipe</label>
                            {/* PERBAIKAN: Menggunakan offset yang dikalkulasi untuk sejajar vertikal */}
                            <Filter className="absolute left-3 top-[36px] w-5 h-5 text-slate-400 pointer-events-none" />
                            <select
                                id="filter-type"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Transaksi</option>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>
                    </div>
                    
                    {(searchTerm || filterType !== "all") && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterType("all");
                                }}
                                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <X className="w-4 h-4" />
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>


                
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-400"/> Daftar Transaksi ({filteredTransactions.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Memuat data transaksi...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg mb-6">
                                {searchTerm || filterType !== "all" ? 
                                    "Tidak ada transaksi yang cocok dengan filter saat ini." : 
                                    "Belum ada transaksi yang tercatat."
                                }
                            </p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20"
                            >
                                Tambah Transaksi Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTransactions
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((tx) => (
                                    <TransactionListItem
                                        key={tx.id}
                                        tx={tx}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                    />
                                ))
                            }
                        </div>
                    )}
                </div>

                
                <TransactionModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    editingId={editingId}
                    formData={formData}
                    setFormData={setFormData}
                    displayAmount={displayAmount}
                    handleAmountChange={handleAmountChange}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    dbCategories={dbCategories}
                    loadingCategories={loadingCategories}
                />
            </div>
        </div>
    );
}