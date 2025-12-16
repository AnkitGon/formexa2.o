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
        title: 'Create',
        href: '/taxes/create',
    },
];

export default function TaxCreate() {
    const { typeOptions } = usePage<SharedData & { typeOptions: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tax" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Create Tax</h1>
                    <Link
                        href="/taxes"
                        className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm"
                    >
                        Back
                    </Link>
                </div>

                <TaxForm mode="create" action="/taxes" typeOptions={typeOptions} />
            </div>
        </AppLayout>
    );
}
