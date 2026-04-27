import AppLayout from '@/layouts/app-layout';
import AppearanceTabs from '@/components/appearance-tabs';

export default function Appearance() {
    return (
        <AppLayout>
            <main className="mx-auto w-full max-w-3xl px-6 py-10">
                <h1 className="text-2xl font-semibold text-[#182219]">Appearance</h1>
                <div className="mt-6 rounded-lg border border-[#d9ded9] bg-white p-5">
                    <AppearanceTabs />
                </div>
            </main>
        </AppLayout>
    );
}
