<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalarySlip extends Model
{
    use HasFactory;

    protected $fillable = [
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

    public function template()
    {
        return $this->belongsTo(DocumentTemplate::class, 'document_template_id');
    }
}
