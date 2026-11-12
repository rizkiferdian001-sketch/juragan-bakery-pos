<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::orderBy('tanggal', 'desc')->latest()->get();
        $totalPengeluaran = Expense::sum('nominal');

        return response()->json([
            'data' => $expenses,
            'total' => (int) $totalPengeluaran,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'nominal' => 'required|integer|min:1',
            'tanggal' => 'required|date',
        ]);

        $expense = Expense::create($validated);

        return response()->json([
            'message' => 'Pengeluaran berhasil dicatat',
            'data' => $expense,
        ], 201);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'message' => 'Data pengeluaran berhasil dihapus',
        ]);
    }
}