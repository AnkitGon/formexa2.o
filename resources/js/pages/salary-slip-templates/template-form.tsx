import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type TemplateFormValues = {
    id?: number;
    name?: string;
    code?: string;
    description?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: string;
    font_size?: number | string;
    line_height?: number | string;
    is_active?: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    action: string;
    designOptions: Record<string, string>;
    template?: TemplateFormValues;
};

export default function SalarySlipTemplateForm({
    mode,
    action,
    designOptions,
    template,
}: Props) {
    const normalizeColor = (value: unknown, fallback: string) => {
        if (typeof value !== 'string') {
            return fallback;
        }

        const v = value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            return v;
        }

        if (/^#[0-9a-fA-F]{8}$/.test(v)) {
            return v.slice(0, 7);
        }

        return fallback;
    };

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
        <Form id="templateForm" method="post" action={action} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    {mode === 'edit' && (
                        <input type="hidden" name="_method" value="PUT" />
                    )}

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={template?.name ?? ''}
                                    />
                                    <InputError message={(errors as any).name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Design</Label>
                                    <select
                                        id="code"
                                        name="code"
                                        required
                                        defaultValue={
                                            mode === 'create'
                                                ? 'classic'
                                                : template?.code ?? ''
                                        }
                                        className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                                    >
                                        {mode === 'edit' && (
                                            <option value="">Select design</option>
                                        )}
                                        {Object.entries(designOptions ?? {}).map(
                                            ([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError message={(errors as any).code} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="font_size">Base font size (px)</Label>
                                    <Input
                                        id="font_size"
                                        name="font_size"
                                        type="number"
                                        min={6}
                                        max={24}
                                        defaultValue={
                                            template?.font_size ??
                                            (mode === 'create' ? 12 : '')
                                        }
                                    />
                                    <InputError message={(errors as any).font_size} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="line_height">Line height (px)</Label>
                                    <Input
                                        id="line_height"
                                        name="line_height"
                                        type="number"
                                        min={10}
                                        max={40}
                                        defaultValue={
                                            template?.line_height ??
                                            (mode === 'create' ? 16 : '')
                                        }
                                        required={mode === 'create'}
                                    />
                                    <InputError message={(errors as any).line_height} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="font_family">Font family</Label>
                                    <select
                                        id="font_family"
                                        name="font_family"
                                        className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                                        defaultValue={template?.font_family ?? ''}
                                    >
                                        <option value="">Default (DejaVu Sans)</option>
                                        <option value="DejaVu Sans, sans-serif">
                                            Sans Serif (Default)
                                        </option>
                                        <option value="Times New Roman, serif">
                                            Times New Roman (Serif)
                                        </option>
                                        <option value="Georgia, serif">Georgia (Serif)</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                        <option value="Roboto, sans-serif">Roboto</option>
                                        <option value="Open Sans, sans-serif">
                                            Open Sans
                                        </option>
                                        <option value="Lato, sans-serif">Lato</option>
                                        <option value="Montserrat, sans-serif">
                                            Montserrat
                                        </option>
                                        <option value="Poppins, sans-serif">Poppins</option>
                                        <option value="Courier New, monospace">
                                            Courier New (Monospace)
                                        </option>
                                    </select>
                                    <InputError message={(errors as any).font_family} />
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
                                            normalizeColor(
                                                template?.primary_color,
                                                '#95979b',
                                            )
                                        }
                                    />
                                    <InputError message={(errors as any).primary_color} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="accent_color">Accent color</Label>
                                    <Input
                                        id="accent_color"
                                        name="accent_color"
                                        type="color"
                                        defaultValue={
                                            normalizeColor(
                                                template?.accent_color,
                                                '#111827',
                                            )
                                        }
                                    />
                                    <InputError message={(errors as any).accent_color} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="secondary_color">Body text color</Label>
                                    <Input
                                        id="secondary_color"
                                        name="secondary_color"
                                        type="color"
                                        defaultValue={
                                            normalizeColor(
                                                template?.secondary_color,
                                                '#111827',
                                            )
                                        }
                                    />
                                    <InputError
                                        message={(errors as any).secondary_color}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={template?.description ?? ''}
                                    className="min-h-24 w-full rounded-md border border-sidebar-border/70 bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={(errors as any).description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    value="1"
                                    defaultChecked={
                                        mode === 'create'
                                            ? true
                                            : Boolean(template?.is_active)
                                    }
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button disabled={processing}>Save</Button>
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-4">
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
                    </div>
                </>
            )}
        </Form>
    );
}
