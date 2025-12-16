import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import SalarySlipTemplateForm from './template-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Salary Slip Templates',
        href: '/template/salary-slip',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function SalarySlipTemplateEdit() {
    const { designOptions, template } = usePage<
        SharedData & { designOptions: any; template: any }
    >().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Salary Slip Template" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">
                        Edit Salary Slip Template
                    </h1>
                    <Link
                        href="/template/salary-slip"
                        className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm"
                    >
                        Back
                    </Link>
                </div>

                <SalarySlipTemplateForm
                    mode="edit"
                    action={`/template/salary-slip/${template.id}`}
                    designOptions={designOptions}
                    template={template}
                />
            </div>
        </AppLayout>
    );
}
