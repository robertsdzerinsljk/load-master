import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

type SchoolClass = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
};

type UserSummary = {
    name?: string | null;
    email?: string | null;
};

type Props = {
    academicYears: string[];
    classes: SchoolClass[];
    user?: UserSummary | null;
};

function classLabel(item: SchoolClass) {
    const code = item.code?.trim() ?? '';
    const name = item.name?.trim() ?? '';

    return code && name && code !== name ? `${code} - ${name}` : code || name;
}

export default function StudentGroupOnboarding({
    academicYears,
    classes,
    user,
}: Props) {
    const years = academicYears ?? [];
    const availableClasses = classes ?? [];

    const { data, setData, post, processing, errors } = useForm({
        academic_year: '',
        class_id: '',
    });

    const filteredClasses = useMemo(
        () =>
            availableClasses.filter(
                (item) => item.academic_year === data.academic_year,
            ),
        [availableClasses, data.academic_year],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/onboarding/student-group');
    };

    return (
        <>
            <Head title="Grupas izvēle" />

            <div className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4 py-8">
                <div className="w-full max-w-xl rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                    <div className="mb-6 text-center">
                        <img
                            src="/images/ljk-logo.png"
                            alt="Liepājas Jūrniecības koledža"
                            className="mx-auto mb-4 h-14 w-auto object-contain"
                        />
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#166a4d] uppercase">
                            Pirmais solis
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#182219]">
                            Izvēlies mācību gadu un grupu
                        </h1>
                    </div>

                    {user ? (
                        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-[0.16em] text-[#6b776f] uppercase">
                                    Pierakstījies kā
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-[#182219]">
                                    {user.name || user.email}
                                </p>
                                {user.email ? (
                                    <p className="truncate text-xs text-[#6b776f]">
                                        {user.email}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="shrink-0 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-sm font-semibold text-[#425347] transition hover:bg-[#edf2ee]"
                            >
                                Izrakstīties
                            </button>
                        </div>
                    ) : null}

                    {availableClasses.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                            Sistēmā vēl nav izveidotu grupu. Sazinies ar
                            administratoru, lai pabeigtu pieslēgšanos.
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-5">
                            <label className="block">
                                <span className="text-sm font-semibold text-[#425347]">
                                    Mācību gads
                                </span>
                                <select
                                    value={data.academic_year}
                                    onChange={(event) => {
                                        setData(
                                            'academic_year',
                                            event.target.value,
                                        );
                                        setData('class_id', '');
                                    }}
                                    className="mt-2 h-12 w-full rounded-2xl border border-[#d9ded9] bg-white px-3 text-sm text-[#182219] transition outline-none focus:border-[#166a4d] focus:ring-4 focus:ring-[#edf6f0]"
                                    required
                                >
                                    <option value="" disabled>
                                        Izvēlies mācību gadu
                                    </option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.academic_year}
                                    className="mt-2"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-semibold text-[#425347]">
                                    Grupa
                                </span>
                                <select
                                    value={data.class_id}
                                    onChange={(event) =>
                                        setData('class_id', event.target.value)
                                    }
                                    disabled={!data.academic_year}
                                    className="mt-2 h-12 w-full rounded-2xl border border-[#d9ded9] bg-white px-3 text-sm text-[#182219] transition outline-none focus:border-[#166a4d] focus:ring-4 focus:ring-[#edf6f0] disabled:cursor-not-allowed disabled:bg-[#f8fbf9] disabled:text-[#7b887f]"
                                    required
                                >
                                    <option value="" disabled>
                                        Izvēlies grupu
                                    </option>
                                    {filteredClasses.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {classLabel(item)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.class_id}
                                    className="mt-2"
                                />
                            </label>

                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.academic_year ||
                                    !data.class_id
                                }
                                className="h-12 w-full rounded-2xl bg-[#1B6250] text-white hover:bg-[#164f41]"
                            >
                                {processing ? 'Saglabā...' : 'Turpināt'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
