import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Folder } from "lucide-react";
import baseCategories from "../data/dummyCategories";
import CategoryManager from "../components/categories/CategoryManager";

export default function Categories() {
  const [categories, setCategories] = useState(baseCategories);
  const [showManager, setShowManager] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl">
            <Folder className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manajemen Kategori
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola kategori pengeluaran & pemasukan Anda dengan mudah.
            </p>
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowManager(!showManager)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          {showManager ? "Tutup Panel" : "Kelola Kategori"}
        </motion.button>
      </div>

      {/* GRID KATEGORI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 250 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col justify-between border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{
                  backgroundColor: cat.color || "#10b981",
                }}
              >
                {cat.icon || "📁"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* PANEL KATEGORI */}
      {showManager && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-12 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <CategoryManager
            initialCategories={categories}
            onChange={setCategories}
          />
        </motion.div>
      )}
    </div>
  );
}