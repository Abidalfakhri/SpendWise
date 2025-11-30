import { useState } from "react";
import {
  PiggyBank,
  PlusCircle,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Edit,
  ArrowUpRight,
  XCircle,
  Plane,
  Laptop,
  Home,
  Gift,
  Car,
  Heart,
  Calendar, // Tambah ikon untuk deadline
  DollarSign, // Tambah ikon untuk nominal
  Tag, // Tambah ikon untuk kategori
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/formatCurrency";

const categories = [
  { id: "travel", name: "Liburan", icon: Plane, color: "bg-sky-500" },
  { id: "tech", name: "Gadget", icon: Laptop, color: "bg-indigo-500" },
  { id: "house", name: "Rumah", icon: Home, color: "bg-amber-500" },
  { id: "gift", name: "Hadiah", icon: Gift, color: "bg-pink-500" },
  { id: "vehicle", name: "Kendaraan", icon: Car, color: "bg-emerald-500" },
  { id: "health", name: "Kesehatan", icon: Heart, color: "bg-red-500" },
];

// Komponen Pembantu untuk Input Form
const FormInput = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
    )}
    <input
      {...props}
      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400"
    />
  </div>
);

// Komponen Pembantu untuk Select Form
const FormSelect = ({ icon: Icon, children, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
    )}
    <select
      {...props}
      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
    >
      {children}
    </select>
  </div>
);


export default function TargetKeuangan() {
  const [targets, setTargets] = useState([
    {
      id: 1,
      name: "Beli Laptop Baru",
      category: "tech",
      targetAmount: 15000000,
      savedAmount: 3500000,
      deadline: "2025-12-30",
      color: "bg-indigo-500",
    },
    {
      id: 2,
      name: "Dana Liburan ke Bali",
      category: "travel",
      targetAmount: 8000000,
      savedAmount: 4000000,
      deadline: "2025-08-01",
      color: "bg-sky-500",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  const [newTarget, setNewTarget] = useState({
    name: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
    category: "",
  });

  const [msg, setMsg] = useState("");

  const handleInputAmount = (field, value) => {
    // Menghapus semua karakter non-digit kecuali tanda minus (jika diperlukan)
    const raw = value.replace(/[^\d]/g, ""); 
    const formatted = new Intl.NumberFormat("id-ID").format(raw || 0);
    setNewTarget({ ...newTarget, [field]: formatted });
  };

  const handleInputModalAmount = (value) => {
    const raw = value.replace(/[^\d]/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(raw || 0);
    setAddAmount(formatted);
  };


  const handleAddTarget = () => {
    // Hapus titik/koma pemisah ribuan sebelum konversi ke angka
    const target = parseFloat(newTarget.targetAmount.replace(/\./g, "").replace(/,/g, "")) || 0;
    const saved = parseFloat(newTarget.savedAmount.replace(/\./g, "").replace(/,/g, "")) || 0;

    if (!newTarget.name || !target || !newTarget.deadline || !newTarget.category) {
      setMsg("Lengkapi semua data target!");
      // Ubah notifikasi error menjadi warna merah/jingga
      setTimeout(() => setMsg(""), 3000); 
      return;
    }

    const cat = categories.find((c) => c.id === newTarget.category);

    const newData = {
      id: Date.now(),
      name: newTarget.name,
      category: newTarget.category,
      targetAmount: target,
      savedAmount: saved,
      deadline: newTarget.deadline,
      color: cat.color,
    };
    setTargets([...targets, newData]);
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
  };

  const handleOpenModal = (target) => {
    setSelectedTarget(target);
    setAddAmount("");
    setShowModal(true);
  };

  const handleAddSaving = () => {
    const nominal = parseFloat(addAmount.replace(/\./g, "").replace(/,/g, ""));
    if (!nominal || nominal <= 0) {
      setMsg("Nominal tabungan harus lebih dari 0.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    setTargets(
      targets.map((t) =>
        t.id === selectedTarget.id
          ? { ...t, savedAmount: t.savedAmount + nominal }
          : t
      )
    );
    setShowModal(false);
    setMsg("💰 Tabungan berhasil ditambahkan!");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus target ini?")) {
        setTargets(targets.filter((t) => t.id !== id));
        setMsg("🗑️ Target dihapus.");
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


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Target Keuangan
          </h1>
        </div>

        <motion.button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-lg transition-all font-semibold 
                      ${showForm 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {showForm ? (
            <>
              <XCircle className="w-5 h-5" /> Batalkan
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" /> Buat Target Baru
            </>
          )}
        </motion.button>
      </div>

      {/* Notifikasi */}
      <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3 rounded-xl text-sm font-medium ${
            msg.includes("Lengkapi") || msg.includes("lebih dari 0") 
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
          } flex items-center gap-2`}
        >
          <CheckCircle2 className="w-5 h-5" />
          {msg}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Form Tambah Target */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-6 text-xl">
              Detail Target Tabungan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <FormInput
                icon={TrendingUp}
                type="text"
                placeholder="Nama target (mis: Dana Mobil Baru)"
                value={newTarget.name}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, name: e.target.value })
                }
              />
              
              <FormSelect
                icon={Tag}
                value={newTarget.category}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, category: e.target.value })
                }
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </FormSelect>
              
              <FormInput
                icon={DollarSign}
                type="text"
                placeholder="Target Nominal (mis: 15.000.000)"
                value={newTarget.targetAmount}
                onChange={(e) =>
                  handleInputAmount("targetAmount", e.target.value)
                }
              />

              <FormInput
                icon={PiggyBank}
                type="text"
                placeholder="Tabungan awal (jika ada)"
                value={newTarget.savedAmount}
                onChange={(e) =>
                  handleInputAmount("savedAmount", e.target.value)
                }
              />

              <FormInput
                icon={Calendar}
                type="date"
                value={newTarget.deadline}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, deadline: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end mt-7">
              <motion.button
                onClick={handleAddTarget}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Simpan Target
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daftar Target */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {targets.length === 0 ? (
             <div className="col-span-full text-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada target tabungan yang dibuat. Mulai sekarang!</p>
             </div>
        ) : (
            targets.map((t) => {
              const progress = Math.min((t.savedAmount / t.targetAmount) * 100, 100);
              const cat = categories.find((c) => c.id === t.category);
              const Icon = cat?.icon || TrendingUp;
              const isDone = progress >= 100;
              const daysRemaining = getDaysRemaining(t.deadline);
              
              const progressColor = isDone 
                ? "from-green-400 to-green-600" 
                : daysRemaining === "Telah Lewat"
                    ? "from-red-400 to-red-600"
                    : "from-emerald-400 to-emerald-600"; // Mengubah dari blue ke emerald

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between transform hover:scale-[1.01]"
                >
                  {/* Top: Icon & Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${cat?.color} shadow-md`}
                        >
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-snug">
                            {t.name}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <Tag className="w-3 h-3"/>
                                {cat?.name}
                            </p>
                        </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="my-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 flex justify-between">
                      <span>{isDone ? "SELESAI" : "PROGRESS"}</span>
                      <span className="font-bold text-sm text-emerald-500">{progress.toFixed(1)}%</span>
                    </p>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${progressColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Amount & Deadline */}
                  <div className="mb-4 text-sm">
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500 dark:text-gray-400">Terkumpul</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(t.savedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-300 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Target</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(t.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4"/> Batas Waktu
                        </span>
                        <span className={`font-semibold ${daysRemaining === "Telah Lewat" ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
                            {t.deadline} ({daysRemaining})
                        </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      onClick={() => handleOpenModal(t)}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition font-medium"
                      disabled={isDone}
                      whileHover={{ x: 2 }}
                    >
                      <ArrowUpRight className="w-4 h-4" /> 
                      {isDone ? "Selesai" : "Tambah Dana"}
                    </motion.button>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          alert("Fitur edit target akan ditambahkan di versi berikutnya")
                        }
                        className="p-1 rounded-full text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
      </div>

      {/* Modal Tambah Tabungan (Diperbaiki) */}
      <AnimatePresence>
        {showModal && selectedTarget && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)} // Klik di luar modal untuk menutup
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat klik di dalam modal
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Tambah Dana
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Target: **{selectedTarget.name}**
              </p>
              
              <div className="relative mb-5">
                 <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                 <input
                    type="text"
                    value={addAmount}
                    onChange={(e) => handleInputModalAmount(e.target.value)}
                    placeholder="Masukkan nominal tabungan"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddSaving}
                  className="px-5 py-2.5 rounded-full font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}