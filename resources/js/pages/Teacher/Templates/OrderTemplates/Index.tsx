import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';

type RelatedName = {
    id: number;
    name: string;
};

type LocationData = {
    id: number;
    name: string;
    city?: string | null;
};

type TemplateItem = {
    id: number;
    title: string;
    scenario_type: string;
    status: string;
    priority?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: string | number | null;
    cargo_amount_tons?: string | number | null;
    student_brief?: string | null;

    startLocation?: LocationData | null;
    start_location?: LocationData | null;
    endLocation?: LocationData | null;
    end_location?: LocationData | null;

    temperatureMode?: RelatedName | null;
    temperature_mode?: RelatedName | null;
    specialCondition?: RelatedName | null;
    special_condition?: RelatedName | null;

    transportTemplates?: RelatedName[];
    transport_templates?: RelatedName[];

    ships?: RelatedName[];
    ports?: RelatedName[];

    landRoutes?: { id: number }[];
    land_routes?: { id: number }[];
};

type PageProps = {
    templates: TemplateItem[];
};

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        draft: 'Melnraksts',
        ready: 'Gatavs',
    };

    const styleMap: Record<string, string> = {
        draft: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        ready: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
    };

    const label = labelMap[status] ?? status;
    const styles =
        styleMap[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${styles}`}
        >
            {label}
        </span>
    );
}

function ScenarioTypeBadge({ type }: { type: string }) {
    const labelMap: Record<string, string> = {
        general: 'Vispārējs scenārijs',
        fuel_planning: 'Uzpildes plānošana',
        port_restriction: 'Ostu ierobežojumi',
        cost_optimization: 'Izmaksu optimizācija',
        capacity_planning: 'Kapacitātes plānošana',
    };

    return (
        <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[13px] font-medium text-[#182219]">
            {labelMap[type] ?? type}
        </span>
    );
}

export default function Index() {
    const page = usePage<PageProps>();
    const templates = page.props.templates ?? [];

    return (
        <TeacherLayout active="templates">
            <Head title="Uzdevumu sagataves" />

            <div className="space-y-6">
                <BackButton href="/teacher/templates" />

                <div className="flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Uzdevumu sagataves
                        </h1>
                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                            Pasniedzējs šeit veido scenāriju karkasus studentu simulatora
                            uzdevumiem, nosakot nosacījumus, resursus un ierobežojumus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/order-templates/create')}
                        className="inline-flex items-center justify-center rounded-xl bg-[#166a4d] px-5 py-3 text-[16px] font-medium text-white transition hover:bg-[#135740]"
                    >
                        Izveidot jaunu sagatavi
                    </button>
                </div>

                <div className="rounded-xl border border-[#d9ded9] bg-white shadow-sm">
                    <div className="border-b border-[#d9ded9] px-6 py-5">
                        <h2 className="text-[24px] font-semibold text-[#182219]">
                            Sagatavju saraksts
                        </h2>
                        <p className="mt-2 text-[16px] leading-7 text-[#5b6b61]">
                            Visi saglabātie uzdevumu scenāriji, kurus vēlāk var izmantot studentu darbā.
                        </p>
                    </div>

                    <div className="divide-y divide-[#d9ded9]">
                        {templates.map((template) => {
                            const start = (template.startLocation ?? template.start_location)?.name ?? '—';
                            const end = (template.endLocation ?? template.end_location)?.name ?? '—';
                            const firstTransport =
                                (template.transportTemplates ?? template.transport_templates)?.[0]?.name ?? '—';
                            const firstShip = template.ships?.[0]?.name ?? null;
                            const firstPort = template.ports?.[0]?.name ?? null;

                            return (
                                <div
                                    key={template.id}
                                    className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-[16px] font-semibold text-[#182219]">
                                                {template.title}
                                            </h3>

                                            <StatusBadge status={template.status} />
                                            <ScenarioTypeBadge type={template.scenario_type} />
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
                                                    Maršruts:
                                                </span>{' '}
                                                {start} → {end}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Prioritāte:
                                                </span>{' '}
                                                {template.priority || '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Transports:
                                                </span>{' '}
                                                {firstTransport}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Temperatūra:
                                                </span>{' '}
                                                {(template.temperatureMode ?? template.temperature_mode)?.name || '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Īpašie nosacījumi:
                                                </span>{' '}
                                                {(template.specialCondition ?? template.special_condition)?.name || '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Kuģis:
                                                </span>{' '}
                                                {firstShip || '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Osta:
                                                </span>{' '}
                                                {firstPort || '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Konteineri:
                                                </span>{' '}
                                                {template.cargo_amount_containers ?? '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Tonnas:
                                                </span>{' '}
                                                {template.cargo_amount_tons ?? '—'}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#182219]">
                                                    Maršrutu skaits:
                                                </span>{' '}
                                                {(template.landRoutes ?? template.land_routes)?.length ?? 0}
                                            </p>
                                        </div>

                                        {template.student_brief && (
                                            <p className="mt-4 max-w-4xl text-[14px] leading-6 text-[#5b6b61]">
                                                {template.student_brief}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.visit(
                                                    `/teacher/templates/order-templates/${template.id}`
                                                )
                                            }
                                            className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                        >
                                            Skatīt
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.visit(
                                                    `/teacher/templates/order-templates/${template.id}/edit`
                                                )
                                            }
                                            className="rounded-xl border border-[#d9ded9] bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                        >
                                            Rediģēt
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {templates.length === 0 && (
                            <div className="px-6 py-10 text-center text-[16px] text-[#5b6b61]">
                                Šobrīd nav nevienas uzdevuma sagataves.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}