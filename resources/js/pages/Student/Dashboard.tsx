import { Head, router, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';

type LocationData = {
    id: number;
    name: string;
    city?: string | null;
};

type TransportData = {
    id: number;
    name: string;
};

type TemplateItem = {
    id: number;
    title: string;
    scenario_type: string;
    student_brief?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: string | number | null;
    startLocation?: LocationData | null;
    start_location?: LocationData | null;
    endLocation?: LocationData | null;
    end_location?: LocationData | null;
    transportTemplates?: TransportData[];
    transport_templates?: TransportData[];
};

type PageProps = {
    templates: TemplateItem[];
};

function ScenarioBadge({ type }: { type: string }) {
    const labels: Record<string, string> = {
        general: 'Vispārējs scenārijs',
        fuel_planning: 'Uzpildes plānošana',
        port_restriction: 'Ostu ierobežojumi',
        cost_optimization: 'Izmaksu optimizācija',
        capacity_planning: 'Kapacitātes plānošana',
    };

    return (
        <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[13px] font-medium text-[#182219]">
            {labels[type] ?? type}
        </span>
    );
}

export default function StudentDashboard() {
    const page = usePage<PageProps>();
    const templates = page.props.templates ?? [];

    return (
        <>
            <Head title="Pieejamie uzdevumi" />

            <StudentLayout active="tasks">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Pieejamie uzdevumi
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izvēlieties simulatora uzdevumu un sāciet izpildi.
                    </p>
                </div>

                <div className="mt-6 grid gap-4">
                    {templates.length > 0 ? (
                        templates.map((template) => {
                            const start =
                                (template.startLocation ?? template.start_location)?.name ?? '—';
                            const end =
                                (template.endLocation ?? template.end_location)?.name ?? '—';
                            const firstTransport =
                                (template.transportTemplates ?? template.transport_templates)?.[0]
                                    ?.name ?? '—';

                            return (
                                <div
                                    key={template.id}
                                    className="rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-[18px] font-semibold text-[#182219]">
                                                    {template.title}
                                                </h2>
                                                <ScenarioBadge type={template.scenario_type} />
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-2 text-[15px] text-[#5b6b61] md:grid-cols-2 xl:grid-cols-4">
                                                <p>
                                                    <span className="font-medium text-[#182219]">
                                                        Krava:
                                                    </span>{' '}
                                                    {template.cargo_name || template.cargo_type || '—'}
                                                </p>

                                                <p>
                                                    <span className="font-medium text-[#182219]">
                                                        Konteineri:
                                                    </span>{' '}
                                                    {template.cargo_amount_containers ?? '—'}
                                                </p>

                                                <p>
                                                    <span className="font-medium text-[#182219]">
                                                        Maršruts:
                                                    </span>{' '}
                                                    {start} → {end}
                                                </p>

                                                <p>
                                                    <span className="font-medium text-[#182219]">
                                                        Transports:
                                                    </span>{' '}
                                                    {firstTransport}
                                                </p>
                                            </div>

                                            <p className="mt-4 max-w-4xl text-[14px] leading-6 text-[#5b6b61]">
                                                {template.student_brief || 'Šim uzdevumam nav pievienots apraksts.'}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.visit(`/student/simulator/task/${template.id}`)
                                                }
                                                className="rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                            >
                                                Sākt uzdevumu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-10 text-center text-[16px] text-[#5b6b61] shadow-sm">
                            Šobrīd nav neviena pieejama uzdevuma.
                        </div>
                    )}
                </div>
            </StudentLayout>
        </>
    );
}