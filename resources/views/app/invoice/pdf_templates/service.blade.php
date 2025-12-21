<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freelance Invoice</title>
    @php
        $primary = $template->primary_color ?? '#0f172a';
        $accent = $template->accent_color ?? '#075985';
        $bodyColor = $template->secondary_color ?? '#0f172a';
        $fontFamily = $template->font_family ?: "'Helvetica', 'Arial', sans-serif";
        $fontSize = $template->font_size ?: 12;
        $lineHeight = $template->line_height ?: 19;
    @endphp
    <style>
        :root {
            --primary: {{ $primary }};
            --accent: {{ $accent }};
            --body: {{ $bodyColor }};
            --muted: #64748b;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; }
        body {
            font-family: {{ $fontFamily }};
            margin: 0;
            padding: 32px;
            color: var(--body);
            background: #f8fafc;
            font-size: {{ $fontSize }}px;
            line-height: {{ $lineHeight }}px;
        }
        .wrap {
            max-width: 860px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 28px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .top {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: flex-start;
        }
        h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0.5px; color: var(--primary); }
        .pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: max(10px, {{ $fontSize }}px - 1);
            background: #e0f2fe;
            color: var(--accent);
        }
        .muted { color: var(--muted); font-size: max(10px, {{ $fontSize }}px - 1); }
        .section {
            margin-top: 20px;
            padding: 14px 16px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: #f8fafc;
        }
        .section h3 {
            margin: 0 0 8px;
            font-size: 13px;
            letter-spacing: 0.3px;
            color: var(--primary);
        }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th, td { padding: 12px 10px; text-align: left; }
        th {
            font-size: max(10px, {{ $fontSize }}px - 1);
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: #475569;
            background: #f1f5f9;
            border-bottom: 1px solid var(--border);
        }
        td { border-bottom: 1px solid #eef2f6; }
        .desc {
            font-weight: 600;
            color: var(--primary);
        }
        .small { font-size: max(10px, {{ $fontSize }}px - 1); color: var(--muted); }
        .totals {
            width: 260px;
            margin-left: auto;
            margin-top: 16px;
            border: 1px solid var(--border);
            border-radius: 10px;
            overflow: hidden;
        }
        .totals td { border: none; padding: 10px 12px; }
        .totals .label { color: #475569; }
        .totals .total { font-weight: 700; font-size: 13px; color: var(--primary); }
        .footer-note {
            margin-top: 18px;
            font-size: max(10px, {{ $fontSize }}px - 1);
            color: #475569;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="top">
            <div>
                <h1>Invoice</h1>
                <div class="muted">Freelance / Service Invoice</div>
            </div>
            <div class="text-right">
                <div class="pill">Due in 7 days</div>
                <div class="muted" style="margin-top:6px;">Invoice #</div>
                <div><strong>FR-2024-018</strong></div>
                <div class="muted">Issued: Mar 2, 2024</div>
            </div>
        </div>

        <div class="section" style="display:flex; gap:18px;">
            <div style="flex:1;">
                <h3>From</h3>
                <div class="desc">Indigo Studio</div>
                <div class="muted">creative@indigo.studio</div>
                <div class="muted">Portfolio: indigo.studio/work</div>
            </div>
            <div style="flex:1;">
                <h3>Bill To</h3>
                <div class="desc">Brightside Agency</div>
                <div class="muted">accounts@brightside.agency</div>
                <div class="muted">1520 Harbor Street, Seattle, WA</div>
            </div>
        </div>

        <div class="section">
            <h3>Project</h3>
            <div class="desc">Website refresh & content rollout</div>
            <div class="muted">Scope: UX polish, CMS content entry, launch support</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:60%;">Description</th>
                    <th style="width:16%;">Rate</th>
                    <th style="width:24%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="desc">UX & UI polish</div>
                        <div class="small">Design refinements, spacing, hierarchy adjustments</div>
                    </td>
                    <td>$90 / hr</td>
                    <td>$2,160.00</td>
                </tr>
                <tr>
                    <td>
                        <div class="desc">Content migration</div>
                        <div class="small">CMS entry for 18 pages, QA pass</div>
                    </td>
                    <td>$75 / hr</td>
                    <td>$1,350.00</td>
                </tr>
                <tr>
                    <td>
                        <div class="desc">Launch support</div>
                        <div class="small">DNS cutover, performance checks, UAT fixes</div>
                    </td>
                    <td>$90 / hr</td>
                    <td>$540.00</td>
                </tr>
                <tr>
                    <td colspan="3" class="small" style="text-align:center; padding:12px 8px;">
                        Service-focused layout—qty hidden, emphasis on deliverables and rate.
                    </td>
                </tr>
            </tbody>
        </table>

        <table class="totals">
            <tr>
                <td class="label">Subtotal</td>
                <td class="text-right">$4,050.00</td>
            </tr>
            <tr>
                <td class="label">Tax (0%)</td>
                <td class="text-right">$0.00</td>
            </tr>
            <tr>
                <td class="label">Discount</td>
                <td class="text-right">- $100.00</td>
            </tr>
            <tr class="total-row">
                <td class="total">Total</td>
                <td class="text-right total">$3,950.00</td>
            </tr>
            <tr>
                <td class="label">Due</td>
                <td class="text-right">$3,950.00</td>
            </tr>
        </table>

        <div class="notes">
            <h3 style="margin:16px 0 6px; font-size:13px;">Payment</h3>
            <div class="small">PayPal: pay@indigo.studio &nbsp;|&nbsp; Wire: INDIGO STUDIO / ABA 123456789</div>
        </div>

        <div class="footer-note">
            Need a minor copy tweak? Included. Major changes billed separately.
        </div>
    </div>
</body>
</html>
