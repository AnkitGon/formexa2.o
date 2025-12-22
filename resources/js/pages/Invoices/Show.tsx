import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InvoicePaper, { InvoiceData, BusinessData } from '@/Components/Invoices/InvoicePaper';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Printer, ArrowLeft, MoreHorizontal, Mail, Copy, FileText } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Assuming, or fallback
import { useState } from 'react';

declare var route: any; // Temporary fix for global route function

interface Payment {
    id: number;
    amount: string;
    payment_date: string;
    payment_method: string;
    reference_number?: string | null;
    notes?: string | null;
}

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
    amount_paid: number; // Added
    payments: Payment[]; // Added
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
    const { post, delete: destroy, processing, reset, data, setData, errors } = useForm({
        amount: Math.max(0, invoice.total - Number(invoice.amount_paid)).toFixed(2),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        reference_number: '',
        notes: ''
    });

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleDuplicate = () => {
        if (confirm('Are you sure you want to duplicate this invoice?')) {
            post(route('invoices.duplicate', invoice.id));
        }
    };

    const handleSend = () => {
        if (confirm(`Send invoice to ${invoice.client.email}?`)) {
            post(route('invoices.send', invoice.id), {
                onSuccess: () => alert('Invoice sent successfully')
            });
        }
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invoices.payments.store', invoice.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                reset();
                alert('Payment recorded successfully');
            }
        });
    };

    const deletePayment = (paymentId: number) => {
        if (confirm('Are you sure you want to delete this payment record?')) {
            destroy(route('invoices.payments.destroy', [invoice.id, paymentId]), {
                onSuccess: () => alert('Payment deleted')
            });
        }
    }

    // Transform invoice model to InvoiceData interface
    const invoiceData: InvoiceData = {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
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
        logo_url: business.logo_url,
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
                                    <a href={route('invoices.print', invoice.id)} target="_blank" rel="noopener noreferrer">
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

                        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                            <DialogTrigger asChild>
                                <Button>Record Payment</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Record Payment</DialogTitle>
                                    <DialogDescription>
                                        Enter payment details for Invoice #{invoice.invoice_number}.
                                        Current Balance: {(invoice.total - invoice.amount_paid).toFixed(2)}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitPayment} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="amount" className="text-right">
                                            Amount
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="date" className="text-right">
                                            Date
                                        </Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="method" className="text-right">
                                            Method
                                        </Label>
                                        <Select value={data.payment_method} onValueChange={(val) => setData('payment_method', val)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                <SelectItem value="PayPal">PayPal</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="notes" className="text-right">
                                            Notes
                                        </Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="col-span-3"
                                            placeholder="Optional..."
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing}>Save Payment</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Payments Section (Visible if payments exist or balance > 0) */}
                {(invoice.payments.length > 0) && (
                    <div className="mx-auto w-full max-w-[210mm] bg-white p-6 shadow-sm border rounded-lg print:hidden">
                        <h3 className="font-bold text-lg mb-4">Payment History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-gray-500">
                                        <th className="py-2">Date</th>
                                        <th className="py-2">Method</th>
                                        <th className="py-2">Notes</th>
                                        <th className="py-2 text-right">Amount</th>
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments.map(payment => (
                                        <tr key={payment.id} className="border-b">
                                            <td className="py-2">{payment.payment_date}</td>
                                            <td className="py-2">{payment.payment_method}</td>
                                            <td className="py-2 text-gray-500 truncate max-w-[200px]">{payment.notes}</td>
                                            <td className="py-2 text-right font-medium">{Number(payment.amount).toFixed(2)}</td>
                                            <td className="py-2 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => deletePayment(payment.id)} className="h-6 w-6 text-red-500 hover:text-red-700">
                                                    <span className="sr-only">Delete</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={3} className="py-2 text-right">Total Paid:</td>
                                        <td className="py-2 text-right">{invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="py-2 text-right text-gray-500">Amount Due:</td>
                                        <td className="py-2 text-right text-red-600 font-bold">{(invoice.total - invoice.amount_paid).toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
