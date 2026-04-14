import { FormEvent, useState } from 'react';

type TransportPresetFormData = {
    name: string;
    description: string;
    capacity: string;
    temperature_support: string;
    special_conditions: string;
    is_shared: boolean;
};

type TransportPresetFormProps = {
    submitLabel?: string;
    onSubmit?: (data: TransportPresetFormData) => void;
};

export default function TransportPresetForm({
    submitLabel = 'Saglabāt',
    onSubmit,
}: TransportPresetFormProps) {
    const [form, setForm] = useState<TransportPresetFormData>({
        name: '',
        description: '',
        capacity: '',
        temperature_support: '',
        special_conditions: '',
        is_shared: false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (onSubmit) {
            onSubmit(form);
            return;
        }

        console.log('Transport preset form submitted:', form);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl">
            <section>
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Pamatinformācija
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5 grid gap-4">
                    <Field>
                        <Label text="Nosaukums *" />
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="piem., Aukstuma kravas auto"
                        />
                    </Field>

                    <Field>
                        <Label text="Apraksts" />
                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Īss transporta veida apraksts"
                        />
                    </Field>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Parametri
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Ietilpība / kravnesība" />
                        <Input
                            name="capacity"
                            value={form.capacity}
                            onChange={handleChange}
                            placeholder="piem., 24 paletes / 18 t"
                        />
                    </Field>

                    <Field>
                        <Label text="Temperatūras atbalsts" />
                        <Input
                            name="temperature_support"
                            value={form.temperature_support}
                            onChange={handleChange}
                            placeholder="piem., +2°C līdz +8°C"
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field>
                        <Label text="Īpašie nosacījumi" />
                        <Textarea
                            name="special_conditions"
                            value={form.special_conditions}
                            onChange={handleChange}
                            placeholder="Papildu piezīmes, ierobežojumi vai prasības"
                        />
                    </Field>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Pieejamība
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5">
                    <Checkbox
                        name="is_shared"
                        checked={form.is_shared}
                        onChange={handleChange}
                        label="Padarīt šo transporta veidu pieejamu studentiem"
                    />
                </div>
            </section>

            <div className="mt-8 flex items-center gap-3">
                <button
                    type="submit"
                    className="rounded-xl bg-[#166a4d] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                >
                    {submitLabel}
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d5dbd6] bg-white px-6 py-3 text-[15px] font-medium text-[#162118] transition hover:bg-[#f3f5f3]"
                >
                    Atcelt
                </button>
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

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
function Input(props: InputProps) {
    return (
        <input
            {...props}
            className="h-11 w-full rounded-lg border border-[#d5dbd6] bg-white px-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]"
        />
    );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
function Textarea(props: TextareaProps) {
    return (
        <textarea
            {...props}
            rows={4}
            className="w-full rounded-lg border border-[#d5dbd6] bg-white px-3 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]"
        />
    );
}

type CheckboxProps = {
    name: string;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    label: string;
};

function Checkbox({ name, checked, onChange, label }: CheckboxProps) {
    return (
        <label className="flex items-center gap-2 text-[15px] text-[#162118]">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
            />
            <span>{label}</span>
        </label>
    );
}