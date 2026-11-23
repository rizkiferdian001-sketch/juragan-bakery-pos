<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Overtime;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OvertimeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Overtime::with('user:id,name,email')->latest('tanggal')->latest('id');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('bulan')) {
            [$year, $month] = explode('-', $request->bulan);
            $query->whereYear('tanggal', $year)->whereMonth('tanggal', $month);
        }

        $overtimes = $query->get();
        $unpaidOvertimes = $overtimes->whereNull('paid_at');

        return response()->json([
            'data' => $overtimes,
            'total_nominal' => $overtimes->sum('nominal'),
            'total_jam' => (float) $overtimes->sum('jam_lembur'),
            'total_belum_dibayar' => (int) $unpaidOvertimes->sum('nominal'),
            'jumlah_belum_dibayar' => $unpaidOvertimes->count(),
        ]);
    }

    public function settle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'bulan' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
            'tanggal' => ['nullable', 'date'],
            'kategori' => ['nullable', 'string', 'max:100'],
        ]);

        $employee = User::findOrFail($validated['user_id']);
        $tanggalPengeluaran = $validated['tanggal'] ?? now()->toDateString();
        $kategori = $validated['kategori'] ?? 'Operasional';

        $query = Overtime::where('user_id', $employee->id)
            ->whereNull('paid_at');

        if (!empty($validated['bulan'])) {
            [$year, $month] = explode('-', $validated['bulan']);
            $query->whereYear('tanggal', $year)->whereMonth('tanggal', $month);
        }

        $unpaidItems = $query->get();

        if ($unpaidItems->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada lembur yang belum masuk pengeluaran untuk periode ini.',
            ], 422);
        }

        $totalNominal = (int) $unpaidItems->sum('nominal');
        $totalJam = (float) $unpaidItems->sum('jam_lembur');
        $periodeLabel = !empty($validated['bulan']) ? $validated['bulan'] : 'Semua Periode';

        $expense = DB::transaction(function () use (
            $unpaidItems,
            $employee,
            $periodeLabel,
            $totalJam,
            $kategori,
            $totalNominal,
            $tanggalPengeluaran
        ) {
            $expenseRecord = Expense::create([
                'keterangan' => "Lembur {$employee->name} ({$periodeLabel}, {$totalJam} jam)",
                'kategori' => $kategori,
                'nominal' => $totalNominal,
                'tanggal' => $tanggalPengeluaran,
            ]);

            Overtime::whereIn('id', $unpaidItems->pluck('id'))->update([
                'paid_at' => now(),
                'expense_id' => $expenseRecord->id,
            ]);

            return $expenseRecord;
        });

        return response()->json([
            'message' => 'Total lembur berhasil dicatat ke Pengeluaran Toko.',
            'expense' => $expense,
            'settled_count' => $unpaidItems->count(),
            'settled_nominal' => $totalNominal,
        ], 201);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'tanggal' => ['required', 'date'],
            'jam_lembur' => ['required', 'numeric', 'min:0.5', 'max:24'],
            'tarif_per_jam' => ['nullable', 'integer', 'min:0'],
            'nominal' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $tarif = $validated['tarif_per_jam'] ?? 0;
        $nominal = $validated['nominal'] ?? (int) round((float) $validated['jam_lembur'] * $tarif);

        $overtime = Overtime::create([
            'user_id' => $validated['user_id'],
            'tanggal' => $validated['tanggal'],
            'jam_lembur' => $validated['jam_lembur'],
            'tarif_per_jam' => $tarif,
            'nominal' => $nominal,
            'catatan' => $validated['catatan'] ?? null,
        ]);

        $overtime->load('user:id,name,email');

        return response()->json([
            'message' => 'Data lembur berhasil disimpan.',
            'data' => $overtime,
        ], 201);
    }

    public function show(Overtime $overtime): JsonResponse
    {
        $overtime->load('user:id,name,email');

        return response()->json([
            'data' => $overtime,
        ]);
    }

    public function update(Request $request, Overtime $overtime): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['sometimes', 'required', 'exists:users,id'],
            'tanggal' => ['sometimes', 'required', 'date'],
            'jam_lembur' => ['sometimes', 'required', 'numeric', 'min:0.5', 'max:24'],
            'tarif_per_jam' => ['nullable', 'integer', 'min:0'],
            'nominal' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $jam = $validated['jam_lembur'] ?? $overtime->jam_lembur;
        $tarif = array_key_exists('tarif_per_jam', $validated)
            ? ($validated['tarif_per_jam'] ?? 0)
            : $overtime->tarif_per_jam;

        if (array_key_exists('nominal', $validated) && $validated['nominal'] !== null) {
            $nominal = $validated['nominal'];
        } elseif (isset($validated['jam_lembur']) || isset($validated['tarif_per_jam'])) {
            $nominal = (int) round((float) $jam * $tarif);
        } else {
            $nominal = $overtime->nominal;
        }

        $overtime->update([
            'user_id' => $validated['user_id'] ?? $overtime->user_id,
            'tanggal' => $validated['tanggal'] ?? $overtime->tanggal,
            'jam_lembur' => $jam,
            'tarif_per_jam' => $tarif,
            'nominal' => $nominal,
            'catatan' => array_key_exists('catatan', $validated) ? $validated['catatan'] : $overtime->catatan,
        ]);

        $overtime->load('user:id,name,email');

        return response()->json([
            'message' => 'Data lembur berhasil diperbarui.',
            'data' => $overtime,
        ]);
    }

    public function destroy(Overtime $overtime): JsonResponse
    {
        if ($overtime->paid_at !== null) {
            return response()->json([
                'message' => 'Data lembur yang sudah masuk pengeluaran tidak dapat dihapus.',
            ], 422);
        }

        $overtime->delete();

        return response()->json([
            'message' => 'Data lembur berhasil dihapus.',
        ]);
    }
}