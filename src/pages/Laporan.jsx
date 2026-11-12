import { useState, useEffect } from "react";
import {
  Printer,
  Eye,
  X,
  Calendar,
  FileBarChart2,
  Receipt,
  Scale,
} from "lucide-react";
import api from "../services/api";

export default function Laporan() {
  const [activeTab, setActiveTab] = useState("penjualan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTrx, setSelectedTrx] = useState(null);

  const [reportData, setReportData] = useState({
    transactions: [],
    expenses: [],
    summary: {
      total_omzet: 0,
      total_transaksi: 0,
      total_pengeluaran: 0,
      laba_bersih: 0,
      rekap_metode: { Tunai: 0, QRIS: 0, Transfer: 0 },
      rekap_kategori_pengeluaran: {},
    },
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const formatTanggal = (isoString) => {
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`/financial-report${query}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Gagal memuat laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((startDate && endDate) || (!startDate && !endDate)) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const judulLaporan = {
    penjualan: "LAPORAN PENJUALAN KASIR",
    pengeluaran: "LAPORAN PENGELUARAN OPERASIONAL",
    labarugi: "LAPORAN LABA RUGI TOKO",
  };

  return (
    <div className="space-y-6">
      {/* KOP SURAT KHUSUS SAAT DICETAK / SAVE AS PDF */}
      <div className="hidden mb-6 text-center print:block">
        <div className="pb-3 border-b-2 border-slate-800">
          <h1 className="text-xl font-bold tracking-wide text-slate-900">
            JURAGAN BAKERY & PASTRY
          </h1>
          <p className="text-xs text-slate-600">
            Sistem Manajemen & Point of Sale Toko Kue
          </p>
        </div>

        <div className="mt-4">
          <h2 className="text-base font-bold text-slate-900">
            {judulLaporan[activeTab]}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Periode:{" "}
            {startDate && endDate
              ? `${startDate} s/d ${endDate}`
              : "Semua Waktu"}{" "}
            | Dicetak pada: {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* HEADER & TOMBOL CETAK */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Laporan & Cetak Pembukuan
          </h1>
          <p className="text-sm text-slate-500">
            Filter periode transaksi, rekap closing kasir, pengeluaran, dan laba
            rugi.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* TAB JENIS LAPORAN & FILTER TANGGAL */}
      <div className="flex flex-col justify-between gap-4 p-4 bg-white border rounded-lg border-slate-200 lg:flex-row lg:items-center print:hidden">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("penjualan")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
              activeTab === "penjualan"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <FileBarChart2 className="w-4 h-4" />
            <span>Laporan Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab("pengeluaran")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
              activeTab === "pengeluaran"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Laporan Pengeluaran</span>
          </button>

          <button
            onClick={() => setActiveTab("labarugi")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
              activeTab === "labarugi"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Laporan Laba Rugi</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>Periode:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
          />
          <span className="text-xs text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
          />
          {(startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: LAPORAN PENJUALAN */}
      {activeTab === "penjualan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="p-4 bg-white border rounded-lg border-slate-200">
              <p className="text-[11px] font-medium uppercase text-slate-400">
                Total Omzet ({reportData.summary.total_transaksi} Struk)
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatRupiah(reportData.summary.total_omzet)}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg border-slate-200">
              <p className="text-[11px] font-medium uppercase text-slate-400">
                Total Tunai (Cash)
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-600">
                {formatRupiah(reportData.summary.rekap_metode?.Tunai)}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg border-slate-200">
              <p className="text-[11px] font-medium uppercase text-slate-400">
                Total QRIS
              </p>
              <p className="mt-1 text-lg font-bold text-blue-600">
                {formatRupiah(reportData.summary.rekap_metode?.QRIS)}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg border-slate-200">
              <p className="text-[11px] font-medium uppercase text-slate-400">
                Total Transfer Bank
              </p>
              <p className="mt-1 text-lg font-bold text-indigo-600">
                {formatRupiah(reportData.summary.rekap_metode?.Transfer)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border rounded-lg border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-medium">No. Invoice</th>
                  <th className="px-5 py-3 font-medium">Waktu</th>
                  <th className="px-5 py-3 font-medium">Pelanggan</th>
                  <th className="px-5 py-3 font-medium">Kasir</th>
                  <th className="px-5 py-3 font-medium">Metode</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium text-right print:hidden">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Memuat laporan...
                    </td>
                  </tr>
                ) : reportData.transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  reportData.transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/75">
                      <td className="px-5 py-3 font-medium text-blue-600">
                        {trx.kode_invoice}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatTanggal(trx.created_at)}
                      </td>
                      <td className="px-5 py-3 text-slate-900">
                        {trx.nama_pelanggan}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {trx.user?.name || "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700">
                          {trx.metode_pembayaran}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {formatRupiah(trx.total_harga)}
                      </td>
                      <td className="px-5 py-3 text-right print:hidden">
                        <button
                          onClick={() => setSelectedTrx(trx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Struk
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN PENGELUARAN */}
      {activeTab === "pengeluaran" && (
        <div className="space-y-4">
          <div className="max-w-sm p-4 bg-white border rounded-lg border-slate-200">
            <p className="text-xs font-medium uppercase text-slate-400">
              Total Biaya Operasional Periode Ini
            </p>
            <p className="mt-1 text-xl font-bold text-red-600">
              {formatRupiah(reportData.summary.total_pengeluaran)}
            </p>
          </div>

          <div className="overflow-x-auto bg-white border rounded-lg border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Keterangan</th>
                  <th className="px-5 py-3 font-medium">Kategori</th>
                  <th className="px-5 py-3 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Tidak ada pengeluaran pada periode ini.
                    </td>
                  </tr>
                ) : (
                  reportData.expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="px-5 py-3 text-slate-600">
                        {exp.tanggal}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {exp.keterangan}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {exp.kategori}
                      </td>
                      <td className="px-5 py-3 font-semibold text-right text-red-600">
                        {formatRupiah(exp.nominal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LAPORAN LABA RUGI */}
      {activeTab === "labarugi" && (
        <div className="max-w-2xl p-6 space-y-6 bg-white border rounded-lg border-slate-200 print:max-w-none print:border-none print:p-0">
          <div className="print:hidden">
            <h3 className="text-base font-semibold text-slate-900">
              Ringkasan Laba Rugi Toko
            </h3>
            <p className="text-xs text-slate-500">
              Perhitungan otomatis pendapatan kotor dikurangi beban operasional.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
              1. Pendapatan Usaha
            </p>
            <div className="flex justify-between py-2 text-sm border-b border-slate-100">
              <span className="text-slate-700">
                Penjualan Produk Bakery ({reportData.summary.total_transaksi}{" "}
                transaksi)
              </span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(reportData.summary.total_omzet)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
              2. Beban & Pengeluaran Operasional
            </p>
            {Object.keys(reportData.summary.rekap_kategori_pengeluaran || {})
              .length === 0 ? (
              <p className="py-2 text-xs text-slate-500">
                Tidak ada pengeluaran tercatat.
              </p>
            ) : (
              Object.entries(reportData.summary.rekap_kategori_pengeluaran).map(
                ([kategori, total]) => (
                  <div
                    key={kategori}
                    className="flex justify-between py-1.5 text-sm border-b border-slate-100"
                  >
                    <span className="text-slate-600">Biaya {kategori}</span>
                    <span className="text-red-600">
                      - {formatRupiah(total)}
                    </span>
                  </div>
                ),
              )
            )}
            <div className="flex justify-between pt-2 text-sm font-semibold">
              <span className="text-slate-800">Total Pengeluaran</span>
              <span className="text-red-600">
                - {formatRupiah(reportData.summary.total_pengeluaran)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-900">
                LABA / RUGI BERSIH
              </p>
              <p className="text-xs text-slate-500">
                Pendapatan dikurangi total biaya
              </p>
            </div>
            <p
              className={`text-xl font-bold ${
                reportData.summary.laba_bersih >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatRupiah(reportData.summary.laba_bersih)}
            </p>
          </div>
        </div>
      )}

      {/* MODAL DETAIL STRUK */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 print:hidden">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-lg border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedTrx.kode_invoice}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatTanggal(selectedTrx.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrx(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  Pelanggan: <strong>{selectedTrx.nama_pelanggan}</strong>
                </span>
                <span>
                  Kasir: <strong>{selectedTrx.user?.name}</strong>
                </span>
              </div>

              <div className="border-t border-b divide-y border-slate-200 divide-slate-100">
                {selectedTrx.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.product?.nama_produk}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.qty} x {formatRupiah(item.harga_satuan)}
                      </p>
                    </div>
                    <p className="font-medium text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total Belanja</span>
                  <span>{formatRupiah(selectedTrx.total_harga)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dibayar ({selectedTrx.metode_pembayaran})</span>
                  <span>{formatRupiah(selectedTrx.uang_dibayar)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Kembalian</span>
                  <span>{formatRupiah(selectedTrx.kembalian)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
