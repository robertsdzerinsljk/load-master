import type { ReactNode } from 'react';

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
        <section className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    Scenario section
                </div>
                <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-[#182219]">
                    {title}
                </h2>

                {description ? (
                    <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5b6b61]">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="space-y-5">{children}</div>
        </section>
    );
}
