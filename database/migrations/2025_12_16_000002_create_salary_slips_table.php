<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_template_id')->constrained('document_templates')->cascadeOnDelete();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('allowance_amount', 12, 2)->default(0);
            $table->decimal('deduction_amount', 12, 2)->default(0);
            $table->decimal('net_salary', 12, 2)->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_slips');
    }
};
