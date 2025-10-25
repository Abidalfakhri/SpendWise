import { useState } from 'react';
import dummyTransactions from '@/data/dummyTransactions';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';

export default function Transactions() {
  const [items, setItems] = useState(dummyTransactions);

  const handleAdd = (tx) => setItems((prev) => [tx, ...prev]);
  const handleDelete = (id) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="space-y-6 bg-slate-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center text-white">Transaksi</h2>
        <TransactionForm onAdd={handleAdd} />
        <TransactionList items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}