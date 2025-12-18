import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { branding } = usePage<
        SharedData & {
            branding?: { favicon_url?: string | null; favicon_v?: string | number | null };
        }
    >().props;

    const faviconHref = (() => {
        const href = branding?.favicon_url;
        if (!href) {
            return null;
        }
        const v = branding?.favicon_v;
        const vv = v === null || v === undefined ? '' : String(v);
        return vv ? `${href}${href.includes('?') ? '&' : '?'}v=${vv}` : href;
    })();

    const faviconType = (() => {
        const href = branding?.favicon_url;
        if (!href) {
            return undefined;
        }
        const clean = href.split('?')[0].toLowerCase();
        if (clean.endsWith('.svg')) return 'image/svg+xml';
        if (clean.endsWith('.png')) return 'image/png';
        if (clean.endsWith('.webp')) return 'image/webp';
        if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
        if (clean.endsWith('.ico')) return 'image/x-icon';
        return undefined;
    })();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <Head>
                {faviconHref ? (
                    <link
                        rel="icon"
                        href={faviconHref}
                        type={faviconType}
                        sizes="any"
                        head-key="dynamic-favicon"
                    />
                ) : null}

                {faviconHref ? (
                    <link
                        rel="shortcut icon"
                        href={faviconHref}
                        type={faviconType}
                        head-key="dynamic-favicon-shortcut"
                    />
                ) : null}

                {!faviconHref ? (
                    <link
                        rel="icon"
                        href="/favicon.ico"
                        sizes="any"
                        head-key="default-favicon-ico"
                    />
                ) : null}

                {!faviconHref ? (
                    <link
                        rel="icon"
                        href="/favicon.svg"
                        type="image/svg+xml"
                        head-key="default-favicon-svg"
                    />
                ) : null}

                {!faviconHref ? (
                    <link
                        rel="shortcut icon"
                        href="/favicon.ico"
                        head-key="default-favicon-shortcut"
                    />
                ) : null}
            </Head>
            {children}
        </AppLayoutTemplate>
    );
};
