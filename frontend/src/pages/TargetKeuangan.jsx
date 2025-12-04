import { useState, useEffect, useCallback } from "react";
import {
  PiggyBank,
  PlusCircle,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Edit,
  ArrowUpRight,
  Plane,
  Laptop,
  Home,
  Gift,
  Car,
  Heart,
  Calendar,
  DollarSign,
  Tag,
  Loader,
  ArrowLeft,
  X,
} from "lucide-react";

const categoryIcons = {
  "Liburan": Plane,
  "Gadget": Laptop,
  "Rumah": Home,
  "Hadiah": Gift,
  "Kendaraan": Car,
  "Kesehatan": Heart,
  "Transportasi": Car,
  "Makanan": Gift,
  "Belanja": Gift,
  "Hiburan": Heart,
  "Pendidikan": Laptop,
  "Investasi": TrendingUp,
  "Tabungan": PiggyBank,
  "Lainnya": Tag,
};

const categoryColors = [
  "bg-sky-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
];

const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null) return "Rp0";
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `Rp${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }
};

const formatAmountDisplay = (value) => {
  if (typeof value === 'number') {
    value = value.toString();
  }
  if (!value) return "";
  
  let num = value.toString().replace(/[^0-9]/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function TargetKeuangan() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [addAmount, setAddAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [dbCategories, setDbCategories] = useState([]);

  const [newTarget, setNewTarget] = useState({
    name: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
    category: "",
  });

  const handleInputAmount = (field, value) => {
    const raw = value.replace(/[^\d]/g, "");
    const formatted = formatAmountDisplay(raw);
    setNewTarget({ ...newTarget, [field]: formatted });
  };

  const handleInputModalAmount = (value) => {
    const raw = value.replace(/[^\d]/g, "");
    const formatted = formatAmountDisplay(raw);
    setAddAmount(formatted);
  };

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
        const allCategories = data.data.map(cat => cat.name);
        setDbCategories(allCategories);
      } else {
        console.error("❌ Error fetching categories:", data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/savings-goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setTargets(data.data || []);
      } else {
        console.error("❌ Error:", data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching targets:", err);
      setMsg("Gagal memuat data target keuangan");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi telah berakhir. Silakan login kembali.");
      return;
    }
    fetchTargets();
    fetchCategories();
  }, [fetchTargets, fetchCategories]);

  const handleAddTarget = async () => {
    const target = parseFloat(newTarget.targetAmount.replace(/\./g, "")) || 0;
    const saved = parseFloat(newTarget.savedAmount.replace(/\./g, "")) || 0;

    if (!newTarget.name || !target || !newTarget.deadline || !newTarget.category) {
      setMsg("Lengkapi semua data target!");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      const payload = {
        name: newTarget.name,
        category: newTarget.category,
        target_amount: target,
        saved_amount: saved,
        deadline: newTarget.deadline,
      };

      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/savings-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      if (data.success) {
        await fetchTargets();
        setShowForm(false);
        setNewTarget({
          name: "",
          targetAmount: "",
          savedAmount: "",
          deadline: "",
          category: "",
        });
        setMsg("✅ Target keuangan berhasil ditambahkan!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg(data.message || "Gagal menambahkan target");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      console.error("❌ Error adding target:", err);
      setMsg("Terjadi kesalahan saat menambahkan target");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleOpenModal = (target) => {
    setSelectedTarget(target);
    setAddAmount("");
    setShowModal(true);
  };

  const handleAddSaving = async () => {
    const nominal = parseFloat(addAmount.replace(/\./g, ""));
    if (!nominal || nominal <= 0) {
      setMsg("Nominal tabungan harus lebih dari 0.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      const res = await fetch(
        `https://spend-wisee-backend-awdsa.vercel.app/api/savings-goals/${selectedTarget.id}/add-savings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: nominal }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      if (data.success) {
        await fetchTargets();
        setShowModal(false);
        setMsg("💰 Tabungan berhasil ditambahkan!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg(data.message || "Gagal menambahkan tabungan");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      console.error("❌ Error adding savings:", err);
      setMsg("Terjadi kesalahan saat menambahkan tabungan");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus target ini?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      const res = await fetch(`https://spend-wisee-backend-awdsa.vercel.app/api/savings-goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      if (data.success) {
        await fetchTargets();
        setMsg("🗑️ Target dihapus.");
        setTimeout(() => setMsg(""), 2500);
      } else {
        setMsg(data.message || "Gagal menghapus target");
        setTimeout(() => setMsg(""), 2500);
      }
    } catch (err) {
      console.error("❌ Error deleting target:", err);
      setMsg("Terjadi kesalahan saat menghapus target");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const dead = new Date(deadline);
    const diffTime = dead - now;
    if (diffTime < 0) return "Telah Lewat";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} hari tersisa`;
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

  if (loading && targets.length === 0 || loadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="text-slate-100 text-xl">
            {loadingCategories ? "Memuat kategori..." : "Memuat target keuangan..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <PiggyBank className="w-8 h-8 text-emerald-500" />
                Target Keuangan
              </h1>
              <p className="text-slate-400 text-sm">Kelola dan pantau target tabungan Anda.</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg w-full sm:w-auto flex-shrink-0 ${
              showForm
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30"
            }`}
          >
            {showForm ? (
              <>
                <X className="w-5 h-5" /> Batalkan
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" /> Buat Target Baru
              </>
            )}
          </button>
        </div>

        <hr className="border-slate-700" />

        {/* Notifikasi */}
        {msg && (
          <div
            className={`p-4 rounded-xl font-medium flex items-center gap-2 animate-fadeIn ${
              msg.includes("Lengkapi") || msg.includes("lebih dari 0") || msg.includes("Gagal") || msg.includes("kesalahan")
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {msg}
          </div>
        )}

        {/* Form Tambah Target */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-slate-200 mb-6 text-xl">
              Detail Target Tabungan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-slate-300">Nama Target <span className="text-rose-400">*</span></label>
                <TrendingUp className="absolute left-3 bottom-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nama target (mis: Dana Mobil Baru)"
                  value={newTarget.name}
                  onChange={(e) =>
                    setNewTarget({ ...newTarget, name: e.target.value })
                  }
                  className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-slate-300">Kategori <span className="text-rose-400">*</span></label>
                <Tag className="absolute left-3 bottom-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={newTarget.category}
                  onChange={(e) =>
                    setNewTarget({ ...newTarget, category: e.target.value })
                  }
                  className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? "Memuat kategori..." : "Pilih Kategori"}
                  </option>
                  {dbCategories.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-slate-300">Target Nominal <span className="text-rose-400">*</span></label>
                <DollarSign className="absolute left-3 bottom-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Target Nominal (mis: 15.000.000)"
                  value={newTarget.targetAmount}
                  onChange={(e) =>
                    handleInputAmount("targetAmount", e.target.value)
                  }
                  className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-slate-300">Tabungan Awal</label>
                <PiggyBank className="absolute left-3 bottom-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tabungan awal (jika ada)"
                  value={newTarget.savedAmount}
                  onChange={(e) =>
                    handleInputAmount("savedAmount", e.target.value)
                  }
                  className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-slate-300">Batas Waktu <span className="text-rose-400">*</span></label>
                <Calendar className="absolute left-3 bottom-3 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={newTarget.deadline}
                  onChange={(e) =>
                    setNewTarget({ ...newTarget, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end mt-7">
              <button
                onClick={handleAddTarget}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
              >
                Simpan Target
              </button>
            </div>
          </div>
        )}

        {/* Daftar Target */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {targets.length === 0 ? (
            <div className="col-span-full text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-800/30">
              <PiggyBank className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-slate-400 text-lg mb-6">Belum ada target tabungan yang dibuat. Mulai sekarang!</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20"
              >
                Buat Target Pertama
              </button>
            </div>
          ) : (
            targets.map((t) => {
              const progress = Math.min((t.saved_amount / t.target_amount) * 100, 100);
              const Icon = categoryIcons[t.category] || TrendingUp;
              const colorIndex = dbCategories.indexOf(t.category) % categoryColors.length;
              const color = categoryColors[colorIndex];
              const isDone = progress >= 100;
              const daysRemaining = getDaysRemaining(t.deadline);
              
              const progressColor = isDone 
                ? "bg-gradient-to-r from-green-500 to-green-600" 
                : daysRemaining === "Telah Lewat"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600";

              return (
                <div
                  key={t.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-xl leading-snug">
                          {t.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3"/>
                          {t.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-4">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-2 flex justify-between">
                      <span>{isDone ? "SELESAI" : "PROGRESS"}</span>
                      <span className="font-bold text-sm text-blue-400">{progress.toFixed(1)}%</span>
                    </p>
                    
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${progressColor} transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Terkumpul</span>
                      <span className="font-bold text-slate-100">{formatCurrency(t.saved_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-700">
                      <span className="text-slate-400">Target</span>
                      <span className="font-bold text-slate-100">{formatCurrency(t.target_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4"/> Batas Waktu
                      </span>
                      <span className={`font-semibold text-xs ${daysRemaining === "Telah Lewat" ? "text-red-400" : "text-slate-300"}`}>
                        {new Date(t.deadline).toLocaleDateString('id-ID')} ({daysRemaining})
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <button
                      onClick={() => handleOpenModal(t)}
                      className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition font-medium"
                      disabled={isDone}
                    >
                      <ArrowUpRight className="w-4 h-4" /> 
                      {isDone ? "Selesai" : "Tambah Dana"}
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          alert("Fitur edit target akan ditambahkan di versi berikutnya")
                        }
                        className="p-1 rounded-full text-slate-400 hover:text-yellow-400 hover:bg-slate-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Tambah Tabungan */}
        {showModal && selectedTarget && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Tambah Dana
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Target: <strong>{selectedTarget.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-all flex-shrink-0"
                  aria-label="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative mb-5">
                <label className="block text-sm font-medium mb-1 text-slate-300">Jumlah <span className="text-rose-400">*</span></label>
                <span className="absolute left-3 bottom-3 text-slate-400 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  value={addAmount}
                  onChange={(e) => handleInputModalAmount(e.target.value)}
                  placeholder="Masukkan nominal tabungan"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 mb-5">
                <p className="text-xs text-blue-300">
                  💡 Menambah dana akan mengurangi saldo Anda dan tercatat sebagai pengeluaran dengan kategori "Tabungan - {selectedTarget.name}"
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                <button
                  onClick={handleAddSaving}
                  className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}