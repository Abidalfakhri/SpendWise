export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 text-center">
      SpendWise © {new Date().getFullYear()} — Atur keuanganmu menjadi lebih rapi.
    </footer>
  );
}