import StudentLayout from '@/layouts/StudentLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    Clock3,
    FileText,
    MapPinned,
    Package,
    Play,
    Route,
    Search,
    Truck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type TemplateItem = {
    id: number;
    title: string;
    scenario_type?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: number | string | null;
    cargo_amount_tons?: number | string | null;
    deadline_date?: string | null;

    startLocation?: {
        id?: number;
        name?: string | null;
    } | null;
    start_location?: {
        id?: number;
        name?: string | null;
    } | null;

    endLocation?: {
        id?: number;
        name?: string | null;
    } | null;
    end_location?: {
        id?: number;
        name?: string | null;
    } | null;

    transportTemplates?: Array<{
        id: number;
        name: string;
    }> | null;
    transport_templates?: Array<{
        id: number;
        name: string;
    }> | null;
};

type PageProps = {
    templates?: TemplateItem[];
    assignments?: TemplateItem[];
};

function formatDate(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function getScenarioLabel(type?: string | null) {
    if (!type) return 'Scenārijs nav norādīts';

    const map: Record<string, string> = {
        fuel_planning: 'Uzpildes plānošana',
        container_delivery: 'Konteineru piegāde',
        route_planning: 'Maršruta plānošana',
        mixed_transport: 'Kombinētais transports',
        port_loading: 'Ostas iekraušana',
        simulation: 'Simulācija',
        general: 'Vispārējs scenārijs',
    };

    return map[type] ?? type.replaceAll('_', ' ');
}

function MetricChip({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] px-3 py-3">
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-1 text-[14px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[28px] border border-dashed border-[#d9ded9] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                <ClipboardList className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#182219]">
                Pašlaik nav pieejamu uzdevumu
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                Kad pasniedzējs tev piešķirs simulatora uzdevumu, tas parādīsies šeit un būs gatavs
                izpildei.
            </p>
        </div>
    );
}

function TemplateRow({ template }: { template: TemplateItem }) {
    const start = template?.startLocation?.name ?? template?.start_location?.name ?? '—';
    const end = template?.endLocation?.name ?? template?.end_location?.name ?? '—';

    const transportNames =
        template?.transportTemplates?.map((item) => item.name) ??
        template?.transport_templates?.map((item) => item.name) ??
        [];

    const transportSummary =
        transportNames.length > 0 ? transportNames.slice(0, 2).join(', ') : 'Nav norādīts';

    const quantity =
        [
            template?.cargo_amount_containers
                ? `${template.cargo_amount_containers} konteineri`
                : null,
            template?.cargo_amount_tons ? `${template.cargo_amount_tons} t` : null,
        ]
            .filter(Boolean)
            .join(' • ') || 'Nav norādīts';

    const description =
        template?.cargo_name || template?.cargo_type || 'Kravas informācija nav norādīta';

    return (
        <div className="rounded-[26px] border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                            <ClipboardList className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-[20px] font-semibold tracking-tight text-[#182219]">
                                    {template?.title || 'Uzdevums bez nosaukuma'}
                                </h2>

                                <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[13px] font-medium text-[#182219]">
                                    {getScenarioLabel(template?.scenario_type)}
                                </span>
                            </div>

                            <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <MetricChip
                            label="Maršruts"
                            value={`${start} → ${end}`}
                            icon={<Route className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Daudzums"
                            value={quantity}
                            icon={<Package className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Transports"
                            value={transportSummary}
                            icon={<Truck className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Termiņš"
                            value={formatDate(template?.deadline_date)}
                            icon={<Clock3 className="h-4 w-4" />}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[#66746c]">
                        <div className="inline-flex items-center gap-2">
                            <MapPinned className="h-4 w-4 text-[#7b887f]" />
                            Gatavs uzsākšanai
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#7b887f]" />
                            Simulatora scenārijs studentam
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 xl:min-w-[210px]">
                    <button
                        type="button"
                        onClick={() => router.visit(`/student/simulator/task/${template.id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                    >
                        <Play className="h-4 w-4" />
                        Sākt uzdevumu
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit(`/student/simulator/task/${template.id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                    >
                        Skatīt detaļas
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboard() {
    const page = usePage<PageProps>();

    const templates = page.props.templates ?? page.props.assignments ?? [];
    const [query, setQuery] = useState('');

    const filteredTemplates = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return templates;
        }

        return templates.filter((template) => {
            const haystack = [
                template?.title,
                template?.cargo_name,
                template?.cargo_type,
                template?.scenario_type,
                template?.startLocation?.name,
                template?.start_location?.name,
                template?.endLocation?.name,
                template?.end_location?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [templates, query]);

    return (
        <>
            <Head title="Pieejamie uzdevumi" />

            <StudentLayout active="tasks">
                <div className="space-y-6">
                    <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                        <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                        <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Studenta darba vide
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                                Pieejamie uzdevumi
                            </h1>

                            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                                Šeit redzami visi tev piešķirtie simulatora uzdevumi. Vari sākt
                                jaunu izpildi un atvērt scenāriju detalizētākam pārskatam.
                            </p>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                                    Uzdevumu saraksts
                                </h2>
                                <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">
                                    Izvēlies uzdevumu, kuru vēlies sākt izpildīt.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Meklēt pēc nosaukuma, kravas vai maršruta..."
                                    className="w-full rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                />
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            {templates.length === 0 ? (
                                <EmptyState />
                            ) : filteredTemplates.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                                        <Search className="h-6 w-6" />
                                    </div>

                                    <h3 className="mt-4 text-[20px] font-semibold text-[#182219]">
                                        Nekas netika atrasts
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-[15px] leading-7 text-[#5b6b61]">
                                        Pamēģini citu meklēšanas frāzi vai notīri meklēšanas lauku,
                                        lai redzētu visus pieejamos uzdevumus.
                                    </p>
                                </div>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <TemplateRow key={template.id} template={template} />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </StudentLayout>
        </>
    );
}