import {
    Attempt,
    getStatusLabel,
    getStepTitle,
    routeName,
    Template,
} from './types';

type Props = {
    template: Template;
    attempt: Attempt;
};

function formatValue(value: string | number | null | undefined, suffix = '') {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return `${value}${suffix}`;
}

export default function SimulatorSummary({ template, attempt }: Props) {
    const routeSegments = attempt.ordered_route_segments ?? [];
    const fuelStops = attempt.ordered_fuel_stations ?? [];
    const preview = attempt.preview_result;
    const result = preview?.result;
    const isExamMode = template.evaluation_mode === 'exam';

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                Kopsavilkums
            </div>

            <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                Tava simulācijas situācija
            </h2>

            <div className="mt-6 space-y-6">
                <SummaryBlock title="Statuss">
                    <SummaryRow label="Mēģinājuma statuss" value={getStatusLabel(attempt.status)} />
                    <SummaryRow label="Pašreizējais solis" value={getStepTitle(attempt.current_step)} />
                    <SummaryRow
                        label="Režīms"
                        value={isExamMode ? 'Pārbaudes darbs' : 'Mācību režīms'}
                    />
                </SummaryBlock>

                <SummaryBlock title="Uzdevums">
                    <SummaryRow label="Nosaukums" value={template.title} />
                    <SummaryRow label="Scenārija tips" value={template.scenario_type ?? '—'} />
                    <SummaryRow label="Scenārija fokuss" value={template.scenario_focus ?? '—'} />
                    <SummaryRow
                        label="Konteineru skaits"
                        value={formatValue(template.cargo_amount_containers)}
                    />
                    <SummaryRow
                        label="Budžeta limits"
                        value={formatValue(template.budget_limit, ' €')}
                    />
                    <SummaryRow
                        label="Deadline datums"
                        value={template.deadline_at ?? template.deadline_date ?? '—'}
                    />
                </SummaryBlock>

                <SummaryBlock title="Izvēlētais risinājums">
                    <SummaryRow
                        label="Transports"
                        value={
                            attempt.selectedTransportTemplate?.name ??
                            preview?.transport?.name ??
                            '—'
                        }
                    />
                    <SummaryRow
                        label="Osta"
                        value={attempt.selectedPort?.name ?? preview?.port?.name ?? '—'}
                    />
                    <SummaryRow
                        label="Kuģis"
                        value={attempt.selectedShip?.name ?? preview?.ship?.name ?? '—'}
                    />
                    <SummaryRow label="Maršruta segmenti" value={formatValue(routeSegments.length)} />
                    <SummaryRow label="Degvielas pieturas" value={formatValue(fuelStops.length)} />
                </SummaryBlock>

                {routeSegments.length > 0 ? (
                    <SummaryBlock title="Maršruts">
                        <div className="space-y-2">
                            {routeSegments.map((segment, index) => (
                                <div
                                    key={`${segment.id}-${index}`}
                                    className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3"
                                >
                                    <div className="text-[14px] font-medium text-[#182219]">
                                        {index + 1}. {routeName(segment, 'from')} → {routeName(segment, 'to')}
                                    </div>
                                    <div className="mt-1 text-[13px] text-[#5b6b61]">
                                        {formatValue(segment.distance_km, ' km')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SummaryBlock>
                ) : null}

                {fuelStops.length > 0 ? (
                    <SummaryBlock title="Degvielas pieturas">
                        <div className="space-y-2">
                            {fuelStops.map((station, index) => (
                                <div
                                    key={`${station.id}-${index}`}
                                    className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3"
                                >
                                    <div className="text-[14px] font-medium text-[#182219]">
                                        {index + 1}. {station.display_name ?? station.name ?? '—'}
                                    </div>
                                    <div className="mt-1 text-[13px] text-[#5b6b61]">
                                        {station.location_name ?? 'Lokācija nav norādīta'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SummaryBlock>
                ) : null}

                {preview ? (
                    <SummaryBlock title="Preview rezultāts">
                        <SummaryRow
                            label="Preview statuss"
                            value={
                                isExamMode
                                    ? result?.is_valid
                                        ? 'Gatavs iesniegšanai'
                                        : 'Vēl nav gatavs iesniegšanai'
                                    : result?.is_valid
                                    ? 'Derīgs risinājums'
                                    : 'Ir problēmas'
                            }
                        />

                        {!isExamMode ? (
                            <SummaryRow
                                label="Score"
                                value={formatValue(result?.score)}
                            />
                        ) : null}

                        <SummaryRow
                            label="Kopējās izmaksas"
                            value={formatValue(result?.total_cost, ' €')}
                        />
                        <SummaryRow
                            label="Degviela kopā"
                            value={formatValue(result?.fuel_needed_liters, ' l')}
                        />
                        <SummaryRow
                            label="Brauciena laiks"
                            value={formatValue(result?.trip_time_hours, ' h')}
                        />

                        {!isExamMode ? (
                            <SummaryRow
                                label="Nepieciešamie transporti"
                                value={formatValue(result?.required_vehicles)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Nepieciešamie reisi"
                                value={formatValue(result?.required_trips)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Kapacitāte vienā reisā"
                                value={formatValue(result?.capacity_per_trip)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Kavējums"
                                value={formatValue(result?.delay_minutes, ' min')}
                            />
                        ) : null}
                    </SummaryBlock>
                ) : null}

                {!isExamMode && result?.warnings?.length ? (
                    <SummaryBlock title="Brīdinājumi">
                        <div className="space-y-2">
                            {result.warnings.map((warning, index) => (
                                <div
                                    key={`${warning}-${index}`}
                                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-6 text-amber-800"
                                >
                                    {warning}
                                </div>
                            ))}
                        </div>
                    </SummaryBlock>
                ) : null}

                {isExamMode ? (
                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[13px] leading-6 text-[#5b6b61]">
                        Pārbaudes darba režīmā detalizēti brīdinājumi, score skaidrojumi un optimizācijas norādes netiek rādītas.
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function SummaryBlock({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="text-[15px] font-semibold text-[#182219]">{title}</h3>
            <div className="mt-3 space-y-3">{children}</div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3">
            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="text-right text-[14px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}
