<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalarySlipController;
use App\Http\Controllers\SalarySlipTemplateController;
use App\Http\Controllers\TaxController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('salary-slip')
        ->name('salary-slip.')
        ->controller(SalarySlipController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::post('/preview', 'preview')->name('preview');
            Route::get('/{salarySlip}/edit', 'edit')->name('edit');
            Route::put('/{salarySlip}', 'update')->name('update');
            Route::delete('/{salarySlip}', 'destroy')->name('destroy');

            Route::get('/{salarySlip}/pdf', 'showPdf')->name('pdf');
            Route::get('/{salarySlip}/download', 'downloadPdf')->name('download');
        });

    Route::prefix('template/salary-slip')
        ->name('template.salary-slip.')
        ->controller(SalarySlipTemplateController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::post('/preview', 'preview')->name('preview');
            Route::get('/{template}/edit', 'edit')->name('edit');
            Route::put('/{template}', 'update')->name('update');
            Route::delete('/{template}', 'destroy')->name('destroy');
        });

    Route::prefix('taxes')
        ->name('taxes.')
        ->controller(TaxController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('/{tax}/edit', 'edit')->name('edit');
            Route::put('/{tax}', 'update')->name('update');
            Route::delete('/{tax}', 'destroy')->name('destroy');
        });
});

require __DIR__.'/settings.php';
