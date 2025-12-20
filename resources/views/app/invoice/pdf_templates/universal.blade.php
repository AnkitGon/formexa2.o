@php
    $primaryColor = $template->primary_color ?? '#111827';
    $accentColor = $template->accent_color ?? '#1f2937';
    $textColor = $template->secondary_color ?? '#111827';
    $fontFamily = $template->font_family ?? 'DejaVu Sans, sans-serif';
    $fontSize = $template->font_size ?? 11;
    $lineHeight = $template->line_height ?? (int) round($fontSize * 1.45);

    $meta = $invoice->meta ?? [];
    if (! is_array($meta)) {
        $meta = [];
    }

    $settingsDefaults = $settingsDefaults ?? [];
    $currencyCode = $invoice->currency ?? ($settingsDefaults['default_currency'] ?? 'USD');
    $currencySymbolPosition = $settingsDefaults['currency_symbol_position'] ?? 'prefix';
    $currencyPrecision = (int) ($settingsDefaults['currency_precision'] ?? 2);
    $dateFormatSetting = $settingsDefaults['date_format'] ?? 'YYYY-MM-DD';
    $phpDateFormat = match ($dateFormatSetting) {
        'DD/MM/YYYY' => 'd/m/Y',
        'MM/DD/YYYY' => 'm/d/Y',
        default => 'Y-m-d',
    };

    $formatCurrency = function ($value) use ($currencyCode, $currencySymbolPosition, $currencyPrecision) {
        $amount = number_format((float) ($value ?? 0), $currencyPrecision);

        return $currencySymbolPosition === 'suffix'
            ? $amount . ' ' . $currencyCode
            : $currencyCode . ' ' . $amount;
    };

    $formatDate = function ($value) use ($phpDateFormat) {
        if ($value === null || $value === '') {
            return '';
        }

        try {
            return \Carbon\Carbon::parse($value)->format($phpDateFormat);
        } catch (\Throwable $e) {
            return (string) $value;
        }
    };

    $business = $invoice->business ?? ($meta['business'] ?? []);
    $client = $invoice->client ?? ($meta['client'] ?? []);
    $items = $invoice->items ?? ($meta['items'] ?? []);
    if (! is_array($items)) {
        $items = [];
    }

    $shipping = (float) ($meta['shipping_amount'] ?? ($invoice->shipping_amount ?? 0));
    $globalDiscount = (float) ($meta['discount_amount'] ?? ($invoice->discount_amount ?? 0));
    $globalTaxPercent = (float) ($meta['tax_percent'] ?? ($invoice->tax_percent ?? 0));
    $paidAmount = (float) ($invoice->paid_amount ?? 0);

    $subtotal = 0;
    $normalizedItems = [];
    foreach ($items as $item) {
        $name = trim((string) ($item['name'] ?? $item['description'] ?? ''));
        $qty = (float) ($item['quantity'] ?? 1);
        $unit = (float) ($item['unit_price'] ?? $item['price'] ?? 0);

        $discountValue = (float) ($item['discount_value'] ?? 0);
        $discountType = $item['discount_type'] ?? 'amount'; // amount | percent
        $taxValue = (float) ($item['tax_value'] ?? 0);
        $taxType = $item['tax_type'] ?? 'percent'; // percent | amount

        $lineBase = $qty * $unit;
        $lineDiscount = $discountType === 'percent' ? ($lineBase * $discountValue / 100) : $discountValue;
        $lineAfterDiscount = max($lineBase - $lineDiscount, 0);
        $lineTax = $taxType === 'percent' ? ($lineAfterDiscount * $taxValue / 100) : $taxValue;
        $lineTotal = $lineAfterDiscount + $lineTax;

        $subtotal += $lineBase;
        $normalizedItems[] = [
            'name' => $name,
            'description' => trim((string) ($item['description'] ?? '')),
            'qty' => $qty,
            'unit' => $unit,
            'discount_display' => $discountType === 'percent' ? ($discountValue . '%') : ($discountValue > 0 ? $formatCurrency($discountValue) : ''),
            'tax_display' => $taxType === 'percent' ? ($taxValue . '%') : ($taxValue > 0 ? $formatCurrency($taxValue) : ''),
            'lineTotal' => $lineTotal,
        ];
    }

    $discountTotal = $globalDiscount;
    $taxTotal = (($subtotal - $discountTotal) * $globalTaxPercent / 100);
    $grandTotal = max($subtotal - $discountTotal, 0) + $taxTotal + $shipping;
    $balanceDue = max($grandTotal - $paidAmount, 0);

    $status = strtoupper((string) ($invoice->status ?? 'draft'));
    $statusColors = [
        'PAID' => '#16a34a',
        'PARTIALLY PAID' => '#f59e0b',
        'OVERDUE' => '#dc2626',
        'SENT' => '#2563eb',
        'CANCELLED' => '#6b7280',
        'DRAFT' => '#9ca3af',
    ];
    $statusColor = $statusColors[$status] ?? '#6b7280';
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice->invoice_number ?? $invoice->id ?? '' }} - Universal</title>
    <style>
        @page {
            margin: 18px 18px;
        }

        body {
            font-family: {{ $fontFamily }};
            font-size: {{ $fontSize }}px;
            color: {{ $textColor }};
            line-height: {{ $lineHeight }}px;
        }

        .wrapper {
            width: 92%;
            max-width: 820px;
            margin-left: auto;
            margin-right: auto;
            padding: 18px 18px 140px 18px;
            box-sizing: border-box;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            border-bottom: 2px solid {{ $primaryColor }};
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .logo {
            max-height: 60px;
            object-fit: contain;
        }

        .title-block {
            text-align: right;
        }

        .title {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0;
        }

        .muted {
            color: #6b7280;
            font-size: 0.95em;
        }

        .status-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            color: #ffffff;
            font-size: 0.9em;
            margin-top: 6px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }

        .card {
            border: 1px solid {{ $accentColor }};
            padding: 10px 12px;
            border-radius: 6px;
        }

        .card h4 {
            margin: 0 0 6px 0;
            font-size: 1em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: {{ $primaryColor }};
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 6px 8px;
            border: 1px solid {{ $accentColor }};
            vertical-align: top;
        }

        th {
            background: {{ $primaryColor }};
            color: #ffffff;
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .summary {
            margin-top: 12px;
            width: 100%;
            max-width: 380px;
            margin-left: auto;
            border-collapse: collapse;
        }

        .summary td {
            border: 0;
            padding: 4px 0;
        }

        .summary .label {
            color: #4b5563;
        }

        .summary .value {
            text-align: right;
        }

        .summary .total {
            font-weight: bold;
            color: {{ $primaryColor }};
            font-size: 1.05em;
            padding-top: 6px;
            border-top: 1px solid {{ $accentColor }};
        }

        .notes {
            margin-top: 18px;
            border-top: 1px solid {{ $accentColor }};
            padding-top: 10px;
        }

        .signature {
            margin-top: 18px;
            text-align: right;
        }

        .signature img {
            max-width: 200px;
            height: 50px;
            object-fit: contain;
            display: block;
            margin-left: auto;
            margin-bottom: 6px;
        }

        .page-footer {
            position: fixed;
            left: 18px;
            right: 18px;
            bottom: 18px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="header">
            <div>
                @if (! empty($business['logo']))
                    <img class="logo" src="{{ $business['logo'] }}" alt="Logo">
                @endif
                <div>{{ $business['name'] ?? '' }}</div>
                <div class="muted">
                    {{ $business['address'] ?? '' }}<br>
                    {{ $business['email'] ?? '' }}<br>
                    {{ $business['phone'] ?? '' }}
                </div>
            </div>
            <div class="title-block">
                <p class="title">Invoice</p>
                <div class="muted">
                    <div>Invoice #: {{ $invoice->invoice_number ?? $invoice->id ?? '' }}</div>
                    <div>Date: {{ $formatDate($invoice->invoice_date ?? $invoice->created_at ?? '') }}</div>
                    <div>Due: {{ $formatDate($invoice->due_date ?? '') }}</div>
                </div>
                <span class="status-pill" style="background: {{ $statusColor }};">{{ $status }}</span>
            </div>
        </div>

        <div class="info-grid">
            <div class="card">
                <h4>Bill From</h4>
                <div>{{ $business['name'] ?? '' }}</div>
                @if (! empty($business['tax_id']))
                    <div>Tax ID: {{ $business['tax_id'] }}</div>
                @endif
                @if (! empty($business['bank_details']))
                    <div class="muted">Bank: {{ $business['bank_details'] }}</div>
                @endif
            </div>
            <div class="card">
                <h4>Bill To</h4>
                <div>{{ $client['name'] ?? $client['company'] ?? '' }}</div>
                <div class="muted">
                    {{ $client['address'] ?? '' }}<br>
                    {{ $client['email'] ?? '' }}<br>
                    {{ $client['phone'] ?? '' }}
                </div>
                @if (! empty($client['tax_id']))
                    <div>Tax ID: {{ $client['tax_id'] }}</div>
                @endif
            </div>
        </div>

        <table>
            <tr>
                <th style="width: 32%;">Item</th>
                <th style="width: 14%;">Quantity</th>
                <th style="width: 16%;">Unit Price</th>
                <th style="width: 14%;">Discount</th>
                <th style="width: 14%;">Tax</th>
                <th style="width: 18%;" class="text-right">Line Total</th>
            </tr>
            @forelse ($normalizedItems as $item)
                <tr>
                    <td>
                        <strong>{{ $item['name'] }}</strong><br>
                        <span class="muted">{{ $item['description'] }}</span>
                    </td>
                    <td>{{ rtrim(rtrim(number_format($item['qty'], 2), '0'), '.') }}</td>
                    <td>{{ $formatCurrency($item['unit']) }}</td>
                    <td>{{ $item['discount_display'] }}</td>
                    <td>{{ $item['tax_display'] }}</td>
                    <td class="text-right">{{ $formatCurrency($item['lineTotal']) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="muted">No items added.</td>
                </tr>
            @endforelse
        </table>

        <table class="summary">
            <tr>
                <td class="label">Subtotal</td>
                <td class="value">{{ $formatCurrency($subtotal) }}</td>
            </tr>
            <tr>
                <td class="label">Discount</td>
                <td class="value">- {{ $formatCurrency($discountTotal) }}</td>
            </tr>
            <tr>
                <td class="label">Tax ({{ $globalTaxPercent }}%)</td>
                <td class="value">{{ $formatCurrency($taxTotal) }}</td>
            </tr>
            <tr>
                <td class="label">Shipping</td>
                <td class="value">{{ $formatCurrency($shipping) }}</td>
            </tr>
            <tr>
                <td class="label total">Total</td>
                <td class="value total">{{ $formatCurrency($grandTotal) }}</td>
            </tr>
            <tr>
                <td class="label">Paid</td>
                <td class="value">{{ $formatCurrency($paidAmount) }}</td>
            </tr>
            <tr>
                <td class="label">Balance Due</td>
                <td class="value">{{ $formatCurrency($balanceDue) }}</td>
            </tr>
        </table>

        @if (! empty($meta['notes']) || ! empty($meta['terms']))
            <div class="notes">
                @if (! empty($meta['notes']))
                    <div><strong>Notes:</strong> {{ $meta['notes'] }}</div>
                @endif
                @if (! empty($meta['terms']))
                    <div><strong>Terms:</strong> {{ $meta['terms'] }}</div>
                @endif
            </div>
        @endif

        @if (! empty($business['signature']))
            <div class="signature">
                <img src="{{ $business['signature'] }}" alt="Signature">
                <div class="muted">Authorized Signature</div>
            </div>
        @endif
    </div>

    <div class="page-footer">
        Generated by Formexa — Thank you for your business.
    </div>
</body>

</html>
