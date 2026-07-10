import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, ShieldCheck, UserCog, UserRound } from 'lucide-react';
import { ReactNode } from 'react';

type AuthUser = {
    display_name?: string | null;
    name?: string | null;
    email?: string | null;
} | null;

type PageProps = {
    auth?: {
        user?: AuthUser;
    };
};

function displayName(user?: AuthUser) {
    return user?.display_name || user?.name || user?.email || 'Administrators';
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;

    return (
        <div className="flex min-h-screen bg-[#f6f6f4]">
            <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-[#d8ddd8] bg-[#f6f6f4]">
                <div className="flex h-[174px] flex-col items-center justify-center border-b border-[#d8ddd8] px-4 text-center">
                    <img
                        src="/images/ljk-logo.png"
                        alt="Liepājas Jūrniecības koledža"
                        className="mb-4 h-12 w-auto object-contain"
                    />
                    <p className="text-[13px] font-semibold tracking-[0.22em] text-[#1B6250] uppercase">
                        Loadmaster
                    </p>
                    <p className="text-[18px] leading-tight font-extrabold tracking-[0.04em] text-[#10251d] uppercase">
                        Administrēšana
                    </p>
                </div>

                <div className="border-b border-[#d8ddd8] px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2ec] text-[#1B6250]">
                            <UserRound size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium tracking-wide text-[#6c756c] uppercase">
                                Admin panelis
                            </p>
                            <p className="truncate text-sm font-semibold text-[#1b2b21]">
                                {displayName(user)}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-2 py-4">
                    <Link
                        href="/admin/users"
                        className="flex h-12 items-center gap-3 rounded-2xl bg-[#1B6250] px-3 text-sm font-semibold text-white"
                    >
                        <span className="flex h-10 w-10 items-center justify-center">
                            <UserCog size={20} />
                        </span>
                        Lietotāji
                    </Link>
                </nav>

                <div className="border-t border-[#d8ddd8] px-2 py-4">
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-[#425347] transition hover:bg-[#edf2ee] hover:text-[#1B6250]"
                    >
                        <span className="flex h-10 w-10 items-center justify-center">
                            <LogOut size={20} />
                        </span>
                        Iziet
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1 px-9 py-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrators
                </div>
                {children}
            </main>

            <ScrollToTopButton />
        </div>
    );
}
