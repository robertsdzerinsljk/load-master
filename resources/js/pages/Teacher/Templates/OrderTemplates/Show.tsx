import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type NamedItem = {
    id: number;
    name: string;
};

type LocationData = {
    id: number;
    name: string;
    city?: string | null;
    type?: string | null;
};

type PortData = {
    id: number;
    name: string;
    country?: string | null;
};

type LandRouteData = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: {
        id: number;
        name: string;
    } | null;
    toLocation?: {
        id: number;
        name: string;
    } | null;
    from_location?: {
        id: number;
        name: string;
    } | null;
    to_location?: {
        id: number;
        name: string;
    } | null;
};

type Template = {
    id: number;
    title: string;
    scenario_type: string;
    status: string;
    description?: string | null;
    student_brief?: string | null;
    teacher_notes?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: string | number | null;
    cargo_amount_tons?: string | number | null;
    cargo_volume_m3?: string | number | null;
    cargo_value?: string | number | null;
    deadline_date?: string | null;
    budget_limit?: string | number | null;
    requires_refuel_planning?: boolean;
    max_trips?: string | number | null;
    priority?: string | null;

    temperatureMode?: NamedItem | null;
    temperature_mode?: NamedItem | null;
    specialCondition?: NamedItem | null;
    special_condition?: NamedItem | null;

    startLocation?: LocationData | null;
    start_location?: LocationData | null;
    endLocation?: LocationData | null;
    end_location?: LocationData | null;

    startPort?: PortData | null;
    start_port?: PortData | null;
    endPort?: PortData | null;
    end_port?: PortData | null;

    transportTemplates?: NamedItem[];
    transport_templates?: NamedItem[];
    ships?: NamedItem[];
    ports?: NamedItem[];
    landRoutes?: LandRouteData[];
    land_routes?: LandRouteData[];
};

type PreviewResponse = {
    route?: {
        from?: string | null;
        to?: string | null;
        distance_km?: number;
        toll_cost?: number;
    };
    transport?: {
        name?: string | null;
        type?: string | null;
        capacity_containers?: number;
        avg_speed_kmh?: number;
        cost_per_km?: number;
        fuel_consumption_per_100km?: number;
        max_range_km?: number;
        loading_time_minutes?: number;
        unloading_time_minutes?: number;
    };
    cargo?: {
        amount_containers?: number;
    };
    result?: {
        required_vehicles?: number;
        trip_time_hours?: number;
        cycle_time_hours?: number;
        transport_cost_per_vehicle?: number;
        base_cost_per_vehicle?: number;
        total_base_cost?: number;
        fuel_used_liters_per_vehicle?: number;
        needs_refuel?: boolean;
        can_complete_with_current_route_data?: boolean;
        fuel_cost_per_vehicle?: number | null;
        total_fuel_cost?: number | null;
        total_cost?: number;
    };
    fuel?: {
        available_fuel_stops?: Array<{
            distance_from_start_km: number;
            station_name?: string | null;
            station_city?: string | null;
            fuel_type?: string | null;
            price_per_liter?: number | null;
        }>;
        recommended_fuel_stop?: {
            distance_from_start_km: number;
            station_name?: string | null;
            station_city?: string | null;
            fuel_type?: string | null;
            price_per_liter?: number | null;
        } | null;
    };
    message?: string;
};

type PageProps = {
    template: Template;
};

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-[#d9ded9] bg-white p-4">
            <span className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </span>
            <span className="text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </span>
        </div>
    );
}

function PreviewCard({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-white p-4">
            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        draft: 'Melnraksts',
        ready: 'Gatavs',
    };

    const styles: Record<string, string> = {
        draft: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        ready: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {labelMap[status] ?? status}
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

function ListBlock({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    return (
        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
            <h2 className="text-[22px] font-semibold text-[#182219]">{title}</h2>

            <div className="mt-5 space-y-3 text-[15px] text-[#5b6b61]">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={`${title}-${index}`}
                            className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3"
                        >
                            {item}
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3">
                        Nav norādīts.
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Show() {
    const page = usePage<PageProps>();
    const template = page.props.template;

    const [isTryingScenario, setIsTryingScenario] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

    const routeLabels =
        (template.landRoutes ?? template.land_routes ?? []).map(
            (route) =>
                `${(route.fromLocation ?? route.from_location)?.name ?? '—'} → ${(
                    route.toLocation ?? route.to_location
                )?.name ?? '—'} (${route.distance_km ?? '—'} km)`
        );

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
                <BackButton href="/teacher/templates/order-templates" />

                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                                {template.title}
                            </h1>
                            <StatusBadge status={template.status} />
                            <ScenarioTypeBadge type={template.scenario_type} />
                        </div>

                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                            Šeit pasniedzējs var pārskatīt pilnu scenārija karkasu pirms tā
                            rediģēšanas vai piešķiršanas studentiem.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(`/teacher/templates/order-templates/${template.id}/edit`)
                            }
                            className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            Rediģēt
                        </button>

                        <button
                            type="button"
                            onClick={handleTryScenario}
                            disabled={isTryingScenario}
                            className="rounded-xl border border-[#166a4d] bg-white px-4 py-2 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:opacity-60"
                        >
                            {isTryingScenario ? 'Notiek aprēķins...' : 'Izmēģināt'}
                        </button>
                    </div>
                </div>

                {(previewError || previewData) && (
                    <div className="mt-6 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <h2 className="text-[22px] font-semibold text-[#182219]">
                            Scenārija preview
                        </h2>
                        <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                            Šis ir saglabātās uzdevuma sagataves aprēķinu priekšskatījums.
                        </p>

                        {previewError && (
                            <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[15px] text-[#991b1b]">
                                {previewError}
                            </div>
                        )}

                        {previewData && (
                            <div className="mt-5 space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <PreviewCard
                                        label="Maršruts"
                                        value={`${previewData.route?.from ?? '—'} → ${previewData.route?.to ?? '—'}`}
                                    />
                                    <PreviewCard
                                        label="Attālums"
                                        value={`${previewData.route?.distance_km ?? '—'} km`}
                                    />
                                    <PreviewCard
                                        label="Transports"
                                        value={previewData.transport?.name ?? '—'}
                                    />
                                    <PreviewCard
                                        label="Nepieciešamās vienības"
                                        value={previewData.result?.required_vehicles ?? '—'}
                                    />
                                    <PreviewCard
                                        label="Brauciena laiks"
                                        value={`${previewData.result?.trip_time_hours ?? '—'} h`}
                                    />
                                    <PreviewCard
                                        label="Pilna cikla laiks"
                                        value={`${previewData.result?.cycle_time_hours ?? '—'} h`}
                                    />
                                    <PreviewCard
                                        label="Bāzes izmaksas uz 1 transportu"
                                        value={`${previewData.result?.base_cost_per_vehicle ?? '—'} €`}
                                    />
                                    <PreviewCard
                                        label="Kopējās bāzes izmaksas"
                                        value={`${previewData.result?.total_base_cost ?? '—'} €`}
                                    />
                                    <PreviewCard
                                        label="Kopējās izmaksas"
                                        value={`${previewData.result?.total_cost ?? '—'} €`}
                                    />
                                    <PreviewCard
                                        label="Nepieciešama uzpilde"
                                        value={previewData.result?.needs_refuel ? 'Jā' : 'Nē'}
                                    />
                                    <PreviewCard
                                        label="Maršruts izpildāms"
                                        value={
                                            previewData.result?.can_complete_with_current_route_data
                                                ? 'Jā'
                                                : 'Nē'
                                        }
                                    />
                                    <PreviewCard
                                        label="Degviela uz 1 transportu"
                                        value={`${previewData.result?.fuel_used_liters_per_vehicle ?? '—'} l`}
                                    />
                                </div>

                                <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                    <h3 className="text-[15px] font-semibold text-[#182219]">
                                        Ieteicamā uzpildes vieta
                                    </h3>
                                    <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                        {previewData.fuel?.recommended_fuel_stop
                                            ? `${previewData.fuel.recommended_fuel_stop.station_name ?? '—'} (${previewData.fuel.recommended_fuel_stop.distance_from_start_km} km no starta)`
                                            : 'Pagaidām nav ieteicamas uzpildes vietas vai uzpilde nav nepieciešama.'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#d9ded9] bg-white p-4">
                                    <h3 className="text-[15px] font-semibold text-[#182219]">
                                        Pieejamās uzpildes pieturas maršrutā
                                    </h3>

                                    <div className="mt-3 space-y-3">
                                        {previewData.fuel?.available_fuel_stops?.length ? (
                                            previewData.fuel.available_fuel_stops.map((stop, index) => (
                                                <div
                                                    key={`${stop.station_name}-${index}`}
                                                    className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3 text-[14px] text-[#5b6b61]"
                                                >
                                                    <div className="font-semibold text-[#182219]">
                                                        {stop.station_name ?? '—'}
                                                    </div>
                                                    <div className="mt-1">
                                                        {stop.distance_from_start_km} km no starta
                                                        {stop.station_city ? ` — ${stop.station_city}` : ''}
                                                    </div>
                                                    <div className="mt-1">
                                                        Degviela: {stop.fuel_type ?? '—'}
                                                        {stop.price_per_liter !== null &&
                                                        stop.price_per_liter !== undefined
                                                            ? ` — ${stop.price_per_liter} €/l`
                                                            : ''}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3 text-[14px] text-[#5b6b61]">
                                                Maršrutam nav piesaistītu uzpildes pieturu.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Pamata informācija
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Nosaukums" value={template.title} />
                                <InfoRow label="Scenārija tips" value={template.scenario_type} />
                                <InfoRow label="Statuss" value={template.status} />
                                <InfoRow label="Prioritāte" value={template.priority} />
                            </div>

                            {template.description && (
                                <p className="mt-5 text-[15px] leading-7 text-[#5b6b61]">
                                    {template.description}
                                </p>
                            )}
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Kravas dati
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Kravas nosaukums" value={template.cargo_name} />
                                <InfoRow label="Kravas tips" value={template.cargo_type} />
                                <InfoRow
                                    label="Konteineru skaits"
                                    value={template.cargo_amount_containers}
                                />
                                <InfoRow label="Tonnas" value={template.cargo_amount_tons} />
                                <InfoRow label="Tilpums (m³)" value={template.cargo_volume_m3} />
                                <InfoRow label="Kravas vērtība (€)" value={template.cargo_value} />
                                <InfoRow
                                    label="Temperatūras režīms"
                                    value={(template.temperatureMode ?? template.temperature_mode)?.name}
                                />
                                <InfoRow
                                    label="Īpašie nosacījumi"
                                    value={(template.specialCondition ?? template.special_condition)?.name}
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Sākuma un gala punkti
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow
                                    label="Sākuma lokācija"
                                    value={(template.startLocation ?? template.start_location)?.name}
                                />
                                <InfoRow
                                    label="Gala lokācija"
                                    value={(template.endLocation ?? template.end_location)?.name}
                                />
                                <InfoRow
                                    label="Sākuma osta"
                                    value={(template.startPort ?? template.start_port)?.name}
                                />
                                <InfoRow
                                    label="Gala osta"
                                    value={(template.endPort ?? template.end_port)?.name}
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Ierobežojumi
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Termiņš" value={template.deadline_date} />
                                <InfoRow label="Budžeta limits" value={template.budget_limit} />
                                <InfoRow label="Maks. reisu skaits" value={template.max_trips} />
                                <InfoRow
                                    label="Uzpildes plānošana"
                                    value={template.requires_refuel_planning ? 'Jā' : 'Nē'}
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Studentam redzamais uzdevums
                            </h2>

                            <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                {template.student_brief || 'Nav ievadīts uzdevuma teksts.'}
                            </p>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <ListBlock
                            title="Pieejamais sauszemes transports"
                            items={(template.transportTemplates ?? template.transport_templates ?? []).map((item) => item.name)}
                        />

                        <ListBlock
                            title="Pieejamie kuģi"
                            items={(template.ships ?? []).map((item) => item.name)}
                        />

                        <ListBlock
                            title="Pieejamās ostas"
                            items={(template.ports ?? []).map((item) => item.name)}
                        />

                        <ListBlock title="Pieejamie maršruti" items={routeLabels} />

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Pasniedzēja piezīmes
                            </h2>

                            <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                {template.teacher_notes || 'Nav pievienotas piezīmes.'}
                            </p>
                        </section>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}