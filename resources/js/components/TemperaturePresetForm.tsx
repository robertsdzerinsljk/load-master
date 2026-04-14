import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

type TemperaturePresetFormData = {
    name: string;
    min_temp: string;
    max_temp: string;
    description: string;
    is_shared: boolean;
};

type TemperaturePresetFormProps = {
    submitLabel?: string;
    onSubmit?: (data: TemperaturePresetFormData) => void;
};

export default function TemperaturePresetForm({
    submitLabel = 'Saglabāt',
    onSubmit,
}: TemperaturePresetFormProps) {
    const [form, setForm] = useState<TemperaturePresetFormData>({
        name: '',
        min_temp: '',
        max_temp: '',
        description: '',
        is_shared: false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) return onSubmit(form);
        console.log(form);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-4xl">
            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6">
                <div>
                    <h2 className="text-[16px] font-semibold text-[#162118]">Pamatinformācija</h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5 grid gap-4">
                        <Field>
                            <Label text="Nosaukums *" />
                            <Input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="piem., Dzesēta krava"
                            />
                        </Field>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[16px] font-semibold text-[#162118]">Temperatūras robežas</h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <Label text="Minimālā temperatūra" />
                            <Input
                                name="min_temp"
                                value={form.min_temp}
                                onChange={handleChange}
                                placeholder="piem., +2"
                            />
                        </Field>

                        <Field>
                            <Label text="Maksimālā temperatūra" />
                            <Input
                                name="max_temp"
                                value={form.max_temp}
                                onChange={handleChange}
                                placeholder="piem., +8"
                            />
                        </Field>
                    </div>

                    <div className="mt-4">
                        <Field>
                            <Label text="Apraksts" />
                            <Textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Papildu piezīmes par temperatūras režīmu"
                            />
                        </Field>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[16px] font-semibold text-[#162118]">Pieejamība</h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5">
                        <Checkbox
                            name="is_shared"
                            checked={form.is_shared}
                            onChange={handleChange}
                            label="Padarīt šo temperatūras režīmu pieejamu studentiem"
                        />
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <button
                        type="submit"
                        className="rounded-xl bg-[#166a4d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        {submitLabel}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/temperature')}
                        className="rounded-xl border border-[#d5dbd6] bg-white px-5 py-3 text-[14px] font-medium text-[#162118] transition hover:bg-[#f3f5f3]"
                    >
                        Atcelt
                    </button>
                </div>
            </div>
        </form>
    );
}

function Field({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}
function Label({ text }: { text: string }) {
    return <label className="mb-2 block text-[14px] font-medium text-[#162118]">{text}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className="h-11 w-full rounded-xl border border-[#d5dbd6] bg-white px-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]" />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} rows={4} className="w-full rounded-xl border border-[#d5dbd6] bg-white px-3 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]" />;
}
function Checkbox({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: React.ChangeEventHandler<HTMLInputElement>; label: string }) {
    return (
        <label className="flex items-center gap-2 text-[14px] text-[#162118]">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]" />
            <span>{label}</span>
        </label>
    );
}