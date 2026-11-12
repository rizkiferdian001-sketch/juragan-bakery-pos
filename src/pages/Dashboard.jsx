import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
    total_transaksi: 0,
    produk_aktif: 0,
    stok_menipis: 0,
    produk_menipis: [],
    chart_harian: [],
    top_produk: [],
    transaksi_terbaru: [],
  });
  const [loading, setLoading] = useState(true);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  // Format angka singkat di sumbu Y grafik (contoh: 50000 -> 50rb, 1500000 -> 1.5jt)
  const formatSingkat = (angka) => {
    if (angka >= 1000000) return `${(angka / 1000000).toFixed(1)}jt`;
    if (angka >= 1000) return `${Math.round(angka / 1000)}rb`;
    return angka;
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/dashboard-summary");
        setData(response.data);
      } catch (error) {
        console.error("Gagal memuat ringkasan dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard Finansial
        </h1>
        <p className="text-sm text-slate-500">
          Ringkasan omzet penjualan, biaya operasional, dan laba bersih toko.
        </p>
      </div>

      {/* 4 Kartu Statistik Real-time */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-white border rounded-lg border-slate-200">
          <p className="text-xs font-medium uppercase text-slate-400">
            Total Pendapatan
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : formatRupiah(data.total_pendapatan)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            {data.total_transaksi} transaksi selesai
          </p>
        </div>

        <div className="p-5 bg-white border rounded-lg border-slate-200">
          <p className="text-xs font-medium uppercase text-slate-400">
            Total Pengeluaran
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {loading ? "..." : formatRupiah(data.total_pengeluaran)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Biaya bahan baku & operasional
          </p>
        </div>

        <div className="p-5 bg-white border rounded-lg border-slate-200">
          <p className="text-xs font-medium uppercase text-slate-400">
            Laba Bersih
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${
              data.laba_bersih >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {loading ? "..." : formatRupiah(data.laba_bersih)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pendapatan dikurangi pengeluaran
          </p>
        </div>

        <div className="p-5 bg-white border rounded-lg border-slate-200">
          <p className="text-xs font-medium uppercase text-slate-400">
            Produk Aktif
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : data.produk_aktif}
          </p>
          <p className="mt-1 text-xs text-amber-600">
            {data.stok_menipis} produk stok menipis
          </p>
        </div>
      </div>

      {/* 2 Kolom Diagram Analitik */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Grafik Kiri: Pendapatan vs Pengeluaran 7 Hari Terakhir */}
        <div className="p-5 bg-white border rounded-lg border-slate-200 lg:col-span-7">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Pendapatan vs Pengeluaran
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan arus kas 7 hari terakhir
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.chart_harian}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatSingkat}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="pendapatan"
                  name="Pendapatan"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Kanan: 5 Produk Kue Terlaris */}
        <div className="p-5 bg-white border rounded-lg border-slate-200 lg:col-span-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              5 Produk Kue Terlaris
            </h2>
            <p className="text-xs text-slate-500">
              Berdasarkan jumlah item (pcs) terjual
            </p>
          </div>

          {data.top_produk.length === 0 ? (
            <div className="flex items-center justify-center text-sm h-72 text-slate-400">
              Belum ada data penjualan produk.
            </div>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.top_produk}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nama"
                    width={110}
                    tick={{ fontSize: 11, fill: "#334155" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} pcs`, "Terjual"]}
                    contentStyle={{
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="terjual"
                    name="Terjual"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Widget Peringatan Stok Menipis */}
      {data.produk_menipis?.length > 0 && (
        <div className="p-5 bg-white border rounded-lg border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-800">
                Peringatan Stok Kue Menipis / Habis
              </h2>
              <p className="text-xs text-slate-500">
                Segera lakukan produksi ulang atau tambah stok produk berikut:
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
              {data.produk_menipis.length} Item
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {data.produk_menipis.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3.5 py-2.5 border rounded-lg bg-amber-50/50 border-amber-200/70"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold truncate text-slate-900">
                    {item.nama_produk}
                  </p>
                  <p className="text-[11px] text-slate-500">{item.kategori}</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded shrink-0 ${
                    item.stok <= 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-200/80 text-amber-900"
                  }`}
                >
                  {item.stok <= 0 ? "HABIS" : `Sisa ${item.stok}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Transaksi Terbaru */}
      <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Transaksi Terbaru
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
              <tr>
                <th className="px-5 py-3 font-medium">ID Invoice</th>
                <th className="px-5 py-3 font-medium">Pelanggan</th>
                <th className="px-5 py-3 font-medium">Kasir</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.transaksi_terbaru.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-6 text-center text-slate-500"
                  >
                    Belum ada transaksi dari Kasir POS.
                  </td>
                </tr>
              ) : (
                data.transaksi_terbaru.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/75">
                    <td className="px-5 py-3.5 font-medium text-blue-600">
                      {trx.kode_invoice}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900">
                      {trx.nama_pelanggan}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {trx.user?.name || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {formatRupiah(trx.total_harga)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                        {trx.metode_pembayaran}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
