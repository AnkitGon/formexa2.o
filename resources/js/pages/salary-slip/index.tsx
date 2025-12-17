import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, Form } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Salary Slips',
        href: '/salary-slip',
    },
];

export default function SalarySlipIndex() {
    const { salarySlips } = usePage<SharedData & { salarySlips: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Salary Slips" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Salary Slips</h1>
                    <Link
                        href="/salary-slip/create"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    >
                        Create
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                    <table className="w-full text-sm">
                        <thead className="border-b border-sidebar-border/70 bg-muted/30 text-left">
                            <tr>
                                <th className="px-3 py-2">Template</th>
                                <th className="px-3 py-2">Employee</th>
                                <th className="px-3 py-2 text-right">Net Salary</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(salarySlips?.data ?? []).map((slip: any) => (
                                <tr
                                    key={slip.id}
                                    className="border-b border-sidebar-border/50 last:border-b-0"
                                >
                                    <td className="px-3 py-2">
                                        {slip.template?.name ?? ''}
                                    </td>
                                    <td className="px-3 py-2">
                                        {slip.meta?.employee_name ?? ''}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {Number(slip.net_salary ?? 0).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/salary-slip/${slip.id}`}
                                                className="rounded-md border border-sidebar-border/70 px-2 py-1 text-xs"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/salary-slip/${slip.id}/edit`}
                                                className="rounded-md border border-sidebar-border/70 px-2 py-1 text-xs"
                                            >
                                                Edit
                                            </Link>
                                            <a
                                                href={`/salary-slip/${slip.id}/download`}
                                                className="rounded-md border border-sidebar-border/70 px-2 py-1 text-xs"
                                            >
                                                Download
                                            </a>
                                            <Form
                                                method="post"
                                                action={`/salary-slip/${slip.id}`}
                                                className="inline"
                                                onSubmit={(e) => {
                                                    if (!window.confirm('Are you sure you want to delete this item?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input type="hidden" name="_method" value="DELETE" />
                                                <button
                                                    type="submit"
                                                    className="rounded-md border border-destructive/50 px-2 py-1 text-xs text-destructive"
                                                >
                                                    Delete
                                                </button>
                                            </Form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
