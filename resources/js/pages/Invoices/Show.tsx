import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InvoicePaper, { InvoiceData, BusinessData } from '@/components/Invoices/InvoicePaper';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Printer, ArrowLeft, MoreHorizontal, Mail, Copy, FileText } from 'lucide-react';

import { useState } from 'react';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    status: string;
    notes: string | null;
    terms: string | null;
    subtotal: number;
    tax_total: number;
    total: number;
    amount_paid: number;
    client: any;
    items: any[];
    // ...other fields
    currency_symbol?: string;
    currency_position?: string;
    decimal_precision?: number;
    template_style?: string;
    primary_color?: string;
    show_logo?: boolean | number | string;
}

interface Business {
    name: string;
    email: string;
    logo_url?: string;
    company_address?: string;
}

export default function Show({ invoice, business }: { invoice: Invoice, business: Business }) {
    const { branding, settingsDefaults } = usePage().props as any;
    console.log(
        branding
    );
    
    const logoUrl = branding?.logo_light_url || branding?.logo_dark_url || business.logo_url;
    const dateFormat = (settingsDefaults?.date_format as string | null) ?? 'YYYY-MM-DD';
    const timeFormat = (settingsDefaults?.time_format as string | null) ?? 'hh:mm A';

    const formatDateTime = (value?: string | null, format?: string) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);

        const tokens: Record<string, string> = {
            YYYY: String(d.getFullYear()),
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            DD: String(d.getDate()).padStart(2, '0'),
            HH: String(d.getHours()).padStart(2, '0'),
            hh: String(((d.getHours() + 11) % 12) + 1).padStart(2, '0'),
            mm: String(d.getMinutes()).padStart(2, '0'),
            A: d.getHours() >= 12 ? 'PM' : 'AM',
        };

        const fmt = format || dateFormat;
        return fmt.replace(/YYYY|MM|DD|HH|hh|mm|A/g, (token) => tokens[token] ?? token);
    };

    const handleDuplicate = () => {
        if (confirm('Are you sure you want to duplicate this invoice?')) {
            window.location.href = `/invoices/${invoice.id}/duplicate`;
        }
    };

    const handleSend = () => {
        if (confirm(`Send invoice to ${invoice.client.email}?`)) {
            window.location.href = `/invoices/${invoice.id}/send`;
        }
    };

    // Transform invoice model to InvoiceData interface

    const invoiceData: InvoiceData = {
        invoice_number: invoice.invoice_number,
        invoice_date: formatDateTime(invoice.invoice_date, dateFormat),
        due_date: formatDateTime(invoice.due_date, dateFormat),
        status: invoice.status, // Add status
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax_total: invoice.tax_total,
        total: invoice.total,
        notes: invoice.notes,
        terms: invoice.terms,
        client: invoice.client,

        // Pass through styling props
        currency_symbol: invoice.currency_symbol,
        currency_position: invoice.currency_position as any,
        decimal_precision: invoice.decimal_precision,
        template_style: invoice.template_style,
        primary_color: invoice.primary_color,
        show_logo: invoice.show_logo,
    };

    const businessData: BusinessData = {
        name: business.name,
        email: business.email,
        logo_url: logoUrl,
        address: business.company_address // Ensure this is passed from controller if available
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Invoices', href: '/invoices' },
            { title: invoice.invoice_number, href: '' }
        ]}>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
                {/* Actions Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild className="-ml-4">
                        <Link href={'/invoices'}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <MoreHorizontal className="mr-2 h-4 w-4" /> Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Manage Invoice</DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleDuplicate}>
                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSend}>
                                    <Mail className="mr-2 h-4 w-4" /> Email Client
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href={`/invoices/${invoice.id}/print`} target="_blank" rel="noopener noreferrer">
                                        <Printer className="mr-2 h-4 w-4" /> Print / PDF
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Invoice Paper Preview */}
                <div className="mx-auto w-full max-w-[210mm] shadow-lg rounded-sm overflow-hidden">
                    <InvoicePaper
                        data={invoiceData}
                        business={businessData}
                        className="min-h-[297mm] p-[20mm]"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
