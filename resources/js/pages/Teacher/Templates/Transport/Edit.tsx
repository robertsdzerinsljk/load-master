import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type PageProps = {
    id: number;
};

const transportItems = [
    {
        id: 1,
        name: 'Standarta kravas auto',
        description: 'Universāls transporta variants standarta kravām bez īpašām temperatūras prasībām.',
        capacity: '24 paletes / 18 t',
        temperatureSupport: 'Nav nepieciešams',
    },
    {
        id: 2,
        name: 'Aukstuma kravas auto',
        description: 'Paredzēts pārtikas un medikamentu kravām ar stabilu temperatūras kontroli.',
        capacity: '20 paletes / 16 t',
        temperatureSupport: '+2°C līdz +8°C',
    },
    {
        id: 3,
        name: 'Konteiners 40FT',
        description: 'Liela tilpuma jūras transporta vienība starptautiskām kravām.',
        capacity: '67 m³ / 26 t',
        temperatureSupport: 'Nav nepieciešams',
    },
];

export default function Edit() {
    const { id } = usePage<{ props: PageProps }>().props;

    const item = useMemo(
        () => transportItems.find((transport) => transport.id === Number(id)) ?? transportItems[0],
        [id]
    );

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
        capacity: item.capacity,
        temperatureSupport: item.temperatureSupport,
    });

    const inputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

    return (
        <TeacherLayout>
            <Head title="Rediģēt transporta veidu" />

            <div className="space-y-6 p-6">
                <BackButton />

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold text-slate-900">Rediģēt transporta veidu</h1>
                    <p className="mt-2 text-[16px] text-slate-600">
                        Atjaunojiet transporta veida parametrus simulatoram.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Updated transport:', form);
                        alert('UI demo: transporta veids atjaunināts lokāli');
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">Nosaukums</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">Apraksts</label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">Ietilpība</label>
                            <input
                                value={form.capacity}
                                onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[16px] font-medium text-slate-800">
                                Temperatūras atbalsts
                            </label>
                            <input
                                value={form.temperatureSupport}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, temperatureSupport: e.target.value }))
                                }
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