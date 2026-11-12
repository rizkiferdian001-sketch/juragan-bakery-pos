import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Search,
  PackagePlus,
} from "lucide-react";
import api from "../services/api";

const KATEGORI_BAKERY = [
  "Roti Manis",
  "Cake & Tart",
  "Kue Kering",
  "Pastry & Croissant",
  "Minuman",
];

export default function Produk() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State untuk Modal Restock Cepat
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [restocking, setRestocking] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    nama_produk: "",
    kategori: "Roti Manis",
    harga: "",
    stok: "",
  });
  const [gambarFile, setGambarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nama_produk: "",
      kategori: "Roti Manis",
      harga: "",
      stok: "",
    });
    setGambarFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama_produk: item.nama_produk,
      kategori: item.kategori || "Roti Manis",
      harga: item.harga,
      stok: item.stok,
    });
    setGambarFile(null);
    setPreviewUrl(item.gambar_url || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append("nama_produk", formData.nama_produk);
    payload.append("kategori", formData.kategori);
    payload.append("harga", Number(formData.harga));
    payload.append("stok", Number(formData.stok));
    if (gambarFile) {
      payload.append("gambar", gambarFile);
    }

    try {
      if (editingId) {
        payload.append("_method", "PUT");
        await api.post(`/products/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRestock = (item) => {
    setRestockTarget(item);
    setRestockQty("");
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockTarget || Number(restockQty) < 1) return;

    setRestocking(true);
    try {
      await api.patch(`/products/${restockTarget.id}/restock`, {
        jumlah: Number(restockQty),
      });
      setRestockTarget(null);
      setRestockQty("");
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menambah stok.");
    } finally {
      setRestocking(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus produk "${nama}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert("Gagal menghapus produk.");
    }
  };

  const filteredProducts = products.filter((item) =>
    item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Kelola Produk & Stok
          </h1>
          <p className="text-sm text-slate-500">
            Atur katalog kue, foto produk, harga jual, dan stok harian bakery.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari nama kue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 pr-3 text-sm bg-white border rounded-lg pl-9 border-slate-200 focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Tabel Produk */}
      <div className="overflow-x-auto bg-white border rounded-lg border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
            <tr>
              <th className="px-5 py-3 font-medium">Produk</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Harga Jual</th>
              <th className="px-5 py-3 font-medium">Stok</th>
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
                  Memuat data produk...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  Belum ada data produk.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.gambar_url ? (
                        <img
                          src={item.gambar_url}
                          alt={item.nama_produk}
                          className="object-cover w-12 h-12 border rounded-lg border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-slate-100 text-slate-400 border-slate-200 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <span className="font-medium text-slate-900">
                        {item.nama_produk}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {formatRupiah(item.harga)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          item.stok <= 0
                            ? "bg-red-50 text-red-600"
                            : item.stok <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.stok} pcs
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenRestock(item)}
                        title="Tambah Stok Harian"
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>+ Stok</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit"
                        className="p-1.5 text-slate-600 rounded-md hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_produk)}
                        title="Hapus"
                        className="p-1.5 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-lg border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit Produk Kue" : "Tambah Produk Kue"}
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
                <label className="block mb-1.5 text-xs font-medium text-slate-700">
                  Foto Produk (Opsional, maks. 2MB)
                </label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-cover w-16 h-16 border rounded-lg border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-16 h-16 border border-dashed rounded-lg bg-slate-50 text-slate-400 border-slate-300 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Nama Kue / Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bolen Pisang Cokelat Keju"
                  value={formData.nama_produk}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_produk: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Kategori Bakery
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                >
                  {KATEGORI_BAKERY.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="35000"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Stok Tersedia
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="20"
                    value={formData.stok}
                    onChange={(e) =>
                      setFormData({ ...formData, stok: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
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
                  {submitting
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mini Restock Cepat */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-sm bg-white border rounded-lg shadow-lg border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Tambah Stok Harian
                </h3>
                <p className="text-xs text-slate-500">
                  {restockTarget.nama_produk} (Stok saat ini:{" "}
                  <strong>{restockTarget.stok} pcs</strong>)
                </p>
              </div>
              <button
                onClick={() => setRestockTarget(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-5 space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-slate-700">
                  Jumlah Tambahan Stok (pcs)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  autoFocus
                  placeholder="Contoh: 20"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
                {Number(restockQty) > 0 && (
                  <p className="mt-1.5 text-xs text-emerald-600">
                    Total stok baru:{" "}
                    <strong>
                      {restockTarget.stok + Number(restockQty)} pcs
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={restocking}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {restocking ? "Menambah..." : "Tambah Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
