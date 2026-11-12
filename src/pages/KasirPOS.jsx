import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Printer,
  X,
  Image as ImageIcon,
} from "lucide-react";
import api from "../services/api";

const KATEGORI_BAKERY = [
  "Semua",
  "Roti Manis",
  "Cake & Tart",
  "Kue Kering",
  "Pastry & Croissant",
  "Minuman",
];

export default function KasirPOS() {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || '{"name":"Kasir","role":"kasir"}',
  );

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form Pembayaran
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("Tunai");
  const [uangDibayar, setUangDibayar] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Struk setelah transaksi berhasil
  const [receiptData, setReceiptData] = useState(null);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get("/products");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat daftar produk:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchSearch = item.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchKategori =
      selectedKategori === "Semua" || item.kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  const addToCart = (product) => {
    if (product.stok <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stok) {
          alert(`Stok "${product.nama_produk}" hanya tersisa ${product.stok}.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (newQty > item.stok) {
              alert(`Maksimal stok tersedia: ${item.stok}`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalBelanja = cart.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0,
  );
  const kembalian = Number(uangDibayar) - totalBelanja;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Keranjang belanja masih kosong.");
      return;
    }

    if (Number(uangDibayar) < totalBelanja) {
      alert("Nominal uang dibayar kurang dari total belanja!");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nama_pelanggan: namaPelanggan.trim() || "Pelanggan Umum",
        metode_pembayaran: metodePembayaran,
        uang_dibayar: Number(uangDibayar),
        items: cart.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      };

      const response = await api.post("/transactions", payload);

      setReceiptData(response.data.data);
      setCart([]);
      setNamaPelanggan("");
      setUangDibayar("");
      setMetodePembayaran("Tunai");

      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memproses transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="flex flex-col min-h-screen bg-slate-50 print:bg-white">
      {/* Header Topbar Kasir (Sembunyi saat print) */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6 print:hidden">
        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg">
              J
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none text-slate-900">
                Juragan POS
              </h1>
              <p className="mt-1 text-[11px] text-slate-500">
                Kasir: {user.name}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Konten Utama (Sembunyi saat print) */}
      <div className="grid flex-1 w-full grid-cols-1 gap-6 p-4 mx-auto max-w-7xl lg:grid-cols-12 sm:p-6 print:hidden">
        {/* KOLOM KIRI: Katalog Kue */}
        <div className="space-y-4 lg:col-span-7">
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama kue atau produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm bg-white border rounded-lg border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {KATEGORI_BAKERY.map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    selectedKategori === kat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {loadingProducts ? (
            <div className="p-10 text-sm text-center bg-white border rounded-lg text-slate-500 border-slate-200">
              Memuat katalog produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-sm text-center bg-white border rounded-lg text-slate-500 border-slate-200">
              Produk tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredProducts.map((product) => {
                const habis = product.stok <= 0;
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={habis}
                    onClick={() => addToCart(product)}
                    className={`flex flex-col justify-between p-3 text-left bg-white border rounded-lg transition-all ${
                      habis
                        ? "opacity-50 cursor-not-allowed border-slate-200"
                        : "border-slate-200 hover:border-blue-600 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    <div>
                      {product.gambar_url ? (
                        <img
                          src={product.gambar_url}
                          alt={product.nama_produk}
                          className="object-cover w-full h-24 mb-2.5 rounded-md border border-slate-100"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-24 mb-2.5 rounded-md bg-slate-100 text-slate-400">
                          <ImageIcon className="w-5 h-5 mb-1" />
                          <span className="text-[10px]">Tanpa Foto</span>
                        </div>
                      )}

                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {product.nama_produk}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.kategori || "Roti Manis"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
                      <span className="text-sm font-bold text-blue-600">
                        {formatRupiah(product.harga)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                          habis
                            ? "bg-red-50 text-red-600"
                            : product.stok <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {habis ? "Habis" : `Stok: ${product.stok}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Keranjang & Checkout */}
        <div className="lg:col-span-5">
          <div className="sticky flex flex-col bg-white border rounded-lg top-22 border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Keranjang Pesanan
                </h2>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-medium text-blue-700 rounded-full bg-blue-50">
                {cart.reduce((sum, i) => sum + i.qty, 0)} Item
              </span>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto max-h-72">
              {cart.length === 0 ? (
                <p className="py-8 text-sm text-center text-slate-400">
                  Klik produk di sebelah kiri untuk menambahkan pesanan.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900">
                        {item.nama_produk}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRupiah(item.harga)} x {item.qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 border rounded text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-xs font-semibold text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 border rounded text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 ml-1 text-red-500 rounded hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleCheckout}
              className="p-5 space-y-4 border-t bg-slate-50/75 border-slate-200"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    placeholder="Pelanggan Umum"
                    value={namaPelanggan}
                    onChange={(e) => setNamaPelanggan(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700">
                    Metode Bayar
                  </label>
                  <select
                    value={metodePembayaran}
                    onChange={(e) => {
                      setMetodePembayaran(e.target.value);
                      if (e.target.value !== "Tunai" && totalBelanja > 0) {
                        setUangDibayar(String(totalBelanja));
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    Uang Dibayar (Rp)
                  </label>
                  {totalBelanja > 0 && (
                    <button
                      type="button"
                      onClick={() => setUangDibayar(String(totalBelanja))}
                      className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      Uang Pas ({formatRupiah(totalBelanja)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min={totalBelanja}
                  placeholder="0"
                  value={uangDibayar}
                  onChange={(e) => setUangDibayar(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 space-y-1.5 border-t border-slate-200">
                <div className="flex justify-between text-sm font-semibold text-slate-900">
                  <span>Total Tagihan</span>
                  <span className="text-base text-blue-600">
                    {formatRupiah(totalBelanja)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Kembalian</span>
                  <span
                    className={`font-semibold ${
                      uangDibayar && kembalian >= 0
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {uangDibayar && kembalian >= 0
                      ? formatRupiah(kembalian)
                      : "Rp 0"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Memproses Transaksi..." : "Proses Pembayaran"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Struk Pembayaran Berhasil (Siap Cetak Thermal Bersih) */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 print:static print:bg-white print:p-0 print:block">
          <div className="w-full max-w-sm bg-white border rounded-lg shadow-lg border-slate-200 print:max-w-[80mm] print:mx-auto print:border-none print:shadow-none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-semibold text-slate-900">
                  Transaksi Berhasil
                </h3>
              </div>
              <button
                onClick={() => setReceiptData(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm print:p-2">
              <div className="pb-3 text-center border-b border-dashed border-slate-300">
                <p className="font-bold text-slate-900">JURAGAN BAKERY & POS</p>
                <p className="text-xs text-slate-500">
                  {receiptData.kode_invoice}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pelanggan: {receiptData.nama_pelanggan}
                </p>
                <p className="text-[11px] text-slate-400">
                  Kasir: {receiptData.user?.name || user.name}
                </p>
              </div>

              <div className="pb-3 space-y-2 border-b border-dashed border-slate-300">
                {receiptData.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.product?.nama_produk}
                      </p>
                      <p className="text-slate-500">
                        {item.qty} x {formatRupiah(item.harga_satuan)}
                      </p>
                    </div>
                    <span className="font-medium text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatRupiah(receiptData.total_harga)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Bayar ({receiptData.metode_pembayaran})</span>
                  <span>{formatRupiah(receiptData.uang_dibayar)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Kembalian</span>
                  <span>{formatRupiah(receiptData.kembalian)}</span>
                </div>
              </div>

              <p className="hidden pt-3 text-center border-t border-dashed border-slate-300 text-[11px] text-slate-500 print:block">
                Terima kasih telah berbelanja di Juragan Bakery!
              </p>

              <div className="flex gap-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptData(null)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Transaksi Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
