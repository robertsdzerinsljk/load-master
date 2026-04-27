import { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { ClipboardList, LogOut, RefreshCcw } from 'lucide-react';
import SidebarLogo from '@/components/SidebarLogo';
import SidebarNavItem from '@/components/SidebarNavItem';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';

type StudentLayoutProps = {
    children: ReactNode;
    active?: 'tasks' | 'attempts' | 'create';
};

export default function StudentLayout({
    children,
    active = 'tasks',
}: StudentLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#f6f6f4]">
            <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 self-start flex-col border-r border-[#d8ddd8] bg-[#f6f6f4]">
                <SidebarLogo />

                <div className="border-b border-[#d8ddd8] px-4 py-4">
                    <p className="text-[15px] font-semibold text-[#1b2b21]">
                        Students
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-4">
                    <div className="space-y-2">
                        <SidebarNavItem
                            label="Pieejamie uzdevumi"
                            href="/student"
                            icon={ClipboardList}
                            active={active === 'tasks'}
                        />

                        <SidebarNavItem
                            label="Mani mēģinājumi"
                            href="/student/attempts"
                            icon={ClipboardList}
                            active={active === 'attempts'}
                        />
                    </div>
                </div>

                <div className="border-t border-[#d8ddd8] px-2 py-4">
                    <div className="space-y-2">
                        <SidebarNavItem
                            label="Mainīt lomu"
                            href="/"
                            icon={RefreshCcw}
                        />

                        <SidebarNavItem
                            label="Iziet"
                            icon={LogOut}
                            onClick={() => router.post('/logout')}
                        />
                    </div>
                </div>
            </aside>

            <main className="min-w-0 flex-1 px-9 py-8">{children}</main>
            <ScrollToTopButton />
        </div>
    );
}
