import AppLogoIcon from './app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';
import { useSidebar } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function AppLogo() {
    const { state } = useSidebar();
    const { branding } = usePage<
        SharedData & {
            branding?: {
                logo_dark_url?: string | null;
                logo_light_url?: string | null;
            };
        }
    >().props;

    const { appearance } = useAppearance();

    const isDark = useMemo(() => {
        return appearance === 'dark' || (appearance === 'system' && prefersDark());
    }, [appearance]);

    const logoUrl = isDark ? branding?.logo_light_url : branding?.logo_dark_url;

    return (
        <>
            {state === 'expanded' ? (
                <div className="flex w-full items-center justify-center">
                    <div className="flex h-12 w-full items-center justify-center px-2">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="h-12 w-auto max-w-[240px] object-contain"
                            />
                        ) : (
                            <AppLogoIcon className="h-8 w-8 fill-current text-sidebar-foreground" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex size-8 items-center justify-center rounded-md border border-sidebar-border/60 bg-sidebar-accent/30">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-5 w-5 object-contain"
                        />
                    ) : (
                        <AppLogoIcon className="h-5 w-5 fill-current text-sidebar-foreground" />
                    )}
                </div>
            )}
        </>
    );
}
