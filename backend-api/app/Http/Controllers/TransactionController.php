<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // Untuk halaman Laporan Penjualan Admin
    public function index(Request $request)
    {
        $query = Transaction::with(['user:id,name', 'items.product:id,nama_produk'])->latest();

        if ($request->filled('tanggal')) {
            $query->whereDate('created_at', $request->tanggal);
        }

        $transactions = $query->get();

        return response()->json([
            'data' => $transactions,
            'total_omzet' => (int) $transactions->sum('total_harga'),
            'total_transaksi' => $transactions->count(),
        ]);
    }

    // Untuk Kasir POS saat Proses Pembayaran (otomatis potong stok)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pelanggan' => 'nullable|string|max:255',
            'uang_dibayar' => 'required|integer|min:0',
            'metode_pembayaran' => 'required|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $totalHarga = 0;
            $preparedItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stok < $item['qty']) {
                    abort(422, "Stok {$product->nama_produk} tidak mencukupi (tersisa {$product->stok}).");
                }

                $subtotal = $product->harga * $item['qty'];
                $totalHarga += $subtotal;

                $preparedItems[] = [
                    'product' => $product,
                    'qty' => $item['qty'],
                    'harga_satuan' => $product->harga,
                    'subtotal' => $subtotal,
                ];
            }

            if ($validated['uang_dibayar'] < $totalHarga) {
                abort(422, 'Uang pembayaran kurang dari total belanja.');
            }

            $kodeInvoice = 'INV-' . date('Ymd') . '-' . str_pad(Transaction::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

            $transaction = Transaction::create([
                'kode_invoice' => $kodeInvoice,
                'user_id' => $request->user()->id,
                'nama_pelanggan' => $validated['nama_pelanggan'] ?: 'Pelanggan Umum',
                'total_harga' => $totalHarga,
                'uang_dibayar' => $validated['uang_dibayar'],
                'kembalian' => $validated['uang_dibayar'] - $totalHarga,
                'metode_pembayaran' => $validated['metode_pembayaran'],
            ]);

            foreach ($preparedItems as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']->id,
                    'qty' => $item['qty'],
                    'harga_satuan' => $item['harga_satuan'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['product']->decrement('stok', $item['qty']);
            }

            return response()->json([
                'message' => 'Transaksi berhasil disimpan',
                'data' => $transaction->load(['user:id,name', 'items.product:id,nama_produk']),
            ], 201);
        });
    }

    // Untuk halaman Dashboard Finansial Admin
    public function dashboardSummary()
    {
        $totalPendapatan = (int) Transaction::sum('total_harga');
        $totalPengeluaran = (int) Expense::sum('nominal');
        $labaBersih = $totalPendapatan - $totalPengeluaran;
        $totalTransaksi = Transaction::count();
        $produkAktif = Product::count();
        $stokMenipis = Product::where('stok', '<=', 5)->count();

        // Daftar detail produk dengan stok <= 5 untuk widget peringatan Dashboard
        $produkMenipis = Product::select('id', 'nama_produk', 'kategori', 'stok')
            ->where('stok', '<=', 5)
            ->orderBy('stok', 'asc')
            ->get();

        // 1. Data Grafik Pendapatan vs Pengeluaran (7 Hari Terakhir)
        $chartHarian = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateString = $date->toDateString();

            $pendapatanHari = (int) Transaction::whereDate('created_at', $dateString)->sum('total_harga');
            $pengeluaranHari = (int) Expense::whereDate('tanggal', $dateString)->sum('nominal');

            $chartHarian[] = [
                'tanggal' => $date->translatedFormat('d M'),
                'pendapatan' => $pendapatanHari,
                'pengeluaran' => $pengeluaranHari,
            ];
        }

        // 2. Data Grafik 5 Produk Kue Terlaris
        $topProduk = TransactionItem::select('product_id', DB::raw('SUM(qty) as total_terjual'))
            ->with('product:id,nama_produk')
            ->groupBy('product_id')
            ->orderByDesc('total_terjual')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'nama' => $item->product->nama_produk ?? 'Produk Dihapus',
                    'terjual' => (int) $item->total_terjual,
                ];
            });

        $transaksiTerbaru = Transaction::with('user:id,name')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_pendapatan' => $totalPendapatan,
            'total_pengeluaran' => $totalPengeluaran,
            'laba_bersih' => $labaBersih,
            'total_transaksi' => $totalTransaksi,
            'produk_aktif' => $produkAktif,
            'stok_menipis' => $stokMenipis,
            'produk_menipis' => $produkMenipis,
            'chart_harian' => $chartHarian,
            'top_produk' => $topProduk,
            'transaksi_terbaru' => $transaksiTerbaru,
        ]);
    }

    // Untuk halaman Pusat Laporan & Cetak (Penjualan, Pengeluaran, Laba Rugi)
    public function financialReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // 1. Query Transaksi Penjualan
        $trxQuery = Transaction::with(['user:id,name', 'items.product:id,nama_produk'])->latest();
        if ($startDate && $endDate) {
            $trxQuery->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
        }
        $transactions = $trxQuery->get();

        // Rekap per metode pembayaran (untuk closing kasir)
        $rekapMetode = [
            'Tunai' => (int) $transactions->where('metode_pembayaran', 'Tunai')->sum('total_harga'),
            'QRIS' => (int) $transactions->where('metode_pembayaran', 'QRIS')->sum('total_harga'),
            'Transfer' => (int) $transactions->where('metode_pembayaran', 'Transfer')->sum('total_harga'),
        ];

        // 2. Query Pengeluaran Operasional
        $expQuery = Expense::orderBy('tanggal', 'desc')->latest();
        if ($startDate && $endDate) {
            $expQuery->whereBetween('tanggal', [$startDate, $endDate]);
        }
        $expenses = $expQuery->get();

        // Rekap pengeluaran per kategori
        $rekapKategoriPengeluaran = $expenses->groupBy('kategori')->map(function ($items) {
            return (int) $items->sum('nominal');
        });

        $totalOmzet = (int) $transactions->sum('total_harga');
        $totalPengeluaran = (int) $expenses->sum('nominal');

        return response()->json([
            'periode' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'transactions' => $transactions,
            'expenses' => $expenses,
            'summary' => [
                'total_omzet' => $totalOmzet,
                'total_transaksi' => $transactions->count(),
                'total_pengeluaran' => $totalPengeluaran,
                'laba_bersih' => $totalOmzet - $totalPengeluaran,
                'rekap_metode' => $rekapMetode,
                'rekap_kategori_pengeluaran' => $rekapKategoriPengeluaran,
            ],
        ]);
    }
}