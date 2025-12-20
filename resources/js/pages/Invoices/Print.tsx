import InvoicePaper, { InvoiceData, BusinessData } from '@/Components/Invoices/InvoicePaper';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface Props {
    invoice: any;
    business_settings: any;
}

export default function Print({ invoice, business_settings }: Props) {

    useEffect(() => {
        // Optional: Auto-print on load
        // window.print();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    // Transform invoice model to InvoiceData interface
    const invoiceData: InvoiceData = {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        status: invoice.status,
        items: invoice.items,
        subtotal: invoice.subtotal ?? invoice.items.reduce((acc: number, item: any) => acc + Number(item.amount), 0),
        tax_total: invoice.tax_total ?? invoice.items.reduce((acc: number, item: any) => acc + (Number(item.amount) * (Number(item.tax_rate) / 100)), 0),
        total: invoice.total ?? 0, // Should be calculated if missing
        notes: invoice.notes,
        terms: invoice.terms,
        client: invoice.client,

        // Settings/Snapshots
        currency_symbol: invoice.currency_symbol || business_settings?.currency_symbol || '$',
        currency_position: invoice.currency_position || business_settings?.currency_position || 'before',
        decimal_precision: Number(invoice.decimal_precision || business_settings?.decimal_precision || 2),
        thousands_separator: invoice.thousands_separator || business_settings?.thousands_separator || ',',
        decimal_separator: invoice.decimal_separator || business_settings?.decimal_separator || '.',
        template_style: invoice.template_style || business_settings?.invoice_template || 'classic',
        primary_color: invoice.primary_color || business_settings?.primary_color || '#000000',
        show_logo: invoice.show_logo !== undefined ? Boolean(invoice.show_logo) : (business_settings?.show_logo === '1' || business_settings?.show_logo === true),
    };

    // Calculate total if not present (fallback)
    if (!invoiceData.total) {
        const sub = invoiceData.subtotal;
        const tax = invoiceData.tax_total;
        invoiceData.total = sub + tax;
    }

    const businessData: BusinessData = {
        name: business_settings?.company_name || 'My Company',
        email: business_settings?.company_email,
        address: business_settings?.company_address,
        logo_url: business_settings?.logo_url,
    };

    return (
        <div className="bg-slate-100 min-h-screen p-8 print:p-0 print:bg-white">
            <Head title={`Invoice ${invoice.invoice_number}`} />

            {/* Toolbar - Hidden when printing */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => window.history.back()}>
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print / Save as PDF
                    </Button>
                </div>
            </div>

            {/* Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full">
                <InvoicePaper
                    data={invoiceData}
                    business={businessData}
                    className="min-h-[297mm] p-[20mm] print:p-0 print:m-0"
                />
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
}
