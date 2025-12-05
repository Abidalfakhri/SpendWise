import { useState, useEffect, useCallback } from "react";
import { X, Plus, Edit2, Trash2, Save, Loader, Search, TrendingUp, TrendingDown, Check, ChevronDown } from "lucide-react";

// Mapping Luksa icons ke emoji untuk backend (optional)
const iconMap = {
    'briefcase': '💼', 
    'laptop': '💻', 
    'trending-up': '📈', 
    'gift': '🎁', 
    'utensils': '🍔', 
    'car': '🚗', 
    'shopping-cart': '🛍️',
    'file-text': '📄', 
    'film': '🎬', 
    'heart': '🏥', 
    'book': '📚', 
    'more-horizontal': '📄', // Default/fallback icon
};

const reverseIconMap = Object.entries(iconMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

export default function CategoryManager({ onClose }) { 
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        type: "expense",
        icon: iconMap['utensils'] || '🍔',
        color: "#ef4444"
    });

    const iconOptions = [
        "🍔", "🚗", "🛍️", "🎬", "📄", "🏥", "📚", "📦",
        "💰", "💼", "📈", "🎁", "🏠", "✈️", "🎮", "☕",
        "💳", "📱", "👕", "⚡", "🌟", "🎯", "🔧", "🎨"
    ]; 

    const colorOptions = [
        "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ];

    const resetForm = () => {
        setFormData({
            name: "",
            type: "expense",
            icon: iconMap['utensils'] || '🍔',
            color: "#ef4444"
        });
        setEditingId(null);
        setShowForm(false);
        setError(null);
        setSuccess(null);
    };

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return; 

            const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/categories`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
            });

            if (res.status === 401) throw new Error("Token kedaluwarsa. Silakan login ulang.");

            const responseData = await res.json();
            
            if (responseData.success) {
                const apiCategories = responseData.data || []; 
                
                const mappedCategories = apiCategories.map(cat => ({
                    ...cat,
                    icon: iconMap[cat.icon] || cat.icon || '📄' 
                }));

                setCategories(mappedCategories); 
            } else {
                throw new Error(responseData.error || "Gagal mengambil data kategori");
            }
        } catch (err) {
            console.error("❌ Error fetching categories:", err);
            setError(err.message || "Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetchCategories();
        } else {
            setError("Anda harus login untuk mengelola kategori.");
        }
    }, [fetchCategories]);

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            const iconNameForDb = reverseIconMap[formData.icon];
            
            const dataToSend = {
                ...formData,
                icon: iconNameForDb || formData.icon, 
            };
            
            const response = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/categories`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal membuat kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil ditambahkan!");
                resetForm();
                await fetchCategories();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error("Error creating category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleStartEdit = (category) => {
        setEditingId(category.id); 
        setShowForm(true);
        
        setFormData({
            name: category.name,
            type: category.type,
            icon: category.icon, 
            color: category.color,
        });
        
        setError(null);
        setSuccess(null);
    };

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const token = localStorage.getItem("token");
            const iconNameForDb = reverseIconMap[formData.icon];
            const dataToSend = {
                ...formData,
                icon: iconNameForDb || formData.icon, 
            };

            const response = await fetch(
                `https://spend-wisee-backend-awdsa.vercel.app/api/categories/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengupdate kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil diperbarui!");
                resetForm();
                await fetchCategories();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error("Error updating category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://spend-wisee-backend-awdsa.vercel.app/api/categories/${categoryId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menghapus kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil dihapus!");
                await fetchCategories();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) return;
        if (editingId) {
            handleUpdate();
        } else {
            handleCreate();
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === "all" || cat.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: categories.length,
        income: categories.filter(c => c.type === "income").length,
        expense: categories.filter(c => c.type === "expense").length
    };

    return (
        <div className="flex flex-col h-full max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 pb-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Kelola Kategori
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Atur kategori transaksi Anda
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3.5 rounded-xl">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-3.5 rounded-xl">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Pemasukan</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.income}</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-3.5 rounded-xl">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">Pengeluaran</p>
                        <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.expense}</p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            resetForm();
                            setShowForm(true);
                        }
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                    {showForm ? (
                        <>
                            <X className="w-5 h-5" />
                            Tutup Form
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Buat Kategori Baru
                        </>
                    )}
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
                        <span>⚠️</span>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5" />
                        <span className="flex-1">{success}</span>
                        <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {editingId ? "Edit Kategori" : "Kategori Baru"}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="Contoh: Makanan & Minuman"
                                    disabled={loading}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                                />
                            </div>

                            {/* Tipe */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Tipe Transaksi
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "expense" })}
                                        disabled={loading}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                                            formData.type === "expense"
                                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        <TrendingDown className="w-4 h-4 inline mr-2" />
                                        Pengeluaran
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "income" })}
                                        disabled={loading}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                                            formData.type === "income"
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        <TrendingUp className="w-4 h-4 inline mr-2" />
                                        Pemasukan
                                    </button>
                                </div>
                            </div>

                            {/* Icon Selector - Improved */}{/* Icon Selector - Improved */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Pilih Icon
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            disabled={loading}
                                            className={`relative h-12 flex items-center justify-center text-xl rounded-lg transition-all duration-200 ${
                                                formData.icon === icon
                                                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-105"
                                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 active:scale-95"
                                            }`}
                                        >
                                            {icon}
                                            {formData.icon === icon && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector - Improved */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Warna
                                </label>
                                <div className="flex gap-2.5 flex-wrap">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            disabled={loading}
                                            className={`relative w-11 h-11 rounded-xl transition-all duration-200 ${
                                                formData.color === color 
                                                    ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800 scale-110 shadow-lg" 
                                                    : "hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                                            }`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {formData.color === color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Preview</p>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                                        style={{ backgroundColor: formData.color }}
                                    >
                                        {formData.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                                            {formData.name || "Nama Kategori"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                            {formData.type === "income" ? (
                                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-rose-500" />
                                            )}
                                            {formData.type === "income" ? "Pemasukan" : "Pengeluaran"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.name.trim()}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingId ? "Update" : "Simpan"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search & Filter - Outside Form */}
                <div className="mb-5 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kategori..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterType("all")}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                filterType === "all"
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilterType("income")}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                filterType === "income"
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Pemasukan
                        </button>
                        <button
                            onClick={() => setFilterType("expense")}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                filterType === "expense"
                                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Pengeluaran
                        </button>
                    </div>
                </div>

                {/* Categories List */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                            {searchQuery ? "Tidak ada hasil" : loading ? "Memuat..." : "Belum ada kategori"}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {searchQuery ? "Coba kata kunci lain" : "Mulai dengan membuat kategori baru"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredCategories.map((cat) => (
                            <div
                                key={cat.id}
                                className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {cat.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                            {cat.type === "income" ? (
                                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 text-rose-500" />
                                            )}
                                            {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleStartEdit(cat)}
                                        disabled={loading}
                                        className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={loading}
                                        className="p-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}