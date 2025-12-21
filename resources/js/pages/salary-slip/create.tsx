import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import SalarySlipForm from './salary-slip-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Salary Slips',
        href: '/salary-slip',
    },
    {
        title: 'Create',
        href: '/salary-slip/create',
    },
];

export default function SalarySlipCreate() {
    const { templates, taxes } = usePage<
        SharedData & { templates: any[]; taxes: any[] }
    >().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Salary Slip" />

            <div className="p-4">
                <div className="w-full max-w-6xl mx-auto overflow-y-auto bg-background p-4 lg:p-6 custom-scrollbar">
                    <div className="space-y-6 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Create Salary Slip</h1>
                                <p className="text-muted-foreground">Configure salary slip details</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        <SalarySlipForm
                            mode="create"
                            action="/salary-slip"
                            templates={templates}
                            taxes={taxes}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
