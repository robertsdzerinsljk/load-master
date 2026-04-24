import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleGauge,
    ClipboardList,
    Clock3,
    Euro,
    FileText,
    Gauge,
    Map,
    MapPinned,
    Package,
    Pencil,
    Play,
    Route,
    ShieldCheck,
    Ship,
    Sparkles,
    Thermometer,
    Truck,
} from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

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

function formatNumber(value?: string | number | null, suffix = '') {
    if (value === null || value === undefined || value === '') return '—';
    return `${value}${suffix}`;
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

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        draft: 'Melnraksts',
        ready: 'Gatavs',
    };

    const styleMap: Record<string, string> = {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styleMap[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
            {labelMap[status] ?? status}
        </span>
    );
}

function ScenarioTypeBadge({ type }: { type: string }) {
    const labelMap: Record<string, string> = {
        general: 'Vispārējs',
        fuel_planning: 'Uzpildes plānošana',
        port_restriction: 'Ostu ierobežojumi',
        cost_optimization: 'Izmaksu optimizācija',
        capacity_planning: 'Kapacitātes plānošana',
    };

    return (
        <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-2.5 py-1 text-xs font-semibold text-[#182219]">
            {labelMap[type] ?? type}
        </span>
    );
}

function toneClasses(tone: 'info' | 'success' | 'warning' | 'danger' | 'critical' | 'ready' | 'blocked') {
    const map: Record<string, string> = {
        info: 'border-sky-200 bg-sky-50 text-sky-800',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        ready: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-red-200 bg-red-50 text-red-800',
        critical: 'border-red-200 bg-red-50 text-red-800',
        blocked: 'border-red-200 bg-red-50 text-red-800',
    };

    return map[tone] ?? map.info;
}

function Section({
    title,
    description,
    icon,
    actions,
    children,
    defaultOpen = true,
}: {
    title: string;
    description?: string;
    icon: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="rounded-2xl border border-[#d9ded9] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#eef1ee] px-5 py-4">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6f0] text-[#166a4d]">
                        {icon}
                    </span>

                    <span className="min-w-0">
                        <span className="block text-lg font-semibold tracking-tight text-[#182219]">
                            {title}
                        </span>
                        {description ? (
                            <span className="mt-0.5 block text-sm leading-5 text-[#5b6b61]">
                                {description}
                            </span>
                        ) : null}
                    </span>

                    <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-[#7b887f] transition ${open ? 'rotate-180' : ''}`} />
                </button>

                {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            {open ? <div className="p-5">{children}</div> : null}
        </section>
    );
}

function MetricCard({
    label,
    value,
    icon,
    dense = false,
}: {
    label: string;
    value: string;
    icon: ReactNode;
    dense?: boolean;
}) {
    return (
        <div className={`rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] ${dense ? 'px-3 py-2.5' : 'p-4'}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className={`${dense ? 'mt-1 text-sm' : 'mt-2 text-base'} font-semibold leading-6 text-[#182219]`}>
                {value}
            </div>
        </div>
    );
}

function InlineList({
    items,
    empty = 'Nav norādīts.',
}: {
    items: string[];
    empty?: string;
}) {
    if (items.length === 0) {
        return <span className="text-[#7b887f]">{empty}</span>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span
                    key={`${item}-${index}`}
                    className="rounded-full border border-[#d9ded9] bg-[#f8fbf9] px-3 py-1.5 text-sm font-medium text-[#425247]"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

function IssuePill({ issue }: { issue: ReadinessIssue }) {
    return (
        <div className={`rounded-xl border px-4 py-3 ${toneClasses(issue.severity)}`}>
            <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                    <div className="text-sm font-semibold">{issue.title}</div>
                    <p className="mt-1 text-sm leading-5">{issue.body}</p>
                </div>
            </div>
        </div>
    );
}

function ActionButton({
    children,
    variant = 'primary',
    onClick,
    disabled,
}: {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'soft';
    onClick: () => void;
    disabled?: boolean;
}) {
    const variants = {
        primary: 'bg-[#166a4d] text-white hover:bg-[#135740]',
        secondary: 'border border-[#d9ded9] bg-white text-[#182219] hover:bg-[#f7f9f7]',
        soft: 'bg-[#DBE9F7] text-[#182219] hover:bg-[#cfe0f1]',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
        >
            {children}
        </button>
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

    const temperatureMode = (template.temperatureMode ?? template.temperature_mode)?.name ?? 'Nav norādīts';
    const specialCondition = (template.specialCondition ?? template.special_condition)?.name ?? 'Nav norādīts';

    const transportNames = (template.transportTemplates ?? template.transport_templates)?.map((item) => item.name) ?? [];
    const shipNames = template.ships?.map((item) => item.name) ?? [];
    const portNames = template.ports?.map((item) => item.name) ?? [];

    const routeLabels = ((template.landRoutes ?? template.land_routes) ?? []).map((route) => {
        const from = (route.fromLocation ?? route.from_location)?.name ?? '—';
        const to = (route.toLocation ?? route.to_location)?.name ?? '—';
        const distance = route.distance_km ?? '—';

        return `${from} → ${to} (${distance} km)`;
    });

    const scenarioSummary = template.description || template.student_brief || 'Šai uzdevuma sagatavei apraksts vēl nav pievienots.';

    const compactMetrics = useMemo(() => {
        return [
            {
                label: 'Sākums',
                value: startLocation,
                icon: <MapPinned className="h-4 w-4" />,
            },
            {
                label: 'Beigas',
                value: endLocation,
                icon: <Route className="h-4 w-4" />,
            },
            {
                label: 'Termiņš',
                value: formatDate(template.deadline_date),
                icon: <CalendarDays className="h-4 w-4" />,
            },
            {
                label: 'Budžets',
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
            const response = await fetch(`/teacher/templates/order-templates/${template.id}/preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({}),
                credentials: 'same-origin',
            });

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
                <div className="mx-auto max-w-[1440px] space-y-5">
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f65] transition hover:text-[#182219]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ
                    </button>

                    <section className="rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf6f0] text-[#166a4d]">
                                        <ClipboardList className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[#182219] md:text-3xl">
                                                {template.title}
                                            </h1>
                                            <StatusBadge status={template.status} />
                                            <ScenarioTypeBadge type={template.scenario_type} />
                                        </div>

                                        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#5b6b61]">
                                            Pārskati scenārija svarīgāko informāciju, testē simulatorā un pārbaudi gatavību pirms piešķiršanas studentiem.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {compactMetrics.map((item) => (
                                        <MetricCard key={item.label} label={item.label} value={item.value} icon={item.icon} dense />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[360px]">
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => router.visit(`/teacher/templates/order-templates/${template.id}/edit`)}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Rediģēt
                                </ActionButton>

                                <ActionButton
                                    onClick={() => router.visit(`/teacher/simulator/template/${template.id}`)}
                                >
                                    <Play className="h-4 w-4" />
                                    Testēt
                                </ActionButton>

                                <ActionButton
                                    onClick={() => router.post(`/teacher/simulator/template/${template.id}/fresh`)}
                                >
                                    <Play className="h-4 w-4" />
                                    Jauns tests
                                </ActionButton>

                                <ActionButton
                                    variant="soft"
                                    onClick={handleTryScenario}
                                    disabled={isTryingScenario}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {isTryingScenario ? 'Rēķina...' : 'Aprēķināt'}
                                </ActionButton>
                            </div>
                        </div>
                    </section>

                    <Section
                        title="Skolotāja testēšana un gatavība"
                        description="Šeit redzams tikai svarīgākais. Detalizētie brīdinājumi ir sagrupēti zemāk."
                        icon={<Play className="h-5 w-5" />}
                    >
                        <div className="space-y-4">
                            <div className={`rounded-xl border px-4 py-3 ${toneClasses(readiness.status)}`}>
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em]">
                                            Piešķiršanas gatavība
                                        </div>
                                        <div className="mt-1 text-lg font-semibold">{readiness.headline}</div>
                                        <p className="mt-1 max-w-4xl text-sm leading-6">{readiness.summary}</p>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
                                            Kritiskas: {readiness.critical_count}
                                        </span>
                                        <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
                                            Brīdinājumi: {readiness.warning_count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {readiness.issues.length > 0 ? (
                                <details className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9]">
                                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#182219]">
                                        Parādīt problēmas un brīdinājumus ({readiness.issues.length})
                                    </summary>

                                    <div className="grid grid-cols-1 gap-3 border-t border-[#e4e9e4] p-4 lg:grid-cols-2">
                                        {readiness.issues.map((issue, index) => (
                                            <IssuePill key={`${issue.title}-${index}`} issue={issue} />
                                        ))}
                                    </div>
                                </details>
                            ) : null}

                            {readiness.recommendations.length > 0 ? (
                                <details className="rounded-xl border border-[#e4e9e4] bg-white">
                                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#182219]">
                                        Ieteikumi uzlabošanai ({readiness.recommendations.length})
                                    </summary>

                                    <div className="space-y-2 border-t border-[#e4e9e4] p-4">
                                        {readiness.recommendations.map((recommendation, index) => (
                                            <div key={`${recommendation}-${index}`} className="rounded-xl bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-[#425247]">
                                                {recommendation}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ) : null}

                            {latestTeacherTest ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                        <MetricCard
                                            label="Pēdējā testa statuss"
                                            value={getTeacherTestStatusLabel(latestTeacherTest.status)}
                                            icon={<CheckCircle2 className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Pēdējais solis"
                                            value={getTeacherTestStepLabel(latestTeacherTest.current_step)}
                                            icon={<ClipboardList className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Punkti"
                                            value={formatNumber(latestTeacherTest.score)}
                                            icon={<Gauge className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Iesniegts"
                                            value={formatDateTime(latestTeacherTest.submitted_at)}
                                            icon={<Clock3 className="h-4 w-4" />}
                                            dense
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <MetricCard label="Kopā testi" value={String(teacherTestStats.total)} icon={<Boxes className="h-4 w-4" />} dense />
                                        <MetricCard label="Aktīvie" value={String(teacherTestStats.active)} icon={<Play className="h-4 w-4" />} dense />
                                        <MetricCard label="Iesniegtie" value={String(teacherTestStats.submitted)} icon={<CheckCircle2 className="h-4 w-4" />} dense />
                                    </div>

                                    {latestTeacherTest.qualitySummary ? (
                                        <details className="rounded-xl border border-[#e4e9e4] bg-white">
                                            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#182219]">
                                                Scenārija kvalitātes signāls
                                            </summary>

                                            <div className="space-y-3 border-t border-[#e4e9e4] p-4">
                                                <div className={`rounded-xl border px-4 py-3 ${toneClasses(latestTeacherTest.qualitySummary.tone)}`}>
                                                    <div className="text-lg font-semibold">
                                                        {latestTeacherTest.qualitySummary.headline}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-6">
                                                        {latestTeacherTest.qualitySummary.summary}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                                                    {latestTeacherTest.qualitySummary.insights.map((insight) => (
                                                        <div key={insight.title} className={`rounded-xl border p-3 ${toneClasses(insight.tone)}`}>
                                                            <div className="text-sm font-semibold">{insight.title}</div>
                                                            <p className="mt-1 text-sm leading-5">{insight.body}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </details>
                                    ) : null}
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] p-4">
                                    <div className="text-base font-semibold text-[#182219]">
                                        Vēl nav saglabātu skolotāja testu
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-[#5b6b61]">
                                        Palaid simulatoru, lai pārbaudītu, kā šī sagatave uzvedas studenta plūsmā.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Section>

                    {(previewError || previewData) && (
                        <Section
                            title="Scenārija aprēķina preview"
                            description="Ātrs aprēķina rezultāts, lai nepārslogotu galveno skatu."
                            icon={<Sparkles className="h-5 w-5" />}
                        >
                            {previewError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <AlertTriangle className="h-4 w-4" />
                                        {previewError}
                                    </div>
                                </div>
                            ) : null}

                            {previewData ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
                                        <MetricCard
                                            label="Maršruts"
                                            value={`${previewData.route?.from ?? '—'} → ${previewData.route?.to ?? '—'}`}
                                            icon={<Map className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Attālums"
                                            value={`${previewData.route?.distance_km ?? '—'} km`}
                                            icon={<Route className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Transports"
                                            value={previewData.transport?.name ?? '—'}
                                            icon={<Truck className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Vienības"
                                            value={`${previewData.result?.required_vehicles ?? '—'}`}
                                            icon={<Boxes className="h-4 w-4" />}
                                            dense
                                        />
                                        <MetricCard
                                            label="Kopējās izmaksas"
                                            value={`${previewData.result?.estimated_total_cost ?? '—'} €`}
                                            icon={<Euro className="h-4 w-4" />}
                                            dense
                                        />
                                    </div>

                                    <details className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9]">
                                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#182219]">
                                            Detalizēts aprēķins
                                        </summary>

                                        <div className="grid grid-cols-2 gap-3 border-t border-[#e4e9e4] p-4 lg:grid-cols-3">
                                            <MetricCard label="Brauciena laiks" value={`${previewData.result?.trip_time_hours ?? '—'} h`} icon={<Clock3 className="h-4 w-4" />} dense />
                                            <MetricCard label="Pilna cikla laiks" value={`${previewData.result?.cycle_time_hours ?? '—'} h`} icon={<CircleGauge className="h-4 w-4" />} dense />
                                            <MetricCard label="Bāzes izmaksas / transports" value={`${previewData.result?.base_cost_per_vehicle ?? '—'} €`} icon={<Euro className="h-4 w-4" />} dense />
                                            <MetricCard label="Kopējās bāzes izmaksas" value={`${previewData.result?.total_base_cost ?? '—'} €`} icon={<Gauge className="h-4 w-4" />} dense />
                                            <MetricCard label="Uzpildes pieturas" value={`${previewData.result?.fuel_stops_needed ?? '—'}`} icon={<CheckCircle2 className="h-4 w-4" />} dense />
                                        </div>
                                    </details>

                                    {previewData.message ? (
                                        <div className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-[#425247]">
                                            {previewData.message}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </Section>
                    )}

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                        <Section
                            title="Scenārija kopsavilkums"
                            description="Galvenā krava un biznesa prasības."
                            icon={<FileText className="h-5 w-5" />}
                        >
                            <div className="space-y-4">
                                <div className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7b887f]">
                                        <Package className="h-4 w-4 text-[#166a4d]" />
                                        Apraksts
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[#425247]">{scenarioSummary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                                    <MetricCard label="Krava" value={template.cargo_name || 'Nav norādīts'} icon={<Package className="h-4 w-4" />} dense />
                                    <MetricCard label="Veids" value={template.cargo_type || 'Nav norādīts'} icon={<Boxes className="h-4 w-4" />} dense />
                                    <MetricCard label="Konteineri" value={formatNumber(template.cargo_amount_containers)} icon={<Boxes className="h-4 w-4" />} dense />
                                    <MetricCard label="Tonnas" value={formatNumber(template.cargo_amount_tons, ' t')} icon={<Package className="h-4 w-4" />} dense />
                                    <MetricCard label="Tilpums" value={formatNumber(template.cargo_volume_m3, ' m³')} icon={<Boxes className="h-4 w-4" />} dense />
                                    <MetricCard label="Vērtība" value={formatNumber(template.cargo_value, ' €')} icon={<Euro className="h-4 w-4" />} dense />
                                </div>
                            </div>
                        </Section>

                        <Section
                            title="Operatīvie nosacījumi"
                            description="Ierobežojumi, kas ietekmē plānošanu."
                            icon={<ShieldCheck className="h-5 w-5" />}
                        >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <MetricCard label="Temperatūra" value={temperatureMode} icon={<Thermometer className="h-4 w-4" />} dense />
                                <MetricCard label="Speciālais nosacījums" value={specialCondition} icon={<ShieldCheck className="h-4 w-4" />} dense />
                                <MetricCard label="Maks. braucieni" value={formatNumber(template.max_trips)} icon={<Route className="h-4 w-4" />} dense />
                                <MetricCard label="Uzpilde" value={template.requires_refuel_planning ? 'Nepieciešama' : 'Nav nepieciešama'} icon={<Gauge className="h-4 w-4" />} dense />
                                <MetricCard label="Prioritāte" value={template.priority || 'Nav norādīta'} icon={<CheckCircle2 className="h-4 w-4" />} dense />
                            </div>

                            {template.teacher_notes ? (
                                <details className="mt-3 rounded-xl border border-[#e4e9e4] bg-[#f8fbf9]">
                                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#182219]">
                                        Pasniedzēja piezīmes
                                    </summary>
                                    <div className="border-t border-[#e4e9e4] p-4 text-sm leading-6 text-[#425247]">
                                        {template.teacher_notes}
                                    </div>
                                </details>
                            ) : null}
                        </Section>
                    </div>

                    <Section
                        title="Saistītie resursi"
                        description="Transporti, kuģi, ostas un maršruti vienā kompaktā blokā."
                        icon={<Truck className="h-5 w-5" />}
                    >
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-[#e4e9e4] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#182219]">
                                    <Truck className="h-4 w-4 text-[#166a4d]" />
                                    Transporta veidi
                                </div>
                                <InlineList items={transportNames} />
                            </div>

                            <div className="rounded-xl border border-[#e4e9e4] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#182219]">
                                    <Ship className="h-4 w-4 text-[#166a4d]" />
                                    Kuģi
                                </div>
                                <InlineList items={shipNames} />
                            </div>

                            <div className="rounded-xl border border-[#e4e9e4] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#182219]">
                                    <MapPinned className="h-4 w-4 text-[#166a4d]" />
                                    Ostas
                                </div>
                                <InlineList items={portNames} />
                            </div>

                            <div className="rounded-xl border border-[#e4e9e4] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#182219]">
                                    <Route className="h-4 w-4 text-[#166a4d]" />
                                    Sauszemes maršruti
                                </div>
                                <InlineList items={routeLabels} />
                            </div>
                        </div>
                    </Section>
                </div>
            </TeacherLayout>
        </>
    );
}
