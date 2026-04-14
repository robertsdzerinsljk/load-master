import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type PageProps = {
    id: number;
};

const temperatureItems = [
    {
        id: 1,
        name: 'Ambient',
        description: 'Parasts temperatūras režīms bez papildu dzesēšanas.',
        range: '+15°C līdz +25°C',
    },
    {
        id: 2,
        name: 'Chilled',
        description: 'Atdzesēts režīms pārtikai un medicīnas kravām.',
        range: '+2°C līdz +8°C',
    },
    {
        id: 3,
        name: 'Frozen',
        description: 'Saldēts režīms dziļi sasaldētām kravām.',
        range: '-18°C',
    },
];

export default function Edit() {
    const { id } = usePage<{ props: PageProps }>().props;

    const item = useMemo(
        () => temperatureItems.find((temperature) => temperature.id === Number(id)) ?? temperatureItems[0],
        [id]
    );

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
        range: item.range,
    });

    const inputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

    return (
        <TeacherLayout>
            <Head title="Rediģēt temperatūras režīmu" />

            <div className="space-y-6 p-6">
                <BackButton />

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold text-slate-900">Rediģēt temperatūras režīmu</h1>
                    <p className="mt-2 text-[16px] text-slate-600">
                        Atjaunojiet temperatūras režīma parametrus simulatoram.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Updated temperature:', form);
                        alert('UI demo: temperatūras režīms atjaunināts lokāli');
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">Nosaukums</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">Apraksts</label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">
                                Temperatūras diapazons
                            </label>
                            <input
                                value={form.range}
                                onChange={(e) => setForm((prev) => ({ ...prev, range: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button className="rounded-xl bg-[#166A4D] px-5 py-3 text-[16px] font-medium text-white hover:bg-[#145C3D]">
                            Saglabāt izmaiņas
                        </button>
                    </div>
                </form>
            </div>
        </TeacherLayout>
    );
}