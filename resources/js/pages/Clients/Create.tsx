
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea exists or use standard
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react'; // Inertia Form
import { FormEventHandler } from 'react';

// Fallback if Textarea component not found
const TextArea = (props: any) => <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />

interface Client {
    id?: number;
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_id: string | null;
    notes: string | null;
}

export default function Create({ client }: { client?: Client }) {
    const isEditing = !!client;

    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name || '',
        company_name: client?.company_name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        tax_id: client?.tax_id || '',
        notes: client?.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/clients/${client?.id}`);
        } else {
            post('/clients');
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Clients', href: '/clients' },
            { title: isEditing ? 'Edit Client' : 'Add Client', href: '' }
        ]}>
            <Head title={isEditing ? 'Edit Client' : 'Add Client'} />

            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Client' : 'New Client'}</CardTitle>
                        <CardDescription>
                            {isEditing ? 'Update client details.' : 'Add a new client to your contacts.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Contact Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                />
                                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                                <Input
                                    id="tax_id"
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                />
                                {errors.tax_id && <p className="text-sm text-red-500">{errors.tax_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <TextArea
                                    id="address"
                                    value={data.address}
                                    onChange={(e: any) => setData('address', e.target.value)}
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <TextArea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e: any) => setData('notes', e.target.value)}
                                    rows={2}
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Client' : 'Create Client'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
