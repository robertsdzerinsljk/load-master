import type { CSSProperties } from 'react';
import {
    Anchor,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Flag,
    Fuel,
    Moon,
    Route,
    ScanSearch,
    ShipWheel,
    Sun,
    Truck,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { simulatorSteps } from './types';
import type {
    SimulatorStepStatus,
    TimelineEvent,
    TimelineSummary,
} from './types';

type Props = {
    currentStepIndex: number;
    loading?: boolean;
    highlightStep?: string | null;
    stepStatuses?: Record<string, SimulatorStepStatus | undefined>;
    scenarioStartAt?: string | null;
    deadlineAt?: string | null;
    timelineEvents?: TimelineEvent[];
    timelineSummary?: TimelineSummary | null;
    onStepClick?: (stepKey: string, index: number) => void;
    onPrev?: () => void;
    onNext?: () => void;
    availableSteps: string[];
};

type TimelinePhase = 'day' | 'night' | 'unknown';

type StepTimelinePoint = {
    dateLabel: string | null;
    timeLabel: string | null;
    phase: TimelinePhase;
    source: 'actual' | 'estimated' | 'none';
};

type StepPresentation = {
    shortLabel: string;
    description: string;
    icon: LucideIcon;
};

const stepPresentations: Record<string, StepPresentation> = {
    intro: {
        shortLabel: 'Starts',
        description: 'Uzdevuma ievads un sākuma punkts.',
        icon: Flag,
    },
    transport: {
        shortLabel: 'Krava',
        description: 'Transporta un kravas kapacitātes sagatavošana.',
        icon: Truck,
    },
    route: {
        shortLabel: 'Maršruts',
        description: 'Sauszemes piegādes ķēdes izvēle un secība.',
        icon: Route,
    },
    fuel: {
        shortLabel: 'Uzpilde',
        description: 'Degvielas pieturu un nobraukuma drošības plāns.',
        icon: Fuel,
    },
    port: {
        shortLabel: 'Osta',
        description: 'Ostas apstrāde un piekļuve jūras posmam.',
        icon: Anchor,
    },
    ship: {
        shortLabel: 'Kuģis',
        description: 'Kuģa gatavība un iekraušana ostā.',
        icon: ShipWheel,
    },
    simulation: {
        shortLabel: 'Simulācija',
        description: 'Palaid notikumu ķēdi un seko līdzi kravas kustībai.',
        icon: ScanSearch,
    },
    submit: {
        shortLabel: 'Gatavs',
        description: 'Risinājums ir sagatavots iesniegšanai.',
        icon: CheckCircle2,
    },
};

function parseDateTime(value?: string | null) {
    if (!value) {
        return null;
    }

    const normalized = value.trim();
    const directDate = new Date(normalized.replace(' ', 'T'));

    if (!Number.isNaN(directDate.getTime())) {
        return directDate;
    }

    const match = normalized.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
    );

    if (!match) {
        return null;
    }

    return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4] ?? 0),
        Number(match[5] ?? 0),
        Number(match[6] ?? 0),
    );
}

function formatDateLabel(value: Date) {
    return new Intl.DateTimeFormat('lv-LV', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(value);
}

function formatTimeLabel(value: Date) {
    return new Intl.DateTimeFormat('lv-LV', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(value);
}

function resolveTimelinePhase(value: Date): TimelinePhase {
    const hour = value.getHours();

    if (hour >= 6 && hour < 20) {
        return 'day';
    }

    return 'night';
}

function phaseAppearance(phase: TimelinePhase) {
    switch (phase) {
        case 'day':
            return {
                label: 'Diena',
                icon: Sun,
                classes: 'border-[#ead7a1] bg-[#fff7dc] text-[#8e630c]',
            };
        case 'night':
            return {
                label: 'Nakts',
                icon: Moon,
                classes: 'border-[#ced9f6] bg-[#eef4ff] text-[#31528b]',
            };
        default:
            return {
                label: 'Laiks nav zināms',
                icon: Clock3,
                classes: 'border-[#d9ded9] bg-white text-[#5b6b61]',
            };
    }
}

function statusChipClasses(tone?: SimulatorStepStatus['tone']) {
    switch (tone) {
        case 'danger':
            return 'border-red-200 bg-red-100 text-red-800';
        case 'warning':
            return 'border-amber-200 bg-amber-100 text-amber-800';
        case 'success':
            return 'border-[#cfe3d8] bg-[#e9f5ef] text-[#166a4d]';
        case 'info':
            return 'border-sky-200 bg-sky-100 text-sky-800';
        default:
            return 'border-[#d9ded9] bg-white/90 text-[#5b6b61]';
    }
}

function nodeShellClasses({
    isActive,
    isCompleted,
    isHighlighted,
}: {
    isActive: boolean;
    isCompleted: boolean;
    isHighlighted: boolean;
}) {
    if (isHighlighted) {
        return 'border-red-300 bg-red-50 text-red-700 shadow-[0_0_0_6px_rgba(239,68,68,0.12)]';
    }

    if (isActive || isCompleted) {
        return 'border-[#166a4d] bg-[#166a4d] text-white shadow-[0_18px_35px_-24px_rgba(22,106,77,0.45)]';
    }

    return 'border-[#d7e5db] bg-[#f6faf7] text-[#5b6b61]';
}

function markerClasses(isReached: boolean, isHighlighted: boolean) {
    if (isHighlighted) {
        return 'border-red-400 bg-red-500';
    }

    if (isReached) {
        return 'border-[#166a4d] bg-[#166a4d]';
    }

    return 'border-[#cfdbd1] bg-white';
}

function resolveStatusIndicator(status?: SimulatorStepStatus) {
    if (status?.tone === 'danger') {
        return {
            kind: 'danger' as const,
            label: status.label,
            classes: 'bg-[#d95151] text-white',
        };
    }

    if (
        status?.tone === 'warning' ||
        status?.label === 'Bloķēts' ||
        status?.label === 'Gaida datus'
    ) {
        return {
            kind: 'warning' as const,
            label: status?.label ?? 'Nepieciešama uzmanība',
            classes: 'bg-[#e1ab35] text-white',
        };
    }

    return {
        kind: 'success' as const,
        label: status?.label ?? 'Kārtībā',
        classes: 'bg-[#166a4d] text-white',
    };
}

function metaString(meta: TimelineEvent['meta'], key: string) {
    const value = meta?.[key];

    return typeof value === 'string' ? value : null;
}

function findTimelineMoment(
    stepKey: string,
    timelineEvents: TimelineEvent[],
    timelineSummary?: TimelineSummary | null,
    scenarioStartAt?: string | null,
) {
    const firstEvent = timelineEvents[0];
    const lastEvent = timelineEvents[timelineEvents.length - 1];
    const firstPortWait = timelineEvents.find(
        (event) =>
            event.type === 'waiting' &&
            metaString(event.meta, 'reason') === 'port_queue',
    );
    const firstShipWait = timelineEvents.find(
        (event) =>
            event.type === 'waiting' &&
            metaString(event.meta, 'reason') === 'ship_ready_window',
    );

    switch (stepKey) {
        case 'intro':
            return (
                scenarioStartAt ??
                timelineSummary?.started_at ??
                firstEvent?.start_at ??
                null
            );
        case 'transport':
            return (
                timelineEvents.find((event) => event.type === 'loading')
                    ?.end_at ?? null
            );
        case 'route':
            return (
                timelineEvents.find((event) => event.type === 'drive')
                    ?.start_at ?? null
            );
        case 'fuel':
            return (
                timelineEvents.find((event) => event.type === 'fuel_stop')
                    ?.start_at ?? null
            );
        case 'port':
            return (
                firstPortWait?.start_at ??
                timelineEvents.find((event) => event.type === 'port_processing')
                    ?.start_at ??
                null
            );
        case 'ship':
            return (
                firstShipWait?.start_at ??
                timelineEvents.find((event) => event.type === 'ship_loading')
                    ?.start_at ??
                null
            );
        case 'simulation':
        case 'submit':
            return timelineSummary?.finished_at ?? lastEvent?.end_at ?? null;
        default:
            return null;
    }
}

function emptyTimelinePoints(
    enabledSteps: Array<(typeof simulatorSteps)[number]>,
) {
    return Object.fromEntries(
        enabledSteps.map((step) => [
            step.key,
            {
                dateLabel: null,
                timeLabel: null,
                phase: 'unknown',
                source: 'none',
            } satisfies StepTimelinePoint,
        ]),
    ) as Record<string, StepTimelinePoint>;
}

function buildTimelinePoints(
    enabledSteps: Array<(typeof simulatorSteps)[number]>,
    timelineEvents: TimelineEvent[],
    timelineSummary?: TimelineSummary | null,
    scenarioStartAt?: string | null,
    deadlineAt?: string | null,
) {
    const fallbackStart =
        parseDateTime(scenarioStartAt) ??
        parseDateTime(timelineSummary?.started_at) ??
        parseDateTime(timelineEvents[0]?.start_at);

    const fallbackEnd =
        parseDateTime(timelineSummary?.finished_at) ??
        parseDateTime(timelineEvents[timelineEvents.length - 1]?.end_at) ??
        parseDateTime(deadlineAt);

    if (!fallbackStart && !fallbackEnd) {
        return emptyTimelinePoints(enabledSteps);
    }

    const estimatedStart =
        fallbackStart ??
        (fallbackEnd
            ? new Date(
                  fallbackEnd.getTime() -
                      Math.max(enabledSteps.length - 1, 1) * 90 * 60 * 1000,
              )
            : null);

    const estimatedEnd =
        fallbackEnd ??
        (estimatedStart
            ? new Date(
                  estimatedStart.getTime() +
                      Math.max(enabledSteps.length - 1, 1) * 90 * 60 * 1000,
              )
            : null);

    if (!estimatedStart || !estimatedEnd) {
        return emptyTimelinePoints(enabledSteps);
    }

    const spanMs = Math.max(
        estimatedEnd.getTime() - estimatedStart.getTime(),
        1,
    );
    const denominator = Math.max(enabledSteps.length - 1, 1);

    return Object.fromEntries(
        enabledSteps.map((step, index) => {
            const actualValue = findTimelineMoment(
                step.key,
                timelineEvents,
                timelineSummary,
                scenarioStartAt,
            );
            const actualDate = parseDateTime(actualValue);
            const estimatedDate = new Date(
                estimatedStart.getTime() + spanMs * (index / denominator),
            );
            const resolvedDate = actualDate ?? estimatedDate;

            return [
                step.key,
                {
                    dateLabel: formatDateLabel(resolvedDate),
                    timeLabel: formatTimeLabel(resolvedDate),
                    phase: resolveTimelinePhase(resolvedDate),
                    source: actualDate ? 'actual' : 'estimated',
                } satisfies StepTimelinePoint,
            ];
        }),
    ) as Record<string, StepTimelinePoint>;
}

export default function SimulatorProgress({
    currentStepIndex,
    loading,
    highlightStep,
    stepStatuses,
    scenarioStartAt,
    deadlineAt,
    timelineEvents = [],
    timelineSummary,
    onStepClick,
    onPrev,
    onNext,
    availableSteps,
}: Props) {
    const enabledSteps = simulatorSteps.filter((step) =>
        availableSteps.includes(step.key),
    );

    if (!enabledSteps.length) {
        return null;
    }

    const totalSteps = enabledSteps.length;
    const safeStepIndex = Math.min(
        Math.max(currentStepIndex, 0),
        totalSteps - 1,
    );
    const progressPercent =
        totalSteps > 1
            ? Math.round((safeStepIndex / (totalSteps - 1)) * 100)
            : 100;
    const railInset = totalSteps > 1 ? `${50 / totalSteps}%` : '0%';
    const gridStyle: CSSProperties = {
        gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
    };

    const timelinePoints = buildTimelinePoints(
        enabledSteps,
        timelineEvents,
        timelineSummary,
        scenarioStartAt,
        deadlineAt,
    );
    const activeStep = enabledSteps[safeStepIndex] ?? enabledSteps[0];
    const activePresentation = stepPresentations[activeStep.key] ?? {
        shortLabel: activeStep.label,
        description: activeStep.label,
        icon: Flag,
    };
    const activeStatus = stepStatuses?.[activeStep.key];
    const activePoint = timelinePoints[activeStep.key];
    const activePhase = phaseAppearance(activePoint?.phase ?? 'unknown');
    const ActiveStepIcon = activePresentation.icon;
    const ActivePhaseIcon = activePhase.icon;
    const timelineHealthLabel = timelineSummary
        ? timelineSummary.is_within_deadline
            ? 'Termiņā'
            : `+${timelineSummary.delay_minutes ?? 0} min`
        : null;
    const timelineHealthClasses = timelineSummary?.is_within_deadline
        ? 'border-[#cfe3d8] bg-[#e9f5ef] text-[#166a4d]'
        : 'border-red-200 bg-red-50 text-red-700';

    return (
        <section className="overflow-hidden rounded-[28px] border border-[#d9ded9] bg-[linear-gradient(135deg,#ffffff_0%,#f7fbf8_48%,#eff7f2_100%)] p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Simulācijas ceļš
                    </div>

                    <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                        Simulācijas progresa timeline
                    </h3>

                    <p className="mt-2 text-[14px] leading-6 text-[#5f6d65]">
                        Esošos soļus attēlojam kā vienu laika asi ar mezgliem,
                        lai plūsma būtu tuvāka tavai atsauces idejai un skaidri
                        parādītu arī dienas vai nakts stāvokli katrā posmā.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-[#d7e5db] bg-white/90 px-4 py-3 text-sm font-semibold text-[#182219] shadow-sm">
                        Progress: {progressPercent}%
                    </div>

                    {timelineHealthLabel ? (
                        <div
                            className={cn(
                                'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm',
                                timelineHealthClasses,
                            )}
                        >
                            {timelineHealthLabel}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="-mx-1 mt-6 overflow-x-auto pb-2">
                <div className="min-w-[760px] px-1">
                    <div className="relative">
                        <div
                            className="pointer-events-none absolute top-[3.8rem] border-t border-dashed border-[#c8d9cf]"
                            style={{ left: railInset, right: railInset }}
                        />

                        <div className="grid gap-3" style={gridStyle}>
                            {enabledSteps.map((step, index) => {
                                const presentation = stepPresentations[
                                    step.key
                                ] ?? {
                                    shortLabel: step.label,
                                    description: step.label,
                                    icon: Flag,
                                };
                                const StepIcon = presentation.icon;
                                const stepPoint = timelinePoints[step.key];
                                const phase = phaseAppearance(
                                    stepPoint?.phase ?? 'unknown',
                                );
                                const PhaseIcon = phase.icon;
                                const status = stepStatuses?.[step.key];
                                const indicator =
                                    resolveStatusIndicator(status);
                                const isActive = index === safeStepIndex;
                                const isCompleted = index < safeStepIndex;
                                const isHighlighted =
                                    step.key === highlightStep;

                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            onStepClick?.(step.key, index)
                                        }
                                        className={cn(
                                            'group relative flex min-h-[154px] flex-col items-center rounded-[24px] px-3 pt-2 pb-4 text-center transition duration-200',
                                            isActive
                                                ? 'bg-white/95 shadow-[0_24px_56px_-34px_rgba(22,106,77,0.28)]'
                                                : 'hover:bg-white/70',
                                            isHighlighted
                                                ? 'ring-2 ring-red-400/50'
                                                : 'ring-1 ring-transparent',
                                        )}
                                        title={`${phase.label} - ${indicator.label}`}
                                    >
                                        <div className="relative flex flex-col items-center">
                                            <span
                                                className={cn(
                                                    'mb-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] shadow-sm',
                                                    phase.classes,
                                                )}
                                                title={phase.label}
                                            >
                                                <PhaseIcon className="h-3.5 w-3.5" />
                                            </span>

                                            <span
                                                className={cn(
                                                    'flex h-14 w-14 items-center justify-center rounded-full border transition',
                                                    nodeShellClasses({
                                                        isActive,
                                                        isCompleted,
                                                        isHighlighted,
                                                    }),
                                                )}
                                            >
                                                <StepIcon className="h-6 w-6" />
                                            </span>

                                            <span
                                                className={cn(
                                                    'absolute top-8 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[11px] font-black shadow-sm',
                                                    indicator.classes,
                                                )}
                                                title={indicator.label}
                                            >
                                                {indicator.kind ===
                                                'success' ? (
                                                    <Check className="h-3 w-3" />
                                                ) : indicator.kind ===
                                                  'danger' ? (
                                                    <X className="h-3 w-3" />
                                                ) : (
                                                    <span className="leading-none">
                                                        !
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <div className="text-[13px] font-semibold text-[#163021]">
                                                {presentation.shortLabel}
                                            </div>

                                            <div className="mt-1 text-[11px] leading-4 text-[#6a7a70]">
                                                {step.label}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative mt-4">
                            <div
                                className="absolute inset-y-1/2 -translate-y-1/2"
                                style={{ left: railInset, right: railInset }}
                            >
                                <div className="h-[4px] rounded-full bg-[#dce7de]" />
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-[#166a4d] transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="grid" style={gridStyle}>
                                {enabledSteps.map((step, index) => {
                                    const isReached = index <= safeStepIndex;
                                    const isHighlighted =
                                        step.key === highlightStep;

                                    return (
                                        <div
                                            key={`${step.key}-marker`}
                                            className="flex justify-center"
                                        >
                                            <span
                                                className={cn(
                                                    'relative z-10 h-4 w-4 rounded-full border-2 shadow-[0_0_0_4px_rgba(255,255,255,0.92)]',
                                                    markerClasses(
                                                        isReached,
                                                        isHighlighted,
                                                    ),
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            className="mt-4 grid min-h-[56px]"
                            style={gridStyle}
                        >
                            {enabledSteps.map((step, index) => {
                                const point = timelinePoints[step.key];

                                return (
                                    <div
                                        key={`${step.key}-timestamp`}
                                        className="flex justify-center"
                                    >
                                        {index === safeStepIndex ? (
                                            point?.dateLabel &&
                                            point.timeLabel ? (
                                                <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#d7e5db] bg-white px-3 py-2 text-[12px] font-medium text-[#32523f] shadow-sm">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {point.dateLabel}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {point.timeLabel}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center rounded-2xl border border-[#d9ded9] bg-white px-3 py-2 text-[12px] font-medium text-[#5b6b61] shadow-sm">
                                                    Laiks būs redzams pēc
                                                    preview
                                                </div>
                                            )
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="rounded-[24px] border border-[#d7e5db] bg-white/85 p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7e5db] bg-[#f6faf7] text-[#166a4d]">
                            <ActiveStepIcon className="h-5 w-5" />
                        </span>

                        <div>
                            <div className="text-[11px] font-medium tracking-[0.16em] text-[#7a877f] uppercase">
                                Aktīvais posms
                            </div>

                            <div className="mt-1 text-[18px] font-semibold text-[#182219]">
                                {activePresentation.shortLabel}
                            </div>

                            <p className="mt-1 text-[14px] leading-6 text-[#5c6c62]">
                                {activeStatus?.detail ??
                                    activePresentation.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {activeStatus ? (
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                                    statusChipClasses(activeStatus.tone),
                                )}
                            >
                                {activeStatus.label}
                            </span>
                        ) : null}

                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                                activePhase.classes,
                            )}
                        >
                            <ActivePhaseIcon className="h-3.5 w-3.5" />
                            {activePhase.label}
                        </span>

                        {activePoint?.source !== 'none' ? (
                            <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-xs font-semibold text-[#506158]">
                                {activePoint.source === 'actual'
                                    ? 'Balstīts uz aprēķināto timeline'
                                    : 'Aptuvenais posma laiks'}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={loading || safeStepIndex === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Iepriekšējais solis
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={loading || safeStepIndex === totalSteps - 1}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-4 py-3 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Nākamais solis
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
