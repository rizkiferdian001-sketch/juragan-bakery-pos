import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const user = response.data.user;

      // Simpan token dan data user ke localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Arahkan halaman sesuai role user
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/kasir");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-sm p-6 bg-white border rounded-lg border-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Juragan<span className="text-blue-600">POS</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mengelola sistem toko
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs text-red-700 border rounded-lg bg-red-50 border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@juragan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
