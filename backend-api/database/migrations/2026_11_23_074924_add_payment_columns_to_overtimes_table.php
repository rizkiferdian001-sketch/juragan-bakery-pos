<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('overtimes', function (Blueprint $table) {
            if (!Schema::hasColumn('overtimes', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('catatan');
            }
            if (!Schema::hasColumn('overtimes', 'expense_id')) {
                $table->foreignId('expense_id')
                    ->nullable()
                    ->after('paid_at')
                    ->constrained('expenses')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('overtimes', function (Blueprint $table) {
            if (Schema::hasColumn('overtimes', 'expense_id')) {
                $table->dropConstrainedForeignId('expense_id');
            }
            if (Schema::hasColumn('overtimes', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
        });
    }
};