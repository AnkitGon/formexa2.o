<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('document_type');
            $table->text('description')->nullable();
            $table->string('preview_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('primary_color', 20)->nullable();
            $table->string('secondary_color', 20)->nullable();
            $table->string('accent_color', 20)->nullable();
            $table->string('font_family', 100)->nullable();
            $table->unsignedTinyInteger('font_size')->nullable();
            $table->unsignedTinyInteger('line_height')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
