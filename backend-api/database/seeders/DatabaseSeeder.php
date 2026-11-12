<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Demo Admin & Kasir
        $admin = User::updateOrCreate(
            ['email' => 'admin@juraganbakery.test'],
            [
                'name' => 'Admin Juragan',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        $kasir = User::updateOrCreate(
            ['email' => 'kasir@juraganbakery.test'],
            [
                'name' => 'Kasir Shift Pagi',
                'password' => Hash::make('password123'),
                'role' => 'kasir',
            ]
        );

        // 2. Katalog Produk Bakery (termasuk stok menipis <= 5 untuk demo peringatan Dashboard)
        $produkList = [
            [
                'nama_produk' => 'Tiramisu Coklat',
                'kategori' => 'Cake & Tart',
                'harga' => 45000,
                'stok' => 14,
            ],
            [
                'nama_produk' => 'Croissant Butter Prancis',
                'kategori' => 'Pastry & Croissant',
                'harga' => 22000,
                'stok' => 4, // Stok menipis
            ],
            [
                'nama_produk' => 'Bolen Pisang Cokelat Keju',
                'kategori' => 'Pastry & Croissant',
                'harga' => 38000,
                'stok' => 18,
            ],
            [
                'nama_produk' => 'Roti Sobek Cokelat Lumer',
                'kategori' => 'Roti Manis',
                'harga' => 25000,
                'stok' => 3, // Stok menipis
            ],
            [
                'nama_produk' => 'Nastar Wisman Premium',
                'kategori' => 'Kue Kering',
                'harga' => 75000,
                'stok' => 10,
            ],
            [
                'nama_produk' => 'Es Kopi Susu Gula Aren',
                'kategori' => 'Minuman',
                'harga' => 18000,
                'stok' => 25,
            ],
        ];

        $products = [];
        foreach ($produkList as $item) {
            $products[] = Product::create($item);
        }

        // 3. Contoh Pengeluaran Operasional
        Expense::create([
            'tanggal' => Carbon::today()->toDateString(),
            'keterangan' => 'Belanja Tepung Terigu & Mentega Anchor',
            'kategori' => 'Bahan Baku',
            'nominal' => 120000,
        ]);

        Expense::create([
            'tanggal' => Carbon::yesterday()->toDateString(),
            'keterangan' => 'Token Listrik & Gas LPG Oven',
            'kategori' => 'Listrik & Gas',
            'nominal' => 100000,
        ]);

        // 4. Contoh Transaksi Penjualan (agar grafik & laporan langsung terisi)
        $trx1 = Transaction::create([
            'kode_invoice' => 'INV-' . date('Ymd') . '-001',
            'user_id' => $kasir->id,
            'nama_pelanggan' => 'Budi Santoso',
            'total_harga' => 112000,
            'uang_dibayar' => 150000,
            'kembalian' => 38000,
            'metode_pembayaran' => 'Tunai',
        ]);

        TransactionItem::create([
            'transaction_id' => $trx1->id,
            'product_id' => $products[0]->id, // Tiramisu Coklat
            'qty' => 2,
            'harga_satuan' => 45000,
            'subtotal' => 90000,
        ]);

        TransactionItem::create([
            'transaction_id' => $trx1->id,
            'product_id' => $products[1]->id, // Croissant
            'qty' => 1,
            'harga_satuan' => 22000,
            'subtotal' => 22000,
        ]);

        $trx2 = Transaction::create([
            'kode_invoice' => 'INV-' . date('Ymd') . '-002',
            'user_id' => $admin->id,
            'nama_pelanggan' => 'Siti Rahma',
            'total_harga' => 94000,
            'uang_dibayar' => 94000,
            'kembalian' => 0,
            'metode_pembayaran' => 'QRIS',
        ]);

        TransactionItem::create([
            'transaction_id' => $trx2->id,
            'product_id' => $products[2]->id, // Bolen Pisang
            'qty' => 2,
            'harga_satuan' => 38000,
            'subtotal' => 76000,
        ]);

        TransactionItem::create([
            'transaction_id' => $trx2->id,
            'product_id' => $products[5]->id, // Es Kopi Susu
            'qty' => 1,
            'harga_satuan' => 18000,
            'subtotal' => 18000,
        ]);
    }
}