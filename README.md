# Juragan Bakery & Pastry — Sistem POS & Manajemen Inventory

Aplikasi *full-stack* Point of Sale (POS), manajemen stok produk bakery, dan pembukuan keuangan toko kue yang dirancang dengan pemisahan hak akses (*Role-Based Access Control*) antara **Admin** dan **Kasir**.

---

## Fitur Utama

### 1. Panel Admin (`Admin Panel`)
- **Dashboard Finansial & Analitik:** Ringkasan total pendapatan, pengeluaran operasional, laba bersih, grafik arus kas 7 hari terakhir, *Top 5* produk terlaris, serta widget peringatan otomatis untuk produk dengan stok menipis (`<= 5 pcs`).
- **Manajemen Produk & Gudang:** Tambah, ubah, dan hapus katalog kue lengkap dengan upload foto produk serta fitur **Restock Cepat (`+ Stok`)** untuk penambahan stok produksi harian.
- **Pencatatan Pengeluaran Operasional:** Monitoring biaya bahan baku, listrik/gas, kemasan, dan operasional harian berdasarkan kategori.
- **Pusat Laporan & Cetak Pembukuan:** Filter laporan berdasarkan rentang tanggal untuk **Laporan Penjualan (Closing Kasir per metode bayar)**, **Laporan Pengeluaran**, dan **Laporan Laba Rugi** dengan format cetak PDF bersih berkop surat.
- **Manajemen Pengguna & Hak Akses:** Pengelolaan akun staf dengan pembatasan akses rute antara Admin dan Kasir.

### 2. Kasir POS (`Juragan POS`)
- **Katalog Interaktif & Filter Kategori:** Pencarian cepat dan filter berdasarkan kategori bakery (*Roti Manis, Cake & Tart, Kue Kering, Pastry & Croissant, Minuman*).
- **Transaksi & Pemotongan Stok Otomatis:** Kalkulasi keranjang belanja, kembalian otomatis, dukungan metode pembayaran (*Tunai, QRIS, Transfer*), dan pemotongan stok database secara *real-time* menggunakan transaksi atomik.
- **Cetak Struk Thermal:** Struk pembayaran siap cetak dengan tata letak terisolasi (`80mm` print layout).

---

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React
- **Backend:** Laravel (REST API), Laravel Sanctum (Token Authentication), MySQL
- **Local Environment:** FlyEnv (Apache, PHP, MySQL)

---

## Struktur Proyek

```text
admin-dashboard/          # Frontend React (Vite + Tailwind CSS)
├── backend-api/          # Backend Laravel REST API
└── src/
    ├── components/       # Komponen layout (Sidebar, Header, ProtectedRoute)
    ├── layouts/          # Layout utama Admin
    ├── pages/            # Halaman Dashboard, Produk, Pengeluaran, Laporan, Kasir POS, Login
    └── services/         # Konfigurasi Axios & Auth Interceptor