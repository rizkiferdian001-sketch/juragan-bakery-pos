import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Header({ setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || '{"name":"Administrator"}',
  );

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-slate-500">
          Selamat datang kembali, {user.name}
        </p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white bg-slate-800 rounded-full">
            {user.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user.name}
          </span>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={handleLogout}
          title="Keluar"
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
