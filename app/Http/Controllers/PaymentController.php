<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($invoice, $validated) {
            $invoice->payments()->create([
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'notes' => $validated['notes'],
            ]);

            $this->updateInvoiceStatus($invoice);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function destroy(Invoice $invoice, Payment $payment)
    {
        if ($invoice->user_id !== Auth::id()) {
            abort(403);
        }

        if ($payment->invoice_id !== $invoice->id) {
            abort(404);
        }

        DB::transaction(function () use ($invoice, $payment) {
            $payment->delete();
            $this->updateInvoiceStatus($invoice);
        });

        return back()->with('success', 'Payment removed successfully.');
    }

    protected function updateInvoiceStatus(Invoice $invoice)
    {
        // Recalculate total paid
        $totalPaid = $invoice->payments()->sum('amount');
        $invoice->amount_paid = $totalPaid;

        // Determine status
        // Tolerance for float comparison
        $epsilon = 0.01;

        if ($totalPaid >= ($invoice->total - $epsilon)) {
            $status = 'paid';
        } elseif ($totalPaid > 0) {
            $status = 'partially_paid';
        } else {
            // Revert to original logic or default
            // If it was overdue, keep overdue, otherwise sent/draft?
            // Simplification: if due date passed -> overdue, else sent
            if ($invoice->due_date && now()->gt($invoice->due_date)) {
                $status = 'overdue';
            } else {
                $status = 'sent'; // Assume sent if we are recording payments
            }
        }

        $invoice->status = $status;
        $invoice->save();
    }
}
