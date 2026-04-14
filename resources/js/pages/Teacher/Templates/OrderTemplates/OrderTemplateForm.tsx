import { useState } from 'react';
import {
    customsDocumentOptions,
    orderTemplateStatusOptions,
    specialConditionOptions,
    temperatureModeOptions,
    transportTypeOptions,
} from './orderTemplateFakeData';

type OrderTemplateFormData = {
    scenarioTitle: string;
    clientName: string;
    clientCompany: string;
    clientCountry: string;
    cargoName: string;
    cargoWeight: string;
    cargoVolume: string;
    cargoValue: string;
    priority: string;
    status: string;
    transportTypeId: string;
    temperatureModeId: string;
    specialConditionId: string;
    customsDocumentId: string;
    pickupLocation: string;
    deliveryLocation: string;
    deadline: string;
    notes: string;
};

const initialForm: OrderTemplateFormData = {
    scenarioTitle: '',
    clientName: '',
    clientCompany: '',
    clientCountry: '',
    cargoName: '',
    cargoWeight: '',
    cargoVolume: '',
    cargoValue: '',
    priority: '',
    status: 'Melnraksts',
    transportTypeId: '',
    temperatureModeId: '',
    specialConditionId: '',
    customsDocumentId: '',
    pickupLocation: '',
    deliveryLocation: '',
    deadline: '',
    notes: '',
};

type Props = {
    onCancel?: () => void;
};

export default function OrderTemplateForm({ onCancel }: Props) {
    const [form, setForm] = useState<OrderTemplateFormData>(initialForm);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Order template:', form);
        alert('UI demo: sagatave saglabāta lokāli');
    };

    const inputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

    const sectionClass = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm';
    const labelClass = 'mb-2 block text-[16px] font-medium text-slate-800';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className={sectionClass}>
                <h2 className="text-[28px] font-semibold text-slate-900">Pamata informācija</h2>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Scenārija nosaukums</label>
                        <input
                            type="text"
                            name="scenarioTitle"
                            value={form.scenarioTitle}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Piemēram, Zivju piegāde uz Somiju"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Prioritāte</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
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
                            name="status"
                            value={form.status}
                            onChange={handleChange}
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
                            type="text"
                            name="clientName"
                            value={form.clientName}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Uzņēmums</label>
                        <input
                            type="text"
                            name="clientCompany"
                            value={form.clientCompany}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Valsts</label>
                        <input
                            type="text"
                            name="clientCountry"
                            value={form.clientCountry}
                            onChange={handleChange}
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
                            type="text"
                            name="cargoName"
                            value={form.cargoName}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Svars (kg)</label>
                        <input
                            type="text"
                            name="cargoWeight"
                            value={form.cargoWeight}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Tilpums (m³)</label>
                        <input
                            type="text"
                            name="cargoVolume"
                            value={form.cargoVolume}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Kravas vērtība (€)</label>
                        <input
                            type="text"
                            name="cargoValue"
                            value={form.cargoValue}
                            onChange={handleChange}
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
                            name="transportTypeId"
                            value={form.transportTypeId}
                            onChange={handleChange}
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
                            name="temperatureModeId"
                            value={form.temperatureModeId}
                            onChange={handleChange}
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
                            name="specialConditionId"
                            value={form.specialConditionId}
                            onChange={handleChange}
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
                            name="customsDocumentId"
                            value={form.customsDocumentId}
                            onChange={handleChange}
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
                            type="text"
                            name="pickupLocation"
                            value={form.pickupLocation}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Piegādes vieta</label>
                        <input
                            type="text"
                            name="deliveryLocation"
                            value={form.deliveryLocation}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Piegādes termiņš</label>
                        <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
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
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={5}
                        className={inputClass}
                    />
                </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-[16px] font-medium text-slate-700 hover:bg-slate-50"
                >
                    Atcelt
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-[16px] font-medium text-white hover:bg-slate-800"
                >
                    Saglabāt sagatavi
                </button>
            </div>
        </form>
    );
}