import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  MonitorSmartphone,
  ChefHat,
} from "lucide-react";
import api from "../services/api";

export default function Karyawan() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    no_telepon: "",
    role: "kasir",
    gaji: "",
    password: "",
  });

  // Cek apakah role yang dipilih butuh akses login (Admin / Kasir)
  const needsLoginAccess =
    formData.role === "admin" || formData.role === "kasir";

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data karyawan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setErrorMsg("");
    setFormData({
      name: "",
      email: "",
      no_telepon: "",
      role: "kasir",
      gaji: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp.id);
    setErrorMsg("");
    setFormData({
      name: emp.name,
      email: emp.email || "",
      no_telepon: emp.no_telepon || "",
      role: emp.role,
      gaji: emp.gaji || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: formData.name,
      no_telepon: formData.no_telepon,
      role: formData.role,
      gaji: Number(formData.gaji),
      email: formData.email || null,
      password: needsLoginAccess ? formData.password : null,
    };

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Gagal menyimpan data karyawan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus data karyawan "${name}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus karyawan.");
    }
  };

  const renderRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-md bg-blue-50">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </span>
      );
    }
    if (role === "kasir") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-md bg-emerald-50">
          <MonitorSmartphone className="w-3.5 h-3.5" />
          Kasir
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md capitalize bg-slate-100 text-slate-700">
        <ChefHat className="w-3.5 h-3.5" />
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Kelola Karyawan
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data staf toko, gaji bulanan, serta akun akses Admin & Kasir.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
            <tr>
              <th className="px-5 py-3 font-medium">Nama Karyawan</th>
              <th className="px-5 py-3 font-medium">No. Telepon</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Gaji</th>
              <th className="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  Memuat data karyawan...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  Belum ada data karyawan.
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {item.no_telepon || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {item.email || "-"}
                  </td>
                  <td className="px-5 py-3.5">{renderRoleBadge(item.role)}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {formatRupiah(item.gaji)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit"
                        className="p-1.5 text-slate-600 rounded-md hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {item.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Hapus"
                          className="p-1.5 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Tambah / Edit Karyawan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-lg border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs text-red-700 border rounded-lg bg-red-50 border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={formData.no_telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, no_telepon: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Role / Jabatan
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="kasir">Kasir (Login POS)</option>
                    <option value="admin">Admin (Login Full)</option>
                    <option value="baker">Baker / Pembuat Kue</option>
                    <option value="staff">Staff Toko / Packing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Email {needsLoginAccess ? "(Wajib)" : "(Opsional)"}
                  </label>
                  <input
                    type="email"
                    required={needsLoginAccess}
                    placeholder="nama@juragan.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Gaji (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="3000000"
                    value={formData.gaji}
                    onChange={(e) =>
                      setFormData({ ...formData, gaji: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Input Password HANYA muncul jika role = admin atau kasir */}
              {needsLoginAccess && (
                <div className="p-3 border rounded-lg bg-slate-50 border-slate-200">
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Password Login{" "}
                    {editingId && "(Kosongkan jika tidak diubah)"}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Diperlukan agar {formData.role} dapat masuk ke aplikasi.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Karyawan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
