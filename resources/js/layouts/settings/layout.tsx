import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: null,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="p-4">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="w-full lg:w-72">
                    <Card className="gap-0 py-4">
                        <CardContent className="px-2">
                            <nav className="flex flex-col space-y-1">
                                {sidebarNavItems.map((item, index) => {
                                    const active = isSameUrl(currentPath, item.href);
                                    return (
                                        <Button
                                            key={`${resolveUrl(item.href)}-${index}`}
                                            size="sm"
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                'w-full justify-start gap-2 rounded-md border-l-2 px-3 py-2 text-sm font-medium',
                                                active
                                                    ? 'border-primary bg-muted text-foreground'
                                                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                            )}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}
                                                <span>{item.title}</span>
                                            </Link>
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
                        <CardContent className="space-y-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
