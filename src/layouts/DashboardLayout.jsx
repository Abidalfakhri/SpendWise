import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import Footer from '@/components/Layout/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar tampil hanya jika sidebarOpen === true */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Konten utama */}
      <div className="flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {!user && (
            <div className="mb-4 rounded bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm">
              Kamu sedang login sebagai tamu. Data yang ditampilkan adalah dummy.
            </div>
          )}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}