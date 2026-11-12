import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 print:bg-white">
      {/* Sidebar Kiri (Sembunyi saat print) */}
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Area Kanan (Header + Konten) */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="print:hidden">
          <Header setIsOpen={setSidebarOpen} />
        </div>

        <main className="flex-1 w-full p-4 mx-auto max-w-7xl sm:p-6 lg:p-8 print:p-0 print:max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
