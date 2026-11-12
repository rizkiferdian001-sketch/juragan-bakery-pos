<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->string('kode_invoice')->unique(); // Contoh: INV-20261112-001
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Kasir yang melayani
        $table->string('nama_pelanggan')->default('Pelanggan Umum');
        $table->integer('total_harga');
        $table->integer('uang_dibayar');
        $table->integer('kembalian');
        $table->string('metode_pembayaran')->default('Tunai'); // Tunai, QRIS, Transfer
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
