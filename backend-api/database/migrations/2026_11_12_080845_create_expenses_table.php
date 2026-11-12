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
    Schema::create('expenses', function (Blueprint $table) {
        $table->id();
        $table->string('keterangan');
        $table->string('kategori'); // Bahan Baku, Kemasan, Operasional, Lainnya
        $table->integer('nominal');
        $table->date('tanggal');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
