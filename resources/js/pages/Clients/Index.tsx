
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';

interface Client {
    id: number;
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
}

export default function Index({ clients }: { clients: Client[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Clients', href: '/clients' }]}>
            <Head title="Clients" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                        <p className="text-muted-foreground">Manage your customer base.</p>
                    </div>
                    <Button asChild>
                        <Link href={'/clients/create'}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Card key={client.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {client.company_name || client.name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/clients/${client.id}/edit`}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    {/* Delete would need a proper form/dialog, skipping for brevity but can be added */}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                    {client.company_name && (
                                        <div className="font-semibold text-foreground">{client.name}</div>
                                    )}
                                    {client.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {client.phone}
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                            <span className="whitespace-pre-line truncate line-clamp-2">{client.address}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {clients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No clients found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
