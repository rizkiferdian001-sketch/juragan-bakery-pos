import { useState, useEffect } from "react";
import { Plus, Trash2, X, Receipt } from "lucide-react";
import api from "../services/api";

export default function Pengeluaran() {
  const [expenses, setExpenses] = useState([]);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    keterangan: "",
    kategori: "Bahan Baku",
    nominal: "",
    tanggal: today,
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/expenses");
      setExpenses(response.data.data);
      setTotalPengeluaran(response.data.total);
    } catch (error) {
      console.error("Gagal memuat pengeluaran:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/expenses", {
        ...formData,
        nominal: Number(formData.nominal),
      });
      setIsModalOpen(false);
      setFormData({
        keterangan: "",
        kategori: "Bahan Baku",
        nominal: "",
        tanggal: today,
      });
      fetchExpenses();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mencatat pengeluaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, keterangan) => {
    if (!window.confirm(`Hapus catatan pengeluaran "${keterangan}"?`)) return;

    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Pengeluaran Toko
          </h1>
          <p className="text-sm text-slate-500">
            Catat biaya bahan baku kue, kemasan, dan operasional toko.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pengeluaran</span>
        </button>
      </div>

      {/* Kartu Ringkasan Total Biaya */}
      <div className="flex items-center justify-between max-w-sm p-4 bg-white border rounded-lg border-slate-200">
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">
            Total Biaya Operasional
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      {/* Tabel Riwayat Pengeluaran */}
      <div className="overflow-x-auto bg-white border rounded-lg border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
            <tr>
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Keterangan</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Nominal</th>
              <th className="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  Memuat data pengeluaran...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  Belum ada catatan pengeluaran toko.
                </td>
              </tr>
            ) : (
              expenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75">
                  <td className="px-5 py-3.5 text-slate-600">{item.tanggal}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {item.keterangan}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-red-600">
                    {formatRupiah(item.nominal)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(item.id, item.keterangan)}
                      title="Hapus"
                      className="p-1.5 text-slate-500 rounded-md hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Catat Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-lg border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Catat Pengeluaran Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Keterangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Tepung Terigu & Mentega 5kg"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Kemasan & Box">Kemasan & Box</option>
                    <option value="Listrik & Gas">Listrik & Gas</option>
                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="100000"
                  value={formData.nominal}
                  onChange={(e) =>
                    setFormData({ ...formData, nominal: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

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
                  {submitting ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
