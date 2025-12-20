import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoicePaper, { InvoiceData, BusinessData } from '@/Components/Invoices/InvoicePaper';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Save, Printer, ArrowLeft, Maximize2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

// Textarea fallback
// Textarea fallback
const Textarea = (props: any) => <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y" {...props} />;

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import axios from 'axios';

declare var route: any; // Fix route error

interface Client {
    id: number;
    name: string;
    company_name: string | null;
    email?: string | null;
    address?: string | null;
    tax_id?: string | null;
}

interface InvoiceProps {
    invoice?: any;
    clients: Client[];
    nextNumber?: string;
    today?: string;
    business_settings?: any; // Passed from controller
}

interface InvoiceFormData {
    client_id: string | number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    notes: string;
    terms: string;
    items: any[];
    currency_symbol: string;
    currency_position: string;
    decimal_precision: string | number;
    thousands_separator: string;
    decimal_separator: string;
    template_style: string;
    primary_color: string;
    show_logo: boolean;
}

export default function Create({ invoice, clients, nextNumber, today, business_settings }: InvoiceProps) {
    const isEditing = !!invoice;

    // Use passed settings or defaults. The settings come from user_settings table via controller
    const defaultSettings = business_settings || {};

    const { data, setData, post, put, processing, errors } = useForm<InvoiceFormData>({
        client_id: invoice?.client_id || '',
        invoice_number: invoice?.invoice_number || nextNumber || '',
        invoice_date: invoice?.invoice_date || today || '',
        due_date: invoice?.due_date || '',
        status: invoice?.status || 'draft',
        notes: invoice?.notes || '',
        terms: invoice?.terms || '',
        items: (invoice?.items || [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]) as any[],

        // Branding snapshots (editable per invoice)
        currency_symbol: invoice?.currency_symbol || defaultSettings.currency_symbol || '$',
        currency_position: invoice?.currency_position || defaultSettings.currency_position || 'before',
        decimal_precision: invoice?.decimal_precision || defaultSettings.decimal_precision || '2',
        thousands_separator: invoice?.thousands_separator || defaultSettings.thousands_separator || ',',
        decimal_separator: invoice?.decimal_separator || defaultSettings.decimal_separator || '.',
        template_style: invoice?.template_style || defaultSettings.invoice_template || 'classic',
        primary_color: invoice?.primary_color || defaultSettings.primary_color || '#000000',
        show_logo: invoice?.show_logo !== undefined ? Boolean(invoice.show_logo) : (defaultSettings.show_logo === '1' || defaultSettings.show_logo === true),
    });

    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
    const [clientList, setClientList] = useState<Client[]>(clients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Quick Client Creation State
    const [newClientData, setNewClientData] = useState({
        name: '',
        company_name: '',
        email: '',
    });
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingClient(true);
        try {
            const response = await axios.post(route('clients.store'), newClientData, {
                headers: { 'Accept': 'application/json' }
            });

            // Success
            const newClient = response.data;
            setClientList([newClient, ...clientList]);
            setData('client_id', String(newClient.id));
            setIsClientModalOpen(false);
            setNewClientData({ name: '', company_name: '', email: '' });
            alert('Client added successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to create client. Please check fields.');
        } finally {
            setIsCreatingClient(false);
        }
    };

    // ...
    useEffect(() => {
        let sub = 0;
        let tax = 0;

        data.items.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unit_price) || 0;
            const rate = Number(item.tax_rate) || 0;

            const amount = qty * price;
            const itemTax = amount * (rate / 100); // Only percent supported in UI for now, logic supports fixed

            sub += amount;
            tax += itemTax;
        });

        setTotals({
            subtotal: sub,
            tax: tax,
            total: sub + tax
        });
    }, [data.items]);

    // Update selected client when client_id changes
    useEffect(() => {
        if (data.client_id) {
            const client = clientList.find(c => String(c.id) === String(data.client_id));
            setSelectedClient(client || null);
        } else {
            setSelectedClient(null);
        }
    }, [data.client_id, clientList]);

    // Update local list if props change (e.g. after reload)
    useEffect(() => {
        setClientList(clients);
    }, [clients]);

    const addItem = () => {
        setData('items', [
            ...data.items,
            { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/invoices/${invoice.id}`);
        } else {
            post('/invoices');
        }
    };

    // Prepare preview data
    const previewData: InvoiceData = {
        ...data,
        subtotal: totals.subtotal,
        tax_total: totals.tax,
        total: totals.total,
        client: selectedClient ? {
            name: selectedClient.name,
            company_name: selectedClient.company_name,
            address: selectedClient.address,
            email: selectedClient.email,
            tax_id: selectedClient.tax_id
        } : undefined,
        items: data.items,
        // Ensure types match
        show_logo: Boolean(data.show_logo),
        currency_position: data.currency_position as 'before' | 'after',
        decimal_precision: Number(data.decimal_precision),
    };

    const businessData: BusinessData = {
        name: defaultSettings.company_name || 'My Company',
        email: 'contact@example.com', // Should come from settings
        address: defaultSettings.company_address || '',
        logo_url: defaultSettings.logo_url // Should be passed
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Invoices', href: '/invoices' },
            { title: isEditing ? 'Edit' : 'Create', href: '' }
        ]}>
            <Head title={isEditing ? 'Edit Invoice' : 'New Invoice'} />

            {/* Split View Layout */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">

                {/* Left: Editor (Scrollable) */}
                <div className="w-full lg:w-1/2 h-full overflow-y-auto border-r bg-background p-4 lg:p-6 custom-scrollbar">
                    <div className="max-w-2xl mx-auto space-y-6 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
                                <p className="text-muted-foreground">Manage invoice details</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={submit} disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-8">

                            {/* Section: Basic Info */}
                            <div className="grid gap-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label>Client</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={String(data.client_id)}
                                                onValueChange={(val) => setData('client_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Client" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientList.map(client => (
                                                        <SelectItem key={client.id} value={String(client.id)}>
                                                            {client.company_name || client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Client</DialogTitle>
                                                        <DialogDescription>Create a new client record instantly.</DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={handleCreateClient} className="space-y-4 pt-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Name *</Label>
                                                                <Input
                                                                    required
                                                                    value={newClientData.name}
                                                                    onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Company Name</Label>
                                                                <Input
                                                                    value={newClientData.company_name}
                                                                    onChange={e => setNewClientData({ ...newClientData, company_name: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Email</Label>
                                                            <Input
                                                                type="email"
                                                                value={newClientData.email}
                                                                onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="button" variant="outline" onClick={() => setIsClientModalOpen(false)}>Cancel</Button>
                                                            <Button type="submit" disabled={isCreatingClient}>Create Client</Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        {selectedClient && (
                                            <div className="text-sm text-gray-500 border p-3 rounded-md mt-2">
                                                <p className="font-bold">{selectedClient.company_name}</p>
                                                <p>{selectedClient.name}</p>
                                                <p>{selectedClient.email}</p>
                                            </div>
                                        )}                                        {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Invoice #</Label>
                                        <Input
                                            value={data.invoice_number}
                                            onChange={e => setData('invoice_number', e.target.value)}
                                            className="font-mono"
                                        />
                                        {errors.invoice_number && <p className="text-sm text-red-500">{errors.invoice_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="sent">Sent</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Issued Date</Label>
                                        <Input
                                            type="date"
                                            value={data.invoice_date}
                                            onChange={e => setData('invoice_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            value={data.due_date}
                                            onChange={e => setData('due_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Section: Items */}
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                        Items
                                    </h3>
                                    <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-primary hover:text-primary/80">
                                        <Plus className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="group relative grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-card hover:shadow-sm transition-all">
                                            <div className="col-span-12 sm:col-span-5">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={e => updateItem(index, 'description', e.target.value)}
                                                    placeholder="Item name / description"
                                                    className="border-0 shadow-none px-0 -ml-1 h-8 focus-visible:ring-0 font-medium"
                                                />
                                            </div>
                                            <div className="col-span-3 sm:col-span-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Qty</Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                    className="border-0 shadow-none px-0 -ml-1 h-8 focus-visible:ring-0"
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Price</Label>
                                                <Input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                                    className="border-0 shadow-none px-0 -ml-1 h-8 focus-visible:ring-0"
                                                />
                                            </div>
                                            <div className="col-span-3 sm:col-span-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Total</Label>
                                                <div className="h-8 flex items-center font-medium text-sm">
                                                    {(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1 flex justify-end pt-6">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-8 px-4 text-sm font-medium">
                                    <div className="text-muted-foreground">Subtotal: <span className="text-foreground ml-2">{totals.subtotal.toFixed(2)}</span></div>
                                    <div className="text-muted-foreground">Tax: <span className="text-foreground ml-2">{totals.tax.toFixed(2)}</span></div>
                                    <div className="text-lg font-bold">Total: <span className="text-primary ml-2">{totals.total.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <Separator />

                            {/* Section: Customization (Accordion style) */}
                            <div className="grid gap-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Details & Branding
                                </h3>

                                <Tabs defaultValue="notes" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="notes">Notes</TabsTrigger>
                                        <TabsTrigger value="branding">Branding</TabsTrigger>
                                        <TabsTrigger value="settings">Settings</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="notes" className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label>Notes</Label>
                                            <Textarea
                                                value={data.notes}
                                                onChange={(e: any) => setData('notes', e.target.value)}
                                                placeholder="Additional notes for the client..."
                                                rows={4}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Terms</Label>
                                            <Textarea
                                                value={data.terms}
                                                onChange={(e: any) => setData('terms', e.target.value)}
                                                placeholder="Payment terms..."
                                                rows={4}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="branding" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Template</Label>
                                                <Select value={data.template_style} onValueChange={(val) => setData('template_style', val)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="classic">Classic</SelectItem>
                                                        <SelectItem value="modern">Modern</SelectItem>
                                                        <SelectItem value="minimal">Minimal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Primary Color</Label>
                                                <div className="flex gap-2">
                                                    <Input type="color" className="w-10 h-10 p-1" value={data.primary_color} onChange={e => setData('primary_color', e.target.value)} />
                                                    <Input value={data.primary_color} onChange={e => setData('primary_color', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-8">
                                                <input type="checkbox" id="show_logo_toggle" checked={Boolean(data.show_logo)} onChange={e => setData('show_logo', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                                                <Label htmlFor="show_logo_toggle">Show Logo</Label>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="settings" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Currency Symbol</Label>
                                                <Input value={data.currency_symbol} onChange={e => setData('currency_symbol', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Currency Position</Label>
                                                <Select value={data.currency_position} onValueChange={(val) => setData('currency_position', val)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="before">Before ($100)</SelectItem>
                                                        <SelectItem value="after">After (100$)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                        </form>
                    </div>
                </div>

                {/* Right: Live Preview (Hidden on small screens) */}
                <div className="hidden lg:block w-1/2 h-full bg-slate-100 p-8 overflow-y-auto">
                    <div className="max-w-[210mm] mx-auto transform origin-top scale-[0.8] xl:scale-[0.9] 2xl:scale-100 transition-transform">
                        <InvoicePaper data={previewData} business={businessData} />
                    </div>
                </div>

                {/* Mobile Preview Button */}
                <div className="lg:hidden fixed bottom-4 right-4 z-50">
                    <Button className="rounded-full shadow-lg h-12 w-12 p-0" onClick={() => {
                        // Implement mobile preview modal if needed
                        // For now just submit
                    }}>
                        <Save className="h-5 w-5" />
                    </Button>
                </div>
            </div >
        </AppLayout >
    );
}
