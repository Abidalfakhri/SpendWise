export default function DashboardCard({ title, value, accent = 'emerald', subtext }) {
  const accentMap = {
    emerald: 'from-emerald-600 to-emerald-500',
    blue: 'from-blue-600 to-blue-500',
    slate: 'from-slate-700 to-slate-600',
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${accentMap[accent] || accentMap.emerald}`} />
      <div className="mt-3 text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-500">{subtext}</div>}
    </div>
  );
} 