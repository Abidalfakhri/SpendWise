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
    const raw = value.replace(/[^\d]/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(raw || 0);
    setNewTarget({ ...newTarget, [field]: formatted });
  };

  const handleAddTarget = () => {
    const target = parseFloat(newTarget.targetAmount.replace(/\./g, "")) || 0;
    const saved = parseFloat(newTarget.savedAmount.replace(/\./g, "")) || 0;

    if (!newTarget.name || !target || !newTarget.deadline || !newTarget.category) {
      setMsg("Lengkapi semua data target!");
      return;
    }

    const cat = categories.find((c) => c.id === newTarget.category);

    const newData = {
      id: Date.now(),
      ...newTarget,
      targetAmount: target,
      savedAmount: saved,
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
    const nominal = parseFloat(addAmount.replace(/\./g, ""));
    if (!nominal || nominal <= 0) return;

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
    setTargets(targets.filter((t) => t.id !== id));
    setMsg("🗑️ Target dihapus.");
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Target Keuangan
          </h1>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md transition-all"
        >
          {showForm ? (
            <>
              <XCircle className="w-5 h-5" /> Batal
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" /> Tambah Target
            </>
          )}
        </button>
      </div>

      {/* Notifikasi */}
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
        >
          <CheckCircle2 className="w-5 h-5" />
          {msg}
        </motion.div>
      )}

      {/* Form Tambah Target */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">
              Tambah Target Keuangan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nama target"
                value={newTarget.name}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, name: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />

              <select
                value={newTarget.category}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, category: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nominal target"
                value={newTarget.targetAmount}
                onChange={(e) =>
                  handleInputAmount("targetAmount", e.target.value)
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />

              <input
                type="text"
                placeholder="Tabungan awal"
                value={newTarget.savedAmount}
                onChange={(e) =>
                  handleInputAmount("savedAmount", e.target.value)
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />

              <input
                type="date"
                value={newTarget.deadline}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, deadline: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={handleAddTarget}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                Simpan Target
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daftar Target */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((t) => {
          const progress = Math.min((t.savedAmount / t.targetAmount) * 100, 100);
          const cat = categories.find((c) => c.id === t.category);
          const Icon = cat?.icon || TrendingUp;
          const isDone = progress >= 100;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${cat?.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cat?.name} • {t.deadline}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Progress Tabungan
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${
                      isDone
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatCurrency(t.savedAmount)}</span>
                  <span>{formatCurrency(t.targetAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleOpenModal(t)}
                  className="flex items-center gap-1 hover:text-blue-500 transition"
                >
                  <ArrowUpRight className="w-4 h-4" /> Tambah Tabungan
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      alert("Fitur edit target akan ditambahkan di versi berikutnya")
                    }
                    className="hover:text-yellow-500 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Tambah Tabungan */}
      <AnimatePresence>
        {showModal && selectedTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Tambah Tabungan untuk “{selectedTarget.name}”
              </h3>
              <input
                type="text"
                value={addAmount}
                onChange={(e) =>
                  setAddAmount(
                    new Intl.NumberFormat("id-ID").format(
                      e.target.value.replace(/[^\d]/g, "") || 0
                    )
                  )
                }
                placeholder="Nominal tambahan"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddSaving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
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
