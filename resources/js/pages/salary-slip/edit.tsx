import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import SalarySlipForm from './salary-slip-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Salary Slips',
        href: '/salary-slip',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function SalarySlipEdit() {
    const { templates, salarySlip, taxes } = usePage<
        SharedData & { templates: any[]; salarySlip: any; taxes: any[] }
    >().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Salary Slip" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Edit Salary Slip</h1>
                    <Link
                        href="/salary-slip"
                        className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm"
                    >
                        Back
                    </Link>
                </div>

                <SalarySlipForm
                    mode="edit"
                    action={`/salary-slip/${salarySlip.id}`}
                    templates={templates}
                    taxes={taxes}
                    salarySlip={salarySlip}
                    showExtraSections
                />
            </div>
        </AppLayout>
    );
}
