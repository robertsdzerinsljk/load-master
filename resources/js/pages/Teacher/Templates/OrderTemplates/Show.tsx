import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Gauge,
    MapPinned,
    Package,
    Route,
    Ship,
    Truck,
    Thermometer,
    ShieldCheck,
    FileText,
    Sparkles,
    Play,
    Pencil,
    AlertTriangle,
    Euro,
    Clock3,
    CircleGauge,
    Map,
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

type RouteItem = {
    id: number;
    distance_km?: number | string | null;
    fromLocation?: LocationData | null;
    from_location?: LocationData | null;
    toLocation?: LocationData | null;
    to_location?: LocationData | null;
};

type TemplateData = {
    id: number;
    title: string;
    scenario_type: string;
    status: string;
    description?: string | null;
    student_brief?: string | null;
    teacher_notes?: string | null;
    priority?: string | null;

    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: number | string | null;
    cargo_amount_tons?: number | string | null;
    cargo_volume_m3?: number | string | null;
    cargo_value?: number | string | null;

    deadline_date?: string | null;
    budget_limit?: number | string | null;
    requires_refuel_planning?: boolean | null;
    max_trips?: number | string | null;

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

    landRoutes?: RouteItem[];
    land_routes?: RouteItem[];
};

type PreviewResponse = {
    route?: {
        from?: string | null;
        to?: string | null;
        distance_km?: number | string | null;
    } | null;
    transport?: {
        name?: string | null;
    } | null;
    result?: {
        required_vehicles?: number | string | null;
        trip_time_hours?: number | string | null;
        cycle_time_hours?: number | string | null;
        base_cost_per_vehicle?: number | string | null;
        total_base_cost?: number | string | null;
        fuel_stops_needed?: number | string | null;
        estimated_total_cost?: number | string | null;
    } | null;
    message?: string | null;
};

type TeacherTestData = {
    id: number;
    status: string;
    current_step: string;
    score?: number | string | null;
    is_valid?: boolean | null;
    updated_at?: string | null;
    submitted_at?: string | null;
    qualitySummary?: {
        headline: string;
        tone: 'info' | 'success' | 'warning' | 'danger';
        summary: string;
        score: number;
        is_valid: boolean;
        penalties_count: number;
        insights: Array<{
            title: string;
            tone: 'info' | 'success' | 'warning' | 'danger';
            body: string;
        }>;
    } | null;
};

type TeacherTestStats = {
    total: number;
    active: number;
    submitted: number;
};

type ReadinessIssue = {
    severity: 'critical' | 'warning';
    title: string;
    body: string;
};

type ReadinessData = {
    status: 'ready' | 'warning' | 'blocked';
    headline: string;
    summary: string;
    has_critical_issues: boolean;
    critical_count: number;
    warning_count: number;
    issues: ReadinessIssue[];
    recommendations: string[];
};

type PageProps = {
    template: TemplateData;
    readiness: ReadinessData;
    latestTeacherTest?: TeacherTestData | null;
    teacherTestStats?: TeacherTestStats | null;
};

function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = '/teacher/templates/order-templates';
}

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

function formatNumber(value?: string | number | null, suffix = '') {
    if (value === null || value === undefined || value === '') return '—';
    return `${value}${suffix}`;
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getTeacherTestStatusLabel(status?: string | null) {
    const map: Record<string, string> = {
        teacher_testing: 'Testēšana',
        teacher_test_submitted: 'Tests iesniegts',
        teacher_test_archived: 'Iepriekšējais tests',
    };

    if (!status) return 'Nav testu';

    return map[status] ?? status;
}

function getTeacherTestStepLabel(step?: string | null) {
    const map: Record<string, string> = {
        intro: 'Uzdevuma pārskats',
        transport: 'Transporta izvēle',
        route: 'Maršruta veidošana',
        fuel: 'Degvielas plānošana',
        port: 'Ostas izvēle',
        ship: 'Kuģa izvēle',
        simulation: 'Rezultāta pārbaude',
        submit: 'Iesniegšana',
    };

    if (!step) return '—';

    return map[step] ?? step;
}

function TeacherTestBadge({ status }: { status?: string | null }) {
    const current = status ?? 'teacher_testing';

    const styleMap: Record<string, string> = {
        teacher_testing: 'border-sky-200 bg-sky-50 text-sky-700',
        teacher_test_submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        teacher_test_archived: 'border-slate-200 bg-slate-100 text-slate-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styleMap[current] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {getTeacherTestStatusLabel(current)}
        </span>
    );
}

function qualityToneClasses(tone: 'info' | 'success' | 'warning' | 'danger') {
    const map: Record<typeof tone, string> = {
        info: 'border-sky-200 bg-sky-50 text-sky-800',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-red-200 bg-red-50 text-red-800',
    };

    return map[tone];
}

function readinessToneClasses(status: 'ready' | 'warning' | 'blocked') {
    const map: Record<typeof status, string> = {
        ready: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        blocked: 'border-red-200 bg-red-50 text-red-800',
    };

    return map[status];
}

function issueToneClasses(severity: 'critical' | 'warning') {
    const map: Record<typeof severity, string> = {
        critical: 'border-red-200 bg-red-50 text-red-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
    };

    return map[severity];
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

function InfoCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold leading-6 text-[#182219]">{value}</div>
        </div>
    );
}

function SectionCard({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4 border-b border-[#eef1ee] pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                    {icon}
                </div>

                <div>
                    <h2 className="text-[22px] font-semibold tracking-tight text-[#182219]">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">{description}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

function ListBlock({
    title,
    items,
    icon,
}: {
    title: string;
    items: string[];
    icon: React.ReactNode;
}) {
    return (
        <SectionCard
            title={title}
            description="Saistītie elementi, kas iekļauti šajā scenārija karkasā."
            icon={icon}
        >
            <div className="space-y-3 text-[15px] text-[#5b6b61]">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={`${title}-${index}`}
                            className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3"
                        >
                            {item}
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3">
                        Nav norādīts.
                    </div>
                )}
            </div>
        </SectionCard>
    );
}

function PreviewCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[18px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

export default function Show() {
    const page = usePage<PageProps>();
    const template = page.props.template;
    const readiness = page.props.readiness;
    const latestTeacherTest = page.props.latestTeacherTest ?? null;
    const teacherTestStats = page.props.teacherTestStats ?? {
        total: 0,
        active: 0,
        submitted: 0,
    };

    const [isTryingScenario, setIsTryingScenario] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

    const startLocation = (template.startLocation ?? template.start_location)?.name ?? '—';
    const endLocation = (template.endLocation ?? template.end_location)?.name ?? '—';

    const temperatureMode =
        (template.temperatureMode ?? template.temperature_mode)?.name ?? 'Nav norādīts';

    const specialCondition =
        (template.specialCondition ?? template.special_condition)?.name ?? 'Nav norādīts';

    const transportNames =
        (template.transportTemplates ?? template.transport_templates)?.map((item) => item.name) ?? [];

    const shipNames = template.ships?.map((item) => item.name) ?? [];
    const portNames = template.ports?.map((item) => item.name) ?? [];

    const routeLabels = ((template.landRoutes ?? template.land_routes) ?? []).map((route) => {
        const from = (route.fromLocation ?? route.from_location)?.name ?? '—';
        const to = (route.toLocation ?? route.to_location)?.name ?? '—';
        const distance = route.distance_km ?? '—';

        return `${from} → ${to} (${distance} km)`;
    });

    const scenarioSummary =
        template.description ||
        template.student_brief ||
        'Šai uzdevuma sagatavei apraksts vēl nav pievienots.';

    const openTeacherTestLabel = latestTeacherTest
        ? latestTeacherTest.status === 'teacher_testing'
            ? 'Atvērt aktīvo testu'
            : 'Atvērt pēdējo testu'
        : 'Testēt simulatorā';

    const compactMetrics = useMemo(() => {
        return [
            {
                label: 'Maršruta sākums',
                value: startLocation,
                icon: <MapPinned className="h-4 w-4" />,
            },
            {
                label: 'Maršruta beigas',
                value: endLocation,
                icon: <Route className="h-4 w-4" />,
            },
            {
                label: 'Termiņš',
                value: formatDate(template.deadline_date),
                icon: <CalendarDays className="h-4 w-4" />,
            },
            {
                label: 'Budžeta limits',
                value: formatNumber(template.budget_limit, ' €'),
                icon: <Euro className="h-4 w-4" />,
            },
        ];
    }, [startLocation, endLocation, template.deadline_date, template.budget_limit]);

    const handleTryScenario = async () => {
        setIsTryingScenario(true);
        setPreviewError(null);
        setPreviewData(null);

        try {
            const response = await fetch(
                `/teacher/templates/order-templates/${template.id}/preview`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({}),
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPreviewError(data.message || 'Neizdevās aprēķināt scenāriju.');
                return;
            }

            setPreviewData(data);
        } catch {
            setPreviewError('Neizdevās sazināties ar serveri.');
        } finally {
            setIsTryingScenario(false);
        }
    };

    return (
        <>
            <Head title="Uzdevuma sagataves priekšskatījums" />

            <TeacherLayout active="templates">
                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5f6f65] transition hover:text-[#182219]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ
                    </button>

                    <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                        <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                        <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                                        <ClipboardList className="h-7 w-7" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#182219] md:text-[34px]">
                                                {template.title}
                                            </h1>
                                            <StatusBadge status={template.status} />
                                            <ScenarioTypeBadge type={template.scenario_type} />
                                        </div>

                                        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                                            Šeit pasniedzējs var pārskatīt pilnu scenārija karkasu,
                                            novērtēt loģistikas nosacījumus un izmēģināt aprēķinu
                                            pirms sagataves piešķiršanas studentiem.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {compactMetrics.map((item) => (
                                        <InfoCard
                                            key={item.label}
                                            label={item.label}
                                            value={item.value}
                                            icon={item.icon}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex w-full shrink-0 flex-col gap-3 xl:w-auto">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            `/teacher/templates/order-templates/${template.id}/edit`
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-5 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Rediģēt sagatavi
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            `/teacher/simulator/template/${template.id}`
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                >
                                    <Play className="h-4 w-4" />
                                    Testēt simulatorā
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/teacher/simulator/template/${template.id}/fresh`
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-[#166A4D] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                >
                                    <Play className="h-4 w-4" />
                                    Jauns tests
                                </button>

                                <button
                                    type="button"
                                    onClick={handleTryScenario}
                                    disabled={isTryingScenario}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DBE9F7] px-5 py-3 text-[15px] font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Play className="h-4 w-4" />
                                    {isTryingScenario ? 'Notiek aprēķins...' : 'Aprēķināt scenāriju'}
                                </button>
                            </div>
                        </div>
                    </section>

                    <SectionCard
                        title="Skolotāja testēšana"
                        description="Atver pēdējo simulatora testu vai sāc pilnīgi jaunu mēģinājumu, lai pārbaudītu scenāriju pirms piešķiršanas studentiem."
                        icon={<Play className="h-5 w-5" />}
                    >
                        {latestTeacherTest ? (
                            <div className="space-y-5">
                                <div className="space-y-5">
                                    <div className={`rounded-2xl border p-5 ${readinessToneClasses(readiness.status)}`}>
                                        <div className="text-[12px] font-semibold uppercase tracking-[0.18em]">
                                            Piešķiršanas gatavība
                                        </div>
                                        <div className="mt-2 text-[22px] font-semibold">
                                            {readiness.headline}
                                        </div>
                                        <p className="mt-3 max-w-3xl text-[15px] leading-7">
                                            {readiness.summary}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <InfoCard
                                            label="Statuss"
                                            value={readiness.headline}
                                            icon={<CheckCircle2 className="h-4 w-4" />}
                                        />
                                        <InfoCard
                                            label="Kritiskās problēmas"
                                            value={String(readiness.critical_count)}
                                            icon={<AlertTriangle className="h-4 w-4" />}
                                        />
                                        <InfoCard
                                            label="Brīdinājumi"
                                            value={String(readiness.warning_count)}
                                            icon={<ShieldCheck className="h-4 w-4" />}
                                        />
                                    </div>

                                    {readiness.issues.length ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {readiness.issues.map((issue) => (
                                                <div
                                                    key={`${issue.severity}-${issue.title}`}
                                                    className={`rounded-2xl border p-4 ${issueToneClasses(issue.severity)}`}
                                                >
                                                    <div className="text-[15px] font-semibold">
                                                        {issue.title}
                                                    </div>
                                                    <p className="mt-2 text-[14px] leading-6">
                                                        {issue.body}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    {readiness.recommendations.length ? (
                                        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] p-5">
                                            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                                Ieteicamie nākamie soļi
                                            </div>
                                            <div className="mt-3 space-y-2">
                                                {readiness.recommendations.map((recommendation, index) => (
                                                    <div
                                                        key={`${recommendation}-${index}`}
                                                        className="rounded-xl border border-[#e4e9e4] bg-white px-4 py-3 text-[14px] leading-6 text-[#425247]"
                                                    >
                                                        {recommendation}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <TeacherTestBadge status={latestTeacherTest.status} />
                                            <div className="text-[14px] text-[#5b6b61]">
                                                Pēdējoreiz atjaunots {formatDateTime(latestTeacherTest.updated_at)}
                                            </div>
                                        </div>

                                        <div className="text-[20px] font-semibold text-[#182219]">
                                            {openTeacherTestLabel}
                                        </div>

                                        <p className="max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                                            Pēdējais tests ir pieejams šajā sagatavē. Vari turpināt no iepriekšējā stāvokļa vai sākt jaunu tīru mēģinājumu.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.visit(`/teacher/simulator/${latestTeacherTest.id}`)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                        >
                                            <Play className="h-4 w-4" />
                                            {openTeacherTestLabel}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.post(`/teacher/simulator/template/${template.id}/fresh`)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-[#125740] px-5 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                        >
                                            <Play className="h-4 w-4" />
                                            Jauns tests
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <InfoCard
                                        label="Pēdējā testa statuss"
                                        value={getTeacherTestStatusLabel(latestTeacherTest.status)}
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Pēdējais solis"
                                        value={getTeacherTestStepLabel(latestTeacherTest.current_step)}
                                        icon={<ClipboardList className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Punkti"
                                        value={formatNumber(latestTeacherTest.score)}
                                        icon={<Gauge className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Iesniegts"
                                        value={formatDateTime(latestTeacherTest.submitted_at)}
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <InfoCard
                                        label="Kopā testi"
                                        value={String(teacherTestStats.total)}
                                        icon={<Boxes className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Aktīvie testi"
                                        value={String(teacherTestStats.active)}
                                        icon={<Play className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Iesniegtie testi"
                                        value={String(teacherTestStats.submitted)}
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                </div>
                                {latestTeacherTest.qualitySummary ? (
                                    <div className="space-y-4">
                                        <div
                                            className={`rounded-2xl border p-5 ${qualityToneClasses(
                                                latestTeacherTest.qualitySummary.tone
                                            )}`}
                                        >
                                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em]">
                                                Scenārija kvalitātes signāls
                                            </div>
                                            <div className="mt-2 text-[22px] font-semibold">
                                                {latestTeacherTest.qualitySummary.headline}
                                            </div>
                                            <p className="mt-3 max-w-3xl text-[15px] leading-7">
                                                {latestTeacherTest.qualitySummary.summary}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            {latestTeacherTest.qualitySummary.insights.map((insight) => (
                                                <div
                                                    key={insight.title}
                                                    className={`rounded-2xl border p-4 ${qualityToneClasses(
                                                        insight.tone
                                                    )}`}
                                                >
                                                    <div className="text-[15px] font-semibold">
                                                        {insight.title}
                                                    </div>
                                                    <p className="mt-2 text-[14px] leading-6">
                                                        {insight.body}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] p-5">
                                <div className="text-[18px] font-semibold text-[#182219]">
                                    Vēl nav saglabātu skolotāja testu
                                </div>
                                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                                    Palaid simulatoru, lai pārbaudītu, kā šī sagatave uzvedas studenta plūsmā. Jaunais tests sāksies no tukša stāvokļa.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(`/teacher/simulator/template/${template.id}`)
                                    }
                                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                >
                                    <Play className="h-4 w-4" />
                                    Testēt simulatorā
                                </button>
                            </div>
                        )}
                    </SectionCard>

                    {(previewError || previewData) && (
                        <SectionCard
                            title="Scenārija preview"
                            description="Priekšskatījums tam, kā sagataves loģika uzvedas aprēķinā. Tas palīdz ātri pamanīt problēmas vēl pirms uzdevuma piešķiršanas studentiem."
                            icon={<Sparkles className="h-5 w-5" />}
                        >
                            {previewError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-700">
                                    <div className="flex items-center gap-2 font-medium">
                                        <AlertTriangle className="h-4 w-4" />
                                        {previewError}
                                    </div>
                                </div>
                            )}

                            {previewData && (
                                <>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <PreviewCard
                                            label="Maršruts"
                                            value={`${previewData.route?.from ?? '—'} → ${previewData.route?.to ?? '—'}`}
                                            icon={<Map className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Attālums"
                                            value={`${previewData.route?.distance_km ?? '—'} km`}
                                            icon={<Route className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Transports"
                                            value={previewData.transport?.name ?? '—'}
                                            icon={<Truck className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Nepieciešamās vienības"
                                            value={`${previewData.result?.required_vehicles ?? '—'}`}
                                            icon={<Boxes className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Brauciena laiks"
                                            value={`${previewData.result?.trip_time_hours ?? '—'} h`}
                                            icon={<Clock3 className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Pilna cikla laiks"
                                            value={`${previewData.result?.cycle_time_hours ?? '—'} h`}
                                            icon={<CircleGauge className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Bāzes izmaksas uz 1 transportu"
                                            value={`${previewData.result?.base_cost_per_vehicle ?? '—'} €`}
                                            icon={<Euro className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Kopējās bāzes izmaksas"
                                            value={`${previewData.result?.total_base_cost ?? '—'} €`}
                                            icon={<Gauge className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Uzpildes pieturas"
                                            value={`${previewData.result?.fuel_stops_needed ?? '—'}`}
                                            icon={<CheckCircle2 className="h-4 w-4" />}
                                        />
                                        <PreviewCard
                                            label="Prognozētās kopējās izmaksas"
                                            value={`${previewData.result?.estimated_total_cost ?? '—'} €`}
                                            icon={<Euro className="h-4 w-4" />}
                                        />
                                    </div>

                                    {previewData.message ? (
                                        <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-4 text-[15px] leading-7 text-[#425247]">
                                            {previewData.message}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </SectionCard>
                    )}

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <SectionCard
                            title="Scenārija kopsavilkums"
                            description="Galvenā biznesa loģika un prasības, ko definē šī sagatave."
                            icon={<FileText className="h-5 w-5" />}
                        >
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <Package className="h-4 w-4 text-[#166a4d]" />
                                        Apraksts
                                    </div>
                                    <p className="mt-3 text-[15px] leading-7 text-[#425247]">
                                        {scenarioSummary}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard
                                        label="Kravas nosaukums"
                                        value={template.cargo_name || 'Nav norādīts'}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kravas veids"
                                        value={template.cargo_type || 'Nav norādīts'}
                                        icon={<Boxes className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Konteineri"
                                        value={formatNumber(template.cargo_amount_containers)}
                                        icon={<Boxes className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Tonnas"
                                        value={formatNumber(template.cargo_amount_tons, ' t')}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Tilpums"
                                        value={formatNumber(template.cargo_volume_m3, ' m³')}
                                        icon={<Boxes className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kravas vērtība"
                                        value={formatNumber(template.cargo_value, ' €')}
                                        icon={<Euro className="h-4 w-4" />}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Operatīvie nosacījumi"
                            description="Svarīgākie ierobežojumi un plānošanas parametri, kas ietekmē izpildi."
                            icon={<ShieldCheck className="h-5 w-5" />}
                        >
                            <div className="space-y-4">
                                <InfoCard
                                    label="Temperatūras režīms"
                                    value={temperatureMode}
                                    icon={<Thermometer className="h-4 w-4" />}
                                />
                                <InfoCard
                                    label="Speciālais nosacījums"
                                    value={specialCondition}
                                    icon={<ShieldCheck className="h-4 w-4" />}
                                />
                                <InfoCard
                                    label="Maksimālais braucienu skaits"
                                    value={formatNumber(template.max_trips)}
                                    icon={<Route className="h-4 w-4" />}
                                />
                                <InfoCard
                                    label="Uzpildes plānošana"
                                    value={template.requires_refuel_planning ? 'Nepieciešama' : 'Nav nepieciešama'}
                                    icon={<Gauge className="h-4 w-4" />}
                                />
                                <InfoCard
                                    label="Prioritāte"
                                    value={template.priority || 'Nav norādīta'}
                                    icon={<CheckCircle2 className="h-4 w-4" />}
                                />
                                <InfoCard
                                    label="Pasniedzēja piezīmes"
                                    value={template.teacher_notes || 'Nav pievienotas'}
                                    icon={<FileText className="h-4 w-4" />}
                                />
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <ListBlock
                            title="Transporta veidi"
                            items={transportNames}
                            icon={<Truck className="h-5 w-5" />}
                        />

                        <ListBlock
                            title="Kuģi"
                            items={shipNames}
                            icon={<Ship className="h-5 w-5" />}
                        />

                        <ListBlock
                            title="Ostas"
                            items={portNames}
                            icon={<MapPinned className="h-5 w-5" />}
                        />

                        <ListBlock
                            title="Sauszemes maršruti"
                            items={routeLabels}
                            icon={<Route className="h-5 w-5" />}
                        />
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}
