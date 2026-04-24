import { FormEvent, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

type TemperaturePresetFormData = {
    name: string;
    min_temp: string;
    max_temp: string;
    description: string;
};

type TemperaturePresetFormProps = {
    submitLabel?: string;
    onSubmit?: (data: TemperaturePresetFormData) => void;
    initialData?: {
        name?: string;
        description?: string | null;
        range?: string | null;
    };
    isEdit?: boolean;
    id?: number;
};

function parseRange(range?: string | null) {
    if (!range) {
        return { min_temp: '', max_temp: '' };
    }

    const normalized = range.replace(/\s+/g, ' ').trim();

    if (normalized.includes('līdz')) {
        const [min, max] = normalized.split('līdz').map((part) => part.trim());
        return {
            min_temp: min ?? '',
            max_temp: max ?? '',
        };
    }

    return {
        min_temp: normalized,
        max_temp: '',
    };
}

export default function TemperaturePresetForm({
    submitLabel = 'Saglabāt',
    onSubmit,
    initialData,
    isEdit = false,
    id,
}: TemperaturePresetFormProps) {
    const parsedRange = useMemo(
        () => parseRange(initialData?.range),
        [initialData?.range],
    );

    const [form, setForm] = useState<TemperaturePresetFormData>({
        name: initialData?.name ?? '',
        min_temp: parsedRange.min_temp,
        max_temp: parsedRange.max_temp,
        description: initialData?.description ?? '',
    });

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (onSubmit) {
            return onSubmit(form);
        }

        const range = form.max_temp.trim()
            ? `${form.min_temp.trim()} līdz ${form.max_temp.trim()}`
            : form.min_temp.trim();

        const payload = {
            name: form.name,
            description: form.description,
            range,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/temperature/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/temperature', payload);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-4xl">
            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6">
                <div>
                    <h2 className="text-[16px] font-semibold text-[#162118]">
                        Pamatinformācija
                    </h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5 grid gap-4">
                        <Field>
                            <Label text="Nosaukums *" />
                            <Input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="piem., Dzesēta krava"
                                required
                            />
                        </Field>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[16px] font-semibold text-[#162118]">
                        Temperatūras robežas
                    </h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <Label text="Minimālā temperatūra" />
                            <Input
                                name="min_temp"
                                value={form.min_temp}
                                onChange={handleChange}
                                placeholder="piem., +2°C"
                            />
                        </Field>

                        <Field>
                            <Label text="Maksimālā temperatūra" />
                            <Input
                                name="max_temp"
                                value={form.max_temp}
                                onChange={handleChange}
                                placeholder="piem., +8°C"
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
    return (
        <label className="mb-2 block text-[14px] font-medium text-[#162118]">
            {text}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="h-11 w-full rounded-xl border border-[#d5dbd6] bg-white px-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]"
        />
    );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            rows={4}
            className="w-full rounded-xl border border-[#d5dbd6] bg-white px-3 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]"
        />
    );
}
