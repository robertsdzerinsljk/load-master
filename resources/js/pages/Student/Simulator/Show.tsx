import StudentLayout from '@/layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import FuelPlanningStep from '@/components/student/simulator/FuelPlanningStep';
import IntroStep from '@/components/student/simulator/IntroStep';
import PortSelectionStep from '@/components/student/simulator/PortSelectionStep';
import PreviewStep from '@/components/student/simulator/PreviewStep';
import RouteBuilderStep from '@/components/student/simulator/RouteBuilderStep';
import ShipSelectionStep from '@/components/student/simulator/ShipSelectionStep';
import SimulatorHeader from '@/components/student/simulator/SimulatorHeader';
import SimulatorProgress from '@/components/student/simulator/SimulatorProgress';
import SimulatorSummary from '@/components/student/simulator/SimulatorSummary';
import TransportStep from '@/components/student/simulator/TransportStep';

import {
    Attempt,
    PageProps,
    simulatorSteps,
} from '@/components/student/simulator/types';

function getCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

type StudentSimulatorPageProps = PageProps & {
    template: PageProps['template'];
    attempt: Attempt;
    availableSteps?: string[];
};

type TimelineEvent = {
    type: string;
    label: string;
    start_at: string;
    end_at: string;
    duration_minutes: number;
};

type TimelineSummary = {
    started_at?: string | null;
    finished_at?: string | null;
    total_minutes?: number | null;
    total_hours?: number | null;
    deadline_at?: string | null;
    delay_minutes?: number | null;
    is_within_deadline?: boolean;
};

export default function StudentSimulatorShow() {
    const page = usePage<StudentSimulatorPageProps>();
    const template = page.props.template;
    const initialAttempt = page.props.attempt;
    const isExamMode = template.evaluation_mode === 'exam';
    const initialAvailableSteps =
        page.props.availableSteps && page.props.availableSteps.length
            ? page.props.availableSteps
            : ['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit'];

    const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
    const [availableSteps, setAvailableSteps] = useState<string[]>(initialAvailableSteps);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [selectedTransportId, setSelectedTransportId] = useState<string>(
        String(initialAttempt.selected_transport_template_id ?? '')
    );
    const [vehicleCount, setVehicleCount] = useState<number>(
        initialAttempt.selected_vehicle_count ?? 1
    );
    const [selectedPortId, setSelectedPortId] = useState<string>(
        String(initialAttempt.selected_port_id ?? '')
    );
    const [selectedShipId, setSelectedShipId] = useState<string>(
        String(initialAttempt.selected_ship_id ?? '')
    );

    const transports = template.transportTemplates ?? template.transport_templates ?? [];
    const availableSegments = template.landRoutes ?? template.land_routes ?? [];
    const availableFuelStations = template.fuelStations ?? template.fuel_stations ?? [];
    const availablePorts = template.ports ?? [];
    const availableShips = template.ships ?? [];
    const selectedSegments = attempt.ordered_route_segments ?? [];
    const selectedFuelStations = attempt.ordered_fuel_stations ?? [];

    const enabledStepDefs = useMemo(() => {
        return simulatorSteps.filter((step) => availableSteps.includes(step.key));
    }, [availableSteps]);

    const currentStepIndex = useMemo(() => {
        const idx = enabledStepDefs.findIndex((step) => step.key === attempt.current_step);
        return idx >= 0 ? idx : 0;
    }, [attempt.current_step, enabledStepDefs]);

    const currentStepKey = useMemo(() => {
        if (availableSteps.includes(attempt.current_step)) {
            return attempt.current_step;
        }

        return availableSteps[0] ?? 'intro';
    }, [attempt.current_step, availableSteps]);

    const selectedTransport = useMemo(
        () => transports.find((item) => String(item.id) === selectedTransportId) ?? null,
        [transports, selectedTransportId]
    );

    const timeline = (attempt.preview_result as any)?.timeline ?? null;
    const timelineSummary: TimelineSummary | null = timeline?.summary ?? null;
    const timelineEvents: TimelineEvent[] = Array.isArray(timeline?.events)
        ? timeline.events
        : [];

    const MAX_TIMELINE_EVENTS = 20;
    const visibleTimelineEvents = timelineEvents.slice(0, MAX_TIMELINE_EVENTS);
    const hiddenTimelineCount =
        timelineEvents.length > MAX_TIMELINE_EVENTS
            ? timelineEvents.length - MAX_TIMELINE_EVENTS
            : 0;
    {hiddenTimelineCount > 0 ? (
    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
        Timeline ir saīsināts priekšskatījumam. Vēl paslēpti {hiddenTimelineCount} notikumi.
    </div>
    ) : null}

    const hasStep = (stepKey: string) => availableSteps.includes(stepKey);

    const getNextStep = (stepKey: string) => {
        const currentIndex = availableSteps.indexOf(stepKey);

        if (currentIndex === -1) {
            return null;
        }

        return availableSteps[currentIndex + 1] ?? null;
    };

    const getPrevStep = (stepKey: string) => {
        const currentIndex = availableSteps.indexOf(stepKey);

        if (currentIndex <= 0) {
            return null;
        }

        return availableSteps[currentIndex - 1] ?? null;
    };

    const requiresFuelPlanning = hasStep('fuel') && !!template.requires_refuel_planning;

    const canPreview = useMemo(() => {
        if (hasStep('transport')) {
            if (!selectedTransportId || vehicleCount < 1) {
                return false;
            }
        }

        if (hasStep('route')) {
            if (!selectedSegments.length) {
                return false;
            }
        }

        if (hasStep('port')) {
            if (!selectedPortId) {
                return false;
            }
        }

        if (hasStep('ship')) {
            if (!selectedShipId) {
                return false;
            }
        }

        return true;
    }, [
        availableSteps,
        selectedTransportId,
        vehicleCount,
        selectedSegments.length,
        selectedPortId,
        selectedShipId,
    ]);

    const canSubmit =
        !!attempt.preview_result && attempt.preview_result?.result?.is_valid === true;

    const validateStepTransition = (targetStep: string): string | null => {
        if (!hasStep(targetStep)) {
            return 'Šis solis šim scenārijam nav pieejams.';
        }

        if (targetStep === 'intro') {
            return null;
        }

        if (targetStep === 'transport') {
            return null;
        }

        if (targetStep === 'route') {
            if (hasStep('transport') && (!selectedTransportId || vehicleCount < 1)) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }

            return null;
        }

        if (targetStep === 'fuel') {
            if (hasStep('transport') && (!selectedTransportId || vehicleCount < 1)) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }

            if (hasStep('route') && !selectedSegments.length) {
                return 'Vispirms izveido maršrutu no vismaz viena segmenta.';
            }

            return null;
        }

        if (targetStep === 'port') {
            if (hasStep('route') && !selectedSegments.length) {
                return 'Vispirms izveido maršrutu no vismaz viena segmenta.';
            }

            if (requiresFuelPlanning && !selectedFuelStations.length) {
                return 'Šim uzdevumam nepieciešams izvēlēties vismaz vienu degvielas pieturu.';
            }

            return null;
        }

        if (targetStep === 'ship') {
            if (hasStep('port') && !selectedPortId) {
                return 'Vispirms izvēlies ostu.';
            }

            return null;
        }

        if (targetStep === 'simulation') {
            if (hasStep('transport') && (!selectedTransportId || vehicleCount < 1)) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }

            if (hasStep('route') && !selectedSegments.length) {
                return 'Vispirms izveido maršrutu no vismaz viena segmenta.';
            }

            if (requiresFuelPlanning && !selectedFuelStations.length) {
                return 'Šim uzdevumam nepieciešams izvēlēties vismaz vienu degvielas pieturu.';
            }

            if (hasStep('port') && !selectedPortId) {
                return 'Vispirms izvēlies ostu.';
            }

            if (hasStep('ship') && !selectedShipId) {
                return 'Vispirms izvēlies kuģi.';
            }

            return null;
        }

        if (targetStep === 'submit') {
            if (!attempt.preview_result) {
                return 'Vispirms aprēķini preview rezultātu.';
            }

            if (attempt.preview_result?.result?.is_valid === false) {
                return 'Risinājumu nevar iesniegt, kamēr tajā ir kritiskas problēmas.';
            }

            return null;
        }

        return null;
    };

    const saveStep = async (step: string) => {
        const validationError = validateStepTransition(step);

        if (validationError) {
            setMessage(validationError);
            return;
        }

        setLoading(true);
        setMessage(null);

        const payload: Record<string, unknown> = {
            current_step: step,
            selected_vehicle_count: vehicleCount,
        };

        if (selectedTransportId) {
            payload.selected_transport_template_id = Number(selectedTransportId);
        }

        if (selectedPortId) {
            payload.selected_port_id = Number(selectedPortId);
        }

        if (selectedShipId) {
            payload.selected_ship_id = Number(selectedShipId);
        }

        try {
            const response = await fetch(`/student/simulator/attempt/${attempt.id}/step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās saglabāt simulatora progresu.');
                return;
            }

            setAttempt(data.attempt);

            if (Array.isArray(data.available_steps) && data.available_steps.length) {
                setAvailableSteps(data.available_steps);
            }

            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const addRouteSegment = async (segmentId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                `/student/simulator/attempt/${attempt.id}/route-segments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({
                        land_route_id: segmentId,
                    }),
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās pievienot segmentu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const removeRouteSegment = async (segmentId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                `/student/simulator/attempt/${attempt.id}/route-segments/${segmentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās noņemt segmentu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const addFuelStation = async (stationId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                `/student/simulator/attempt/${attempt.id}/fuel-stations`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({
                        fuel_station_id: stationId,
                    }),
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās pievienot degvielas pieturu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const removeFuelStation = async (stationId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                `/student/simulator/attempt/${attempt.id}/fuel-stations/${stationId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās noņemt degvielas pieturu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const goBackStep = async () => {
        const prevStep = getPrevStep(currentStepKey);

        if (!prevStep) {
            return;
        }

        await saveStep(prevStep);
    };

    const goToVisitedStep = async (stepKey: string, index: number) => {
        const currentIndex = enabledStepDefs.findIndex(
            (step) => step.key === currentStepKey
        );

        if (index <= currentIndex) {
            await saveStep(stepKey);
            return;
        }

        const validationError = validateStepTransition(stepKey);

        if (validationError) {
            setMessage(validationError);
            return;
        }

        await saveStep(stepKey);
    };

    const goNextStep = async () => {
        const nextStep = getNextStep(currentStepKey);

        if (!nextStep) {
            return;
        }

        await saveStep(nextStep);
    };

    const submitAttempt = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/student/simulator/attempt/${attempt.id}/submit`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās iesniegt risinājumu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage('Risinājums iesniegts.');
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const introNextStep = getNextStep('intro') ?? 'intro';
    const transportNextStep = getNextStep('transport') ?? 'transport';

    return (
        <>
            <Head title={template.title || 'Studenta simulators'} />

            <StudentLayout>
                <div className="space-y-6">
                    <SimulatorHeader template={template} attempt={attempt} />

                    <SimulatorProgress
                        currentStepIndex={currentStepIndex}
                        loading={loading}
                        onStepClick={goToVisitedStep}
                        onPrev={goBackStep}
                        onNext={goNextStep}
                        availableSteps={availableSteps}
                    />

                    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                        <div className="space-y-6">
                            {currentStepKey === 'intro' && (
                                <IntroStep
                                    template={template}
                                    loading={loading}
                                    onStart={() => saveStep(introNextStep)}
                                />
                            )}

                            {currentStepKey === 'transport' && (
                                <TransportStep
                                    transports={transports}
                                    selectedTransportId={selectedTransportId}
                                    setSelectedTransportId={setSelectedTransportId}
                                    vehicleCount={vehicleCount}
                                    setVehicleCount={setVehicleCount}
                                    selectedTransport={selectedTransport}
                                    loading={loading}
                                    onSave={() => saveStep(transportNextStep)}
                                />
                            )}

                            {currentStepKey === 'route' && (
                                <RouteBuilderStep
                                    availableSegments={availableSegments}
                                    selectedSegments={selectedSegments}
                                    loading={loading}
                                    onAddSegment={addRouteSegment}
                                    onRemoveSegment={removeRouteSegment}
                                />
                            )}

                            {currentStepKey === 'fuel' && (
                                <FuelPlanningStep
                                    availableStations={availableFuelStations}
                                    selectedStations={selectedFuelStations}
                                    loading={loading}
                                    onAddStation={addFuelStation}
                                    onRemoveStation={removeFuelStation}
                                />
                            )}

                            {currentStepKey === 'port' && (
                                <PortSelectionStep
                                    ports={availablePorts}
                                    selectedPortId={selectedPortId}
                                    setSelectedPortId={setSelectedPortId}
                                    loading={loading}
                                />
                            )}

                            {currentStepKey === 'ship' && (
                                <ShipSelectionStep
                                    ships={availableShips}
                                    selectedShipId={selectedShipId}
                                    setSelectedShipId={setSelectedShipId}
                                    loading={loading}
                                />
                            )}

                            {currentStepKey === 'simulation' && (
                                <div className="space-y-6">
                                    <PreviewStep
                                        attempt={attempt}
                                        loading={loading}
                                        canPreview={canPreview}
                                        onPreview={() => saveStep('simulation')}
                                    />

                                    {timelineSummary ? (
                                        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                                Timeline
                                            </div>

                                            <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                                                Laika aprēķina kopsavilkums
                                            </h2>

                                            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                <TimelineStatCard
                                                    label="Sākums"
                                                    value={timelineSummary.started_at}
                                                />
                                                <TimelineStatCard
                                                    label="Beigas"
                                                    value={timelineSummary.finished_at}
                                                />
                                                <TimelineStatCard
                                                    label="Kopējais laiks"
                                                    value={`${timelineSummary.total_minutes ?? '—'} min`}
                                                />
                                                <TimelineStatCard
                                                    label="Kopējais laiks stundās"
                                                    value={`${timelineSummary.total_hours ?? '—'} h`}
                                                />
                                                <TimelineStatCard
                                                    label="Deadline"
                                                    value={
                                                        timelineSummary.deadline_at ??
                                                        'Nav norādīts'
                                                    }
                                                />
                                                <TimelineStatCard
                                                    label="Kavējums"
                                                    value={`${
                                                        timelineSummary.delay_minutes ?? 0
                                                    } min`}
                                                />
                                                <TimelineStatCard
                                                    label="Nepieciešamie reisi"
                                                    value={attempt.preview_result?.result?.required_trips ?? '—'}
                                                />
                                                <TimelineStatCard
                                                    label="Kapacitāte vienā reisā"
                                                    value={attempt.preview_result?.result?.capacity_per_trip ?? '—'}
                                                />
                                                <TimelineStatCard
                                                    label="Transporta kapacitāte"
                                                    value={attempt.preview_result?.result?.vehicle_capacity ?? '—'}
                                                />
                                            </div>

                                            <div className="mt-6 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] leading-6 text-[#4d5d53]">
                                                {timelineSummary.is_within_deadline
                                                    ? 'Maršruts un operāciju ķēde iekļaujas deadline ietvaros.'
                                                    : 'Risinājums neiekļaujas deadline ietvaros.'}
                                            </div>

                                            {timelineEvents.length ? (
                                                <div className="mt-6 space-y-3">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <h3 className="text-[16px] font-semibold text-[#182219]">
                                                            Timeline notikumi
                                                        </h3>

                                                        <div className="text-[13px] text-[#5b6b61]">
                                                            Parādīti {visibleTimelineEvents.length} no {timelineEvents.length} notikumiem
                                                        </div>
                                                    </div>

                                                    {visibleTimelineEvents.map((event, index) => (
                                                        <div
                                                            key={`${event.type}-${index}`}
                                                            className="rounded-2xl border border-[#d9ded9] bg-white px-4 py-4"
                                                        >
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
                                                                    <div>
                                                                        Sākums: {event.start_at}
                                                                    </div>
                                                                    <div>
                                                                        Beigas: {event.end_at}
                                                                    </div>
                                                                    <div>
                                                                        Ilgums:{' '}
                                                                        {event.duration_minutes} min
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </section>
                                    ) : null}
                                </div>
                            )}

                            {currentStepKey === 'submit' && (
                                <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                        Pēdējais solis
                                    </div>

                                    <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                                        Gatavs iesniegšanai
                                    </h2>

                                    <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                        Šis risinājums ir sagatavots iesniegšanai. Pārbaudi
                                        kopsavilkumu labajā pusē un iesniedz gala variantu
                                        pārbaudei.
                                    </p>

                                    <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] leading-6 text-[#4d5d53]">
                                        Kad iesniegsi risinājumu, tas parādīsies sadaļā “Mani
                                        mēģinājumi” ar gala statusu.
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={submitAttempt}
                                            disabled={
                                                loading ||
                                                attempt.status === 'submitted' ||
                                                !canSubmit
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {attempt.status === 'submitted'
                                                ? 'Risinājums jau ir iesniegts'
                                                : 'Iesniegt risinājumu'}
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="space-y-6">
                            <SimulatorSummary template={template} attempt={attempt} />

                            {message ? (
                                <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 shadow-sm">
                                    <div className="text-[14px] font-medium text-amber-800">
                                        {message}
                                    </div>
                                </section>
                            ) : null}
                        </div>
                    </div>
                </div>
            </StudentLayout>
        </>
    );
}

function TimelineStatCard({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] p-4">
            <div className="text-[12px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}