import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Salary Slip Templates',
        href: '/template/salary-slip',
    },
];

export default function SalarySlipTemplateIndex() {
    const { templates } = usePage<SharedData & { templates: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Salary Slip Templates" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Salary Slip Templates</h1>
                    <Link
                        href="/template/salary-slip/create"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    >
                        Create
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                    <table className="w-full text-sm">
                        <thead className="border-b border-sidebar-border/70 bg-muted/30 text-left">
                            <tr>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Code</th>
                                <th className="px-3 py-2">Active</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(templates?.data ?? []).map((t: any) => (
                                <tr
                                    key={t.id}
                                    className="border-b border-sidebar-border/50 last:border-b-0"
                                >
                                    <td className="px-3 py-2">{t.name}</td>
                                    <td className="px-3 py-2">{t.code}</td>
                                    <td className="px-3 py-2">
                                        {t.is_active ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={`/template/salary-slip/${t.id}/edit`}>Edit</Link>
                                            </Button>
                                            <Form
                                                method="post"
                                                action={`/template/salary-slip/${t.id}`}
                                                className="inline"
                                                onSubmit={(e) => {
                                                    if (!window.confirm('Are you sure you want to delete this item?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input type="hidden" name="_method" value="DELETE" />
                                                <Button type="submit" variant="destructive">
                                                    Delete
                                                </Button>
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
