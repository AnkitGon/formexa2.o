<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalarySlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_template_id',
        'basic_salary',
        'allowance_amount',
        'deduction_amount',
        'net_salary',
        'meta',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'allowance_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'meta' => 'array',
    ];

    protected $appends = [
        'employer_signature_url',
        'employee_signature_url',
    ];

    private function signatureUrlForDisplay($value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        if (str_starts_with($value, 'data:image/')) {
            return $value;
        }

        $path = $value;
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            $urlPath = parse_url($value, PHP_URL_PATH);
            if (is_string($urlPath) && $urlPath !== '') {
                $path = $urlPath;
            }
        }

        $path = '/' . ltrim((string) $path, '/');

        return url($path);
    }

    public function getEmployerSignatureUrlAttribute(): ?string
    {
        return $this->signatureUrlForDisplay($this->meta['employer_signature'] ?? null);
    }

    public function getEmployeeSignatureUrlAttribute(): ?string
    {
        return $this->signatureUrlForDisplay($this->meta['employee_signature'] ?? null);
    }

    public function template()
    {
        return $this->belongsTo(DocumentTemplate::class, 'document_template_id');
    }
}
