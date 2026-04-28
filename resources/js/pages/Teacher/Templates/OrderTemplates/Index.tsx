import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FileSearch,
    Gauge,
    MapPinned,
    Package,
    Pencil,
    Plus,
    Route,
    Search,
    ShieldCheck,
    Thermometer,
    Truck,
    FileText,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
    deadline_date?: string | null;
    budget_limit?: string | number | null;

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

function formatValue(value?: string | number | null, suffix = '') {
    if (value === null || value === undefined || value === '') return '—';
    return `${value}${suffix}`;
}

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        draft: 'Melnraksts',
        ready: 'Gatavs',
    };

    const styleMap: Record<string, string> = {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };

    const label = labelMap[status] ?? status;

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styleMap[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
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

function StatCard({
    label,
    value,
    helper,
    icon,
}: {
    label: string;
    value: number;
    helper: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-[#6b776f]">{label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-[#182219]">
                        {value}
                    </div>
                    <div className="mt-2 text-sm text-[#7d8a82]">{helper}</div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ecf5ef] text-[#166a4d]">
                    {icon}
                </div>
            </div>
        </div>
    );
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
                Sagataves vēl nav izveidotas
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                Kad izveidosi pirmo uzdevuma sagatavi, tā parādīsies šajā sarakstā un būs
                pieejama pārskatīšanai, rediģēšanai un vēlākai izmantošanai studentu darbā.
            </p>

            <button
                type="button"
                onClick={() => router.visit('/teacher/templates/order-templates/create')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
            >
                <Plus className="h-4 w-4" />
                Izveidot pirmo sagatavi
            </button>
        </div>
    );
}

function TemplateRow({ template }: { template: TemplateItem }) {
    const start = (template.startLocation ?? template.start_location)?.name ?? '—';
    const end = (template.endLocation ?? template.end_location)?.name ?? '—';

    const transportNames =
        (template.transportTemplates ?? template.transport_templates)?.map((item) => item.name) ?? [];

    const transportSummary =
        transportNames.length > 0 ? transportNames.slice(0, 2).join(', ') : 'Nav norādīts';

    const portCount = template.ports?.length ?? 0;
    const shipCount = template.ships?.length ?? 0;
    const routesCount = (template.landRoutes ?? template.land_routes)?.length ?? 0;

    const temperatureMode =
        (template.temperatureMode ?? template.temperature_mode)?.name ?? 'Nav norādīts';

    const specialCondition =
        (template.specialCondition ?? template.special_condition)?.name ?? 'Nav norādīts';

    const handleDelete = () => {
        if (!window.confirm('Vai tiešām dzēst šo sagatavi?')) {
            return;
        }

        router.delete(`/teacher/templates/order-templates/${template.id}`);
    };

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
                                    {template.title}
                                </h2>
                                <StatusBadge status={template.status} />
                                <ScenarioTypeBadge type={template.scenario_type} />
                            </div>

                            <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                {template.student_brief ||
                                    'Šai sagatavei nav pievienots īss studentu apraksts.'}
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
                            label="Krava"
                            value={template.cargo_name || template.cargo_type || 'Nav norādīts'}
                            icon={<Package className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Konteineri / t"
                            value={`${formatValue(template.cargo_amount_containers)} / ${formatValue(template.cargo_amount_tons)}`}
                            icon={<Boxes className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Termiņš"
                            value={formatDate(template.deadline_date)}
                            icon={<CalendarDays className="h-4 w-4" />}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <MetricChip
                            label="Transports"
                            value={transportSummary}
                            icon={<Truck className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Temperatūra"
                            value={temperatureMode}
                            icon={<Thermometer className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Spec. nosacījums"
                            value={specialCondition}
                            icon={<ShieldCheck className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Resursi"
                            value={`Ostas ${portCount} • Kuģi ${shipCount} • Maršruti ${routesCount}`}
                            icon={<MapPinned className="h-4 w-4" />}
                        />
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 xl:min-w-[190px]">
                    <button
                        type="button"
                        onClick={() =>
                            router.visit(`/teacher/templates/order-templates/${template.id}`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                    >
                        <FileSearch className="h-4 w-4" />
                        Skatīt
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.visit(`/teacher/templates/order-templates/${template.id}/edit`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                    >
                        <Pencil className="h-4 w-4" />
                        Rediģēt
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700 transition hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4" />
                        Dzēst
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index() {
    const page = usePage<PageProps>();
    const templates = page.props.templates ?? [];
    const [query, setQuery] = useState('');

    const filteredTemplates = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return templates;
        }

        return templates.filter((template) => {
            const start = (template.startLocation ?? template.start_location)?.name ?? '';
            const end = (template.endLocation ?? template.end_location)?.name ?? '';
            const cargo = template.cargo_name ?? '';
            const cargoType = template.cargo_type ?? '';
            const brief = template.student_brief ?? '';
            const scenario = template.scenario_type ?? '';

            return [
                template.title,
                start,
                end,
                cargo,
                cargoType,
                brief,
                scenario,
                template.status,
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery);
        });
    }, [templates, query]);

    const readyCount = templates.filter((item) => item.status === 'ready').length;
    const draftCount = templates.filter((item) => item.status === 'draft').length;
    const withRoutesCount = templates.filter(
        (item) => ((item.landRoutes ?? item.land_routes)?.length ?? 0) > 0
    ).length;

    return (
        <TeacherLayout active="templates">
            <Head title="Uzdevumu sagataves" />

            <div className="space-y-6">
                <BackButton fallbackHref="/teacher/templates" />

                <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                    <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                    <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Sagatavju bibliotēka
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                                Uzdevumu sagataves
                            </h1>

                            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                                Šeit tiek glabāti scenāriju karkasi studentu simulatora
                                uzdevumiem. Pasniedzējs var ātri pārskatīt sagataves, atrast
                                vajadzīgo scenāriju un atvērt to rediģēšanai vai pārbaudei.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.visit('/teacher/templates/order-templates/create')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                            >
                                <Plus className="h-4 w-4" />
                                Izveidot jaunu sagatavi
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Kopā sagataves"
                        value={templates.length}
                        helper="Visi pieejamie scenāriji"
                        icon={<ClipboardList className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Gatavas"
                        value={readyCount}
                        helper="Var izmantot studentu darbā"
                        icon={<CheckCircle2 className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Melnraksti"
                        value={draftCount}
                        helper="Vēl tiek papildinātas"
                        icon={<FileText className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Ar maršrutiem"
                        value={withRoutesCount}
                        helper="Sagataves ar definētiem land routes"
                        icon={<Gauge className="h-5 w-5" />}
                    />
                </section>

                <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                                Sagatavju saraksts
                            </h2>
                            <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">
                                Visi saglabātie uzdevumu scenāriji ar galvenajiem parametriem
                                un ātrajām darbībām.
                            </p>
                        </div>

                        <div className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Meklēt pēc nosaukuma, kravas, maršruta..."
                                className="w-full rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                            />
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <TemplateRow key={template.id} template={template} />
                            ))
                        ) : templates.length > 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                                    <Search className="h-6 w-6" />
                                </div>

                                <h3 className="mt-4 text-[20px] font-semibold text-[#182219]">
                                    Nekas netika atrasts
                                </h3>

                                <p className="mx-auto mt-2 max-w-xl text-[15px] leading-7 text-[#5b6b61]">
                                    Pamēģini citu atslēgvārdu vai notīri meklēšanas lauku, lai
                                    atkal redzētu visas sagataves.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-2.5 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                >
                                    Rādīt visas sagataves
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </section>
            </div>
        </TeacherLayout>
    );
}