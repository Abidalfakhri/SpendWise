import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPage from "./pages/DashboardPage";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Mutasi from "./pages/Mutasi";
import Dompet from "./pages/Dompet";
import TargetKeuangan from './pages/TargetKeuangan';
import Laporan from './pages/Laporan';

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Halaman Publik */}
            <Route path="/" element={<Landing />} />

            {/* Halaman Autentikasi */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Halaman Dashboard (Setelah Login) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/mutasi" element={<Mutasi />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/dompet" element={<Dompet />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/target-keuangan" element={<TargetKeuangan />} />
              <Route path="/laporan" element={<Laporan />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
