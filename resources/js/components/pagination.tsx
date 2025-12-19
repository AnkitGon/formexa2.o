import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links?: PaginationLink[];
    className?: string;
}

export default function Pagination({ links = [], className = '' }: PaginationProps) {
    if (!links || links.length === 0) {
        return null;
    }

    const cleaned = links.map((link) => ({
        ...link,
        label: link.label
            .replace('&laquo;', '«')
            .replace('&raquo;', '»')
            .replace('&hellip;', '…'),
    }));

    const numericPageLinksCount = cleaned.filter((link) => /^\d+$/.test(link.label.trim())).length;
    const hasEllipsis = cleaned.some((link) => link.label.includes('…'));

    if (numericPageLinksCount <= 1 && !hasEllipsis) {
        return null;
    }

    return (
        <nav className={`flex items-center justify-center gap-1 px-2 py-3 ${className}`}>
            {cleaned.map((link, idx) => {
                const isDisabled = link.url === null;
                const isActive = link.active;

                const baseClasses =
                    'min-w-[36px] inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm transition-colors';
                const stateClasses = isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isDisabled
                        ? 'border-muted text-muted-foreground cursor-not-allowed'
                        : 'border-sidebar-border/70 hover:border-primary/60 hover:text-primary';

                const commonProps = {
                    className: `${baseClasses} ${stateClasses}`,
                } as const;

                if (isDisabled) {
                    return (
                        <span key={idx} {...commonProps}>
                            {link.label}
                        </span>
                    );
                }

                return (
                    <Link key={idx} href={link.url!} {...commonProps} preserveScroll>
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
