import { useCallback, useEffect, useState } from "react";
import { Trash2, Wallet, CheckCircle2, Clock } from "lucide-react";
import api from "../services/api";

export default function OvertimeHistoryModal({
  isOpen,
  onClose,
  employee,
  refreshTrigger = 0,
}) {
  const [bulan, setBulan] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [items, setItems] = useState([]);
  const [totalJam, setTotalJam] = useState(0);
  const [totalNominal, setTotalNominal] = useState(0);
  const [totalBelumDibayar, setTotalBelumDibayar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchOvertimes = useCallback(async () => {
    if (!employee) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get("/overtimes", {
        params: {
          user_id: employee.id,
          bulan: bulan || undefined,
        },
      });

      setItems(res.data.data || []);
      setTotalJam(res.data.total_jam ?? 0);
      setTotalNominal(res.data.total_nominal ?? 0);
      setTotalBelumDibayar(res.data.total_belum_dibayar ?? 0);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Gagal memuat riwayat lembur.",
      );
    } finally {
      setLoading(false);
    }
  }, [employee, bulan]);

  useEffect(() => {
    if (isOpen && employee) {
      setSuccessMsg("");
      fetchOvertimes();
    }
  }, [isOpen, employee, bulan, refreshTrigger, fetchOvertimes]);

  const handleSettleToExpense = async () => {
    if (!employee || totalBelumDibayar <= 0) return;

    const periodeText = bulan || "semua periode";
    if (
      !window.confirm(
        `Catat lembur belum terbayar milik ${employee.name} (${periodeText}) sebesar Rp ${Number(totalBelumDibayar).toLocaleString("id-ID")} ke Pengeluaran Toko?`,
      )
    ) {
      return;
    }

    setSettling(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/overtimes/settle", {
        user_id: employee.id,
        bulan: bulan || null,
        kategori: "Operasional",
      });

      setSuccessMsg(
        res.data.message ||
          "Total lembur berhasil dicatat ke Pengeluaran Toko.",
      );
      await fetchOvertimes();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Gagal mencatat lembur ke pengeluaran.",
      );
    } finally {
      setSettling(false);
    }
  };

  const handleDeleteOvertime = async (row) => {
    const labelTanggal = String(row.tanggal).slice(0, 10);
    if (
      !window.confirm(
        `Hapus catatan lembur tanggal ${labelTanggal} (${row.jam_lembur} jam)?`,
      )
    ) {
      return;
    }

    setDeletingId(row.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.delete(`/overtimes/${row.id}`);
      await fetchOvertimes();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Gagal menghapus data lembur.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border rounded-lg shadow-lg border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              Riwayat & Rekap Lembur
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Karyawan:{" "}
              <span className="font-medium text-slate-700">
                {employee.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-sm rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Filter Bulan & Tombol Catat ke Pengeluaran */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-bulan"
                className="text-xs font-medium text-slate-700"
              >
                Periode:
              </label>
              <input
                id="filter-bulan"
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="px-2.5 py-1.5 text-xs sm:text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setBulan("")}
                className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
              >
                Semua
              </button>
            </div>

            <button
              type="button"
              disabled={settling || totalBelumDibayar <= 0}
              onClick={handleSettleToExpense}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{settling ? "Memproses..." : "Catat ke Pengeluaran"}</span>
            </button>
          </div>

          {/* Ringkasan Total Lembur */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 border rounded-lg bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500">Total Jam Lembur</p>
              <p className="mt-1 text-sm sm:text-base font-bold text-slate-800">
                {totalJam} Jam
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500">Total Nominal</p>
              <p className="mt-1 text-sm sm:text-base font-bold text-slate-800">
                Rp {Number(totalNominal || 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-amber-50/70 border-amber-200">
              <p className="text-xs text-amber-800">Belum Masuk Pengeluaran</p>
              <p className="mt-1 text-sm sm:text-base font-bold text-amber-900">
                Rp {Number(totalBelumDibayar || 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-red-700 border rounded-lg bg-red-50 border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-800 border rounded-lg bg-emerald-50 border-emerald-200">
              {successMsg}
            </div>
          )}

          {/* Tabel Riwayat */}
          <div className="overflow-x-auto border rounded-lg max-h-60 border-slate-200">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="sticky top-0 text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-medium">Tanggal</th>
                  <th className="px-3 py-2 font-medium">Jam</th>
                  <th className="px-3 py-2 font-medium">Nominal</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Catatan</th>
                  <th className="px-3 py-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      Memuat data lembur...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      Belum ada catatan lembur pada periode ini.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const isPaid = Boolean(row.paid_at);

                    return (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {String(row.tanggal).slice(0, 10)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {row.jam_lembur} jam
                        </td>
                        <td className="px-3 py-2 font-medium whitespace-nowrap text-slate-800">
                          Rp {Number(row.nominal || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                              <CheckCircle2 className="w-3 h-3" />
                              Masuk Pengeluaran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
                              <Clock className="w-3 h-3" />
                              Belum Dibayar
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600 min-w-[120px]">
                          {row.catatan || "-"}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          {!isPaid ? (
                            <button
                              type="button"
                              disabled={deletingId === row.id}
                              onClick={() => handleDeleteOvertime(row)}
                              title="Hapus Lembur"
                              className="p-1.5 text-slate-500 rounded-md hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Terkunci
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 sm:px-5 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-slate-800 hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
