<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Retail Invoice</title>
    @php
        $primary = $template->primary_color ?? '#475569';
        $accent = $template->accent_color ?? '#0f172a';
        $bodyColor = $template->secondary_color ?? '#0f172a';
        $fontFamily = trim((string) ($template->font_family ?? ''));
        if ($fontFamily === '') {
            $fontFamily = 'Arial, sans-serif';
        }
        $fontSize = $template->font_size ?: 12;
        $lineHeight = $template->line_height ?: 18;
    @endphp
    <style>
        :root {
            --primary: {{ $primary }};
            --accent: {{ $accent }};
            --body: {{ $bodyColor }};
            --border: #cbd5e1;
            --muted: #64748b;
        }
        * { box-sizing: border-box; }
        body {
            font-family: {{ $fontFamily }} !important;
            margin: 0;
            padding: 16px;
            color: var(--body);
            background: #ffffff;
            font-size: {{ $fontSize }}px;
            line-height: {{ $lineHeight }}px;
        }
        .receipt {
            max-width: 420px;
            margin: 0 auto;
            border: 1px dashed var(--border);
            padding: 16px;
        }
        h1 { margin: 0 0 6px; font-size: 18px; text-align: center; letter-spacing: 0.4px; color: var(--accent); }
        .muted { color: var(--muted); font-size: max(10px, {{ $fontSize }}px - 1); }
        .row { display: flex; justify-content: space-between; align-items: center; }
        .info { margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { padding: 6px 4px; text-align: left; }
        th { font-size: max(10px, {{ $fontSize }}px - 1); text-transform: uppercase; letter-spacing: 0.3px; color: var(--primary); border-bottom: 1px solid #e2e8f0; }
        td { border-bottom: 1px solid #f1f5f9; }
        .total-row td { font-weight: 700; color: var(--accent); }
        .totals { margin-top: 8px; }
        .center { text-align: center; }
        .small { font-size: max(9px, {{ $fontSize }}px - 2); color: var(--primary); }
    </style>
</head>
<body>
    <div class="receipt">
        <h1>Retail Invoice</h1>
        <div class="center muted">POS-friendly, compact layout</div>

        <div class="info row">
            <div>
                <div><strong>MiniMart</strong></div>
                <div class="muted">123 Corner Street</div>
                <div class="muted">City Center</div>
            </div>
            <div style="text-align:right;">
                <div class="muted">Receipt #: RT-0081</div>
                <div class="muted">Date: Apr 18, 2024</div>
                <div class="muted">Cashier: Sam</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:52%;">Item</th>
                    <th style="width:12%;">Qty</th>
                    <th style="width:18%;">Price</th>
                    <th style="width:18%;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Bread (Whole Wheat)</td>
                    <td>2</td>
                    <td>$2.50</td>
                    <td>$5.00</td>
                </tr>
                <tr>
                    <td>Milk 1L</td>
                    <td>1</td>
                    <td>$1.80</td>
                    <td>$1.80</td>
                </tr>
                <tr>
                    <td>Fruit Pack</td>
                    <td>1</td>
                    <td>$4.20</td>
                    <td>$4.20</td>
                </tr>
                <tr>
                    <td>Snacks</td>
                    <td>3</td>
                    <td>$1.50</td>
                    <td>$4.50</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="row">
                <div class="muted">Subtotal</div>
                <div>$15.50</div>
            </div>
            <div class="row">
                <div class="muted">Tax (5%)</div>
                <div>$0.78</div>
            </div>
            <div class="row total-row">
                <div>Total</div>
                <div>$16.28</div>
            </div>
            <div class="row">
                <div class="muted">Paid</div>
                <div>$20.00 (Cash)</div>
            </div>
            <div class="row total-row">
                <div>Change</div>
                <div>$3.72</div>
            </div>
        </div>

        <div class="center small" style="margin-top:10px;">
            Thank you for shopping! No returns without receipt.
        </div>
    </div>
</body>
</html>
