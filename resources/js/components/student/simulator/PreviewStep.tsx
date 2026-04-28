import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Anchor,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    Fuel,
    MapPinned,
    Package,
    Pause,
    Play,
    RotateCcw,
    Route as RouteIcon,
    ScanSearch,
    Ship,
    Sparkles,
    Truck,
    Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Attempt, TimelineEvent } from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    attempt: Attempt;
    loading: boolean;
    canPreview: boolean;
    onPreview: () => void;
    isExamMode: boolean;
};

type PlaybackSpeed = 1 | 2 | 4 | 10;

type TrackNodeKind =
    | 'location'
    | 'transport'
    | 'fuel'
    | 'port'
    | 'ship'
    | 'destination';

type TrackNode = {
    id: string;
    label: string;
    subtitle: string;
    kind: TrackNodeKind;
};

type TrackPosition = {
    startIndex: number;
    endIndex: number;
    mode: 'move' | 'hold';
    accentClasses: string;
    tokenIcon: LucideIcon;
};

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 2, 4, 10];
const TRACK_SIDE_PADDING = 64;
const TRACK_MIN_WIDTH = 760;
const TRACK_NODE_WIDTH = 152;

export default function PreviewStep({
    stepNumber = 5,
    attempt,
    loading,
    canPreview,
    onPreview,
    isExamMode,
}: Props) {
    const preview = attempt.preview_result;
    const result = preview?.result;
    const route = preview?.route;
    const fuel = preview?.fuel;
    const timelineEvents = useMemo(
        () => preview?.timeline?.events ?? [],
        [preview?.timeline?.events],
    );
    const criticalHints = preview?.hints?.critical ?? [];
    const optimizationHints = preview?.hints?.optimization ?? [];
    const infoHints = preview?.hints?.info ?? [];
    const warnings = result?.warnings ?? [];
    const costBreakdown = result?.cost_breakdown;
    const timelineCosts = preview?.timeline?.costs;

    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const [isPlaying, setIsPlaying] = useState(
        Boolean(preview && timelineEvents.length),
    );
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [eventProgress, setEventProgress] = useState(0);

    const track = useMemo(() => buildSimulationTrack(attempt), [attempt]);

    const safeActiveEventIndex = Math.min(
        activeEventIndex,
        Math.max(timelineEvents.length - 1, 0),
    );
    const currentEvent = timelineEvents[safeActiveEventIndex] ?? null;
    const currentTrackPosition =
        track.positions[safeActiveEventIndex] ?? fallbackTrackPosition();
    const currentEventAppearance = eventAppearance(currentEvent?.type ?? null);
    const CurrentEventIcon = currentEventAppearance.icon;
    const CurrentTokenIcon = currentTrackPosition.tokenIcon;

    useEffect(() => {
        if (!isPlaying || !currentEvent) {
            return;
        }

        const scaledDurationMs =
            Math.max(
                900,
                Math.min(
                    Math.max(currentEvent.duration_minutes, 1) * 200,
                    4200,
                ),
            ) / playbackSpeed;

        let animationFrame = 0;
        let startedAt: number | null = null;

        const tick = (timestamp: number) => {
            if (startedAt === null) {
                startedAt = timestamp;
            }

            const ratio = Math.min(
                (timestamp - startedAt) / scaledDurationMs,
                1,
            );

            setEventProgress(ratio);

            if (ratio >= 1) {
                if (safeActiveEventIndex >= timelineEvents.length - 1) {
                    setIsPlaying(false);

                    return;
                }

                setActiveEventIndex((index) => index + 1);
                setEventProgress(0);

                return;
            }

            animationFrame = window.requestAnimationFrame(tick);
        };

        animationFrame = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [
        currentEvent,
        isPlaying,
        playbackSpeed,
        safeActiveEventIndex,
        timelineEvents.length,
    ]);

    const diagnostics = [
        {
            title: 'Kritiski',
            items: criticalHints,
            classes: 'border-red-200 bg-red-50 text-red-800',
        },
        {
            title: 'Brīdinājumi',
            items: warnings,
            classes: 'border-amber-200 bg-amber-50 text-amber-800',
        },
        {
            title: 'Optimizācija',
            items: optimizationHints,
            classes: 'border-sky-200 bg-sky-50 text-sky-800',
        },
        {
            title: 'Informatīvi',
            items: infoHints,
            classes: 'border-[#d9ded9] bg-[#f8fbf9] text-[#4d5d53]',
        },
    ].filter((group) => group.items.length > 0);

    const trackWidth = Math.max(
        track.nodes.length * TRACK_NODE_WIDTH,
        TRACK_MIN_WIDTH,
    );
    const lineWidth = Math.max(trackWidth - TRACK_SIDE_PADDING * 2, 1);
    const resolveNodeX = (index: number) => {
        if (track.nodes.length <= 1) {
            return trackWidth / 2;
        }

        return (
            TRACK_SIDE_PADDING +
            (lineWidth * index) / Math.max(track.nodes.length - 1, 1)
        );
    };

    const startX = resolveNodeX(currentTrackPosition.startIndex);
    const endX = resolveNodeX(currentTrackPosition.endIndex);
    const tokenX =
        currentTrackPosition.mode === 'move'
            ? startX + (endX - startX) * eventProgress
            : endX;
    const travelledWidth = Math.max(tokenX - TRACK_SIDE_PADDING, 0);
    const currentNodeIndex = findNearestNodeIndex(
        track.nodes,
        resolveNodeX,
        tokenX,
    );
    const streamStartIndex = Math.max(0, safeActiveEventIndex - 1);
    const streamEndIndex = Math.min(
        timelineEvents.length,
        safeActiveEventIndex + 4,
    );
    const streamEvents = timelineEvents.slice(streamStartIndex, streamEndIndex);

    const handleRestart = () => {
        setActiveEventIndex(0);
        setEventProgress(0);
        setIsPlaying(Boolean(timelineEvents.length));
    };

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                        <Sparkles className="h-3.5 w-3.5" />
                        {stepNumber}. solis
                    </div>

                    <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                        Palaist simulāciju
                    </h2>

                    <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                        Šeit pārbaude pārtop par vienu loģisku piegādes ķēdi ar
                        punktiem, kustību un notikumu secību, nevis tikai lielu
                        datu izklājumu.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={onPreview}
                        disabled={loading || !canPreview}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {preview ? 'Pārrēķināt simulāciju' : 'Palaist simulāciju'}
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    {timelineEvents.length ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsPlaying((current) => !current)}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                {isPlaying ? 'Pauze' : 'Atskaņot'}
                            </button>

                            <button
                                type="button"
                                onClick={handleRestart}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Sākt no jauna
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-[14px] text-[#6f7b74]">
                    {canPreview
                        ? 'Kad simulācija ir palaista, maršruts tiek attēlots kā viena notikumu līnija ar loģisku kustību starp punktiem.'
                        : 'Simulācija kļūs pieejama pēc transporta, maršruta, ostas un kuģa izvēles.'}
                </div>

                {timelineEvents.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                                key={speed}
                                type="button"
                                onClick={() => setPlaybackSpeed(speed)}
                                className={cn(
                                    'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition',
                                    playbackSpeed === speed
                                        ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                        : 'border-[#d9ded9] bg-white text-[#506158] hover:bg-[#f7f9f7]',
                                )}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            {preview ? (
                <>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                        <MetricCard
                            label="Maršruts"
                            value={`${route?.start ?? '—'} → ${route?.end ?? '—'}`}
                            detail={`${route?.segments_count ?? 0} posmi`}
                            icon={RouteIcon}
                        />
                        <MetricCard
                            label="Degviela"
                            value={formatMetric(result?.fuel_needed_liters, ' L')}
                            detail={`${fuel?.stops_count ?? 0} pieturas`}
                            icon={Fuel}
                        />
                        <MetricCard
                            label="Kopējais laiks"
                            value={formatMetric(result?.trip_time_hours, ' h')}
                            detail="Visa ķēde kopā"
                            icon={Clock3}
                        />
                        <MetricCard
                            label="Kopējās izmaksas"
                            value={formatMetric(result?.total_cost, ' €')}
                            detail="Pēc aprēķina"
                            icon={ClipboardCheck}
                        />
                        <MetricCard
                            label="Operāciju izmaksas"
                            value={formatMetric(costBreakdown?.operations_cost, ' €')}
                            detail="Darbs, tehnika un maiņu laiks"
                            icon={Package}
                        />
                        <MetricCard
                            label="Nakts piemaksa"
                            value={formatMetric(costBreakdown?.night_operations_cost, ' €')}
                            detail={`${timelineCosts?.night_operation_minutes ?? 0} min naktī`}
                            icon={Clock3}
                        />
                        <MetricCard
                            label="Reisi"
                            value={formatMetric(result?.required_trips)}
                            detail={
                                result?.is_valid
                                    ? 'Risinājums derīgs'
                                    : 'Jāizlabo kritiskie punkti'
                            }
                            icon={CheckCircle2}
                            tone={result?.is_valid ? 'success' : 'warning'}
                        />
                    </div>

                    {!isExamMode && timelineEvents.length ? (
                        <div className="mt-6 rounded-[28px] border border-[#d7e5db] bg-[linear-gradient(135deg,#f8fbf9_0%,#eff7f2_100%)] p-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                        <ScanSearch className="h-3.5 w-3.5" />
                                        Simulācijas skats
                                    </div>

                                    <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                                        Maršruta līnija ar dzīviem notikumiem
                                    </h3>

                                    <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                        Krava, transports, ostas posms un kuģis
                                        kustas pa vienu loģisku ķēdi. Aktīvais
                                        notikums vienmēr ir redzams uz līnijas,
                                        nevis paslēpts zem gariem sarakstiem.
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
                                        result?.is_valid
                                            ? 'border-[#cfe3d8] bg-[#e9f5ef] text-[#166a4d]'
                                            : 'border-amber-200 bg-amber-50 text-amber-800',
                                    )}
                                >
                                    {result?.is_valid
                                        ? 'Simulācija gatava iesniegšanai'
                                        : 'Simulācija atklāja labojamus punktus'}
                                </div>
                            </div>

                            <div className="-mx-2 mt-6 overflow-x-auto pb-3">
                                <div
                                    className="relative min-h-[244px] px-2"
                                    style={{ width: `${trackWidth}px` }}
                                >
                                    <div
                                        className="absolute top-[86px] h-[6px] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(194,208,198,0.85)]"
                                        style={{
                                            left: `${TRACK_SIDE_PADDING}px`,
                                            width: `${lineWidth}px`,
                                        }}
                                    />

                                    <div
                                        className="absolute top-[86px] h-[6px] rounded-full bg-[#166a4d]"
                                        style={{
                                            left: `${TRACK_SIDE_PADDING}px`,
                                            width: `${travelledWidth}px`,
                                        }}
                                    />

                                    <div
                                        className="absolute top-[26px] -translate-x-1/2"
                                        style={{ left: `${tokenX}px` }}
                                    >
                                        <div
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold shadow-sm',
                                                currentEventAppearance.accentClasses,
                                            )}
                                        >
                                            <CurrentEventIcon className="h-3.5 w-3.5" />
                                            {currentEventAppearance.label}
                                        </div>
                                    </div>

                                    <div
                                        className="absolute top-[62px] -translate-x-1/2"
                                        style={{ left: `${tokenX}px` }}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-12 w-12 items-center justify-center rounded-full border border-white text-white shadow-[0_16px_35px_-20px_rgba(24,34,25,0.75)]',
                                                currentTrackPosition.accentClasses,
                                            )}
                                        >
                                            <CurrentTokenIcon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {track.nodes.map((node, index) => {
                                        const nodeX = resolveNodeX(index);
                                        const isCompleted =
                                            nodeX < tokenX - 16 ||
                                            (index === currentNodeIndex &&
                                                eventProgress >= 0.98);
                                        const isCurrent = index === currentNodeIndex;

                                        return (
                                            <div
                                                key={node.id}
                                                className="absolute top-0 flex w-[132px] -translate-x-1/2 flex-col items-center text-center"
                                                style={{ left: `${nodeX}px` }}
                                            >
                                                <div
                                                    className={cn(
                                                        'mb-4 flex h-16 w-16 items-center justify-center rounded-full border text-[#5b6b61] shadow-sm transition',
                                                        isCompleted || isCurrent
                                                            ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                                            : 'border-[#d7e5db] bg-white text-[#5b6b61]',
                                                        isCurrent
                                                            ? 'shadow-[0_20px_45px_-28px_rgba(22,106,77,0.6)]'
                                                            : '',
                                                    )}
                                                >
                                                    <NodeIcon kind={node.kind} className="h-6 w-6" />
                                                </div>

                                                <div className="rounded-2xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm">
                                                    <div className="text-[14px] font-semibold text-[#182219]">
                                                        {node.label}
                                                    </div>
                                                    <div className="mt-1 text-[12px] leading-5 text-[#6f7b74]">
                                                        {node.subtitle}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                                <div className="rounded-[24px] border border-[#d7e5db] bg-white/90 p-4 shadow-sm">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                                Aktīvais notikums
                                            </div>
                                            <div className="mt-2 text-[18px] font-semibold text-[#182219]">
                                                {currentEvent?.label ??
                                                    'Simulācija ir gatava palaišanai'}
                                            </div>
                                            <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                                {currentEvent
                                                    ? describeEvent(currentEvent)
                                                    : 'Kad palaidīsi simulāciju, šeit redzēsi pašreizējo notikumu un tā gaitu.'}
                                            </p>
                                        </div>

                                        <div
                                            className={cn(
                                                'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold',
                                                currentEventAppearance.accentClasses,
                                            )}
                                        >
                                            {currentEventAppearance.label}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <InfoPill
                                            icon={Clock3}
                                            label={`Ilgums ${currentEvent?.duration_minutes ?? 0} min`}
                                        />
                                        <InfoPill
                                            icon={MapPinned}
                                            label={formatEventWindow(currentEvent)}
                                        />
                                        {currentEvent?.meta?.trip ? (
                                            <InfoPill
                                                icon={Truck}
                                                label={`Reiss ${String(currentEvent.meta.trip)}`}
                                            />
                                        ) : null}
                                        {typeof currentEvent?.meta?.expense_total_eur ===
                                        'number' ? (
                                            <InfoPill
                                                icon={ClipboardCheck}
                                                label={`Izmaksas ${formatMetric(currentEvent.meta.expense_total_eur as number, ' €')}`}
                                            />
                                        ) : null}
                                        {typeof currentEvent?.meta?.phase === 'string' ? (
                                            <InfoPill
                                                icon={Clock3}
                                                label={
                                                    currentEvent.meta.phase === 'night'
                                                        ? 'Nakts maiņa'
                                                        : 'Dienas maiņa'
                                                }
                                            />
                                        ) : null}
                                    </div>

                                    {streamEvents.length ? (
                                        <div className="mt-5 space-y-2">
                                            {streamEvents.map((event, index) => {
                                                const actualIndex =
                                                    streamStartIndex + index;
                                                const appearance = eventAppearance(
                                                    event.type,
                                                );
                                                const StreamEventIcon =
                                                    appearance.icon;

                                                return (
                                                    <div
                                                        key={`${event.type}-${event.start_at}-${actualIndex}`}
                                                        className={cn(
                                                            'flex items-center gap-3 rounded-2xl border px-3 py-3',
                                                            actualIndex ===
                                                                safeActiveEventIndex
                                                                ? 'border-[#166a4d] bg-[#f3faf6]'
                                                                : 'border-[#e4e9e4] bg-[#fbfcfb]',
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                                                                appearance.accentClasses,
                                                            )}
                                                        >
                                                            <StreamEventIcon className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-[14px] font-semibold text-[#182219]">
                                                                {event.label}
                                                            </div>
                                                            <div className="mt-1 text-[12px] text-[#6f7b74]">
                                                            {formatEventWindow(event)}{' '}
                                                            •{' '}
                                                            {
                                                                event.duration_minutes
                                                            }{' '}
                                                            min
                                                            {typeof event.meta?.expense_total_eur ===
                                                            'number'
                                                                ? ` • ${formatMetric(event.meta.expense_total_eur as number, ' €')}`
                                                                : ''}
                                                        </div>
                                                        </div>

                                                        {actualIndex ===
                                                        safeActiveEventIndex ? (
                                                            <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#166a4d]">
                                                                Šobrīd
                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="rounded-[24px] border border-[#d7e5db] bg-white/90 p-4 shadow-sm">
                                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                        Diagnostika
                                    </div>

                                    <div className="mt-2 text-[18px] font-semibold text-[#182219]">
                                        {diagnostics.length
                                            ? 'Kas jāņem vērā pirms iesniegšanas'
                                            : 'Risinājums pašlaik izskatās tīrs'}
                                    </div>

                                    <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                        {diagnostics.length
                                            ? 'Svarīgākās norādes ir saspiestas vienā vietā, lai zem līnijas neveidotos vairāki smagi logi.'
                                            : 'Kritisku brīdinājumu nav. Vari pārrēķināt simulāciju vai virzīties uz iesniegšanu.'}
                                    </p>

                                    {diagnostics.length ? (
                                        <div className="mt-5 space-y-3">
                                            {diagnostics.map((group) => (
                                                <div
                                                    key={group.title}
                                                    className={cn(
                                                        'rounded-2xl border px-4 py-4',
                                                        group.classes,
                                                    )}
                                                >
                                                    <div className="text-[13px] font-semibold uppercase tracking-[0.16em]">
                                                        {group.title}
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        {group.items.map(
                                                            (item, index) => (
                                                                <div
                                                                    key={`${group.title}-${index}`}
                                                                    className="flex items-start gap-2 text-[14px] leading-6"
                                                                >
                                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                                    <span>
                                                                        {item}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-[#cfe3d8] bg-[#e9f5ef] px-4 py-4 text-[14px] leading-6 text-[#166a4d]">
                                            Simulācija neuzrāda kritiskus
                                            konfliktus starp transportu,
                                            maršrutu, uzpildi, ostu un kuģi.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] p-5 text-[14px] leading-6 text-[#4d5d53]">
                            Pārbaudes darba režīmā redzams tikai kompakts
                            kopsavilkums. Detalizētā notikumu līnija un
                            diagnostikas ķēde šajā režīmā nav pieejama.
                        </div>
                    )}
                </>
            ) : canPreview ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[24px] border border-[#d7e5db] bg-[linear-gradient(135deg,#f8fbf9_0%,#eff7f2_100%)] p-5">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                            Gatavs palaišanai
                        </div>

                        <div className="mt-2 text-[20px] font-semibold text-[#182219]">
                            Simulācija uzbūvēs notikumu līniju no tava plāna
                        </div>

                        <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                            Pēc palaišanas redzēsi, kā krava tiek ievietota
                            transportā, kā transports pārvietojas pa maršruta
                            punktiem, kur notiek uzpilde un kā piegāde nonāk
                            ostā vai uz kuģa.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <InfoPill
                                icon={Truck}
                                label={attempt.selectedTransportTemplate?.name ?? 'Transports izvēlēts'}
                            />
                            <InfoPill
                                icon={RouteIcon}
                                label={`${attempt.ordered_route_segments?.length ?? 0} maršruta posmi`}
                            />
                            <InfoPill
                                icon={Fuel}
                                label={`${attempt.ordered_fuel_stations?.length ?? 0} degvielas pieturas`}
                            />
                            {attempt.selectedPort?.name ? (
                                <InfoPill
                                    icon={Anchor}
                                    label={attempt.selectedPort.name}
                                />
                            ) : null}
                            {attempt.selectedShip?.name ? (
                                <InfoPill
                                    icon={Ship}
                                    label={attempt.selectedShip.name}
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                            Ko parādīsim
                        </div>

                        <div className="mt-4 space-y-3">
                            <PreviewPromise
                                icon={Package}
                                text="Kravas iekraušanu un sagatavošanu transportam"
                            />
                            <PreviewPromise
                                icon={Truck}
                                text="Transporta kustību pa punktiem un starpposmiem"
                            />
                            <PreviewPromise
                                icon={Fuel}
                                text="Uzpildes, gaidīšanas un apstrādes notikumus"
                            />
                            <PreviewPromise
                                icon={Waves}
                                text="Jūras posmu un pēdējo piegādes etapu, ja tas ir scenārijā"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-6">
                    <EmptyBlock text="Simulācija būs pieejama, tiklīdz būs aizpildīti visi nepieciešamie iepriekšējie soļi." />
                </div>
            )}
        </section>
    );
}

function buildSimulationTrack(attempt: Attempt) {
    const preview = attempt.preview_result;
    const events = preview?.timeline?.events ?? [];
    const nodes: TrackNode[] = [];
    const positions: TrackPosition[] = [];

    const startLabel =
        preview?.route?.start ??
        metaString(events[0]?.meta, 'location_name') ??
        'Starts';

    let currentIndex = pushTrackNode(nodes, {
        label: startLabel,
        subtitle: 'Sākuma punkts',
        kind: 'location',
    });

    for (const event of events) {
        const currentNode = nodes[currentIndex];
        const driveLabel = parseDriveLabel(event.label);
        let nextIndex = currentIndex;

        switch (event.type) {
            case 'loading':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        preview?.transport?.name ??
                        metaString(event.meta, 'transport_name') ??
                        'Transports',
                    subtitle: 'Krava iekrauta',
                    kind: 'transport',
                });
                break;
            case 'drive':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'to_location_name') ??
                        driveLabel.to ??
                        'Nākamais punkts',
                    subtitle:
                        metaString(event.meta, 'from_location_name') ??
                        driveLabel.from ??
                        'Sauszemes posms',
                    kind: 'location',
                });
                break;
            case 'fuel_stop':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'station_name') ?? 'Uzpilde',
                    subtitle:
                        metaString(event.meta, 'location_name') ??
                        'Degvielas pietura',
                    kind: 'fuel',
                });
                break;
            case 'waiting':
            case 'port_processing':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'port_name') ??
                        metaString(event.meta, 'location_name') ??
                        currentNode?.label ??
                        'Osta',
                    subtitle:
                        event.type === 'waiting'
                            ? 'Gaidīšana'
                            : 'Ostas apstrāde',
                    kind: 'port',
                });
                break;
            case 'ship_loading':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'ship_name') ??
                        preview?.ship?.name ??
                        'Kuģis',
                    subtitle:
                        metaString(event.meta, 'port_name') ??
                        'Krava uz kuģa',
                    kind: 'ship',
                });
                break;
            case 'sea_transit':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'destination_port_name') ??
                        preview?.route?.end ??
                        'Galamērķis',
                    subtitle:
                        metaString(event.meta, 'origin_port_name') ??
                        'Jūras posms',
                    kind: 'destination',
                });
                break;
            case 'return':
                nextIndex = appendTrackNode(nodes, currentIndex, {
                    label:
                        metaString(event.meta, 'to_location_name') ??
                        preview?.route?.start ??
                        'Atgriešanās',
                    subtitle:
                        metaString(event.meta, 'from_location_name') ??
                        'Atpakaļceļš',
                    kind: 'location',
                });
                break;
            default:
                nextIndex = currentIndex;
                break;
        }

        positions.push({
            startIndex: currentIndex,
            endIndex: nextIndex,
            mode: currentIndex === nextIndex ? 'hold' : 'move',
            accentClasses: tokenClasses(event.type),
            tokenIcon: tokenIcon(event.type),
        });

        currentIndex = nextIndex;
    }

    return {
        nodes,
        positions,
    };
}

function pushTrackNode(
    nodes: TrackNode[],
    node: Omit<TrackNode, 'id'>,
): number {
    nodes.push({
        id: `${node.kind}-${nodes.length}`,
        ...node,
    });

    return nodes.length - 1;
}

function appendTrackNode(
    nodes: TrackNode[],
    currentIndex: number,
    node: Omit<TrackNode, 'id'>,
) {
    const currentNode = nodes[currentIndex];

    if (
        currentNode &&
        currentNode.kind === node.kind &&
        currentNode.label === node.label
    ) {
        return currentIndex;
    }

    return pushTrackNode(nodes, node);
}

function fallbackTrackPosition(): TrackPosition {
    return {
        startIndex: 0,
        endIndex: 0,
        mode: 'hold',
        accentClasses: tokenClasses(null),
        tokenIcon: tokenIcon(null),
    };
}

function metaString(
    meta: TimelineEvent['meta'],
    key: string,
): string | null {
    const value = meta?.[key];

    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function parseDriveLabel(label: string) {
    const match = label.match(/:\s*(.+?)\s*(?:→|->)\s*(.+)$/);

    if (!match) {
        return {
            from: null,
            to: null,
        };
    }

    return {
        from: match[1]?.trim() ?? null,
        to: match[2]?.trim() ?? null,
    };
}

function formatMetric(
    value: string | number | null | undefined,
    suffix = '',
) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return `${value}${suffix}`;
}

function formatEventWindow(event: TimelineEvent | null) {
    if (!event) {
        return 'Laiks būs redzams pēc palaišanas';
    }

    return `${formatDateTime(event.start_at)} → ${formatDateTime(event.end_at)}`;
}

function formatDateTime(value?: string | null) {
    if (!value) {
        return '—';
    }

    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function tokenIcon(type: string | null): LucideIcon {
    switch (type) {
        case 'loading':
            return Package;
        case 'drive':
        case 'return':
        case 'fuel_stop':
            return Truck;
        case 'waiting':
        case 'port_processing':
            return Anchor;
        case 'ship_loading':
            return Package;
        case 'sea_transit':
            return Ship;
        default:
            return Truck;
    }
}

function tokenClasses(type: string | null) {
    switch (type) {
        case 'loading':
            return 'bg-[#166a4d]';
        case 'drive':
        case 'return':
            return 'bg-[#225bdb]';
        case 'fuel_stop':
            return 'bg-[#c2771a]';
        case 'waiting':
        case 'port_processing':
            return 'bg-[#7058d8]';
        case 'ship_loading':
        case 'sea_transit':
            return 'bg-[#15717d]';
        default:
            return 'bg-[#166a4d]';
    }
}

function eventAppearance(type: string | null) {
    switch (type) {
        case 'loading':
            return {
                label: 'Iekraušana',
                icon: Package,
                accentClasses:
                    'border-[#cfe3d8] bg-[#e9f5ef] text-[#166a4d]',
            };
        case 'drive':
        case 'return':
            return {
                label: 'Pārvietojas',
                icon: Truck,
                accentClasses:
                    'border-sky-200 bg-sky-50 text-sky-800',
            };
        case 'fuel_stop':
            return {
                label: 'Uzpilde',
                icon: Fuel,
                accentClasses:
                    'border-amber-200 bg-amber-50 text-amber-800',
            };
        case 'waiting':
        case 'port_processing':
            return {
                label: 'Ostas posms',
                icon: Anchor,
                accentClasses:
                    'border-violet-200 bg-violet-50 text-violet-800',
            };
        case 'ship_loading':
            return {
                label: 'Pārcelšana uz kuģi',
                icon: Package,
                accentClasses:
                    'border-cyan-200 bg-cyan-50 text-cyan-800',
            };
        case 'sea_transit':
            return {
                label: 'Jūras posms',
                icon: Waves,
                accentClasses:
                    'border-teal-200 bg-teal-50 text-teal-800',
            };
        case 'rest':
            return {
                label: 'Atpūta',
                icon: Clock3,
                accentClasses:
                    'border-[#d9ded9] bg-white text-[#5b6b61]',
            };
        default:
            return {
                label: 'Simulācija',
                icon: ScanSearch,
                accentClasses:
                    'border-[#d9ded9] bg-white text-[#5b6b61]',
            };
    }
}

function describeEvent(event: TimelineEvent) {
    switch (event.type) {
        case 'loading':
            return `Krava tiek ievietota transportā un sagatavota izbraukšanai no ${metaString(event.meta, 'location_name') ?? 'sākuma punkta'}.`;
        case 'drive':
            return `Transports dodas no ${metaString(event.meta, 'from_location_name') ?? 'iepriekšējā punkta'} uz ${metaString(event.meta, 'to_location_name') ?? 'nākamo punktu'}.`;
        case 'fuel_stop':
            return `Notiek uzpilde pie ${metaString(event.meta, 'station_name') ?? 'izvēlētās pieturas'}, lai maršruts paliktu izpildāms.`;
        case 'waiting':
            return metaString(event.meta, 'reason') === 'ship_ready_window'
                ? `Krava gaida, līdz kuģis ${metaString(event.meta, 'ship_name') ?? ''} ir gatavs turpināt ķēdi.`
                : `Notiek gaidīšana pie ${metaString(event.meta, 'port_name') ?? 'ostas'} pirms nākamā soļa.`;
        case 'port_processing':
            return `Ostai ir jāapstrādā krava pie ${metaString(event.meta, 'port_name') ?? 'izvēlētās ostas'} pirms tālākās kustības.`;
        case 'ship_loading':
            return `Krava tiek pārcelta uz kuģi ${metaString(event.meta, 'ship_name') ?? ''} ostas etapā.`;
        case 'sea_transit':
            return `${metaString(event.meta, 'ship_name') ?? 'Kuģis'} dodas no ${metaString(event.meta, 'origin_port_name') ?? 'izbraukšanas ostas'} uz ${metaString(event.meta, 'destination_port_name') ?? 'galamērķi'}.`;
        case 'return':
            return `Transports atgriežas uz ${metaString(event.meta, 'to_location_name') ?? 'sākuma punktu'}, lai sāktu nākamo reisu.`;
        case 'rest':
            return 'Tiek ievērota obligātā atpūtas pauze pirms maršruta turpināšanas.';
        default:
            return 'Notiek simulācijas aprēķinātais etaps.';
    }
}

function findNearestNodeIndex(
    nodes: TrackNode[],
    resolveNodeX: (index: number) => number,
    tokenX: number,
) {
    if (!nodes.length) {
        return 0;
    }

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < nodes.length; index += 1) {
        const distance = Math.abs(resolveNodeX(index) - tokenX);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
        }
    }

    return nearestIndex;
}

function NodeIcon({
    kind,
    className,
}: {
    kind: TrackNodeKind;
    className?: string;
}) {
    const Icon =
        kind === 'transport'
            ? Truck
            : kind === 'fuel'
              ? Fuel
              : kind === 'port'
                ? Anchor
                : kind === 'ship'
                  ? Ship
                  : kind === 'destination'
                    ? CheckCircle2
                    : MapPinned;

    return <Icon className={className} />;
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone?: 'default' | 'success' | 'warning';
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border p-4',
                tone === 'success'
                    ? 'border-[#cfe3d8] bg-[#e9f5ef]'
                    : tone === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-[#d9ded9] bg-[#f8faf8]',
            )}
        >
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                <span className="text-[#166a4d]">
                    <Icon className="h-4 w-4" />
                </span>
                {label}
            </div>
            <div className="mt-2 text-[17px] font-semibold text-[#182219]">
                {value}
            </div>
            <div className="mt-1 text-[13px] text-[#5b6b61]">{detail}</div>
        </div>
    );
}

function InfoPill({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ded9] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#506158]">
            <Icon className="h-3.5 w-3.5 text-[#166a4d]" />
            {label}
        </span>
    );
}

function PreviewPromise({
    icon: Icon,
    text,
}: {
    icon: LucideIcon;
    text: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3 text-[14px] leading-6 text-[#182219]">
            <span className="mt-0.5 text-[#166a4d]">
                <Icon className="h-4 w-4" />
            </span>
            <span>{text}</span>
        </div>
    );
}
