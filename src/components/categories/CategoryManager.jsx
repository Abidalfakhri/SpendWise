import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Search, Filter, Edit2 } from "lucide-react";

export default function CategoryManager({ initialCategories, onChange }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState("#f43f5e");
  const [icon, setIcon] = useState("📁");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState(null);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return initialCategories.filter((cat) => {
      const matchSearch = cat.name.toLowerCase().includes(term);
      const matchType = filterType === "all" || cat.type === filterType;
      return matchSearch && matchType;
    });
  }, [initialCategories, searchTerm, filterType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const isDuplicate = initialCategories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingId
    );
    if (isDuplicate) {
      alert("Kategori sudah ada!");
      return;
    }

    let next;
    if (editingId) {
      next = initialCategories.map((c) =>
        c.id === editingId ? { ...c, name: trimmed, type, color, icon } : c
      );
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: trimmed,
        type,
        color,
        icon,
      };
      next = [...initialCategories, newCat];
    }

    onChange(next);
    setName("");
    setType("expense");
    setColor("#f43f5e");
    setIcon("📁");
    setEditingId(null);
  };

  const removeCategory = (id) => {
    const next = initialCategories.filter((c) => c.id !== id);
    onChange(next);
    if (editingId === id) {
      setEditingId(null);
      setName("");
      setType("expense");
      setColor("#f43f5e");
      setIcon("📁");
    }
  };

  return (
    <motion.div className="space-y-8">
      {/* FORM TAMBAH / EDIT */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-lg"
      >
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-xs text-slate-400">Nama Kategori</label>
          <input
            type="text"
            placeholder="Contoh: Makan, Gaji..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg bg-slate-800 text-white p-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Tipe</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg bg-slate-800 text-white p-2.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Warna</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 p-1 rounded-lg border border-slate-700 bg-slate-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Ikon</label>
          <div className="grid grid-cols-7 gap-2">
            {["📁", "💰", "🍽️", "🚌", "🛒", "🏠", "📈"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
                  icon === emoji
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            {editingId ? "Update" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setType("expense");
                setColor("#f43f5e");
                setIcon("📁");
              }}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition"
            >
              Batalkan
            </button>
          )}
        </div>
      </form>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 md:w-auto">
          <Filter className="text-slate-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg bg-slate-800 text-white p-2.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
      </div>

      {/* TABEL KATEGORI */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/70 text-slate-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nama Kategori</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredItems.map((cat, idx) => (
                <motion.tr
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`border-t border-slate-800 transition ${
                    idx % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/10"
                  } hover:bg-slate-800/50`}
                >
                  <td className="px-4 py-3 text-white flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-sm font-bold shadow"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon || "📁"}
                    </div>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cat.type === "income"
                          ? "bg-emerald-600/30 text-emerald-400"
                          : "bg-rose-600/30 text-rose-400"
                      }`}
                    >
                      {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setName(cat.name);
                        setType(cat.type);
                        setColor(cat.color);
                        setIcon(cat.icon || "");
                      }}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    Tidak ada kategori yang cocok.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
