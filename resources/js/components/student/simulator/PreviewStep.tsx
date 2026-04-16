import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Fuel,
    MapPinned,
    Route as RouteIcon,
    Sparkles,
    Truck,
} from 'lucide-react';
import { Attempt } from './types';
import { EmptyBlock, PreviewBox } from './ui';

type Props = {
    attempt: Attempt;
    loading: boolean;
    canPreview: boolean;
    onPreview: () => void;
};

export default function PreviewStep({
    attempt,
    loading,
    canPreview,
    onPreview,
}: Props) {
    const preview = attempt.preview_result;

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Sparkles className="h-3.5 w-3.5" />
                    5. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Rezultāta pārbaude
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Aprēķini starprezultātu, lai redzētu, vai izvēlētais risinājums ir loģisks pirms iesniegšanas.
                </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onPreview}
                    disabled={loading || !canPreview}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Aprēķināt preview
                    <ArrowRight className="h-4 w-4" />
                </button>

                <span className="text-[14px] text-[#6f7b74]">
                    Preview pieejams pēc transporta, transportu skaita, maršruta un degvielas plāna.
                </span>
            </div>

            {preview ? (
                <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <PreviewBox
                            label="Sākums"
                            value={preview.route?.start}
                            icon={<RouteIcon className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Beigas"
                            value={preview.route?.end}
                            icon={<RouteIcon className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Segmentu skaits"
                            value={preview.route?.segments_count}
                            icon={<RouteIcon className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Attālums"
                            value={`${preview.route?.distance_km ?? '—'} km`}
                            icon={<MapPinned className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Degvielas pieturas"
                            value={preview.fuel?.stops_count}
                            icon={<Fuel className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Aptuvenais posms starp uzpildēm"
                            value={`${preview.fuel?.approx_leg_distance_km ?? '—'} km`}
                            icon={<Fuel className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Nepieciešamie transporti"
                            value={preview.result?.required_vehicles}
                            icon={<Truck className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Izvēlētie transporti"
                            value={preview.result?.selected_vehicles}
                            icon={<Truck className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Brauciena laiks"
                            value={`${preview.result?.trip_time_hours ?? '—'} h`}
                            icon={<Clock3 className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Kopējās izmaksas"
                            value={`${preview.result?.total_cost ?? '—'} €`}
                            icon={<ClipboardCheck className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Degviela"
                            value={`${preview.result?.fuel_needed_liters ?? '—'} L`}
                            icon={<Fuel className="h-4 w-4" />}
                        />
                        <PreviewBox
                            label="Punkti"
                            value={preview.result?.score}
                            icon={<CheckCircle2 className="h-4 w-4" />}
                        />
                    </div>

                    {preview.fuel?.stops?.length ? (
                        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                            <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                Degvielas plāns
                            </div>

                            <div className="mt-3 space-y-2">
                                {preview.fuel.stops.map((stop, index) => (
                            <div
                                key={`${stop.id}-${index}`}
                                className="rounded-xl border border-[#e4e9e4] bg-white px-3 py-3 text-[14px] text-[#182219]"
                            >
                                <div className="font-semibold">
                                    {index + 1}. {stop.name}
                                </div>
                                {stop.location_name ? (
                                    <div className="mt-1 text-[#5b6b61]">{stop.location_name}</div>
                                ) : null}
                            </div>
                        ))}
                            </div>
                        </div>
                    ) : null}

                    {preview.result?.warnings?.length ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                Brīdinājumi
                            </div>

                            <div className="mt-3 space-y-2 text-[14px] leading-6 text-amber-800">
                                {preview.result.warnings.map((warning, index) => (
                                    <div key={`${warning}-${index}`} className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="mt-5">
                    <EmptyBlock text="Preview vēl nav aprēķināts." />
                </div>
            )}
        </section>
    );
}