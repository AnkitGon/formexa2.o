<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice</title>
    @php
        $primary = $template->primary_color ?? '#111827';
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
        * { box-sizing: border-box; }
        body {
            font-family: {{ $fontFamily }} !important;
            margin: 0;
            padding: 32px;
            color: var(--body);
            font-size: {{ $fontSize }}px;
            line-height: {{ $lineHeight }}px;
            background: #f9fafb;
        }
        .invoice {
            max-width: 920px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 24px;
        }
        .flex-between { display: flex; justify-content: space-between; gap: 16px; }
        .muted { color: var(--muted); font-size: max(10px, {{ $fontSize }}px - 1); }
        h1 { margin: 0 0 6px; font-size: 22px; color: var(--accent); letter-spacing: 0.3px; }
        h3 { margin: 12px 0 6px; font-size: 14px; color: var(--accent); }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: var(--primary); color: #fff; padding: 8px; font-size: max(10px, {{ $fontSize }}px - 1); text-align: left; }
        td { border-bottom: 1px solid var(--border); padding: 8px; vertical-align: top; }
        .totals { width: 320px; margin-left: auto; margin-top: 16px; }
        .totals td { border: none; padding: 6px 4px; }
        .totals .label { color: #4b5563; }
        .pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: max(10px, {{ $fontSize }}px - 1);
            background: var(--primary);
            color: #fff;
        }
        .panel {
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px;
            background: #f8fafc;
            margin-top: 14px;
        }
        .tax-table td, .tax-table th { border: 1px solid var(--border); }
        .tax-table th {
            background: #f1f5f9;
            color: var(--accent);
            text-align: center;
        }
            background: #eef2f7;
            border-bottom: 1px solid #e2e8f0;
        }
        td { border-bottom: 1px solid #eef2f6; vertical-align: top; }
        .desc { font-weight: 600; color: #0f172a; }
        .small { font-size: 11px; color: #64748b; }
        .tax-table {
            margin-top: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .tax-table th { background: #0f172a; color: #fff; }
        .totals {
            width: 280px;
            margin-left: auto;
            margin-top: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .totals td { border: none; padding: 10px 12px; }
        .totals .label { color: #475569; }
        .totals .total { font-weight: 700; font-size: 13px; }
        .note { margin-top: 16px; font-size: 11px; color: #475569; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <div>
                <h1>Tax Invoice</h1>
                <div class="muted">Compliant layout for VAT / GST</div>
            </div>
            <div style="text-align:right;">
                <div class="pill">Due in 14 days</div>
                <div class="muted" style="margin-top:6px;">Invoice #: TX-2024-119</div>
                <div class="muted">Date: Apr 12, 2024</div>
                <div class="muted">Place of Supply: Berlin, DE</div>
            </div>
        </div>

        <div class="section" style="display:flex; gap:18px;">
            <div style="flex:1;">
                <h3>Supplier</h3>
                <div class="desc">Nordwind Trading GmbH</div>
                <div class="muted">VAT ID: DE123456789</div>
                <div class="muted">Am Alexanderplatz 1, 10178 Berlin</div>
            </div>
            <div style="flex:1;">
                <h3>Customer</h3>
                <div class="desc">Willow Wholesale Ltd</div>
                <div class="muted">VAT ID: GB987654321</div>
                <div class="muted">42 Market Lane, London</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:45%;">Description</th>
                    <th style="width:12%;">Qty</th>
                    <th style="width:12%;">Unit</th>
                    <th style="width:13%;">Net</th>
                    <th style="width:18%;">Tax Code</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="desc">Bulk coffee beans</div>
                        <div class="small">Roasted, 1kg packs</div>
                    </td>
                    <td>120</td>
                    <td>kg</td>
                    <td>€18.00</td>
                    <td>VAT 7%</td>
                </tr>
                <tr>
                    <td>
                        <div class="desc">Packaging service</div>
                        <div class="small">Custom labeling, pallet wrap</div>
                    </td>
                    <td>1</td>
                    <td>lot</td>
                    <td>€320.00</td>
                    <td>VAT 19%</td>
                </tr>
            </tbody>
        </table>

        <div class="tax-table">
            <table>
                <thead>
                    <tr>
                        <th style="width:20%;">Tax Code</th>
                        <th style="width:20%;">Rate</th>
                        <th style="width:30%;">Taxable Base</th>
                        <th style="width:30%;">Tax Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>VAT 7%</td>
                        <td>7%</td>
                        <td>€2,160.00</td>
                        <td>€151.20</td>
                    </tr>
                    <tr>
                        <td>VAT 19%</td>
                        <td>19%</td>
                        <td>€320.00</td>
                        <td>€60.80</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="small" style="text-align:center; padding:10px 8px;">
                            Tax tables are separated for clarity and compliance.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <table class="totals">
            <tr>
                <td class="label">Net Total</td>
                <td class="text-right">€2,480.00</td>
            </tr>
            <tr>
                <td class="label">VAT Total</td>
                <td class="text-right">€212.00</td>
            </tr>
            <tr class="total-row">
                <td class="total">Invoice Total</td>
                <td class="text-right total">€2,692.00</td>
            </tr>
        </table>

        <div class="note">
            Reverse charge not applicable. Please include VAT IDs on remittance. Bank: IBAN DE00 1234 1234 1234 1234 12 / BIC NWBGDE77.
        </div>
    </div>
</body>
</html>
