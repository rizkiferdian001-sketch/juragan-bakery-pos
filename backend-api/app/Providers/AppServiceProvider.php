<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa semua URL asset() / Storage menjadi HTTPS agar aman di Vercel & HP
        if (env('APP_ENV') !== 'local' || request()->header('x-forwarded-proto') === 'https') {
            URL::forceScheme('https');
        }
    }
}