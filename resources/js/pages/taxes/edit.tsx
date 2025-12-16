import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import TaxForm from './tax-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Taxes',
        href: '/taxes',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function TaxEdit() {
    const { tax, typeOptions } = usePage<
        SharedData & { tax: any; typeOptions: any }
    >().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tax" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Edit Tax</h1>
                    <Link
                        href="/taxes"
                        className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm"
                    >
                        Back
                    </Link>
                </div>

                <TaxForm
                    mode="edit"
                    action={`/taxes/${tax.id}`}
                    typeOptions={typeOptions}
                    tax={tax}
                />
            </div>
        </AppLayout>
    );
}
