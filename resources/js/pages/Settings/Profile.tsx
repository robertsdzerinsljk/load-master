import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';
import { usePage } from '@inertiajs/react';

type Props = {
    mustVerifyEmail?: boolean;
    status?: string | null;
};

export default function Profile({ mustVerifyEmail = false, status = null }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <AppLayout>
            <main className="mx-auto w-full max-w-3xl px-6 py-10">
                <h1 className="text-2xl font-semibold text-[#182219]">Profile settings</h1>
                <div className="mt-6 rounded-lg border border-[#d9ded9] bg-white p-5">
                    <div className="text-sm font-semibold text-[#5b6b61]">Name</div>
                    <div className="mt-1 text-base text-[#182219]">{auth.user.name}</div>
                    <div className="mt-4 text-sm font-semibold text-[#5b6b61]">Email</div>
                    <div className="mt-1 text-base text-[#182219]">{auth.user.email}</div>
                    {mustVerifyEmail ? (
                        <div className="mt-4 text-sm text-amber-700">Email verification is required.</div>
                    ) : null}
                    {status ? <div className="mt-4 text-sm text-[#166a4d]">{status}</div> : null}
                </div>
            </main>
        </AppLayout>
    );
}
