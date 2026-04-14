import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type PageProps = {
    id: number;
};

const customsItems = [
    {
        id: 1,
        name: 'CMR',
        description: 'Starptautiskais autotransporta kravas pavadzīmes dokuments.',
    },
    {
        id: 2,
        name: 'Commercial Invoice',
        description: 'Komercrēķins muitošanas un norēķinu procesam.',
    },
    {
        id: 3,
        name: 'Packing List',
        description: 'Detalizēts kravas vienību un iepakojuma saraksts.',
    },
];

export default function Edit() {
    const { id } = usePage<{ props: PageProps }>().props;

    const item = useMemo(
        () => customsItems.find((customs) => customs.id === Number(id)) ?? customsItems[0],
        [id]
    );

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
    });

    const inputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

    return (
        <TeacherLayout>
            <Head title="Rediģēt muitas dokumentu" />

            <div className="space-y-6 p-6">
                <BackButton />

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold text-slate-900">Rediģēt muitas dokumentu</h1>
                    <p className="mt-2 text-[16px] text-slate-600">
                        Atjaunojiet dokumenta sagatavi simulatora scenārijiem.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Updated customs document:', form);
                        alert('UI demo: muitas dokuments atjaunināts lokāli');
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