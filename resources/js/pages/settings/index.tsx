import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type TabId = 'brand' | 'company' | 'salary_slip' | 'taxes' | 'security';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
];

export default function SettingsIndex({
    brand,
    settings,
}: {
    brand?: {
        logo_dark_url?: string | null;
        logo_light_url?: string | null;
        favicon_url?: string | null;
    };
    settings?: Record<string, string | null>;
}) {
    const allowedExtensions = useMemo(
        () => new Set(['jpg', 'jpeg', 'png', 'svg', 'webp']),
        [],
    );
    const allowedMimes = useMemo(
        () =>
            new Set([
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/svg+xml',
                'image/webp',
            ]),
        [],
    );

    const tabs = useMemo(
        () =>
            [
                {
                    id: 'brand' as const,
                    title: 'Brand',
                    description: 'Upload logos and favicon',
                },
                {
                    id: 'company' as const,
                    title: 'Company',
                    description: 'Business details and defaults',
                },
                {
                    id: 'salary_slip' as const,
                    title: 'Salary Slip',
                    description: 'Templates and salary slip preferences',
                },
                {
                    id: 'taxes' as const,
                    title: 'Taxes',
                    description: 'Tax calculation and deduction behavior',
                },
                {
                    id: 'security' as const,
                    title: 'Security',
                    description: 'Authentication and access preferences',
                },
            ] satisfies Array<{ id: TabId; title: string; description: string }>,
        [],
    );

    const [activeTab, setActiveTab] = useState<TabId>('brand');
    const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

    const [brandFiles, setBrandFiles] = useState<{
        logoDark: File | null;
        logoLight: File | null;
        favicon: File | null;
    }>({
        logoDark: null,
        logoLight: null,
        favicon: null,
    });
    const [brandErrors, setBrandErrors] = useState<{
        logoDark?: string;
        logoLight?: string;
        favicon?: string;
        companyName?: string;
        companyAddress?: string;
        form?: string;
    }>({});

    const [isSavingBrand, setIsSavingBrand] = useState(false);

    const [companyName, setCompanyName] = useState<string>(
        (settings?.company_name as string | null) ?? '',
    );
    const [companyAddress, setCompanyAddress] = useState<string>(
        (settings?.company_address as string | null) ?? '',
    );

    const logoDarkRef = useRef<HTMLInputElement | null>(null);
    const logoLightRef = useRef<HTMLInputElement | null>(null);
    const faviconRef = useRef<HTMLInputElement | null>(null);

    const validateImageFile = (file: File | null): string | null => {
        if (!file) {
            return null;
        }

        const ext = (file.name.split('.').pop() ?? '').toLowerCase();
        const mime = (file.type ?? '').toLowerCase();
        const ok = allowedExtensions.has(ext) || allowedMimes.has(mime);
        if (!ok) {
            return 'Only image files are allowed (jpg, jpeg, png, svg, webp).';
        }
        return null;
    };

    const BrandUploadCard = ({
        title,
        description,
        hint,
        file,
        existingUrl,
        error,
        inputRef,
        onPick,
    }: {
        title: string;
        description: string;
        hint: string;
        file: File | null;
        existingUrl?: string | null;
        error?: string;
        inputRef: React.RefObject<HTMLInputElement | null>;
        onPick: (file: File | null) => void;
    }) => {
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        const [isDragging, setIsDragging] = useState(false);

        useEffect(() => {
            if (!file) {
                setPreviewUrl(existingUrl ?? null);
                return;
            }

            const isSvg =
                file.type === 'image/svg+xml' ||
                file.name.toLowerCase().endsWith('.svg');
            if (isSvg) {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        setPreviewUrl(reader.result);
                    }
                };
                reader.readAsDataURL(file);
                return;
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }, [file, existingUrl]);

        const hasAsset = Boolean(file || existingUrl);

        return (
            <Card className="gap-0 h-full overflow-hidden border-sidebar-border/60 transition-shadow hover:shadow-sm">
                <CardHeader className="border-b border-sidebar-border/60 bg-muted/10 pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <CardTitle className="text-sm">{title}</CardTitle>
                            <CardDescription className="mt-1">
                                {description}
                            </CardDescription>
                        </div>

                        <div className="text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const next = e.dataTransfer.files?.[0] ?? null;
                            onPick(next);
                            if (inputRef.current) {
                                inputRef.current.value = '';
                            }
                        }}
                        className={cn(
                            'group relative flex min-h-[96px] w-full items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                            error
                                ? 'border-destructive/60 bg-destructive/5'
                                : isDragging
                                    ? 'border-primary/70 bg-primary/5'
                                    : 'border-sidebar-border/70 bg-muted/10 hover:border-primary/30 hover:bg-muted/20',
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-background shadow-sm',
                                    error
                                        ? 'border-destructive/40'
                                        : 'border-sidebar-border/60 group-hover:border-primary/30',
                                )}
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt={title}
                                        className="h-full w-full object-contain p-1"
                                    />
                                ) : (
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="text-sm font-medium">
                                    {hasAsset ? 'Replace file' : 'Upload file'}
                                </div>
                                <div className="mt-0.5 text-xs leading-4 text-muted-foreground">
                                    <div>Drag and drop, or click to browse.</div>
                                    <div className="mt-1 truncate">{hint}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="rounded-md border border-sidebar-border/60 bg-background p-2 text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
                                <Upload className="h-4 w-4" />
                            </div>
                        </div>
                    </button>

                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                        onChange={(e) => {
                            const next = e.target.files?.[0] ?? null;
                            onPick(next);
                            e.currentTarget.value = '';
                        }}
                    />

                    {file && (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-sidebar-border/60 bg-muted/20 px-3 py-2">
                            <div className="min-w-0">
                                <div className="truncate text-sm">{file.name}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(0)} KB
                                    {' · '}
                                    {(file.type || 'image').replace('image/', '').toUpperCase()}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                    }
                                    onPick(null);
                                }}
                            >
                                <X className="h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/60 bg-muted/20">
                            <div className="flex items-center justify-center p-4" style={{backgroundColor: 'rgb(249, 249, 249)'}}>
                                <img
                                    src={previewUrl}
                                    alt={title}
                                    className="max-h-28 w-auto max-w-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <InputError message={error} />
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-lg font-semibold">Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure your application preferences
                    </p>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <aside className="w-full lg:w-72">
                        <Card className="gap-0 py-4">
                            <CardContent className="px-2">
                                <nav className="flex flex-col space-y-1">
                                    {tabs.map((tab) => {
                                        const isActive = tab.id === activeTab;
                                        return (
                                            <Button
                                                key={tab.id}
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    'w-full justify-start gap-2 rounded-md border-l-2 px-3 py-2 text-sm font-medium',
                                                    isActive
                                                        ? 'border-primary bg-muted text-foreground'
                                                        : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                                )}
                                            >
                                                <span>{tab.title}</span>
                                            </Button>
                                        );
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    <Separator className="lg:hidden" />

                    <div className="min-w-0 flex-1">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    {active.title}
                                </CardTitle>
                                <CardDescription>
                                    {active.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <Separator />

                                {activeTab === 'brand' && (
                                    <form
                                        className="space-y-6"
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            const nextErrors: typeof brandErrors = {};
                                            const darkErr = validateImageFile(brandFiles.logoDark);
                                            const lightErr = validateImageFile(brandFiles.logoLight);
                                            const favErr = validateImageFile(brandFiles.favicon);
                                            if (darkErr) nextErrors.logoDark = darkErr;
                                            if (lightErr) nextErrors.logoLight = lightErr;
                                            if (favErr) nextErrors.favicon = favErr;

                                            if (Object.keys(nextErrors).length > 0) {
                                                setBrandErrors(nextErrors);
                                                return;
                                            }

                                            setBrandErrors(nextErrors);

                                            router.post(
                                                '/settings/brand',
                                                {
                                                    logo_dark: brandFiles.logoDark,
                                                    logo_light: brandFiles.logoLight,
                                                    favicon: brandFiles.favicon,
                                                    company_name: companyName,
                                                    company_address: companyAddress,
                                                },
                                                {
                                                    preserveScroll: true,
                                                    forceFormData: true,
                                                    onStart: () => setIsSavingBrand(true),
                                                    onFinish: () => setIsSavingBrand(false),
                                                    onSuccess: () => {
                                                        setBrandFiles({
                                                            logoDark: null,
                                                            logoLight: null,
                                                            favicon: null,
                                                        });
                                                        setBrandErrors({});
                                                    },
                                                    onError: (errors) => {
                                                        setBrandErrors({
                                                            logoDark: (errors as any).logo_dark,
                                                            logoLight: (errors as any).logo_light,
                                                            favicon: (errors as any).favicon,
                                                            companyName: (errors as any).company_name,
                                                            companyAddress: (errors as any).company_address,
                                                            form: (errors as any).form,
                                                        });
                                                    },
                                                },
                                            );
                                        }}
                                    >

                                        <div className="grid gap-4 lg:grid-cols-3">
                                            <BrandUploadCard
                                                title="Logo (Dark)"
                                                description="Used on light backgrounds"
                                                hint="Recommended: SVG or PNG · JPG/WEBP also ok"
                                                file={brandFiles.logoDark}
                                                existingUrl={brand?.logo_dark_url ?? null}
                                                error={brandErrors.logoDark}
                                                inputRef={logoDarkRef}
                                                onPick={(file) => {
                                                    const err = validateImageFile(file);
                                                    setBrandFiles((prev) => ({
                                                        ...prev,
                                                        logoDark: err ? null : file,
                                                    }));
                                                    setBrandErrors((prev) => ({
                                                        ...prev,
                                                        logoDark: err ?? undefined,
                                                    }));
                                                }}
                                            />

                                            <BrandUploadCard
                                                title="Logo (Light)"
                                                description="Used on dark backgrounds"
                                                hint="Recommended: SVG or PNG · JPG/WEBP also ok"
                                                file={brandFiles.logoLight}
                                                existingUrl={brand?.logo_light_url ?? null}
                                                error={brandErrors.logoLight}
                                                inputRef={logoLightRef}
                                                onPick={(file) => {
                                                    const err = validateImageFile(file);
                                                    setBrandFiles((prev) => ({
                                                        ...prev,
                                                        logoLight: err ? null : file,
                                                    }));
                                                    setBrandErrors((prev) => ({
                                                        ...prev,
                                                        logoLight: err ?? undefined,
                                                    }));
                                                }}
                                            />

                                            <BrandUploadCard
                                                title="Favicon"
                                                description="Shown in browser tab"
                                                hint="Square image recommended · SVG/PNG preferred"
                                                file={brandFiles.favicon}
                                                existingUrl={brand?.favicon_url ?? null}
                                                error={brandErrors.favicon}
                                                inputRef={faviconRef}
                                                onPick={(file) => {
                                                    const err = validateImageFile(file);
                                                    setBrandFiles((prev) => ({
                                                        ...prev,
                                                        favicon: err ? null : file,
                                                    }));
                                                    setBrandErrors((prev) => ({
                                                        ...prev,
                                                        favicon: err ?? undefined,
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <div className="grid gap-4 lg:grid-cols-3">
                                            <div className="space-y-2 lg:col-span-1">
                                                <Label htmlFor="company_name">
                                                    Company Name
                                                </Label>
                                                <Input
                                                    id="company_name"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    placeholder="Company name"
                                                    autoComplete="organization"
                                                />
                                                <InputError message={brandErrors.companyName} />
                                            </div>

                                            <div className="space-y-2 lg:col-span-2">
                                                <Label htmlFor="company_address">
                                                    Company Address
                                                </Label>
                                                <textarea
                                                    id="company_address"
                                                    value={companyAddress}
                                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                                    placeholder="Address"
                                                    rows={2}
                                                    className={cn(
                                                        'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm',
                                                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                                        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                                                        'min-h-[4.5rem] resize-none',
                                                    )}
                                                />
                                                <InputError message={brandErrors.companyAddress} />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isSavingBrand}>
                                                Save
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {activeTab === 'company' && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Add company-related settings here.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'salary_slip' && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Add salary slip preferences here.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'taxes' && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Add tax-related preferences here.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Add security preferences here.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
