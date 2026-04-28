import type { ReactNode } from 'react';
import {
    attemptPortName,
    attemptShipName,
    attemptTransportName,
} from './types';
import type { Attempt, Template } from './types';
import { getStatusLabel, getStepTitle, routeName } from './types';

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
    const handling = preview?.handling;
    const handlingContext = attempt.handling_context;
    const isExamMode = template.evaluation_mode === 'exam';

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                Kopsavilkums
            </div>

            <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                Tava simulacijas situacija
            </h2>

            <div className="mt-6 space-y-6">
                <SummaryBlock title="Statuss">
                    <SummaryRow label="Megjinajuma statuss" value={getStatusLabel(attempt.status)} />
                    <SummaryRow label="Pasreizejais solis" value={getStepTitle(attempt.current_step)} />
                    <SummaryRow
                        label="Rezims"
                        value={isExamMode ? 'Parbaudes darbs' : 'Macibu rezims'}
                    />
                </SummaryBlock>

                <SummaryBlock title="Uzdevums">
                    <SummaryRow label="Nosaukums" value={template.title} />
                    <SummaryRow label="Scenarija tips" value={template.scenario_type ?? '—'} />
                    <SummaryRow label="Scenarija fokuss" value={template.scenario_focus ?? '—'} />
                    <SummaryRow label="Kravas veids" value={template.cargo_mode ?? template.cargo_type ?? '—'} />
                    <SummaryRow
                        label="Konteineru skaits"
                        value={formatValue(template.cargo_amount_containers)}
                    />
                    <SummaryRow
                        label="Krava tonnas"
                        value={formatValue(template.cargo_amount_tons, ' t')}
                    />
                    <SummaryRow
                        label="Budzeta limits"
                        value={formatValue(template.budget_limit, ' €')}
                    />
                    <SummaryRow
                        label="Deadline"
                        value={template.deadline_at ?? template.deadline_date ?? '—'}
                    />
                </SummaryBlock>

                <SummaryBlock title="Izveletais risinajums">
                    <SummaryRow
                        label="Transports"
                        value={
                            attemptTransportName(attempt) ??
                            preview?.transport?.name ??
                            '—'
                        }
                    />
                    <SummaryRow
                        label="Osta"
                        value={attemptPortName(attempt) ?? preview?.port?.name ?? '—'}
                    />
                    <SummaryRow
                        label="Kugjis"
                        value={attemptShipName(attempt) ?? preview?.ship?.name ?? '—'}
                    />
                    <SummaryRow label="Marsruta segmenti" value={formatValue(routeSegments.length)} />
                    <SummaryRow label="Degvielas pieturas" value={formatValue(fuelStops.length)} />
                </SummaryBlock>

                {(attempt.selectedShip || handling) ? (
                    <SummaryBlock title="Apstrades plans">
                        <SummaryRow
                            label="Iekrausana"
                            value={
                                handling?.loading?.name ??
                                attempt.selected_loading_method_code ??
                                '—'
                            }
                        />
                        <SummaryRow
                            label="Iekrausanas avots"
                            value={
                                handling?.loading?.source ??
                                attempt.loading_method_source ??
                                '—'
                            }
                        />
                        <SummaryRow
                            label="Iekrausanas ilgums"
                            value={formatValue(
                                handling?.loading?.duration_minutes ??
                                    attempt.loading_duration_minutes,
                                ' min',
                            )}
                        />
                        <SummaryRow
                            label="Izkrausana"
                            value={
                                handling?.unloading?.name ??
                                attempt.selected_unloading_method_code ??
                                '—'
                            }
                        />
                        <SummaryRow
                            label="Izkrausanas avots"
                            value={
                                handling?.unloading?.source ??
                                attempt.unloading_method_source ??
                                '—'
                            }
                        />
                        <SummaryRow
                            label="Izkrausanas ilgums"
                            value={formatValue(
                                handling?.unloading?.duration_minutes ??
                                    attempt.unloading_duration_minutes,
                                ' min',
                            )}
                        />
                    </SummaryBlock>
                ) : null}

                {routeSegments.length > 0 ? (
                    <SummaryBlock title="Marsruts">
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
                                        {station.location_name ?? 'Lokacija nav noradita'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SummaryBlock>
                ) : null}

                {preview ? (
                    <SummaryBlock title="Simulacijas rezultats">
                        <SummaryRow
                            label="Simulacijas statuss"
                            value={
                                isExamMode
                                    ? result?.is_valid
                                        ? 'Gatavs iesniegsanai'
                                        : 'Vel nav gatavs iesniegsanai'
                                    : result?.is_valid
                                      ? 'Derigs risinajums'
                                      : 'Ir problemas'
                            }
                        />

                        {!isExamMode ? (
                            <SummaryRow label="Score" value={formatValue(result?.score)} />
                        ) : null}

                        <SummaryRow
                            label="Kopejas izmaksas"
                            value={formatValue(result?.total_cost, ' €')}
                        />
                        <SummaryRow
                            label="Degviela kopa"
                            value={formatValue(result?.fuel_needed_liters, ' l')}
                        />
                        <SummaryRow
                            label="Brauciena laiks"
                            value={formatValue(result?.trip_time_hours, ' h')}
                        />

                        {!isExamMode ? (
                            <SummaryRow
                                label="Nepieciesamie transporti"
                                value={formatValue(result?.required_vehicles)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Nepieciesamie reisi"
                                value={formatValue(result?.required_trips)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Kapacitate viena reisa"
                                value={formatValue(result?.capacity_per_trip)}
                            />
                        ) : null}

                        {!isExamMode ? (
                            <SummaryRow
                                label="Kavejums"
                                value={formatValue(result?.delay_minutes, ' min')}
                            />
                        ) : null}
                    </SummaryBlock>
                ) : null}

                {!isExamMode && result?.warnings?.length ? (
                    <SummaryBlock title="Bridinajumi">
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

                {!isExamMode && handlingContext?.validation?.errors?.length ? (
                    <SummaryBlock title="Apstrades piezimes">
                        <div className="space-y-2">
                            {handlingContext.validation.errors.map((item, index) => (
                                <div
                                    key={`${item}-${index}`}
                                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-800"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </SummaryBlock>
                ) : null}

                {isExamMode ? (
                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[13px] leading-6 text-[#5b6b61]">
                        Parbaudes darba rezima detalizeti bridinajumi, score skaidrojumi un optimizacijas norades netiek raditas.
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
    children: ReactNode;
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
