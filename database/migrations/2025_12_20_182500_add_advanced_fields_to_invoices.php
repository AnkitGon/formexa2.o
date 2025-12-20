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
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('currency_symbol', 10)->default('$')->after('currency');
            $table->enum('currency_position', ['before', 'after'])->default('before')->after('currency_symbol');
            $table->unsignedTinyInteger('decimal_precision')->default(2)->after('currency_position');
            $table->string('thousands_separator', 2)->default(',')->after('decimal_precision');
            $table->string('decimal_separator', 2)->default('.')->after('thousands_separator');

            // Branding override per invoice (snapshot)
            $table->string('template_style')->default('classic')->after('status'); // classic, modern, minimal
            $table->string('primary_color', 20)->nullable()->after('template_style');

            // Toggle fields
            $table->boolean('show_logo')->default(true)->after('primary_color');
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->enum('tax_type', ['percent', 'fixed'])->default('percent')->after('tax_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'currency_symbol',
                'currency_position',
                'decimal_precision',
                'thousands_separator',
                'decimal_separator',
                'template_style',
                'primary_color',
                'show_logo'
            ]);
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropColumn('tax_type');
        });
    }
};
