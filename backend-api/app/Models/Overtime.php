<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Overtime extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tanggal',
        'jam_lembur',
        'tarif_per_jam',
        'nominal',
        'catatan',
        'paid_at',
        'expense_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jam_lembur' => 'decimal:1',
            'tarif_per_jam' => 'integer',
            'nominal' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}   