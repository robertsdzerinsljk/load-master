import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherOrderTabs from '@/components/TeacherOrderTabs';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Clock3,
    FileText,
    Package,
    ShieldCheck,
    Truck,
    UserRound,
    BookOpenText,
    Thermometer,
    TriangleAlert,
    Box,
    Route as RouteIcon,
    ShipWheel,
    Fuel,
    TimerReset,
    Award,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

type AttemptPageProps = {
    attempt: {
        id: number;
        status: string;
        current_step: string;
        submitted_at?: string | null;
        updated_at?: string | null;
        selected_transport_template_id?: number | null;
        selected_vehicle_count?: number | null;
        selected_port_id?: number | null;
        selected_ship_id?: number | null;
        preview_result?: {
            message?: string | null;
            timeline?: {
                events?: Array<{
                    type: string;
                    label: string;
                    start_at: string;
                    end_at: string;
                    duration_minutes: number;
                    meta?: Record<string, unknown>;
                }>;
                summary?: {
                    started_at?: string | null;
                    finished_at?: string | null;
                    total_minutes?: number | null;
                    total_hours?: number | null;
                    deadline_at?: string | null;
                    delay_minutes?: number | null;
                    is_within_deadline?: boolean;
                };
            };
            hints?: {
                critical?: string[];
                optimization?: string[];
                info?: string[];
            };
            result?: {
                score?: number | string | null;
                required_vehicles?: number | null;
                selected_vehicles?: number | null;
                required_trips?: number | null;
                capacity_per_trip?: number | null;
                vehicle_capacity?: number | null;
                trip_time_hours?: number | string | null;
                total_cost?: number | string | null;
                fuel_needed_liters?: number | string | null;
                delay_minutes?: number | null;
                is_valid?: boolean | null;
                warnings?: string[];
                scoring?: {
                    time_weight?: number;
                    cost_weight?: number;
                    compatibility_weight?: number;
                    trips_weight?: number;
                };
                score_breakdown?: {
                    base_score?: number;
                    final_score?: number;
                    penalties?: Array<{
                        key: string;
                        label: string;
                        category: string;
                        amount: number;
                        details?: string;
                    }>;
                };
            };
            [key: string]: any;
        } | null;
        selectedTransportTemplate?: {
            id: number;
            name: string;
            type?: string | null;
            capacity_containers?: number | string | null;
        } | null;
        selectedPort?: {
            id: number;
            name: string;
            country?: string | null;
        } | null;
        selectedShip?: {
            id: number;
            name: string;
            cargo_type?: string | null;
            ship_type?: string | null;
        } | null;
        ordered_route_segments?: Array<{
            id: number;
            distance_km?: number | string | null;
            pivot?: {
                position?: number | null;
            };
            fromLocation?: {
                id?: number;
                name: string;
            } | null;
            toLocation?: {
                id?: number;
                name: string;
            } | null;
        }>;
        ordered_fuel_stations?: Array<{
            id: number;
            name?: string | null;
            display_name?: string | null;
            location_name?: string | null;
            pivot?: {
                position?: number | null;
            };
        }>;
        student?: {
            id?: number | null;
            name?: string | null;
            email?: string | null;
            class_name?: string | null;
        } | null;
        template?: {
            id?: number | null;
            title?: string | null;
            description?: string | null;
            student_brief?: string | null;
            cargo_name?: string | null;
            cargo_type?: string | null;
            cargo_amount_containers?: number | string | null;
            cargo_amount_tons?: number | string | null;
            deadline_date?: string | null;
            priority?: string | null;
            evaluation_mode?: string | null;
            temperature_mode?: string | null;
            special_condition?: string | null;
            transport_names?: string[];
        } | null;
        feedback?: {
            id?: number | null;
            grade?: number | null;
            comment?: string | null;
        } | null;
        derived?: {
            delivery_quantity_match?: 'Jā' | 'Nē' | 'Daļēji';
            delivery_type_match?: 'Jā' | 'Nē' | 'Daļēji';
            delivery_quality_match?: 'Jā' | 'Nē' | 'Daļēji';
        } | null;
    };
};

type AttemptResult = NonNullable<
    NonNullable<NonNullable<AttemptPageProps['attempt']['preview_result']>['result']>
>;

type ScoreBreakdown = NonNullable<AttemptResult['score_breakdown']>;

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
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatShortDate(value?: string | null) {
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

function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = '/teacher';
}

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        draft: 'Melnraksts',
        reviewed: 'Pārskatīts',
    };

    const styles: Record<string, string> = {
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        reviewed: 'border-blue-200 bg-blue-50 text-blue-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {labelMap[status] ?? status}
        </span>
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

function ScoreSummaryCard({
    label,
    score,
    expanded,
    onToggle,
}: {
    label: string;
    score?: number | string | null;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-left transition hover:border-[#c9d5cc] hover:bg-white"
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                        <span className="text-[#166a4d]">
                            <Award className="h-4 w-4" />
                        </span>
                        {label}
                    </div>
                    <div className="mt-2 text-[16px] font-semibold leading-6 text-[#182219]">
                        {String(score ?? 'â€”')}
                    </div>
                </div>

                <div className="text-[#5b6b61]">
                    {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </div>
            </div>

            <div className="mt-2 text-[13px] text-[#5b6b61]">
                {expanded
                    ? 'Uzspied, lai paslēptu score breakdown'
                    : 'Uzspied, lai redzētu score breakdown'}
            </div>
        </button>
    );
}

function ScoreBreakdownPanel({
    score,
    breakdown,
}: {
    score?: number | string | null;
    breakdown?: ScoreBreakdown;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-5">
            <div className="flex flex-col gap-2 border-b border-[#eef1ee] pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-[16px] font-semibold text-[#182219]">
                        Score breakdown
                    </h3>
                    <p className="mt-1 text-[14px] text-[#5b6b61]">
                        Sistēmas score sastāv no bāzes vērtības un piemērotajām penalizācijām.
                    </p>
                </div>

                <div className="rounded-xl bg-[#f8fbf9] px-4 py-2 text-[14px] font-medium text-[#182219]">
                    Bāze: {breakdown?.base_score ?? 100} → Gala score:{' '}
                    {breakdown?.final_score ?? score ?? 'â€”'}
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {breakdown?.penalties?.length ? (
                    breakdown.penalties.map((item, index) => (
                        <div
                            key={`${item.key}-${index}`}
                            className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-4"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="text-[15px] font-semibold text-[#182219]">
                                        {item.label}
                                    </div>
                                    <div className="mt-1 text-[13px] uppercase tracking-wide text-[#7a877f]">
                                        {item.category}
                                    </div>
                                    {item.details ? (
                                        <div className="mt-2 text-[14px] leading-6 text-[#4d5d53]">
                                            {item.details}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-semibold text-red-700">
                                    -{item.amount}
                                </div>
                            </div>
                        </div>
                    ))
                ) : breakdown ? (
                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
                        Penalizācijas netika piemērotas. Risinājums saglabāja pilnu score.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
                        Score breakdown šim mēģinājumam pašlaik nav pieejams.
                    </div>
                )}
            </div>
        </div>
    );
}

function ValidationRow({
    label,
    value,
}: {
    label: string;
    value: 'Jā' | 'Nē' | 'Daļēji';
}) {
    const styles: Record<string, string> = {
        Jā: 'border-green-200 bg-green-50 text-green-700',
        Nē: 'border-red-200 bg-red-50 text-red-700',
        Daļēji: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e4e9e4] bg-white px-4 py-4">
            <span className="text-[15px] font-medium text-[#182219]">{label}</span>
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                    styles[value]
                }`}
            >
                {value}
            </span>
        </div>
    );
}

function TimelineEventCard({
    event,
    index,
}: {
    event: {
        type: string;
        label: string;
        start_at: string;
        end_at: string;
        duration_minutes: number;
    };
    index: number;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-white px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-[15px] font-semibold text-[#182219]">
                        {index + 1}. {event.label}
                    </div>
                    <div className="mt-1 text-[13px] uppercase tracking-wide text-[#7a877f]">
                        {event.type}
                    </div>
                </div>

                <div className="grid gap-2 text-[14px] text-[#4d5d53] md:text-right">
                    <div>Sākums: {event.start_at}</div>
                    <div>Beigas: {event.end_at}</div>
                    <div>Ilgums: {event.duration_minutes} min</div>
                </div>
            </div>
        </div>
    );
}

function HintGroup({
    title,
    items,
    variant,
}: {
    title: string;
    items: string[];
    variant: 'critical' | 'optimization' | 'info';
}) {
    const classes =
        variant === 'critical'
            ? 'border-red-200 bg-red-50 text-red-800'
            : variant === 'optimization'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-[#d9ded9] bg-[#f8fbf9] text-[#4d5d53]';

    return (
        <div>
            <h3 className="text-[15px] font-semibold text-[#182219]">{title}</h3>
            <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                    <div
                        key={`${title}-${index}`}
                        className={`rounded-2xl border px-4 py-3 text-[14px] leading-6 ${classes}`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TeacherAssignedTaskShow() {
    const { attempt } = usePage<AttemptPageProps>().props;

    const [activeTab, setActiveTab] = useState<TeacherOrderTabKey>('overview');
    const [grade, setGrade] = useState(String(attempt.feedback?.grade ?? ''));
    const [feedback, setFeedback] = useState(attempt.feedback?.comment ?? '');
    const [feedbackSaved, setFeedbackSaved] = useState(false);
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

    const title = attempt.template?.title || 'Piešķirtais uzdevums';
    const isExamMode = attempt.template?.evaluation_mode === 'exam';

    const studentLabel = useMemo(() => {
        const name = attempt.student?.name || 'Nezināms students';
        const className = attempt.student?.class_name ? ` • ${attempt.student.class_name}` : '';
        return `${name}${className}`;
    }, [attempt.student]);

    const summary =
        attempt.template?.description ||
        attempt.template?.student_brief ||
        'Apraksts nav pievienots.';

    const transportRequirements = attempt.template?.transport_names?.length
        ? attempt.template.transport_names.join(', ')
        : 'Nav norādīts';

    const customsDocuments = attempt.template?.special_condition || 'Nav norādīts';
    const temperatureRequirements = attempt.template?.temperature_mode || 'Nav norādīts';

    const deliveryQuantityMatch = attempt.derived?.delivery_quantity_match || 'Daļēji';
    const deliveryTypeMatch = attempt.derived?.delivery_type_match || 'Daļēji';
    const deliveryQualityMatch = attempt.derived?.delivery_quality_match || 'Daļēji';

    const deliveryNotes =
        attempt.preview_result?.message ||
        (attempt.status === 'submitted'
            ? 'Students ir iesniedzis risinājumu. Var veikt pārskatīšanu.'
            : 'Students vēl turpina darbu pie uzdevuma.');

    const cargoName = attempt.template?.cargo_name || 'Nav norādīts';
    const cargoType = attempt.template?.cargo_type || 'Nav norādīts';

    const quantityLabel = [
        attempt.template?.cargo_amount_containers
            ? `${attempt.template.cargo_amount_containers} konteineri`
            : null,
        attempt.template?.cargo_amount_tons ? `${attempt.template.cargo_amount_tons} t` : null,
    ]
        .filter(Boolean)
        .join(' • ') || 'Nav norādīts';

    const selectedTransport = attempt.selectedTransportTemplate?.name || 'Nav izvēlēts';
    const selectedPort = attempt.selectedPort?.name || 'Nav izvēlēta';
    const selectedShip = attempt.selectedShip?.name || 'Nav izvēlēts';

    const result = attempt.preview_result?.result;
    const timeline = attempt.preview_result?.timeline;
    const timelineSummary = timeline?.summary;
    const timelineEvents = Array.isArray(timeline?.events) ? timeline.events : [];
    const visibleTimelineEvents = timelineEvents.slice(0, 20);
    const hiddenTimelineCount =
        timelineEvents.length > 20 ? timelineEvents.length - 20 : 0;

    const previewHints = attempt.preview_result?.hints;
    const criticalHints = previewHints?.critical ?? [];
    const optimizationHints = previewHints?.optimization ?? [];
    const infoHints = previewHints?.info ?? [];

    const handleSaveFeedback = () => {
        router.post(
            `/teacher/assigned-tasks/${attempt.id}/feedback`,
            {
                grade: grade === '' ? null : Number(grade),
                comment: feedback,
            },
            {
                preserveScroll: true,
                onSuccess: () => setFeedbackSaved(true),
            }
        );
    };

    return (
        <>
            <Head title="Piešķirtā uzdevuma detaļas" />

            <TeacherLayout active="orders">
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
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                                        <ClipboardCheck className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#182219] md:text-[34px]">
                                                {title}
                                            </h1>
                                            <StatusBadge status={attempt.status} />
                                        </div>

                                        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                                            {summary}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <InfoCard
                                        label="Students"
                                        value={studentLabel}
                                        icon={<UserRound className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Solis"
                                        value={attempt.current_step || 'Nav norādīts'}
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Iesniegts"
                                        value={formatDate(attempt.submitted_at)}
                                        icon={<CalendarDays className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Atjaunots"
                                        value={formatDate(attempt.updated_at)}
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                </div>
                            </div>

                            <div className="grid min-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[320px] xl:max-w-[360px] xl:grid-cols-1">
                                <div className="rounded-2xl border border-[#e3ebe5] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <Package className="h-4 w-4 text-[#166a4d]" />
                                        Krava
                                    </div>
                                    <div className="mt-2 text-[18px] font-semibold text-[#182219]">
                                        {cargoName}
                                    </div>
                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                        {cargoType} • {quantityLabel}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#e3ebe5] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <Truck className="h-4 w-4 text-[#166a4d]" />
                                        Pārvadājums
                                    </div>
                                    <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                        {transportRequirements}
                                    </div>
                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                        Temperatūra: {temperatureRequirements}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="rounded-[24px] border border-[#d9ded9] bg-white p-2 shadow-sm">
                        <TeacherOrderTabs active={activeTab} onChange={setActiveTab} />
                    </div>

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <SectionCard
                                title="Uzdevuma pārskats"
                                description="Galvenā informācija par piešķirto uzdevumu un studenta izpildes kontekstu."
                                icon={<BookOpenText className="h-5 w-5" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard
                                        label="Kravas nosaukums"
                                        value={cargoName}
                                        icon={<Box className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kravas veids"
                                        value={cargoType}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Daudzums"
                                        value={quantityLabel}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Termiņš"
                                        value={formatShortDate(attempt.template?.deadline_date)}
                                        icon={<CalendarDays className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Temperatūras režīms"
                                        value={temperatureRequirements}
                                        icon={<Thermometer className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Speciālie nosacījumi"
                                        value={customsDocuments}
                                        icon={<ShieldCheck className="h-4 w-4" />}
                                    />
                                </div>

                                <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <FileText className="h-4 w-4 text-[#166a4d]" />
                                        Studenta uzdevuma apraksts
                                    </div>
                                    <p className="mt-3 text-[15px] leading-7 text-[#425247]">
                                        {summary}
                                    </p>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <InfoCard
                                        label="Students izvēlējās transportu"
                                        value={selectedTransport}
                                        icon={<Truck className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Transportu skaits"
                                        value={String(attempt.selected_vehicle_count ?? '—')}
                                        icon={<Truck className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Izvēlētā osta"
                                        value={selectedPort}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Izvēlētais kuģis"
                                        value={selectedShip}
                                        icon={<ShipWheel className="h-4 w-4" />}
                                    />
                                    <ScoreSummaryCard
                                        label="Score"
                                        score={result?.score}
                                        expanded={showScoreBreakdown}
                                        onToggle={() => setShowScoreBreakdown((prev) => !prev)}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowScoreBreakdown((prev) => !prev)}
                                        className="hidden rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-left transition hover:border-[#c9d5cc] hover:bg-white"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                                    <span className="text-[#166a4d]">
                                                        <Award className="h-4 w-4" />
                                                    </span>
                                                    Score
                                                </div>
                                                <div className="mt-2 text-[16px] font-semibold leading-6 text-[#182219]">
                                                    {String(result?.score ?? '—')}
                                                </div>
                                            </div>

                                            <div className="text-[#5b6b61]">
                                                {showScoreBreakdown ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-[13px] text-[#5b6b61]">
                                            Uzspied, lai redzētu score breakdown
                                        </div>
                                    </button>

                                    <InfoCard
                                        label="Deadline statuss"
                                        value={
                                            timelineSummary?.is_within_deadline
                                                ? 'Iekļauts'
                                                : 'Nokavēts'
                                        }
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Nepieciešamie reisi"
                                        value={String(result?.required_trips ?? '—')}
                                        icon={<RouteIcon className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kapacitāte vienā reisā"
                                        value={String(result?.capacity_per_trip ?? '—')}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kavējums"
                                        value={`${timelineSummary?.delay_minutes ?? 0} min`}
                                        icon={<TimerReset className="h-4 w-4" />}
                                    />
                                </div>

                                {showScoreBreakdown && result?.score_breakdown ? (
                                    <div className="mt-5 rounded-2xl border border-[#d9ded9] bg-white p-5">
                                        <div className="flex flex-col gap-2 border-b border-[#eef1ee] pb-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-[16px] font-semibold text-[#182219]">
                                                    Score breakdown
                                                </h3>
                                                <p className="mt-1 text-[14px] text-[#5b6b61]">
                                                    Sistēmas score sastāv no bāzes vērtības un piemērotajām penalizācijām.
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-[#f8fbf9] px-4 py-2 text-[14px] font-medium text-[#182219]">
                                                Bāze: {result.score_breakdown.base_score ?? 100} → Gala score:{' '}
                                                {result.score_breakdown.final_score ?? result.score ?? '—'}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {result.score_breakdown.penalties?.length ? (
                                                result.score_breakdown.penalties.map((item, index) => (
                                                    <div
                                                        key={`${item.key}-${index}`}
                                                        className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-4"
                                                    >
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div>
                                                                <div className="text-[15px] font-semibold text-[#182219]">
                                                                    {item.label}
                                                                </div>
                                                                <div className="mt-1 text-[13px] uppercase tracking-wide text-[#7a877f]">
                                                                    {item.category}
                                                                </div>
                                                                {item.details ? (
                                                                    <div className="mt-2 text-[14px] leading-6 text-[#4d5d53]">
                                                                        {item.details}
                                                                    </div>
                                                                ) : null}
                                                            </div>

                                                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-semibold text-red-700">
                                                                -{item.amount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
                                                    Penalizācijas netika piemērotas. Risinājums saglabāja pilnu score.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </SectionCard>

                            <SectionCard
                                title="Izpildes statuss"
                                description="Ātrs pārskats par iesnieguma stāvokli un sistēmas ģenerēto paziņojumu."
                                icon={<CheckCircle2 className="h-5 w-5" />}
                            >
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                        <div className="text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                            Statuss
                                        </div>
                                        <div className="mt-3">
                                            <StatusBadge status={attempt.status} />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                        <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                            <TriangleAlert className="h-4 w-4 text-[#166a4d]" />
                                            Sistēmas piezīme
                                        </div>
                                        <p className="mt-3 text-[15px] leading-7 text-[#425247]">
                                            {deliveryNotes}
                                        </p>
                                    </div>

                                    {result?.scoring ? (
                                        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                                Score prioritātes
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-3 text-[14px] text-[#425247]">
                                                <div>Laiks: {result.scoring.time_weight ?? '—'}</div>
                                                <div>Izmaksas: {result.scoring.cost_weight ?? '—'}</div>
                                                <div>Saderība: {result.scoring.compatibility_weight ?? '—'}</div>
                                                <div>Reisi: {result.scoring.trips_weight ?? '—'}</div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.7fr]">
                            <SectionCard
                                title="Pasniedzēja atsauksme"
                                description="Šeit vari pierakstīt komentārus par studenta risinājumu un saglabāt gala vērtējumu."
                                icon={<FileText className="h-5 w-5" />}
                            >
                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-2 block text-[14px] font-medium text-[#182219]">
                                            Vērtējums (0–100)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={grade}
                                            onChange={(e) => {
                                                setGrade(e.target.value);
                                                if (feedbackSaved) {
                                                    setFeedbackSaved(false);
                                                }
                                            }}
                                            className="w-full rounded-2xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                            placeholder="Piemēram, 82"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[14px] font-medium text-[#182219]">
                                            Atsauksmes teksts
                                        </label>

                                        <textarea
                                            rows={10}
                                            value={feedback}
                                            onChange={(e) => {
                                                setFeedback(e.target.value);
                                                if (feedbackSaved) {
                                                    setFeedbackSaved(false);
                                                }
                                            }}
                                            placeholder="Ieraksti komentāru par studenta pieeju, kļūdām, stiprajām pusēm vai ieteikumiem uzlabojumiem..."
                                            className="w-full rounded-2xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleSaveFeedback}
                                            className="rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                        >
                                            Saglabāt atsauksmi
                                        </button>

                                        {feedbackSaved ? (
                                            <span className="text-[14px] font-medium text-[#166a4d]">
                                                Atsauksme saglabāta.
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Atsauksmes konteksts"
                                description="Svarīgākā informācija, ko redzēt rakstot komentāru."
                                icon={<ClipboardCheck className="h-5 w-5" />}
                            >
                                <div className="space-y-4">
                                    <InfoCard
                                        label="Students"
                                        value={studentLabel}
                                        icon={<UserRound className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Uzdevums"
                                        value={title}
                                        icon={<ClipboardCheck className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Statuss"
                                        value={
                                            {
                                                in_progress: 'Procesā',
                                                submitted: 'Iesniegts',
                                                draft: 'Melnraksts',
                                                reviewed: 'Pārskatīts',
                                            }[attempt.status] ?? attempt.status
                                        }
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Pēdējais atjauninājums"
                                        value={formatDate(attempt.updated_at)}
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Sistēmas score"
                                        value={String(result?.score ?? '—')}
                                        icon={<Award className="h-4 w-4" />}
                                    />
                                    <ScoreSummaryCard
                                        label="Score breakdown"
                                        score={result?.score}
                                        expanded={showScoreBreakdown}
                                        onToggle={() => setShowScoreBreakdown((prev) => !prev)}
                                    />
                                    {showScoreBreakdown ? (
                                        <ScoreBreakdownPanel
                                            score={result?.score}
                                            breakdown={result?.score_breakdown}
                                        />
                                    ) : null}
                                    <InfoCard
                                        label="Pasniedzēja vērtējums"
                                        value={grade === '' ? '—' : String(grade)}
                                        icon={<ClipboardCheck className="h-4 w-4" />}
                                    />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
                            <SectionCard
                                title="Piegādes validācija"
                                description="Vienkāršots pārskats par to, vai iesniegtais risinājums atbilst galvenajiem uzdevuma kritērijiem."
                                icon={<Truck className="h-5 w-5" />}
                            >
                                <div className="space-y-3">
                                    <ValidationRow
                                        label="Daudzums atbilst"
                                        value={deliveryQuantityMatch}
                                    />
                                    <ValidationRow
                                        label="Veids atbilst"
                                        value={deliveryTypeMatch}
                                    />
                                    <ValidationRow
                                        label="Kvalitāte atbilstoša"
                                        value={deliveryQualityMatch}
                                    />
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard
                                        label="Maršruta segmenti"
                                        value={String(attempt.ordered_route_segments?.length ?? 0)}
                                        icon={<RouteIcon className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Degvielas pieturas"
                                        value={String(attempt.ordered_fuel_stations?.length ?? 0)}
                                        icon={<Fuel className="h-4 w-4" />}
                                    />
                                </div>

                                {attempt.ordered_route_segments?.length ? (
                                    <div className="mt-5 space-y-3">
                                        <h3 className="text-[15px] font-semibold text-[#182219]">
                                            Izvēlētais maršruts
                                        </h3>

                                        {attempt.ordered_route_segments.map((segment, index) => (
                                            <div
                                                key={`${segment.id}-${index}`}
                                                className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3"
                                            >
                                                <div className="text-[14px] font-semibold text-[#182219]">
                                                    {index + 1}. {segment.fromLocation?.name ?? '—'} →{' '}
                                                    {segment.toLocation?.name ?? '—'}
                                                </div>
                                                <div className="mt-1 text-[13px] text-[#5b6b61]">
                                                    {segment.distance_km ?? '—'} km
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </SectionCard>

                            <div className="space-y-6">
                                <SectionCard
                                    title="Piegādes piezīme"
                                    description="Sistēmas vai pasniedzēja īss skaidrojums par piegādes rezultātu."
                                    icon={<ShieldCheck className="h-5 w-5" />}
                                >
                                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                        <p className="text-[15px] leading-7 text-[#425247]">
                                            {deliveryNotes}
                                        </p>
                                    </div>
                                </SectionCard>

                                {timelineSummary ? (
                                    <SectionCard
                                        title="Timeline"
                                        description="Pilns piegādes notikumu ceļš ar laika aprēķinu."
                                        icon={<Clock3 className="h-5 w-5" />}
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <InfoCard
                                                label="Sākums"
                                                value={timelineSummary.started_at ?? '—'}
                                                icon={<CalendarDays className="h-4 w-4" />}
                                            />
                                            <InfoCard
                                                label="Beigas"
                                                value={timelineSummary.finished_at ?? '—'}
                                                icon={<CalendarDays className="h-4 w-4" />}
                                            />
                                            <InfoCard
                                                label="Kopējais laiks"
                                                value={`${timelineSummary.total_minutes ?? '—'} min`}
                                                icon={<Clock3 className="h-4 w-4" />}
                                            />
                                            <InfoCard
                                                label="Kavējums"
                                                value={`${timelineSummary.delay_minutes ?? 0} min`}
                                                icon={<TimerReset className="h-4 w-4" />}
                                            />
                                        </div>

                                        {visibleTimelineEvents.length ? (
                                            <div className="mt-5 space-y-3">
                                                {visibleTimelineEvents.map((event, index) => (
                                                    <TimelineEventCard
                                                        key={`${event.type}-${index}`}
                                                        event={event}
                                                        index={index}
                                                    />
                                                ))}

                                                {hiddenTimelineCount > 0 ? (
                                                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
                                                        Timeline ir saīsināts priekšskatījumam. Vēl paslēpti {hiddenTimelineCount} notikumi.
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </SectionCard>
                                ) : null}

                                {!isExamMode &&
                                (criticalHints.length ||
                                    optimizationHints.length ||
                                    infoHints.length) ? (
                                    <SectionCard
                                        title="Practice hints"
                                        description="Papildu sistēmas novērojumi, ko nerāda pārbaudes darba režīmā."
                                        icon={<TriangleAlert className="h-5 w-5" />}
                                    >
                                        <div className="space-y-5">
                                            {criticalHints.length ? (
                                                <HintGroup
                                                    title="Kritiski"
                                                    items={criticalHints}
                                                    variant="critical"
                                                />
                                            ) : null}

                                            {optimizationHints.length ? (
                                                <HintGroup
                                                    title="Optimizācija"
                                                    items={optimizationHints}
                                                    variant="optimization"
                                                />
                                            ) : null}

                                            {infoHints.length ? (
                                                <HintGroup
                                                    title="Informatīvi"
                                                    items={infoHints}
                                                    variant="info"
                                                />
                                            ) : null}
                                        </div>
                                    </SectionCard>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}
