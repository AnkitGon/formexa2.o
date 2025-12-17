import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type Props = SharedData & {
    salarySlip: any;
};

export default function SalarySlipShow() {
    const { salarySlip } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Salary Slips', href: '/salary-slip' },
        { title: `#${salarySlip?.id ?? ''}`, href: `/salary-slip/${salarySlip?.id ?? ''}` },
    ];

    const meta = (salarySlip?.meta ?? {}) as Record<string, any>;

    const payslipLabels = (meta.payslip_labels ?? {}) as Record<string, any>;
    const employeeLabels = (meta.employee_labels ?? {}) as Record<string, any>;

    const payslipRows = Object.entries(payslipLabels)
        .map(([key, label]) => ({
            key,
            label: String(label ?? '').trim(),
            value: meta[key],
        }))
        .filter((r) => r.label && r.value !== undefined && r.value !== null && String(r.value).trim() !== '');

    const employeeRows = Object.entries(employeeLabels)
        .map(([key, label]) => ({
            key,
            label: String(label ?? '').trim(),
            value: meta[key],
        }))
        .filter((r) => r.label && r.value !== undefined && r.value !== null && String(r.value).trim() !== '');

    const earnings = Array.isArray(meta.earnings) ? meta.earnings : [];
    const deductions = Array.isArray(meta.deductions) ? meta.deductions : [];

    const formatMoney = (n: any) => {
        const num = Number(n ?? 0);
        return Number.isFinite(num) ? num.toFixed(2) : '0.00';
    };

    const formatDateTime = (value: any) => {
        const raw = String(value ?? '').trim();
        if (!raw) {
            return '-';
        }

        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
            return raw;
        }

        try {
            return new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(date);
        } catch {
            return date.toLocaleString();
        }
    };

    const employerSignatureSrc = String(salarySlip?.employer_signature_url ?? '').trim();
    const employeeSignatureSrc = String(salarySlip?.employee_signature_url ?? '').trim();
    const showEmployerSignature = employerSignatureSrc !== '';
    const showEmployeeSignature = employeeSignatureSrc !== '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Salary Slip #${salarySlip?.id ?? ''}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-lg font-semibold">
                            Salary Slip <span className="text-muted-foreground">#{salarySlip?.id}</span>
                        </h1>
                        <div className="text-sm text-muted-foreground">
                            {meta.employee_name ? <span>{meta.employee_name}</span> : null}
                            {meta.pay_period ? <span> · {meta.pay_period}</span> : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/salary-slip">Back</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/salary-slip/${salarySlip?.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm">
                            <a href={`/salary-slip/${salarySlip?.id}/download`}>Download PDF</a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-4 lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Company</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Heading</div>
                                        <div className="text-sm font-medium">{meta.heading ?? '-'}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-muted-foreground">Template</div>
                                        <div className="text-sm font-medium">
                                            {salarySlip?.template?.name ?? '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-muted-foreground">Company name</div>
                                        <div className="text-sm font-medium">{meta.company_name ?? '-'}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-muted-foreground">Company address</div>
                                        <div className="text-sm whitespace-pre-wrap">
                                            {meta.company_address ?? '-'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Payslip details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {payslipRows.length ? (
                                        <div className="grid gap-2">
                                            {payslipRows.map((r) => (
                                                <div key={r.key} className="flex items-start justify-between gap-4">
                                                    <div className="text-sm text-muted-foreground">{r.label}</div>
                                                    <div className="text-sm font-medium text-right">
                                                        {String(r.value)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No payslip fields</div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Employee details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {employeeRows.length ? (
                                        <div className="grid gap-2">
                                            {employeeRows.map((r) => (
                                                <div key={r.key} className="flex items-start justify-between gap-4">
                                                    <div className="text-sm text-muted-foreground">{r.label}</div>
                                                    <div className="text-sm font-medium text-right">
                                                        {String(r.value)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No employee fields</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Earnings & Deductions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Earnings</div>
                                        <div className="rounded-lg border border-sidebar-border/70">
                                            <table className="w-full text-sm">
                                                <thead className="border-b border-sidebar-border/70 bg-muted/30">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Title</th>
                                                        <th className="px-3 py-2 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(earnings.length ? earnings : [{ label: '—', amount: 0 }]).map(
                                                        (row: any, idx: number) => (
                                                            <tr key={idx} className="border-b border-sidebar-border/50 last:border-b-0">
                                                                <td className="px-3 py-2">{row?.label ?? ''}</td>
                                                                <td className="px-3 py-2 text-right tabular-nums">
                                                                    {formatMoney(row?.amount)}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Deductions</div>
                                        <div className="rounded-lg border border-sidebar-border/70">
                                            <table className="w-full text-sm">
                                                <thead className="border-b border-sidebar-border/70 bg-muted/30">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Title</th>
                                                        <th className="px-3 py-2 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(deductions.length ? deductions : [{ label: '—', amount: 0 }]).map(
                                                        (row: any, idx: number) => (
                                                            <tr key={idx} className="border-b border-sidebar-border/50 last:border-b-0">
                                                                <td className="px-3 py-2">{row?.label ?? ''}</td>
                                                                <td className="px-3 py-2 text-right tabular-nums">
                                                                    {formatMoney(row?.amount)}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Basic salary</div>
                                        <div className="text-sm font-semibold tabular-nums">
                                            {formatMoney(salarySlip?.basic_salary)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Allowance</div>
                                        <div className="text-sm font-semibold tabular-nums">
                                            {formatMoney(salarySlip?.allowance_amount)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Deductions</div>
                                        <div className="text-sm font-semibold tabular-nums">
                                            {formatMoney(salarySlip?.deduction_amount)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-sidebar-border/70 bg-muted/30 px-3 py-2">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Net pay</div>
                                        <div className="text-xs text-muted-foreground">Total earnings minus deductions</div>
                                    </div>
                                    <div className="text-lg font-semibold tabular-nums">
                                        {formatMoney(salarySlip?.net_salary)}
                                    </div>
                                </div>

                                {meta.show_net_pay_in_words && meta.net_pay_in_words ? (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Net pay in words:</span>{' '}
                                        <span className="font-medium">{meta.net_pay_in_words}</span>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Signatures</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Employer</div>
                                    {showEmployerSignature ? (
                                        <div className="flex items-center justify-center rounded-md border border-sidebar-border/70 bg-white p-2">
                                            <img
                                                src={employerSignatureSrc}
                                                alt="Employer signature"
                                                loading="lazy"
                                                className="h-16 w-auto max-w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Not provided</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Employee</div>
                                    {showEmployeeSignature ? (
                                        <div className="flex items-center justify-center rounded-md border border-sidebar-border/70 bg-white p-2">
                                            <img
                                                src={employeeSignatureSrc}
                                                alt="Employee signature"
                                                loading="lazy"
                                                className="h-16 w-auto max-w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Not provided</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <div className="text-muted-foreground">Created</div>
                                    <div className="font-medium">{formatDateTime(salarySlip?.created_at)}</div>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <div className="text-muted-foreground">Updated</div>
                                    <div className="font-medium">{formatDateTime(salarySlip?.updated_at)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
