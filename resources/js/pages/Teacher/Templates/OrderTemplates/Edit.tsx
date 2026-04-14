import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    customsDocumentOptions,
    orderTemplateList,
    orderTemplateStatusOptions,
    specialConditionOptions,
    temperatureModeOptions,
    transportTypeOptions,
} from './orderTemplateFakeData';

type PageProps = {
    id: number;
};

export default function Edit() {
    const { id } = usePage<{ props: PageProps }>().props;

    const item = useMemo(
        () => orderTemplateList.find((template) => template.id === Number(id)) ?? orderTemplateList[0],
        [id]
    );

    const [form, setForm] = useState({
        scenarioTitle: item.title,
        clientName: item.client,
        clientCompany: item.client,
        clientCountry: 'Latvija',
        cargoName: item.cargo,
        cargoWeight: '1200',
        cargoVolume: '18',
        cargoValue: '25000',
        priority: item.priority,
        status: item.status === 'Piešķirts' ? 'Gatavs' : item.status,
        transportTypeId:
            String(transportTypeOptions.find((option) => option.name === item.transportType)?.id ?? ''),
        temperatureModeId:
            String(temperatureModeOptions.find((option) => option.name === item.temperatureMode)?.id ?? ''),
        specialConditionId:
            String(specialConditionOptions.find((option) => option.name === item.specialCondition)?.id ?? ''),
        customsDocumentId:
            String(customsDocumentOptions.find((option) => option.name === item.customsDocument)?.id ?? ''),
        pickupLocation: 'Liepāja',
        deliveryLocation: 'Hamburg',
        deadline: '',
        notes: 'Demo rediģēšanas režīms bez backend pieslēguma.',
    });

    const inputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

    const sectionClass = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm';
    const labelClass = 'mb-2 block text-[16px] font-medium text-slate-800';

    return (
        <TeacherLayout active="templates">
            <Head title="Rediģēt pasūtījuma sagatavi" />

            <div className="space-y-6">
                <BackButton href="/teacher/templates/order-templates" />

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold text-slate-900">Rediģēt pasūtījuma sagatavi</h1>
                    <p className="mt-2 text-[16px] text-slate-600">
                        Atjaunojiet scenāriju, ko vēlāk var izmantot studentu uzdevumos.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Updated order template:', form);
                        alert('UI demo: pasūtījuma sagatave atjaunināta lokāli');
                    }}
                    className="space-y-6"
                >
                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Pamata informācija</h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Scenārija nosaukums</label>
                                <input
                                    value={form.scenarioTitle}
                                    onChange={(e) => setForm((prev) => ({ ...prev, scenarioTitle: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Prioritāte</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlies prioritāti</option>
                                    <option value="Zema">Zema</option>
                                    <option value="Vidēja">Vidēja</option>
                                    <option value="Augsta">Augsta</option>
                                    <option value="Kritiska">Kritiska</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Statuss</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                    className={inputClass}
                                >
                                    {orderTemplateStatusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Klienta dati</h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Kontaktpersona</label>
                                <input
                                    value={form.clientName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Uzņēmums</label>
                                <input
                                    value={form.clientCompany}
                                    onChange={(e) => setForm((prev) => ({ ...prev, clientCompany: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Valsts</label>
                                <input
                                    value={form.clientCountry}
                                    onChange={(e) => setForm((prev) => ({ ...prev, clientCountry: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Kravas dati</h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Kravas nosaukums</label>
                                <input
                                    value={form.cargoName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cargoName: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Svars (kg)</label>
                                <input
                                    value={form.cargoWeight}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cargoWeight: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Tilpums (m³)</label>
                                <input
                                    value={form.cargoVolume}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cargoVolume: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Kravas vērtība (€)</label>
                                <input
                                    value={form.cargoValue}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cargoValue: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Loģistikas nosacījumi</h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Transporta veids</label>
                                <select
                                    value={form.transportTypeId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, transportTypeId: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlies transporta veidu</option>
                                    {transportTypeOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Temperatūras režīms</label>
                                <select
                                    value={form.temperatureModeId}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, temperatureModeId: e.target.value }))
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Izvēlies temperatūras režīmu</option>
                                    {temperatureModeOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Īpašie nosacījumi</label>
                                <select
                                    value={form.specialConditionId}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, specialConditionId: e.target.value }))
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Izvēlies īpašo nosacījumu</option>
                                    {specialConditionOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Muitas dokuments</label>
                                <select
                                    value={form.customsDocumentId}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, customsDocumentId: e.target.value }))
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Izvēlies muitas dokumentu</option>
                                    {customsDocumentOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Maršruts un piegāde</h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Saņemšanas vieta</label>
                                <input
                                    value={form.pickupLocation}
                                    onChange={(e) => setForm((prev) => ({ ...prev, pickupLocation: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Piegādes vieta</label>
                                <input
                                    value={form.deliveryLocation}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, deliveryLocation: e.target.value }))
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Piegādes termiņš</label>
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h2 className="text-[28px] font-semibold text-slate-900">Papildu piezīmes</h2>

                        <div className="mt-6">
                            <label className={labelClass}>Komentāri / instrukcijas</label>
                            <textarea
                                rows={5}
                                value={form.notes}
                                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/teacher/templates/order-templates')}
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-[16px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Atcelt
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#166A4D] px-5 py-3 text-[16px] font-medium text-white hover:bg-[#135740]"
                        >
                            Saglabāt izmaiņas
                        </button>
                    </div>
                </form>
            </div>
        </TeacherLayout>
    );
}