import { FormEvent, useState } from 'react';

type OrderFormData = {
    client_name: string;
    contact_person: string;
    address: string;
    cargo_type: string;
    quantity: string;
    weight_capacity: string;
    temperature_requirements: string;
    due_date: string;
    priority: string;
    requires_security: boolean;
    requires_insurance: boolean;
    transport_requirements: string;
    customs_documents: string;
};

type OrderFormProps = {
    submitLabel?: string;
    onSubmit?: (data: OrderFormData) => void;
};

export default function OrderForm({
    submitLabel = 'Izveidot pasūtījumu',
    onSubmit,
}: OrderFormProps) {
    const [form, setForm] = useState<OrderFormData>({
        client_name: '',
        contact_person: '',
        address: '',
        cargo_type: '',
        quantity: '',
        weight_capacity: '',
        temperature_requirements: '',
        due_date: '',
        priority: 'standarta',
        requires_security: false,
        requires_insurance: false,
        transport_requirements: '',
        customs_documents: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

        console.log('Order form submitted:', form);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-4xl">
            <section>
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Klienta informācija
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Klienta vārds / uzņēmums *" />
                        <Input
                            name="client_name"
                            value={form.client_name}
                            onChange={handleChange}
                        />
                    </Field>

                    <Field>
                        <Label text="Kontaktpersona" />
                        <Input
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field>
                        <Label text="Adrese *" />
                        <Input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </Field>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Kravas informācija
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Kravas veids *" />
                        <Input
                            name="cargo_type"
                            value={form.cargo_type}
                            onChange={handleChange}
                        />
                    </Field>

                    <Field>
                        <Label text="Daudzums" />
                        <Input
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                        />
                    </Field>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Kravnesība" />
                        <Input
                            name="weight_capacity"
                            value={form.weight_capacity}
                            onChange={handleChange}
                        />
                    </Field>

                    <Field>
                        <Label text="Temperatūras prasības" />
                        <Input
                            name="temperature_requirements"
                            value={form.temperature_requirements}
                            onChange={handleChange}
                            placeholder="piem., +2°C līdz +8°C"
                        />
                    </Field>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Piegādes laiks
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Termiņš" />
                        <Input
                            type="date"
                            name="due_date"
                            value={form.due_date}
                            onChange={handleChange}
                        />
                    </Field>

                    <Field>
                        <Label text="Prioritāte" />
                        <Select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >
                            <option value="standarta">Standarta</option>
                            <option value="steidzams">Steidzams</option>
                        </Select>
                    </Field>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#162118]">
                    Īpaši nosacījumi
                </h2>
                <div className="mt-3 h-px bg-[#d9ded9]" />

                <div className="mt-4 flex gap-6">
                    <Checkbox
                        name="requires_security"
                        checked={form.requires_security}
                        onChange={handleChange}
                        label="Drošība"
                    />

                    <Checkbox
                        name="requires_insurance"
                        checked={form.requires_insurance}
                        onChange={handleChange}
                        label="Apdrošināšana"
                    />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field>
                        <Label text="Speciāla transporta prasības" />
                        <Textarea
                            name="transport_requirements"
                            value={form.transport_requirements}
                            onChange={handleChange}
                        />
                    </Field>

                    <Field>
                        <Label text="Muitas dokumenti" />
                        <Textarea
                            name="customs_documents"
                            value={form.customs_documents}
                            onChange={handleChange}
                        />
                    </Field>
                </div>
            </section>

            <div className="mt-8">
                <button
                    type="submit"
                    className="rounded-xl bg-[#166a4d] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                >
                    {submitLabel}
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

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
function Select(props: SelectProps) {
    return (
        <select
            {...props}
            className="h-11 w-full rounded-lg border border-[#d5dbd6] bg-white px-3 text-[14px] text-[#162118] outline-none transition focus:border-[#166a4d]"
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