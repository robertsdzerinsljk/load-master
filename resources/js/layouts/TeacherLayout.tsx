import { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import {
    CirclePlus,
    LogOut,
    PackageOpen,
    RefreshCcw,
    Settings2,
    Users,
} from 'lucide-react';
import SidebarLogo from '@/components/SidebarLogo';
import SidebarNavItem from '@/components/SidebarNavItem';

type TeacherLayoutProps = {
    children: ReactNode;
    active?: 'create' | 'orders' | 'students' | 'templates';
};

export default function TeacherLayout({
    children,
    active = 'orders',
}: TeacherLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#f6f6f4]">
            <aside className="flex w-[250px] shrink-0 flex-col border-r border-[#d8ddd8] bg-[#f6f6f4]">
                <SidebarLogo />

                <div className="border-b border-[#d8ddd8] px-4 py-4">
                    <p className="text-[15px] font-semibold text-[#1b2b21]">
                        Roberts Dzēriņš
                    </p>
                </div>

                <div className="flex-1 px-2 py-4">
                    <div className="space-y-2">
                        <SidebarNavItem
                            label="Izveidot pasūtījumu"
                            href="/teacher/create-order"
                            icon={CirclePlus}
                            active={active === 'create'}
                        />

                        <SidebarNavItem
                            label="Pasūtījumi un uzdevumi"
                            href="/teacher"
                            icon={PackageOpen}
                            active={active === 'orders'}
                        />

                        <SidebarNavItem
                            label="Studentu saraksts"
                            href="/teacher/students"
                            icon={Users}
                            active={active === 'students'}
                        />

                        <SidebarNavItem
                            label="Sagataves"
                            href="/teacher/templates"
                            icon={Settings2}
                            active={active === 'templates'}
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

            <main className="flex-1 px-9 py-8">{children}</main>
        </div>
    );
}