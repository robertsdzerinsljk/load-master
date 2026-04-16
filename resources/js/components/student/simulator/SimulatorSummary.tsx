import {
    AlertTriangle,
    CheckCircle2,
    Fuel,
    Map,
    Truck,
    Gauge,
} from 'lucide-react';
import { Attempt, Template } from './types';

type Props = {
    template: Template;
    attempt: Attempt;
};

function Stat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#e4e9e4] bg-white px-3 py-2">
            <div className="text-[11px] uppercase text-[#7b887f]">{label}</div>
            <div className="text-[14px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

function format(value: any, suffix = '') {
    if (value === null || value === undefined) return '—';
    return `${value}${suffix}`;
}

export default function SimulatorSummary({ template, attempt }: Props) {
    const preview = attempt.preview_result;

    return (
        <aside className="sticky top-6 space-y-4">
            <div className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                <h3 className="text-[18px] font-semibold text-[#182219]">
                    Kopsavilkums
                </h3>

                {/* TRANSPORT */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#166a4d]">
                        <Truck className="h-4 w-4" />
                        Transports
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Stat
                            label="Izvēlēts"
                            value={
                                attempt.selected_transport_template_id
                                    ? 'Jā'
                                    : 'Nē'
                            }
                        />
                        <Stat
                            label="Skaits"
                            value={format(attempt.selected_vehicle_count)}
                        />
                    </div>
                </div>

                {/* ROUTE */}
                <div className="mt-5">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#166a4d]">
                        <Map className="h-4 w-4" />
                        Maršruts
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Stat
                            label="Segmenti"
                            value={format(preview?.route?.segments_count)}
                        />
                        <Stat
                            label="Distance"
                            value={format(preview?.route?.distance_km, ' km')}
                        />
                    </div>

                    <div className="mt-2 text-[13px] text-[#5b6b61]">
                        {preview?.route?.start || '—'} →{' '}
                        {preview?.route?.end || '—'}
                    </div>
                </div>

                {/* FUEL */}
                <div className="mt-5">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#166a4d]">
                        <Fuel className="h-4 w-4" />
                        Degviela
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Stat
                            label="Pieturas"
                            value={format(preview?.fuel?.stops_count)}
                        />
                        <Stat
                            label="Distance/legs"
                            value={format(preview?.fuel?.approx_leg_distance_km, ' km')}
                        />
                    </div>
                </div>

                {/* RESULT */}
                {preview?.result && (
                    <div className="mt-5">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#166a4d]">
                            <Gauge className="h-4 w-4" />
                            Rezultāts
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <Stat
                                label="Izmaksas"
                                value={format(preview.result.total_cost, ' €')}
                            />
                            <Stat
                                label="Laiks"
                                value={format(preview.result.trip_time_hours, ' h')}
                            />
                            <Stat
                                label="Degviela"
                                value={format(preview.result.fuel_needed_liters, ' L')}
                            />
                            <Stat
                                label="Score"
                                value={format(preview.result.score)}
                            />
                        </div>
                    </div>
                )}

                {/* WARNINGS */}
                {preview?.result?.warnings?.length ? (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                            Brīdinājumi
                        </div>

                        <ul className="mt-2 space-y-1 text-[13px] text-amber-800">
                            {preview.result.warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                            ))}
                        </ul>
                    </div>
                ) : preview?.result ? (
                    <div className="mt-5 flex items-center gap-2 text-[13px] text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Nav kritisku problēmu
                    </div>
                ) : null}
            </div>
        </aside>
    );
}