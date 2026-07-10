import {
    ArrowDown,
    ArrowUp,
    Plus,
    Route as RouteIcon,
    Trash2,
} from 'lucide-react';
import { useMemo } from 'react';
import LogisticsMap, {
    type LogisticsMapLocation,
    type LogisticsRouteLeg,
} from '@/components/LogisticsMap';
import MapRouteBuilder, {
    type RouteBuilderPoint,
    type RouteBuilderPreview,
} from '@/components/routing/MapRouteBuilder';
import {
    LocationItem,
    RouteItem,
    RouteTemplate,
    RouteTemplatePoint,
    routeName,
} from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    availableSegments: RouteItem[];
    selectedSegments: RouteItem[];
    routeTemplate?: RouteTemplate | null;
    expectedStartName?: string | null;
    expectedEndName?: string | null;
    loading: boolean;
    onAddSegment: (segmentId: number) => void | Promise<void>;
    onRemoveSegment: (segmentId: number) => void;
    onMoveSegment: (segmentId: number, direction: 'up' | 'down') => void;
};

export default function RouteBuilderStep({
    stepNumber = 3,
    availableSegments,
    selectedSegments,
    routeTemplate,
    expectedStartName,
    expectedEndName,
    loading,
    onAddSegment,
    onRemoveSegment,
    onMoveSegment,
}: Props) {
    const totalDistance = selectedSegments.reduce(
        (sum, segment) => sum + Number(segment.distance_km ?? 0),
        0,
    );
    const initialBuilderPoints = useMemo(
        () =>
            selectedSegments.length > 0
                ? [
                      routeLocation(selectedSegments[0], 'from'),
                      ...selectedSegments.map((segment) =>
                          routeLocation(segment, 'to'),
                      ),
                  ].filter((point): point is RouteBuilderPoint =>
                      Boolean(point),
                  )
                : [],
        [selectedSegments],
    );

    const handleUseGeneratedRoute = async (preview: RouteBuilderPreview) => {
        for (const routeId of preview.land_route_ids ?? []) {
            if (!selectedSegments.some((segment) => segment.id === routeId)) {
                await onAddSegment(routeId);
            }
        }
    };

    if (routeTemplate?.points?.length) {
        return (
            <PresetRouteStep
                stepNumber={stepNumber}
                routeTemplate={routeTemplate}
                expectedStartName={expectedStartName}
                expectedEndName={expectedEndName}
            />
        );
    }

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                    <RouteIcon className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Maršruta veidošana
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Meklē vietu vai klikšķini uz kartes, saliec A, B, C punktus
                    un ģenerē maršrutu. Karte izveidos vajadzīgos maršruta
                    posmus automātiski.
                </p>

                {expectedStartName || expectedEndName ? (
                    <div className="mt-4 rounded-2xl border border-[#d7e5db] bg-[#f8fbf9] p-4 text-[14px] font-semibold text-[#182219]">
                        Uzdevuma maršruts:{' '}
                        {expectedStartName ?? 'sākums nav norādīts'} -&gt;{' '}
                        {expectedEndName ?? 'galamērķis nav norādīts'}
                    </div>
                ) : null}
            </div>

            <MapRouteBuilder
                title="Izveido maršrutu uz kartes"
                initialPoints={initialBuilderPoints}
                onUseRoute={handleUseGeneratedRoute}
                className="mt-6"
            />

            <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                    Maršruta kopsavilkums
                </div>
                <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                    Posmi: {selectedSegments.length}
                </div>
                <div className="mt-1 text-[15px] font-semibold text-[#182219]">
                    Kopējais attālums: {totalDistance.toFixed(2)} km
                </div>
            </div>

            <details className="mt-5 rounded-2xl border border-[#e4e9e4] bg-white p-4">
                <summary className="cursor-pointer text-[14px] font-semibold text-[#182219]">
                    Papildu manuāla posmu izvēle
                </summary>

                <div className="mt-5 grid gap-6 xl:grid-cols-2">
                    <ManualAvailableSegments
                        availableSegments={availableSegments}
                        loading={loading}
                        onAddSegment={onAddSegment}
                    />
                    <ManualSelectedSegments
                        selectedSegments={selectedSegments}
                        loading={loading}
                        totalDistance={totalDistance}
                        onRemoveSegment={onRemoveSegment}
                        onMoveSegment={onMoveSegment}
                    />
                </div>
            </details>
        </section>
    );
}

function PresetRouteStep({
    stepNumber,
    routeTemplate,
    expectedStartName,
    expectedEndName,
}: {
    stepNumber: number;
    routeTemplate: RouteTemplate;
    expectedStartName?: string | null;
    expectedEndName?: string | null;
}) {
    const mapData = routeTemplateMapData(routeTemplate);

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                    <RouteIcon className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Maršruta pārskats
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Pasniedzējs šim uzdevumam jau ir definējis maršrutu kartē.
                    Tālāk izvēlies resursus un pārbaudi, vai tavs plāns ir
                    piemērots šai loģistikas ķēdei.
                </p>

                {expectedStartName || expectedEndName ? (
                    <div className="mt-4 rounded-2xl border border-[#d7e5db] bg-[#f8fbf9] p-4 text-[14px] font-semibold text-[#182219]">
                        Uzdevuma maršruts:{' '}
                        {expectedStartName ?? 'sākums nav norādīts'} -&gt;{' '}
                        {expectedEndName ?? 'galamērķis nav norādīts'}
                    </div>
                ) : null}
            </div>

            <LogisticsMap
                origin={mapData.origin}
                destination={mapData.destination}
                landLegs={mapData.landLegs}
                seaLegs={mapData.seaLegs}
                summary={{
                    route_type: routeTemplate.mode ?? 'multimodal',
                    total_distance_km:
                        routeTemplate.total_distance_km ??
                        mapData.totalDistance,
                    total_duration_hours: routeTemplate.total_duration_hours,
                    provider: 'task route',
                }}
                warnings={
                    mapData.landLegs.length + mapData.seaLegs.length === 0
                        ? [
                              'Maršruta līnija nav attēlojama, jo trūkst koordinātu.',
                          ]
                        : []
                }
                className="mt-6"
            />
        </section>
    );
}

function ManualAvailableSegments({
    availableSegments,
    loading,
    onAddSegment,
}: {
    availableSegments: RouteItem[];
    loading: boolean;
    onAddSegment: (segmentId: number) => void | Promise<void>;
}) {
    return (
        <div>
            <h3 className="text-[18px] font-semibold text-[#182219]">
                Pieejamie segmenti
            </h3>

            <div className="mt-4 space-y-3">
                {availableSegments.length > 0 ? (
                    availableSegments.map((segment) => (
                        <div
                            key={segment.id}
                            className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-[16px] font-semibold text-[#182219]">
                                        {routeName(segment, 'from')} -&gt;{' '}
                                        {routeName(segment, 'to')}
                                    </div>
                                    <div className="mt-2 text-[14px] text-[#5b6b61]">
                                        Attālums: {segment.distance_km ?? '-'}{' '}
                                        km
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onAddSegment(segment.id)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-3 py-2 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:opacity-60"
                                >
                                    <Plus className="h-4 w-4" />
                                    Pievienot
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyBlock text="Nav pieejamu maršruta segmentu." />
                )}
            </div>
        </div>
    );
}

function ManualSelectedSegments({
    selectedSegments,
    loading,
    totalDistance,
    onRemoveSegment,
    onMoveSegment,
}: {
    selectedSegments: RouteItem[];
    loading: boolean;
    totalDistance: number;
    onRemoveSegment: (segmentId: number) => void;
    onMoveSegment: (segmentId: number, direction: 'up' | 'down') => void;
}) {
    return (
        <div>
            <h3 className="text-[18px] font-semibold text-[#182219]">
                Izveidotais maršruts
            </h3>

            <div className="mt-4 space-y-3">
                {selectedSegments.length > 0 ? (
                    selectedSegments.map((segment, index) => (
                        <div
                            key={`${segment.id}-${index}`}
                            className="rounded-2xl border border-[#d9ded9] bg-white p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                                        Posms {index + 1}
                                    </div>
                                    <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                        {routeName(segment, 'from')} -&gt;{' '}
                                        {routeName(segment, 'to')}
                                    </div>
                                    <div className="mt-2 text-[14px] text-[#5b6b61]">
                                        Attālums: {segment.distance_km ?? '-'}{' '}
                                        km
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onMoveSegment(segment.id, 'up')
                                            }
                                            disabled={loading || index === 0}
                                            className="inline-flex items-center gap-1 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-50"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            Augstāk
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onMoveSegment(
                                                    segment.id,
                                                    'down',
                                                )
                                            }
                                            disabled={
                                                loading ||
                                                index ===
                                                    selectedSegments.length - 1
                                            }
                                            className="inline-flex items-center gap-1 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-50"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                            Zemāk
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemoveSegment(segment.id)
                                        }
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-60"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Dzēst
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyBlock text="Maršruts vēl nav izveidots." />
                )}
            </div>

            <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] font-semibold text-[#182219]">
                Segmenti: {selectedSegments.length}; attālums:{' '}
                {totalDistance.toFixed(2)} km
            </div>
        </div>
    );
}

function routeLocation(
    segment: RouteItem | undefined,
    side: 'from' | 'to',
): RouteBuilderPoint | null {
    const location: LocationItem | null | undefined =
        side === 'from'
            ? (segment?.fromLocation ?? segment?.from_location)
            : (segment?.toLocation ?? segment?.to_location);

    if (!location || !hasCoordinates(location)) {
        return null;
    }

    return {
        location_id: location.id,
        source: 'local',
        name: location.name,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        city: location.city,
        country: location.country,
        type: 'city',
        is_saved: true,
    };
}

function hasCoordinates(location: LocationItem): boolean {
    return (
        Number.isFinite(Number(location.latitude)) &&
        Number.isFinite(Number(location.longitude))
    );
}

function routeTemplateMapData(routeTemplate: RouteTemplate) {
    const points = [...(routeTemplate.points ?? [])].sort(
        (left, right) =>
            Number(left.sequence ?? 0) - Number(right.sequence ?? 0),
    );
    const legs = [...(routeTemplate.legs ?? [])].sort(
        (left, right) =>
            Number(left.sequence ?? 0) - Number(right.sequence ?? 0),
    );
    const origin = pointToMapLocation(points[0], 'origin');
    const destination = pointToMapLocation(
        points[points.length - 1],
        'destination',
    );
    const landLegs: LogisticsRouteLeg[] = [];
    const seaLegs: LogisticsRouteLeg[] = [];

    legs.forEach((leg, index) => {
        const originPoint = points[index];
        const destinationPoint = points[index + 1];
        const geometry =
            leg.geometry_geojson ??
            lineGeometryFromPoints(originPoint, destinationPoint);

        if (!geometry || leg.type === 'port_handling') {
            return;
        }

        const mapLeg: LogisticsRouteLeg = {
            id: leg.id ?? index,
            type: leg.type === 'sea' ? 'sea' : 'land',
            origin: originPoint?.name ?? null,
            destination: destinationPoint?.name ?? null,
            distance_km: leg.distance_km,
            duration_hours: leg.duration_hours,
            geometry_geojson: geometry,
        };

        if (leg.type === 'sea') {
            seaLegs.push(mapLeg);
        } else {
            landLegs.push(mapLeg);
        }
    });

    return {
        origin,
        destination,
        landLegs,
        seaLegs,
        totalDistance: legs.reduce(
            (sum, leg) => sum + Number(leg.distance_km ?? 0),
            0,
        ),
    };
}

function pointToMapLocation(
    point: RouteTemplatePoint | undefined,
    type: string,
): LogisticsMapLocation | null {
    if (
        !point ||
        !Number.isFinite(Number(point.latitude)) ||
        !Number.isFinite(Number(point.longitude))
    ) {
        return null;
    }

    return {
        id: point.location_id ?? point.id,
        name: point.name,
        latitude: point.latitude ?? null,
        longitude: point.longitude ?? null,
        type,
    };
}

function lineGeometryFromPoints(
    origin: RouteTemplatePoint | undefined,
    destination: RouteTemplatePoint | undefined,
) {
    if (
        !origin ||
        !destination ||
        !Number.isFinite(Number(origin.latitude)) ||
        !Number.isFinite(Number(origin.longitude)) ||
        !Number.isFinite(Number(destination.latitude)) ||
        !Number.isFinite(Number(destination.longitude))
    ) {
        return null;
    }

    return {
        type: 'LineString',
        coordinates: [
            [Number(origin.longitude), Number(origin.latitude)],
            [Number(destination.longitude), Number(destination.latitude)],
        ],
    };
}
