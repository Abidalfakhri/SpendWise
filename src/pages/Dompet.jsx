import { useState } from "react";
import {
  Wallet,
  PlusCircle,
  CreditCard,
  ArrowLeftRight,
  Edit,
  Trash2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Dompet() {
  const [wallets, setWallets] = useState([
    {
      id: 1,
      name: "Dompet Tunai",
      type: "Cash",
      balance: 1250000,
      color: "bg-amber-500",
    },
    {
      id: 2,
      name: "Bank BCA",
      type: "Rekening Bank",
      balance: 5800000,
      color: "bg-blue-600",
    },
    {
      id: 3,
      name: "DANA",
      type: "E-Wallet",
      balance: 300000,
      color: "bg-sky-500",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: "",
    type: "",
    balance: "",
    color: "bg-gray-500",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Fungsi formatting nominal input (dengan koma)
  const handleBalanceInput = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(rawValue || 0);
    setNewWallet({ ...newWallet, balance: formatted });
  };

  const handleAddWallet = () => {
    const parsedBalance = parseFloat(
      newWallet.balance.replace(/\./g, "").replace(",", ".")
    );

    if (!newWallet.name || !newWallet.type || !parsedBalance) {
      setSuccessMsg("Lengkapi semua data akun!");
      return;
    }

    const walletData = {
      ...newWallet,
      id: Date.now(),
      balance: parsedBalance,
    };

    setWallets([...wallets, walletData]);
    setNewWallet({ name: "", type: "", balance: "", color: "bg-gray-500" });
    setShowForm(false);
    setSuccessMsg("Akun berhasil ditambahkan!");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleDelete = (id) => {
    setWallets(wallets.filter((w) => w.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dompet & Akun Keuangan
          </h1>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition-all"
        >
          {showForm ? (
            <>
              <XCircle className="w-5 h-5" /> Batal
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" /> Tambah Akun
            </>
          )}
        </button>
      </div>

      {/* Total Saldo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg">
        <div>
          <p className="text-sm opacity-80">Total Saldo</p>
          <h2 className="text-4xl font-extrabold mt-1">
            {formatCurrency(totalBalance)}
          </h2>
        </div>
        <CreditCard className="w-12 h-12 opacity-80" />
      </div>

      {/* Notifikasi */}
      {successMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            successMsg.includes("berhasil")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {successMsg.includes("berhasil") ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {successMsg}
        </div>
      )}

      {/* Form Tambah Akun */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md animate-fadeIn">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">
            Tambah Akun Keuangan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nama akun (mis. BCA, DANA, Dompet)"
              value={newWallet.name}
              onChange={(e) =>
                setNewWallet({ ...newWallet, name: e.target.value })
              }
              className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />

            <select
              value={newWallet.type}
              onChange={(e) =>
                setNewWallet({ ...newWallet, type: e.target.value })
              }
              className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">Pilih jenis akun</option>
              <option value="Cash">Cash</option>
              <option value="Rekening Bank">Rekening Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Investasi">Investasi</option>
            </select>

            <input
              type="text"
              placeholder="Saldo awal"
              value={newWallet.balance}
              onChange={handleBalanceInput}
              className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={handleAddWallet}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Simpan Akun
            </button>
          </div>
        </div>
      )}

      {/* Daftar Akun */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${wallet.color}`}
                >
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {wallet.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {wallet.type}
                  </p>
                </div>
              </div>

              <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-3">
                {formatCurrency(wallet.balance)}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
              <button
                className="flex items-center gap-1 hover:text-blue-500 transition"
                onClick={() =>
                  alert(`Transfer antar akun (${wallet.name}) belum tersedia`)
                }
              >
                <ArrowLeftRight className="w-4 h-4" /> Transfer
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert("Fitur edit belum diimplementasi")}
                  className="hover:text-yellow-500 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  className="hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
