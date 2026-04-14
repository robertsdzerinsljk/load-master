import { Head, router } from '@inertiajs/react';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function RoleSelect() {
    return (
        <>
            <Head title="Lomas izvēle" />

            <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4">
                <div className="w-full max-w-3xl text-center">
                    <div className="mb-8 flex justify-center">
                        <img
                            src="/images/ljk-logo.png"
                            alt="LJK logo"
                            className="h-24 w-auto object-contain"
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-neutral-900">
                        Loģistikas un kravu simulators
                    </h1>
                    <p className="mt-3 text-lg text-neutral-500">
                        Izvēlieties savu lomu, lai turpinātu
                    </p>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => router.post('/switch-role/teacher')}
                            className="group rounded-3xl border border-neutral-300 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9efeb]">
                                <BookOpen className="h-8 w-8 text-[#1f6b50]" />
                            </div>
                            <div className="text-2xl font-semibold text-neutral-900">
                                Pasniedzējs
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.post('/switch-role/student')}
                            className="group rounded-3xl border border-neutral-300 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9efeb]">
                                <GraduationCap className="h-8 w-8 text-[#1f6b50]" />
                            </div>
                            <div className="text-2xl font-semibold text-neutral-900">
                                Students
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}