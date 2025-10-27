
// Format seragam: YYYY-MM-DD
const dummyTransactions = [
  // === Pemasukan (Income) ===
  { id: 1, type: "income", category: "Gaji", amount: 15000000, date: "2025-10-01", description: "Gaji Bulanan" },
  { id: 2, type: "income", category: "Investasi", amount: 2200000, date: "2025-10-03", description: "Dividen saham" },
  { id: 3, type: "income", category: "Freelance", amount: 1800000, date: "2025-10-10", description: "Proyek desain UI" },
  { id: 4, type: "income", category: "Bonus", amount: 1250000, date: "2025-10-15", description: "Bonus performa kerja" },

  // === Pengeluaran (Expense) ===
  { id: 5, type: "expense", category: "Makanan", amount: 3200000, date: "2025-10-02", description: "Belanja mingguan" },
  { id: 6, type: "expense", category: "Transportasi", amount: 2500000, date: "2025-10-04", description: "Bensin dan parkir" },
  { id: 7, type: "expense", category: "Tagihan", amount: 1200000, date: "2025-10-05", description: "Listrik & Air" },
  { id: 8, type: "expense", category: "Kesehatan", amount: 1000000, date: "2025-10-07", description: "Obat dan vitamin" },
  { id: 9, type: "expense", category: "Hiburan", amount: 650000, date: "2025-10-09", description: "Langganan streaming dan bioskop" },
  { id: 10, type: "expense", category: "Belanja", amount: 770000, date: "2025-10-11", description: "Online shop" },
  { id: 11, type: "expense", category: "Pendidikan", amount: 900000, date: "2025-10-12", description: "Kursus online React" },
  { id: 12, type: "expense", category: "Donasi", amount: 500000, date: "2025-10-18", description: "Sumbangan sosial" },
];

// ========================================
// Dummy Categories untuk budget vs aktual & detail kategori
// ========================================
export const dummyCategories = [
  { id: "cat-1", name: "Makanan", type: "expense", value: 3200000, target: 3000000 },
  { id: "cat-2", name: "Transportasi", type: "expense", value: 2500000, target: 2000000 },
  { id: "cat-3", name: "Tagihan", type: "expense", value: 1200000, target: 1300000 },
  { id: "cat-4", name: "Kesehatan", type: "expense", value: 1000000, target: 800000 },
  { id: "cat-5", name: "Hiburan", type: "expense", value: 650000, target: 700000 },
  { id: "cat-6", name: "Belanja", type: "expense", value: 770000, target: 750000 },
  { id: "cat-7", name: "Pendidikan", type: "expense", value: 900000, target: 900000 },
  { id: "cat-8", name: "Donasi", type: "expense", value: 500000, target: 500000 },
  { id: "cat-9", name: "Gaji", type: "income", value: 9500000, target: 9500000 },
  { id: "cat-10", name: "Bonus", type: "income", value: 1250000, target: 1000000 },
  { id: "cat-11", name: "Freelance", type: "income", value: 1800000, target: 1500000 },
  { id: "cat-12", name: "Investasi", type: "income", value: 2200000, target: 2000000 },
];

// ========================================
// Fungsi utilitas untuk laporan
// ========================================

// Hitung total income, expense, dan saldo
export function getSummary(transactions) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  return { income, expense, balance };
}

// Kelompokkan transaksi berdasarkan kategori (untuk PieChart/BarChart)
export function groupByCategory(transactions, type) {
  const filtered = transactions.filter((t) => t.type === type);
  const result = {};

  filtered.forEach((t) => {
    if (!result[t.category]) result[t.category] = 0;
    result[t.category] += t.amount;
  });

  return Object.entries(result).map(([category, total]) => ({
    name: category,
    value: total,
    target:
      dummyCategories.find((cat) => cat.name === category && cat.type === type)?.target ||
      total,
  }));
}

// Kelompokkan transaksi berdasarkan tanggal (untuk AreaChart arus kas)
export function groupByDate(transactions) {
  const result = {};

  transactions.forEach((t) => {
    const date = t.date;
    if (!result[date]) result[date] = { income: 0, expense: 0 };
    result[date][t.type] += t.amount;
  });

  return Object.entries(result).map(([date, { income, expense }]) => ({
    date,
    bulan: new Date(date).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    income,
    expense,
    saving: income - expense,
  }));
}

// Posisi keuangan
export const financialPosition = {
  aset: 38000000,
  liabilitas: 12000000,
};


export const dataPerbandingan = dummyCategories
  .filter((cat) => cat.type === "expense")
  .map((cat) => ({
    category: cat.name,
    budget: cat.target,
    actual: cat.value,
  }));


export const dataRadar = [
  { subject: "Tabungan", A: 80 },
  { subject: "Hutang", A: 60 },
  { subject: "Efisiensi", A: 75 },
  { subject: "Investasi", A: 70 },
  { subject: "Diversifikasi", A: 65 },
];

export default dummyTransactions;
