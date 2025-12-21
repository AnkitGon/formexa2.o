<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalarySlipController;
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
            Route::get('/{salarySlip}', 'show')->name('show');
            Route::get('/{salarySlip}/edit', 'edit')->name('edit');
            Route::put('/{salarySlip}', 'update')->name('update');
            Route::delete('/{salarySlip}', 'destroy')->name('destroy');

            Route::get('/{salarySlip}/pdf', 'showPdf')->name('pdf');
            Route::get('/{salarySlip}/download', 'downloadPdf')->name('download');
        });

    Route::prefix('template')
        ->name('template.')
        ->controller(\App\Http\Controllers\TemplateController::class)
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
            Route::post('/', 'store')->name('store');
            Route::put('/{tax}', 'update')->whereNumber('tax')->name('update');
            Route::delete('/{tax}', 'destroy')->whereNumber('tax')->name('destroy');
        });

    Route::resource('clients', \App\Http\Controllers\ClientController::class);
    Route::get('invoices/{invoice}/print', [\App\Http\Controllers\InvoiceController::class, 'print'])->name('invoices.print');
    Route::post('invoices/{invoice}/duplicate', [\App\Http\Controllers\InvoiceController::class, 'duplicate'])->name('invoices.duplicate');
    Route::post('invoices/{invoice}/send', [\App\Http\Controllers\InvoiceController::class, 'send'])->name('invoices.send');
    Route::post('invoices/{invoice}/payments', [\App\Http\Controllers\PaymentController::class, 'store'])->name('invoices.payments.store');
    Route::delete('invoices/{invoice}/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'destroy'])->name('invoices.payments.destroy');
    Route::resource('invoices', \App\Http\Controllers\InvoiceController::class);
});

require __DIR__ . '/settings.php';
