import { ReactNode } from 'react';

type OrderTemplateFormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function OrderTemplateFormSection({
    title,
    description,
    children,
}: OrderTemplateFormSectionProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-[28px] font-semibold leading-tight text-slate-900">
                    {title}
                </h2>

                {description && (
                    <p className="mt-2 text-[16px] leading-7 text-slate-600">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-5">{children}</div>
        </section>
    );
}