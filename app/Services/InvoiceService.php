<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Support\Str;

class InvoiceService
{
    public function generateInvoiceNumber(User $user): string
    {
        // Get prefix from settings or default to 'INV-'
        $prefixSetting = $user->settings()->where('key', 'invoice_prefix')->first();
        $prefix = $prefixSetting ? $prefixSetting->value : 'INV-';

        // Find the last invoice number for this user
        $lastInvoice = Invoice::where('user_id', $user->id)
            ->where('invoice_number', 'LIKE', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (! $lastInvoice) {
            return $prefix . '0001';
        }

        // Extract the number part
        // Assuming format is PREFIX-NUMBER
        // If prefix is "INV-", we remove it to get the number
        $lastNumberStr = Str::after($lastInvoice->invoice_number, $prefix);

        // Try to parse it as integer
        $lastNumber = intval($lastNumberStr);

        // Increment and pad
        $nextNumber = $lastNumber + 1;
        return $prefix . str_pad((string)$nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function calculateTotals(Invoice $invoice)
    {
        $subtotal = 0;
        $taxTotal = 0;
        $discountTotal = 0; // Keeping it 0 for now as item level discount logic is not fully defined

        foreach ($invoice->items as $item) {
            // Amount is already calculated in item model or controller, but let's re-verify
            // item amount = qty * unit_price
            $itemAmount = $item->quantity * $item->unit_price;

            // Tax
            $itemTax = 0;
            if ($item->tax_rate > 0) {
                if ($item->tax_type === 'fixed') {
                    // Fixed tax per item quantity or just once per line? 
                    // Usually fixed tax is per unit, so qty * tax_rate
                    $itemTax = $item->quantity * $item->tax_rate;
                } else {
                    $itemTax = $itemAmount * ($item->tax_rate / 100);
                }
            }

            $subtotal += $itemAmount;
            $taxTotal += $itemTax;
        }

        $total = $subtotal + $taxTotal - $discountTotal;

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_total' => $taxTotal,
            // 'discount_total' => $discountTotal,
            'total' => $total,
        ]);

        return $invoice;
    }
}
