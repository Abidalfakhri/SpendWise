export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">

        {/* Brand */}
        <h3 className="text-slate-200 text-sm font-semibold tracking-wide">
          SpendWise
        </h3>

        {/* Navigation / Social (optional tetap aman) */}
        <div className="flex gap-6 text-xs text-slate-400">
          <a className="hover:text-blue-400 transition" href="#">Tentang</a>
          <a className="hover:text-blue-400 transition" href="#">Bantuan</a>
          <a className="hover:text-blue-400 transition" href="#">Kontak</a>
        </div>

        {/* Divider */}
        <div className="w-2/3 border-t border-slate-700/40"></div>

        {/* Copyright */}
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} SpendWise — Atur keuanganmu menjadi lebih rapi.
        </p>
      </div>
    </footer>
  );
}
