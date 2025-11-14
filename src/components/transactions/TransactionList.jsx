import { useState } from 'react';
import dummyCategories from '@/data/dummyCategories';
import Button from '@/components/common/Button';

const formatNumberWithDots = (value) => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const formatted = formatNumberWithDots(value);
      setForm((prev) => ({ ...prev, amount: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTx = {
      ...form,
      id: Date.now(),
      amount: parseInt(form.amount.replace(/\./g, '')),
    };
    onAdd(newTx);
    setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
  };

  const filteredCategories = dummyCategories.filter((cat) => cat.type === form.type);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-gray-900 p-6 rounded-2xl shadow-lg text-white border border-gray-800 transition-all duration-300"
    >
      <h2 className="text-lg font-semibold text-center mb-2 tracking-wide">Tambah Transaksi</h2>

      <div className="flex gap-3">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg w-1/3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg flex-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="">Pilih Kategori</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Jumlah (contoh: 100.000)"
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg w-full text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />

        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Deskripsi (opsional)"
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-semibold transition duration-200"
      >
        + Tambah Transaksi
      </Button>
    </form>
  );
} 