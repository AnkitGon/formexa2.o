<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    @php
        $primary = $template->primary_color ?? '#1f2937';
        $accent = $template->accent_color ?? '#111827';
        $bodyColor = $template->secondary_color ?? '#111827';
        $fontFamily = trim((string) ($template->font_family ?? ''));
        if ($fontFamily === '') {
            $fontFamily = 'Arial, sans-serif';
        }
        $fontSize = $template->font_size ?: 12;
        $lineHeight = $template->line_height ?: 19;
    @endphp
    <style>
        :root {
            --primary: {{ $primary }};
            --accent: {{ $accent }};
            --body: {{ $bodyColor }};
            --border: #e5e7eb;
            --muted: #6b7280;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: {{ $fontFamily }} !important;
            margin: 0;
            padding: 32px;
            color: var(--body);
            font-size: {{ $fontSize }}px;
            line-height: {{ $lineHeight }}px;
        }

        .invoice {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 28px;
        }

        .flex-between {
            display: flex;
            justify-content: space-between;
            gap: 16px;
        }

        .text-right {
            text-align: right;
        }

        .muted {
            color: var(--muted);
            font-size: max(10px, {{ $fontSize }}px - 1);
        }

        h1 {
            margin: 0 0 4px;
            font-size: 22px;
            color: var(--accent);
        }

        h3 {
            margin: 12px 0 4px;
            font-size: 14px;
            color: var(--accent);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }

        th {
            background: var(--primary);
            color: #fff;
            padding: 8px;
            font-size: max(10px, {{ $fontSize }}px - 1);
            text-align: left;
        }

        td {
            border-bottom: 1px solid var(--border);
            padding: 8px;
            vertical-align: top;
        }

        .total-row td {
            font-weight: 600;
        }

        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: max(10px, {{ $fontSize }}px - 1);
            background: #e5e7eb;
            color: var(--accent);
        }

        .badge-primary {
            background: var(--primary);
            color: #fff;
        }

        .totals {
            width: 280px;
            margin-left: auto;
            margin-top: 16px;
        }

        .totals td {
            border: none;
        }

        .totals .label {
            color: #4b5563;
        }

        .notes {
            margin-top: 18px;
        }
    </style>
</head>

<body>
    <div class="invoice">
        <div class="flex-between" style="align-items:flex-start;">
            <div>
                <h1>Invoice</h1>
                <div>Acme Corporation</div>
                <div class="muted">123 Market Street</div>
                <div class="muted">San Francisco, CA 94105</div>
            </div>
            <div class="text-right">
                <div class="pill badge-primary">Paid</div>
                <div class="muted">Invoice #</div>
                <div><strong>INV-2024-001</strong></div>
                <div class="muted">Date: Jan 15, 2024</div>
                <div class="muted">Due: Jan 30, 2024</div>
            </div>
        </div>

        <div class="flex-between" style="margin-top:18px;">
            <div style="flex:1;">
                <h3>Bill To</h3>
                <div><strong>Globex LLC</strong></div>
                <div class="muted">78 Sunset Blvd</div>
                <div class="muted">Los Angeles, CA 90028</div>
                <div class="muted">billing@globex.com</div>
            </div>
            <div style="flex:1;" class="text-right">
                <h3>Summary</h3>
                <div class="muted">Currency: USD</div>
                <div class="muted">Terms: Net 15</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:40%;">Description</th>
                    <th style="width:12%;">Qty</th>
                    <th style="width:12%;">Price</th>
                    <th style="width:12%;">Tax</th>
                    <th style="width:12%;">Discount</th>
                    <th style="width:12%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Consulting Services</strong>
                        <div class="muted">Strategic planning and implementation</div>
                    </td>
                    <td>10</td>
                    <td>$150.00</td>
                    <td>$150.00</td>
                    <td>$0.00</td>
                    <td>$1,650.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Software License</strong>
                        <div class="muted">Annual subscription</div>
                    </td>
                    <td>1</td>
                    <td>$2,000.00</td>
                    <td>$200.00</td>
                    <td>$100.00</td>
                    <td>$2,100.00</td>
                </tr>
                <tr class="muted">
                    <td colspan="6" style="text-align:center;">Thank you for your business</td>
                </tr>
            </tbody>
        </table>

        <table class="totals">
            <tr>
                <td class="label">Subtotal</td>
                <td class="text-right">$3,650.00</td>
            </tr>
            <tr>
                <td class="label">Tax</td>
                <td class="text-right">$350.00</td>
            </tr>
            <tr>
                <td class="label">Discounts</td>
                <td class="text-right">- $100.00</td>
            </tr>
            <tr class="total-row">
                <td>Total</td>
                <td class="text-right">$3,900.00</td>
            </tr>
            <tr>
                <td class="label">Paid</td>
                <td class="text-right">- $3,900.00</td>
            </tr>
            <tr class="total-row">
                <td>Balance Due</td>
                <td class="text-right">$0.00</td>
            </tr>
        </table>

        <div class="notes">
            <h3>Notes</h3>
            <div class="muted">Payment received in full. For questions, contact billing@acme.com.</div>
        </div>
    </div>
</body>

</html>
