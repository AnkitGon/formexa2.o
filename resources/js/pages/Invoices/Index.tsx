
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Eye, Pencil, FileText } from 'lucide-react';

interface Client {
    id: number;
    name: string;
    company_name: string | null;
}

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
    total: number;
    client: Client | null;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    sent: "default",
    paid: "default", // Maybe green if custom variant exists
    partially_paid: "default",
    overdue: "destructive",
    cancelled: "outline",
};

export default function Index({ invoices }: { invoices: Invoice[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices', href: '/invoices' }]}>
            <Head title="Invoices" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-muted-foreground">Manage your billing and payments.</p>
                    </div>
                    <Button asChild>
                        <Link href={'/invoices/create'}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id} className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-lg">{invoice.invoice_number}</span>
                                            <Badge variant={statusColors[invoice.status] || "default"}>
                                                {invoice.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {invoice.client?.company_name || invoice.client?.name || 'Unknown Client'}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Issued: {invoice.invoice_date} {invoice.due_date && `• Due: ${invoice.due_date}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:ml-auto">
                                    <div className="text-right">
                                        <div className="font-bold text-xl">
                                            ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Total Amount</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href={`/invoices/${invoice.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/invoices/${invoice.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {invoices.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                            No invoices found. Create your first invoice!
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
