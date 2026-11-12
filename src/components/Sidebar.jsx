import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  FileBarChart2,
  MonitorSmartphone,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const user = JSON.parse(
    localStorage.getItem("user") || '{"name":"Administrator","role":"admin"}',
  );

  // Menu khusus Admin (Manager Area)
  const managerMenus = [
    {
      name: "Dashboard Finansial",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Kelola Karyawan", path: "/admin/karyawan", icon: Users },
    { name: "Kelola Produk & Stok", path: "/admin/produk", icon: Package },
    { name: "Pengeluaran Toko", path: "/admin/pengeluaran", icon: Receipt },
    { name: "Laporan", path: "/admin/laporan", icon: FileBarChart2 },
  ];

  // Menu Kasir (Bisa diakses Admin maupun Kasir)
  const kasirMenus = [
    { name: "Kasir POS", path: "/kasir", icon: MonitorSmartphone },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Brand Toko */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg">
              J
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-900">
                Juragan POS
              </p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">
                ● Internal Active
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daftar Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* GRUP 1: MANAGER AREA (Hanya dirender jika role === 'admin') */}
          {user.role === "admin" && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Manager Area
              </p>
              <div className="space-y-1">
                {managerMenus.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <NavLink
                      key={menu.path}
                      to={menu.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{menu.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRUP 2: KASIR & TRANSAKSI (Muncul untuk Admin & Kasir) */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Kasir & Transaksi
            </p>
            <div className="space-y-1">
              {kasirMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{menu.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
