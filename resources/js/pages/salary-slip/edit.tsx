import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type KeyValueRow = {
    key: string;
    label: string;
    value: string;
};

type LabelValueRow = {
    label: string;
    value: string;
};

type AmountRow = {
    label: string;
    amount: string;
};

function ensureUniqueKey(base: string, used: Set<string>) {
    if (!base) {
        base = 'field';
    }

    let key = base;
    let i = 2;
    while (used.has(key)) {
        key = `${base}_${i}`;
        i++;
    }
    return key;
}

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
    const { templates, salarySlip } = usePage<
        SharedData & { templates: any[]; salarySlip: any }
    >().props;

    const [previewHtml, setPreviewHtml] = useState('');
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewTimeoutRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const initialPayslipFields = (): KeyValueRow[] => {
        const labels = salarySlip?.meta?.payslip_labels;
        if (labels && typeof labels === 'object') {
            const rows = Object.entries(labels).map(([key, label]) => ({
                key,
                label: String(label ?? ''),
                value: String(salarySlip?.meta?.[key] ?? ''),
            }));
            if (rows.length > 0) {
                return rows;
            }
        }

        return [
            {
                key: 'pay_date',
                label: 'Pay Date',
                value: String(
                    salarySlip?.meta?.pay_date ??
                        salarySlip?.meta?.pay_period ??
                        '',
                ),
            },
            {
                key: 'working_days',
                label: 'Working Days',
                value: String(
                    salarySlip?.meta?.working_days ??
                        salarySlip?.meta?.worked_days ??
                        '',
                ),
            },
        ];
    };

    const initialEmployeeFields = (): KeyValueRow[] => {
        const labels = salarySlip?.meta?.employee_labels;
        if (labels && typeof labels === 'object') {
            const rows = Object.entries(labels).map(([key, label]) => ({
                key,
                label: String(label ?? ''),
                value: String(salarySlip?.meta?.[key] ?? ''),
            }));
            if (rows.length > 0) {
                return rows;
            }
        }

        return [
            {
                key: 'employee_name',
                label: 'Employee Name',
                value: String(salarySlip?.meta?.employee_name ?? ''),
            },
            {
                key: 'employee_code',
                label: 'Employee ID',
                value: String(salarySlip?.meta?.employee_code ?? ''),
            },
        ];
    };

    const initialEarnings = (): AmountRow[] => {
        const rows = Array.isArray(salarySlip?.meta?.earnings)
            ? salarySlip.meta.earnings
            : [];
        if (rows.length > 0) {
            return rows.map((r: any) => ({
                label: String(r?.label ?? ''),
                amount: String(r?.amount ?? ''),
            }));
        }

        return [{ label: 'Basic', amount: '' }];
    };

    const initialDeductions = (): AmountRow[] => {
        const rows = Array.isArray(salarySlip?.meta?.deductions)
            ? salarySlip.meta.deductions
            : [];
        if (rows.length > 0) {
            return rows.map((r: any) => ({
                label: String(r?.label ?? ''),
                amount: String(r?.amount ?? ''),
            }));
        }

        return [{ label: 'Tax', amount: '' }];
    };

    const initialPayslipExtra = (): LabelValueRow[] => {
        const rows = Array.isArray(salarySlip?.meta?.payslip_extra)
            ? salarySlip.meta.payslip_extra
            : [];
        return rows.map((r: any) => ({
            label: String(r?.label ?? ''),
            value: String(r?.value ?? ''),
        }));
    };

    const initialEmployeeExtra = (): LabelValueRow[] => {
        const rows = Array.isArray(salarySlip?.meta?.employee_extra)
            ? salarySlip.meta.employee_extra
            : [];
        return rows.map((r: any) => ({
            label: String(r?.label ?? ''),
            value: String(r?.value ?? ''),
        }));
    };

    const [payslipFields, setPayslipFields] = useState<KeyValueRow[]>(
        initialPayslipFields,
    );
    const [employeeFields, setEmployeeFields] = useState<KeyValueRow[]>(
        initialEmployeeFields,
    );
    const [earnings, setEarnings] = useState<AmountRow[]>(initialEarnings);
    const [deductions, setDeductions] = useState<AmountRow[]>(initialDeductions);
    const [payslipExtra, setPayslipExtra] = useState<LabelValueRow[]>(
        initialPayslipExtra,
    );
    const [employeeExtra, setEmployeeExtra] = useState<LabelValueRow[]>(
        initialEmployeeExtra,
    );

    const totalEarnings = earnings.reduce((sum, row) => {
        const n = Number.parseFloat(String(row.amount ?? ''));
        return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const totalDeductions = deductions.reduce((sum, row) => {
        const n = Number.parseFloat(String(row.amount ?? ''));
        return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const basicSalary = (() => {
        const match = earnings.find((e) =>
            String(e.label ?? '').toLowerCase().includes('basic'),
        );
        const amount = match?.amount ?? earnings[0]?.amount ?? '';
        const n = Number.parseFloat(String(amount));
        return Number.isFinite(n) ? n : 0;
    })();
    const allowanceAmount = Math.max(0, totalEarnings - basicSalary);
    const deductionAmount = totalDeductions;

    useEffect(() => {
        const form = document.getElementById('salarySlipForm') as HTMLFormElement | null;
        if (!form) {
            return;
        }

        const loadPreview = () => {
            if (previewTimeoutRef.current) {
                window.clearTimeout(previewTimeoutRef.current);
            }

            previewTimeoutRef.current = window.setTimeout(async () => {
                const token = (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement | null
                )?.content;

                const fd = new FormData(form);
                fd.delete('_method');
                if (token && !fd.has('_token')) {
                    fd.append('_token', token);
                }

                abortControllerRef.current?.abort();
                const controller = new AbortController();
                abortControllerRef.current = controller;

                try {
                    setPreviewError(null);
                    const response = await fetch('/salary-slip/preview', {
                        method: 'POST',
                        body: fd,
                        signal: controller.signal,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    });

                    const html = await response.text();
                    if (!response.ok) {
                        setPreviewError(html);
                        return;
                    }

                    setPreviewHtml(html);
                } catch (e: any) {
                    if (e?.name === 'AbortError') {
                        return;
                    }

                    setPreviewError('Failed to load preview');
                }
            }, 350);
        };

        loadPreview();
        form.addEventListener('input', loadPreview);
        form.addEventListener('change', loadPreview);

        return () => {
            form.removeEventListener('input', loadPreview);
            form.removeEventListener('change', loadPreview);
            abortControllerRef.current?.abort();
            if (previewTimeoutRef.current) {
                window.clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

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

                <Form
                    id="salarySlipForm"
                    method="post"
                    action={`/salary-slip/${salarySlip.id}`}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />
                            <input type="hidden" name="basic_salary" value={basicSalary} />
                            <input type="hidden" name="allowance_amount" value={allowanceAmount} />
                            <input type="hidden" name="deduction_amount" value={deductionAmount} />

                            <div className="grid gap-2">
                                <Label htmlFor="document_template_id">
                                    Template
                                </Label>
                                <select
                                    id="document_template_id"
                                    name="document_template_id"
                                    required
                                    defaultValue={salarySlip.document_template_id}
                                    className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                                >
                                    <option value="">Select template</option>
                                    {templates.map((t: any) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.document_template_id}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payslip Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {payslipFields.map((row, i) => (
                                            <div
                                                key={row.key}
                                                className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                                            >
                                                <input
                                                    type="hidden"
                                                    name={`meta[payslip_fields][${i}][key]`}
                                                    value={row.key}
                                                />
                                                <div className="grid gap-1">
                                                    <Label>Label</Label>
                                                    <Input
                                                        name={`meta[payslip_fields][${i}][label]`}
                                                        value={row.label}
                                                        onChange={(e) => {
                                                            const next = [...payslipFields];
                                                            next[i] = {
                                                                ...next[i],
                                                                label: e.target.value,
                                                            };
                                                            setPayslipFields(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <Label>Value</Label>
                                                    <Input
                                                        name={`meta[payslip_fields][${i}][value]`}
                                                        value={row.value}
                                                        onChange={(e) => {
                                                            const next = [...payslipFields];
                                                            next[i] = {
                                                                ...next[i],
                                                                value: e.target.value,
                                                            };
                                                            setPayslipFields(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-end justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setPayslipFields(
                                                                payslipFields.filter(
                                                                    (_, idx) => idx !== i,
                                                                ),
                                                            );
                                                        }}
                                                    >
                                                        <Minus />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                const used = new Set(
                                                    payslipFields.map((r) => r.key),
                                                );
                                                setPayslipFields([
                                                    ...payslipFields,
                                                    {
                                                        key: ensureUniqueKey(
                                                            'payslip_item',
                                                            used,
                                                        ),
                                                        label: '',
                                                        value: '',
                                                    },
                                                ]);
                                            }}
                                        >
                                            <Plus />
                                            Add Item
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Employee Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {employeeFields.map((row, i) => (
                                            <div
                                                key={row.key}
                                                className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                                            >
                                                <input
                                                    type="hidden"
                                                    name={`meta[employee_fields][${i}][key]`}
                                                    value={row.key}
                                                />
                                                <div className="grid gap-1">
                                                    <Label>Label</Label>
                                                    <Input
                                                        name={`meta[employee_fields][${i}][label]`}
                                                        value={row.label}
                                                        onChange={(e) => {
                                                            const next = [...employeeFields];
                                                            next[i] = {
                                                                ...next[i],
                                                                label: e.target.value,
                                                            };
                                                            setEmployeeFields(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <Label>Value</Label>
                                                    <Input
                                                        name={`meta[employee_fields][${i}][value]`}
                                                        value={row.value}
                                                        onChange={(e) => {
                                                            const next = [...employeeFields];
                                                            next[i] = {
                                                                ...next[i],
                                                                value: e.target.value,
                                                            };
                                                            setEmployeeFields(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-end justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEmployeeFields(
                                                                employeeFields.filter(
                                                                    (_, idx) => idx !== i,
                                                                ),
                                                            );
                                                        }}
                                                    >
                                                        <Minus />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                const used = new Set(
                                                    employeeFields.map((r) => r.key),
                                                );
                                                setEmployeeFields([
                                                    ...employeeFields,
                                                    {
                                                        key: ensureUniqueKey(
                                                            'employee_item',
                                                            used,
                                                        ),
                                                        label: '',
                                                        value: '',
                                                    },
                                                ]);
                                            }}
                                        >
                                            <Plus />
                                            Add Item
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="meta_heading">Heading</Label>
                                <Input
                                    id="meta_heading"
                                    name="meta[heading]"
                                    type="text"
                                    defaultValue={salarySlip.meta?.heading ?? 'Payslip'}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_company_name">
                                        Company name
                                    </Label>
                                    <Input
                                        id="meta_company_name"
                                        name="meta[company_name]"
                                        type="text"
                                        defaultValue={salarySlip.meta?.company_name ?? ''}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_company_address">
                                        Company address
                                    </Label>
                                    <textarea
                                        id="meta_company_address"
                                        name="meta[company_address]"
                                        defaultValue={salarySlip.meta?.company_address ?? ''}
                                        className="min-h-20 w-full rounded-md border border-sidebar-border/70 bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <h2 className="text-base font-semibold">Salary Details</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Earnings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {earnings.map((row, i) => (
                                                <div
                                                    key={i}
                                                    className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                                                >
                                                    <div className="grid gap-1">
                                                        <Label>Title</Label>
                                                        <Input
                                                            name={`meta[earnings][${i}][label]`}
                                                            value={row.label}
                                                            onChange={(e) => {
                                                                const next = [...earnings];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    label: e.target.value,
                                                                };
                                                                setEarnings(next);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            name={`meta[earnings][${i}][amount]`}
                                                            type="number"
                                                            step="0.01"
                                                            value={row.amount}
                                                            onChange={(e) => {
                                                                const next = [...earnings];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    amount: e.target.value,
                                                                };
                                                                setEarnings(next);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-end justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEarnings(
                                                                    earnings.filter(
                                                                        (_, idx) => idx !== i,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            <Minus />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    setEarnings([
                                                        ...earnings,
                                                        { label: '', amount: '' },
                                                    ])
                                                }
                                            >
                                                <Plus />
                                                Add Item
                                            </Button>

                                            <div className="grid gap-2 pt-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total Earnings</span>
                                                    <span className="font-medium">
                                                        {totalEarnings.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Deductions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {deductions.map((row, i) => (
                                                <div
                                                    key={i}
                                                    className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                                                >
                                                    <div className="grid gap-1">
                                                        <Label>Title</Label>
                                                        <Input
                                                            name={`meta[deductions][${i}][label]`}
                                                            value={row.label}
                                                            onChange={(e) => {
                                                                const next = [...deductions];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    label: e.target.value,
                                                                };
                                                                setDeductions(next);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            name={`meta[deductions][${i}][amount]`}
                                                            type="number"
                                                            step="0.01"
                                                            value={row.amount}
                                                            onChange={(e) => {
                                                                const next = [...deductions];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    amount: e.target.value,
                                                                };
                                                                setDeductions(next);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-end justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeductions(
                                                                    deductions.filter(
                                                                        (_, idx) => idx !== i,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            <Minus />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    setDeductions([
                                                        ...deductions,
                                                        { label: '', amount: '' },
                                                    ])
                                                }
                                            >
                                                <Plus />
                                                Add Item
                                            </Button>

                                            <div className="grid gap-2 pt-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total Deductions</span>
                                                    <span className="font-medium">
                                                        {totalDeductions.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Payslip extra rows</Label>
                                <div className="space-y-3">
                                    {payslipExtra.map((row, i) => (
                                        <div
                                            key={i}
                                            className="grid gap-2 rounded-md border border-sidebar-border/70 p-3 md:grid-cols-3"
                                        >
                                            <div className="grid gap-1">
                                                <Label>Label</Label>
                                                <Input
                                                    name={`meta[payslip_extra][${i}][label]`}
                                                    value={row.label}
                                                    onChange={(e) => {
                                                        const next = [...payslipExtra];
                                                        next[i] = {
                                                            ...next[i],
                                                            label: e.target.value,
                                                        };
                                                        setPayslipExtra(next);
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-1 md:col-span-2">
                                                <Label>Value</Label>
                                                <Input
                                                    name={`meta[payslip_extra][${i}][value]`}
                                                    value={row.value}
                                                    onChange={(e) => {
                                                        const next = [...payslipExtra];
                                                        next[i] = {
                                                            ...next[i],
                                                            value: e.target.value,
                                                        };
                                                        setPayslipExtra(next);
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-3 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setPayslipExtra(
                                                            payslipExtra.filter(
                                                                (_, idx) => idx !== i,
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setPayslipExtra([
                                                ...payslipExtra,
                                                { label: '', value: '' },
                                            ])
                                        }
                                    >
                                        Add payslip extra
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Employee extra rows</Label>
                                <div className="space-y-3">
                                    {employeeExtra.map((row, i) => (
                                        <div
                                            key={i}
                                            className="grid gap-2 rounded-md border border-sidebar-border/70 p-3 md:grid-cols-3"
                                        >
                                            <div className="grid gap-1">
                                                <Label>Label</Label>
                                                <Input
                                                    name={`meta[employee_extra][${i}][label]`}
                                                    value={row.label}
                                                    onChange={(e) => {
                                                        const next = [...employeeExtra];
                                                        next[i] = {
                                                            ...next[i],
                                                            label: e.target.value,
                                                        };
                                                        setEmployeeExtra(next);
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-1 md:col-span-2">
                                                <Label>Value</Label>
                                                <Input
                                                    name={`meta[employee_extra][${i}][value]`}
                                                    value={row.value}
                                                    onChange={(e) => {
                                                        const next = [...employeeExtra];
                                                        next[i] = {
                                                            ...next[i],
                                                            value: e.target.value,
                                                        };
                                                        setEmployeeExtra(next);
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-3 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setEmployeeExtra(
                                                            employeeExtra.filter(
                                                                (_, idx) => idx !== i,
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setEmployeeExtra([
                                                ...employeeExtra,
                                                { label: '', value: '' },
                                            ])
                                        }
                                    >
                                        Add employee extra
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_net_pay_in_words">
                                        Net pay in words
                                    </Label>
                                    <Input
                                        id="meta_net_pay_in_words"
                                        name="meta[net_pay_in_words]"
                                        type="text"
                                        defaultValue={
                                            salarySlip.meta?.net_pay_in_words ?? ''
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_employer_signature">
                                        Employer signature (URL)
                                    </Label>
                                    <Input
                                        id="meta_employer_signature"
                                        name="meta[employer_signature]"
                                        type="text"
                                        defaultValue={
                                            salarySlip.meta?.employer_signature ?? ''
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_employee_signature">
                                        Employee signature (URL)
                                    </Label>
                                    <Input
                                        id="meta_employee_signature"
                                        name="meta[employee_signature]"
                                        type="text"
                                        defaultValue={
                                            salarySlip.meta?.employee_signature ?? ''
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button disabled={processing}>
                                    Save
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                <Label>Live preview</Label>
                                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white">
                                    {previewError ? (
                                        <pre className="max-h-[720px] overflow-auto p-3 text-xs text-destructive">
                                            {previewError}
                                        </pre>
                                    ) : (
                                        <iframe
                                            title="Salary slip preview"
                                            className="h-[720px] w-full"
                                            srcDoc={previewHtml}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
