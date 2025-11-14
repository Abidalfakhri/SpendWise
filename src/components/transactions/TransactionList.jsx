import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function TransactionList({ items, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-400 italic py-6">
          Belum ada transaksi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Daftar Transaksi
      </h2>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((tx) => (
          <li
            key={tx.id}
            className="flex justify-between items-center py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 px-2 rounded-lg transition"
          >
            {/* Kiri */}
            <div className="flex items-center gap-3">
              {tx.type === "income" ? (
                <ArrowUpCircle className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-red-500" />
              )}

              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {tx.category}
                </p>

                {tx.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tx.description}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">{tx.date}</p>
              </div>
            </div>

            {/* Kanan */}
            <div className="flex flex-col items-end">
              <span
                className={`font-semibold ${
                  tx.type === "income" ? "text-green-500" : "text-red-500"
                }`}
              >
                {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
              </span>

              <button
                onClick={() => onDelete(tx.id)}
                className="text-gray-400 hover:text-red-500 mt-1 transition flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
