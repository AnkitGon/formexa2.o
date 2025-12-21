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

            <div className="p-4">
                <div className="w-full max-w-4xl mx-auto overflow-y-auto bg-background p-4 lg:p-6 custom-scrollbar">
                    <div className="space-y-6 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Edit Salary Slip</h1>
                                <p className="text-muted-foreground">Configure salary slip details</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                            </div>
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
                </div>
            </div>
        </AppLayout>
    );
}
