import type { ReactNode } from 'react';
import { AlertCircle, Anchor, Clock3, Ship, Wrench } from 'lucide-react';
import type { HandlingContext, HandlingSource } from './types';

type Props = {
    stepNumber?: number;
    handlingContext?: HandlingContext | null;
    selectedPortName?: string | null;
    selectedShipName?: string | null;
    selectedLoadingMethodCode: string;
    selectedUnloadingMethodCode: string;
    loadingMethodSource: string;
    unloadingMethodSource: string;
    setSelectedLoadingMethodCode: (value: string) => void;
    setSelectedUnloadingMethodCode: (value: string) => void;
    setLoadingMethodSource: (value: string) => void;
    setUnloadingMethodSource: (value: string) => void;
    loadingDurationMinutes?: string | number | null;
    unloadingDurationMinutes?: string | number | null;
    loading: boolean;
};

function formatMinutes(value?: string | number | null) {
    if (value === null || value === undefined || value === '') {
        return 'Tiks aprekinats pec saglabasanas';
    }

    return `${value} min`;
}

function resolveSource(
    sources: HandlingSource[] | undefined,
    selectedSource: string,
) {
    const allSources = sources ?? [];
    const enabledSources = allSources.filter((source) => source.enabled);

    if (!enabledSources.length) {
        return {
            allSources,
            enabledSources: [],
            activeSource: null as HandlingSource | null,
        };
    }

    const activeSource =
        enabledSources.find((source) => source.key === selectedSource) ??
        enabledSources[0] ??
        null;

    return {
        allSources,
        enabledSources,
        activeSource,
    };
}

export default function HandlingSelectionPanel({
    stepNumber = 6,
    handlingContext,
    selectedPortName,
    selectedShipName,
    selectedLoadingMethodCode,
    selectedUnloadingMethodCode,
    loadingMethodSource,
    unloadingMethodSource,
    setSelectedLoadingMethodCode,
    setSelectedUnloadingMethodCode,
    setLoadingMethodSource,
    setUnloadingMethodSource,
    loadingDurationMinutes,
    unloadingDurationMinutes,
    loading,
}: Props) {
    const loadingSources = handlingContext?.loading?.sources ?? [];
    const unloadingSources = handlingContext?.unloading?.sources ?? [];
    const loadingState = resolveSource(loadingSources, loadingMethodSource);
    const unloadingState = resolveSource(unloadingSources, unloadingMethodSource);
    const loadingErrors = handlingContext?.validation?.errors ?? [];
    const loadingWarnings = handlingContext?.validation?.warnings ?? [];
    const portReasons = handlingContext?.resource_checks?.port?.reasons ?? [];
    const shipReasons = handlingContext?.resource_checks?.ship?.reasons ?? [];
    const pairReasons = handlingContext?.resource_checks?.pair?.reasons ?? [];
    const derivedPortName =
        selectedPortName ||
        loadingSources.find((source) => source.key === 'port')?.resource_name ||
        unloadingSources.find((source) => source.key === 'port')?.resource_name ||
        null;
    const derivedShipName =
        selectedShipName ||
        loadingSources.find((source) => source.key === 'ship')?.resource_name ||
        unloadingSources.find((source) => source.key === 'ship')?.resource_name ||
        null;
    const hasAnyHandlingContext =
        loadingSources.length > 0 ||
        unloadingSources.length > 0 ||
        loadingErrors.length > 0 ||
        loadingWarnings.length > 0 ||
        portReasons.length > 0 ||
        shipReasons.length > 0 ||
        pairReasons.length > 0;

    if (!hasAnyHandlingContext && (!derivedPortName || !derivedShipName)) {
        return (
            <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Wrench className="h-3.5 w-3.5" />
                    Apstrade
                </div>

                <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                    Kravas apstrades plans
                </h3>

                <p className="mt-2 rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] leading-6 text-[#5b6b61]">
                    Izvelies ostu un kugi, lai redzetu savietojamas iekrausanas un izkrausanas metodes.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                        <Wrench className="h-3.5 w-3.5" />
                        {stepNumber}. solis
                    </div>

                    <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                        Kravas apstrades plans
                    </h3>

                    <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                        Izveles tiek sakartotas pec izveletas ostas, kugja un scenarija noteikumiem, lai paliktu tikai realistiskas opcijas.
                    </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <ResourcePill
                        icon={<Anchor className="h-3.5 w-3.5" />}
                        label="Osta"
                        value={derivedPortName ?? 'Nav ieladets nosaukums'}
                    />
                    <ResourcePill
                        icon={<Ship className="h-3.5 w-3.5" />}
                        label="Kugjis"
                        value={derivedShipName ?? 'Nav ieladets nosaukums'}
                    />
                </div>
            </div>

            {(portReasons.length || shipReasons.length || pairReasons.length) && (
                <div className="mt-5 grid gap-3 xl:grid-cols-3">
                    <ReasonBlock title="Ostas saderiba" items={portReasons} />
                    <ReasonBlock title="Kugja saderiba" items={shipReasons} />
                    <ReasonBlock title="Pāra saderiba" items={pairReasons} />
                </div>
            )}

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <DirectionCard
                    title="Iekrausana"
                    required={!!handlingContext?.loading?.required}
                    sources={loadingState.allSources}
                    activeSourceKey={loadingState.activeSource?.key ?? ''}
                    selectedCode={selectedLoadingMethodCode}
                    onSourceChange={(value) => {
                        setLoadingMethodSource(value);
                        const nextSource = loadingState.allSources.find(
                            (source) => source.key === value,
                        );

                        if (
                            !nextSource?.methods.some(
                                (method) => method.code === selectedLoadingMethodCode,
                            )
                        ) {
                            setSelectedLoadingMethodCode('');
                        }
                    }}
                    onCodeChange={setSelectedLoadingMethodCode}
                    durationLabel={formatMinutes(loadingDurationMinutes)}
                    loading={loading}
                />

                <DirectionCard
                    title="Izkrausana"
                    required={!!handlingContext?.unloading?.required}
                    sources={unloadingState.allSources}
                    activeSourceKey={unloadingState.activeSource?.key ?? ''}
                    selectedCode={selectedUnloadingMethodCode}
                    onSourceChange={(value) => {
                        setUnloadingMethodSource(value);
                        const nextSource = unloadingState.allSources.find(
                            (source) => source.key === value,
                        );

                        if (
                            !nextSource?.methods.some(
                                (method) => method.code === selectedUnloadingMethodCode,
                            )
                        ) {
                            setSelectedUnloadingMethodCode('');
                        }
                    }}
                    onCodeChange={setSelectedUnloadingMethodCode}
                    durationLabel={formatMinutes(unloadingDurationMinutes)}
                    loading={loading}
                />
            </div>

            {loadingErrors.length > 0 && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-[14px] leading-6 text-red-800">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Jaizlabo apstrades plans
                    </div>
                    <div className="mt-2 space-y-1">
                        {loadingErrors.map((item, index) => (
                            <div key={`${item}-${index}`}>{item}</div>
                        ))}
                    </div>
                </div>
            )}

            {loadingWarnings.length > 0 && (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-[14px] leading-6 text-amber-800">
                    <div className="font-semibold">Papildu bridinajumi</div>
                    <div className="mt-2 space-y-1">
                        {loadingWarnings.map((item, index) => (
                            <div key={`${item}-${index}`}>{item}</div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function DirectionCard({
    title,
    required,
    sources,
    activeSourceKey,
    selectedCode,
    onSourceChange,
    onCodeChange,
    durationLabel,
    loading,
}: {
    title: string;
    required: boolean;
    sources: HandlingSource[];
    activeSourceKey: string;
    selectedCode: string;
    onSourceChange: (value: string) => void;
    onCodeChange: (value: string) => void;
    durationLabel: string;
    loading: boolean;
}) {
    const activeSource = sources.find((source) => source.key === activeSourceKey) ?? null;
    const options = activeSource?.methods ?? [];
    const hasEnabledSources = sources.some((source) => source.enabled);

    return (
        <div className="rounded-[24px] border border-[#d9ded9] bg-[#fbfcfb] p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-[16px] font-semibold text-[#182219]">
                        {title}
                    </div>
                    <div className="mt-1 text-[13px] text-[#5b6b61]">
                        {required ? 'Studenta izvele ir obligata.' : 'Ja nav stingras prasibas, sistema var izmantot ieteikto variantu.'}
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[12px] font-semibold text-[#506158]">
                    <Clock3 className="h-3.5 w-3.5 text-[#166a4d]" />
                    {durationLabel}
                </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b887f]">
                        Avots
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {sources.map((source) => (
                            <button
                                key={source.key}
                                type="button"
                                onClick={() => onSourceChange(source.key)}
                                disabled={loading || !source.enabled}
                                className={`rounded-full border px-3 py-2 text-[13px] font-medium transition ${
                                    activeSourceKey === source.key
                                        ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                        : source.enabled
                                          ? 'border-[#d9ded9] bg-white text-[#182219] hover:bg-[#f7f9f7]'
                                          : 'cursor-not-allowed border-[#e4e7e4] bg-[#f4f6f4] text-[#94a097]'
                                }`}
                            >
                                {source.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b887f]">
                        Metode
                    </label>
                    <select
                        value={selectedCode}
                        onChange={(event) => onCodeChange(event.target.value)}
                        disabled={loading || !activeSource || !hasEnabledSources}
                        className="mt-2 w-full rounded-xl border border-[#d7ddd8] bg-white px-4 py-3 text-sm text-[#1f2a21] outline-none transition focus:border-[#166a4d] focus:ring-2 focus:ring-[#166a4d]/10"
                    >
                        <option value="">
                            {required ? 'Izvelies metodi...' : 'Atstat automatisku ieteikumu'}
                        </option>
                        {options.map((method) => (
                            <option key={`${activeSource?.key}-${method.code}`} value={method.code}>
                                {method.name}
                            </option>
                        ))}
                    </select>
                    {!hasEnabledSources ? (
                        <p className="mt-2 text-[12px] leading-5 text-[#a15a12]">
                            Sim virzienam nav nevienas pieejamas metodes. Pārbaudi resursu saderību un scenārija prasības.
                        </p>
                    ) : null}
                </div>
            </div>

            {!hasEnabledSources && sources.some((source) => (source.reasons ?? []).length > 0) ? (
                <div className="mt-4 grid gap-3">
                    {sources
                        .filter((source) => (source.reasons ?? []).length > 0)
                        .map((source) => (
                            <div
                                key={`${title}-${source.key}-reasons`}
                                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] leading-6 text-amber-800"
                            >
                                <div className="font-semibold">{source.label}</div>
                                <div className="mt-2 space-y-1">
                                    {(source.reasons ?? []).map((reason, index) => (
                                        <div key={`${source.key}-${index}`}>{reason}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            ) : null}

            {activeSource ? (
                <div className="mt-4 space-y-2">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b887f]">
                        Pieejamas metodes
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {activeSource.methods.map((method) => (
                            <span
                                key={`${activeSource.key}-${method.code}-pill`}
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                                    selectedCode === method.code
                                        ? 'border-[#166a4d] bg-[#edf6f0] text-[#166a4d]'
                                        : 'border-[#d9ded9] bg-white text-[#506158]'
                                }`}
                            >
                                <span>{method.name}</span>
                                {method.throughput_containers_per_hour || method.throughput_tons_per_hour ? (
                                    <span className="text-[#7b887f]">
                                        {method.throughput_containers_per_hour
                                            ? `${method.throughput_containers_per_hour} cont/h`
                                            : `${method.throughput_tons_per_hour} t/h`}
                                    </span>
                                ) : null}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[#d9ded9] bg-white px-4 py-4 text-[13px] leading-6 text-[#5b6b61]">
                    Sim virzienam nav pieejamu saderigu apstrades metodu.
                </div>
            )}
        </div>
    );
}

function ResourcePill({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

function ReasonBlock({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    if (!items.length) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] leading-6 text-amber-800">
            <div className="font-semibold">{title}</div>
            <div className="mt-2 space-y-1">
                {items.map((item, index) => (
                    <div key={`${item}-${index}`}>{item}</div>
                ))}
            </div>
        </div>
    );
}
