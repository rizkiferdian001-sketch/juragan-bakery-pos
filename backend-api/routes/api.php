<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TransactionController;

// Endpoint publik (tanpa token)
Route::post('/login', [AuthController::class, 'login']);

// Endpoint terproteksi (wajib bawa token login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Bisa diakses Admin maupun Kasir
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Khusus Admin (Kasir otomatis ditolak 403)
    Route::middleware('role:admin')->group(function () {
        Route::patch('/products/{product}/restock', [ProductController::class, 'restock']);
        Route::apiResource('products', ProductController::class)->except(['index']);
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('expenses', ExpenseController::class)->only(['index', 'store', 'destroy']);
        
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/dashboard-summary', [TransactionController::class, 'dashboardSummary']);
        Route::get('/financial-report', [TransactionController::class, 'financialReport']);
    });
});