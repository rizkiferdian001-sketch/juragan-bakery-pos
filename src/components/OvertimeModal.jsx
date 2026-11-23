import { useEffect, useState } from "react";
import api from "../services/api";

export default function OvertimeModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) {
  const [tanggal, setTanggal] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [jamLembur, setJamLembur] = useState("1");
  const [tarifPerJam, setTarifPerJam] = useState("20000");
  const [nominalManual, setNominalManual] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hitungOtomatis = Math.round(
    (parseFloat(jamLembur) || 0) * (parseInt(tarifPerJam, 10) || 0),
  );
  const totalNominal =
    nominalManual !== "" ? parseInt(nominalManual, 10) || 0 : hitungOtomatis;

  useEffect(() => {
    if (isOpen) {
      setTanggal(new Date().toISOString().split("T")[0]);
      setJamLembur("1");
      setNominalManual("");
      setCatatan("");
      setErrorMsg("");
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        user_id: employee.id,
        tanggal,
        jam_lembur: parseFloat(jamLembur),
        tarif_per_jam: parseInt(tarifPerJam, 10) || 0,
        nominal: totalNominal,
        catatan: catatan.trim() || null,
      };

      const res = await api.post("/overtimes", payload);

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {},
        )[0]?.[0];
        setErrorMsg(firstError || "Periksa kembali input data lembur.");
      } else if (err.response?.status === 429) {
        setErrorMsg(
          "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
        );
      } else {
        setErrorMsg(
          err.response?.data?.message || "Gagal menyimpan data lembur.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-lg border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Input Lembur Karyawan
            </h3>
            <p className="text-xs text-slate-500">
              Karyawan:{" "}
              <span className="font-medium text-slate-700">
                {employee.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-sm rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 text-xs text-red-700 border rounded-lg bg-red-50 border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Tanggal Lembur
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700">
                Jam Lembur
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={jamLembur}
                onChange={(e) => setJamLembur(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700">
                Tarif / Jam (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={tarifPerJam}
                onChange={(e) => setTarifPerJam(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Nominal Lembur Manual (Opsional)
            </label>
            <input
              type="number"
              min="0"
              placeholder={`Otomatis: Rp ${hitungOtomatis.toLocaleString("id-ID")}`}
              value={nominalManual}
              onChange={(e) => setNominalManual(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Total lembur:{" "}
              <strong className="text-slate-800">
                Rp {totalNominal.toLocaleString("id-ID")}
              </strong>
            </p>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              maxLength={255}
              placeholder="Contoh: Tutup toko & stok opname"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Menyimpan..." : "Simpan Lembur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
