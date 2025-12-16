import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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

    const [previewHtml, setPreviewHtml] = useState('');
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewTimeoutRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const form = document.getElementById('templateForm') as HTMLFormElement | null;
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
                if (token && !fd.has('_token')) {
                    fd.append('_token', token);
                }

                abortControllerRef.current?.abort();
                const controller = new AbortController();
                abortControllerRef.current = controller;

                try {
                    setPreviewError(null);
                    const response = await fetch('/template/salary-slip/preview', {
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

                <Form
                    id="templateForm"
                    method="post"
                    action={`/template/salary-slip/${template.id}`}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={template.name}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Design</Label>
                                    <select
                                        id="code"
                                        name="code"
                                        required
                                        defaultValue={template.code}
                                        className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                                    >
                                        <option value="">Select design</option>
                                        {Object.entries(designOptions).map(
                                            ([value, label]: any) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="font_size">
                                        Base font size (px)
                                    </Label>
                                    <Input
                                        id="font_size"
                                        name="font_size"
                                        type="number"
                                        min={6}
                                        max={24}
                                        defaultValue={template.font_size ?? 11}
                                    />
                                    <InputError message={errors.font_size} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="line_height">
                                        Line height (px)
                                    </Label>
                                    <Input
                                        id="line_height"
                                        name="line_height"
                                        type="number"
                                        min={10}
                                        max={40}
                                        defaultValue={template.line_height ?? 16}
                                    />
                                    <InputError message={errors.line_height} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="font_family">
                                        Font family
                                    </Label>
                                    <select
                                        id="font_family"
                                        name="font_family"
                                        className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                                        defaultValue={
                                            template.font_family ?? ''
                                        }
                                    >
                                        <option value="">Default (DejaVu Sans)</option>
                                        <option value="DejaVu Sans, sans-serif">
                                            Sans Serif (Default)
                                        </option>
                                        <option value="Times New Roman, serif">
                                            Times New Roman (Serif)
                                        </option>
                                        <option value="Georgia, serif">
                                            Georgia (Serif)
                                        </option>
                                        <option value="Arial, sans-serif">Arial</option>
                                        <option value="Roboto, sans-serif">Roboto</option>
                                        <option value="Open Sans, sans-serif">
                                            Open Sans
                                        </option>
                                        <option value="Lato, sans-serif">Lato</option>
                                        <option value="Montserrat, sans-serif">
                                            Montserrat
                                        </option>
                                        <option value="Poppins, sans-serif">
                                            Poppins
                                        </option>
                                        <option value="Courier New, monospace">
                                            Courier New (Monospace)
                                        </option>
                                    </select>
                                    <InputError message={errors.font_family} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="primary_color">
                                        Primary / header color
                                    </Label>
                                    <Input
                                        id="primary_color"
                                        name="primary_color"
                                        type="color"
                                        defaultValue={
                                            template.primary_color ?? '#1f2937'
                                        }
                                    />
                                    <InputError message={errors.primary_color} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="accent_color">
                                        Accent color
                                    </Label>
                                    <Input
                                        id="accent_color"
                                        name="accent_color"
                                        type="color"
                                        defaultValue={
                                            template.accent_color ?? '#111827'
                                        }
                                    />
                                    <InputError message={errors.accent_color} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="secondary_color">
                                        Body text color
                                    </Label>
                                    <Input
                                        id="secondary_color"
                                        name="secondary_color"
                                        type="color"
                                        defaultValue={
                                            template.secondary_color ?? '#111827'
                                        }
                                    />
                                    <InputError
                                        message={errors.secondary_color}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={template.description ?? ''}
                                    className="min-h-24 w-full rounded-md border border-sidebar-border/70 bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    value="1"
                                    defaultChecked={!!template.is_active}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="is_active">Active</Label>
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
                                            title="Salary slip template preview"
                                            className="h-[720px] w-full"
                                            srcDoc={previewHtml}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button disabled={processing}>Save</Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
