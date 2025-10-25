import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <Outlet />
    </div>
  );
}