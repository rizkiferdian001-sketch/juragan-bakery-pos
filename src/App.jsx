import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produk from "./pages/Produk";
import Karyawan from "./pages/Karyawan";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";
import KasirPOS from "./pages/KasirPOS";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Publik */}
        <Route path="/login" element={<Login />} />

        {/* RUTE KHUSUS ADMIN (Kasir tidak bisa masuk) */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="karyawan" element={<Karyawan />} />
            <Route path="produk" element={<Produk />} />
            <Route path="pengeluaran" element={<Pengeluaran />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>
        </Route>

        {/* RUTE KASIR POS (Bisa diakses Admin maupun Kasir) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "kasir"]} />}>
          <Route path="/kasir" element={<KasirPOS />} />
        </Route>

        {/* Redirect otomatis jika akses root "/" atau URL nyasar */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
