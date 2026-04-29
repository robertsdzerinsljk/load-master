import { ReactNode, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    LogOut,
    RotateCcw,
    UserRound,
} from 'lucide-react';

import ScrollToTopButton from '@/components/common/ScrollToTopButton';

type StudentLayoutProps = {
    children: ReactNode;
    active?: 'tasks' | 'attempts' | 'create';
};

type AuthUser = {
    id?: number;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    surname?: string | null;
    display_name?: string | null;
    email?: string | null;
} | null;

type PageProps = {
    auth?: {
        user?: AuthUser;
    };
};

type SidebarLinkProps = {
    href: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
    collapsed: boolean;
};

type SidebarActionProps = {
    label: string;
    icon: LucideIcon;
    collapsed: boolean;
    onClick: () => void;
};

const SIDEBAR_COLLAPSED_KEY = 'student-sidebar-collapsed';

function getUserDisplayName(user?: AuthUser) {
    const firstName = user?.first_name?.trim();
    const lastName = (user?.last_name ?? user?.surname)?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    return user?.display_name || fullName || user?.name || user?.email || 'Students';
}

function SidebarLink({
    href,
    label,
    icon: Icon,
    active = false,
    collapsed,
}: SidebarLinkProps) {
    return (
        <Link
            href={href}
            aria-label={label}
            title={collapsed ? label : undefined}
            className={[
                'group flex h-12 w-full items-center overflow-hidden rounded-2xl transition-all duration-200',
                collapsed ? 'justify-center px-0' : 'justify-start px-3',
                active
                    ? 'bg-[#1B6250] text-white shadow-sm'
                    : 'text-[#425347] hover:bg-[#edf2ee] hover:text-[#1B6250]',
            ].join(' ')}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                <Icon size={20} strokeWidth={2} />
            </span>

            <span
                className={[
                    'overflow-hidden transition-[width,opacity,margin] duration-200 ease-in-out',
                    collapsed
                        ? 'ml-0 w-0 opacity-0'
                        : 'ml-1 w-[168px] opacity-100',
                ].join(' ')}
            >
                <span
                    className="block overflow-hidden text-[15px] leading-none font-medium text-ellipsis whitespace-nowrap"
                    style={{
                        WebkitMaskImage:
                            'linear-gradient(90deg, black 0%, black 82%, transparent 100%)',
                        maskImage:
                            'linear-gradient(90deg, black 0%, black 82%, transparent 100%)',
                    }}
                >
                    {label}
                </span>
            </span>
        </Link>
    );
}

function SidebarAction({
    label,
    icon: Icon,
    collapsed,
    onClick,
}: SidebarActionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={collapsed ? label : undefined}
            className={[
                'group flex h-12 w-full items-center overflow-hidden rounded-2xl transition-all duration-200',
                collapsed ? 'justify-center px-0' : 'justify-start px-3',
                'text-[#425347] hover:bg-[#edf2ee] hover:text-[#1B6250]',
            ].join(' ')}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                <Icon size={20} strokeWidth={2} />
            </span>

            <span
                className={[
                    'overflow-hidden transition-[width,opacity,margin] duration-200 ease-in-out',
                    collapsed
                        ? 'ml-0 w-0 opacity-0'
                        : 'ml-1 w-[168px] opacity-100',
                ].join(' ')}
            >
                <span
                    className="block overflow-hidden text-left text-[15px] leading-none font-medium text-ellipsis whitespace-nowrap"
                    style={{
                        WebkitMaskImage:
                            'linear-gradient(90deg, black 0%, black 82%, transparent 100%)',
                        maskImage:
                            'linear-gradient(90deg, black 0%, black 82%, transparent 100%)',
                    }}
                >
                    {label}
                </span>
            </span>
        </button>
    );
}

export default function StudentLayout({
    children,
    active = 'tasks',
}: StudentLayoutProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const displayName = getUserDisplayName(user);

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;

        return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    });

    const toggleSidebar = () => {
        setCollapsed((current) => {
            const next = !current;

            if (typeof window !== 'undefined') {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            }

            return next;
        });
    };

    return (
        <div className="flex min-h-screen bg-[#f6f6f4]">
            <aside
                className={[
                    'sticky top-0 z-30 flex h-screen shrink-0 flex-col self-start border-r border-[#d8ddd8] bg-[#f6f6f4] transition-[width] duration-300 ease-in-out',
                    collapsed ? 'w-[82px]' : 'w-[260px]',
                ].join(' ')}
            >
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="absolute top-[213px] -right-4 z-40 flex h-11 w-8 -translate-y-1/2 items-center justify-center rounded-r-full border border-l-0 border-[#145342] bg-[#1B6250] text-white shadow-sm transition hover:bg-[#164f41]"
                    aria-label={
                        collapsed
                            ? 'Atvērt sānu izvēlni'
                            : 'Sakļaut sānu izvēlni'
                    }
                >
                    {collapsed ? (
                        <ChevronRight size={20} strokeWidth={2.6} />
                    ) : (
                        <ChevronLeft size={20} strokeWidth={2.6} />
                    )}
                </button>

                <div className="relative flex h-[174px] shrink-0 items-center justify-center overflow-hidden border-b border-[#d8ddd8] px-3">
                    <div
                        className={[
                            'absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ease-in-out',
                            collapsed
                                ? 'pointer-events-none translate-y-1 scale-95 opacity-0'
                                : 'translate-y-0 scale-100 opacity-100',
                        ].join(' ')}
                    >
                        <img
                            src="/images/ljk-logo.png"
                            alt="Rīgas Tehniskās universitātes un Liepājas Jūrniecības koledžas logo"
                            className="mb-4 h-[48px] w-auto object-contain"
                        />

                        <div className="w-[220px] text-center">
                            <p className="overflow-hidden text-[13px] font-semibold tracking-[0.22em] whitespace-nowrap text-[#1B6250] uppercase">
                                Loģistikas
                            </p>
                            <p className="overflow-hidden text-[18px] leading-tight font-extrabold tracking-[0.04em] whitespace-nowrap text-[#10251d] uppercase">
                                Simulators
                            </p>
                        </div>
                    </div>

                    <div
                        className={[
                            'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out',
                            collapsed
                                ? 'translate-y-0 scale-100 opacity-100'
                                : 'pointer-events-none -translate-y-1 scale-90 opacity-0',
                        ].join(' ')}
                    >
                        <img
                            src="/images/LJK-LOGO-ICON.svg"
                            alt="Logo"
                            className="h-12 w-12 object-contain"
                        />
                    </div>
                </div>

                <div className="relative h-[78px] shrink-0 overflow-hidden border-b border-[#d8ddd8]">
                    <div
                        className={[
                            'absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out',
                            collapsed
                                ? 'opacity-100 delay-150'
                                : 'pointer-events-none opacity-0',
                        ].join(' ')}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7f2ec] text-[#1B6250]">
                            <UserRound size={20} strokeWidth={2.2} />
                        </div>
                    </div>

                    <div
                        className={[
                            'absolute inset-0 transition-opacity duration-200 ease-in-out',
                            collapsed
                                ? 'pointer-events-none opacity-0'
                                : 'opacity-100 delay-150',
                        ].join(' ')}
                    >
                        <div className="w-[260px] px-4 py-4">
                            <p className="overflow-hidden text-[13px] font-medium tracking-wide whitespace-nowrap text-[#6c756c] uppercase">
                                Studenta panelis
                            </p>
                            <p className="mt-1 overflow-hidden text-[15px] font-semibold whitespace-nowrap text-[#1b2b21]">
                                {displayName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-4">
                    <div className="space-y-2">
                        <SidebarLink
                            label="Pieejamie uzdevumi"
                            href="/student"
                            icon={ClipboardList}
                            active={active === 'tasks'}
                            collapsed={collapsed}
                        />

                        <SidebarLink
                            label="Mani mēģinājumi"
                            href="/student/attempts"
                            icon={RotateCcw}
                            active={active === 'attempts'}
                            collapsed={collapsed}
                        />
                    </div>
                </div>

                <div className="border-t border-[#d8ddd8] px-2 py-4">
                    <SidebarAction
                        label="Iziet"
                        icon={LogOut}
                        collapsed={collapsed}
                        onClick={() => router.post('/logout')}
                    />
                </div>
            </aside>

            <main className="min-w-0 flex-1 px-9 py-8">{children}</main>

            <ScrollToTopButton />
        </div>
    );
}