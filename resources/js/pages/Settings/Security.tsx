import AppLayout from '@/layouts/app-layout';

type Props = {
    canManageTwoFactor: boolean;
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
};

export default function Security({
    canManageTwoFactor,
    twoFactorEnabled = false,
    requiresConfirmation = false,
}: Props) {
    return (
        <AppLayout>
            <main className="mx-auto w-full max-w-3xl px-6 py-10">
                <h1 className="text-2xl font-semibold text-[#182219]">Security settings</h1>
                <div className="mt-6 rounded-lg border border-[#d9ded9] bg-white p-5">
                    <div className="text-sm font-semibold text-[#5b6b61]">Two-factor authentication</div>
                    <div className="mt-2 text-base text-[#182219]">
                        {canManageTwoFactor
                            ? twoFactorEnabled
                                ? 'Enabled'
                                : 'Not enabled'
                            : 'Unavailable'}
                    </div>
                    {canManageTwoFactor && requiresConfirmation ? (
                        <div className="mt-4 text-sm text-[#5b6b61]">
                            Changes may require password confirmation.
                        </div>
                    ) : null}
                </div>
            </main>
        </AppLayout>
    );
}
