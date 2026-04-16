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

export default function StudentSimulatorShow() {
    const page = usePage<PageProps>();
    const template = page.props.template;
    const initialAttempt = page.props.attempt;

    const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
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

    const currentStepIndex = useMemo(() => {
        const idx = simulatorSteps.findIndex((step) => step.key === attempt.current_step);
        return idx >= 0 ? idx : 0;
    }, [attempt.current_step]);

    const selectedTransport = useMemo(
        () => transports.find((item) => String(item.id) === selectedTransportId) ?? null,
        [transports, selectedTransportId]
    );

    const requiresFuelPlanning = !!template.requires_refuel_planning;
    const canPreview =
        !!selectedTransportId &&
        vehicleCount > 0 &&
        selectedSegments.length > 0 &&
        !!selectedPortId &&
        !!selectedShipId;

    const canSubmit =
        !!attempt.preview_result && attempt.preview_result?.result?.is_valid === true;

    const validateStepTransition = (targetStep: string): string | null => {
        if (targetStep === 'intro' || targetStep === 'transport') {
            return null;
        }

        if (targetStep === 'route') {
            if (!selectedTransportId || vehicleCount < 1) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }
            return null;
        }

        if (targetStep === 'fuel') {
            if (!selectedTransportId || vehicleCount < 1) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }

            if (!selectedSegments.length) {
                return 'Vispirms izveido maršrutu no vismaz viena segmenta.';
            }

            return null;
        }

        if (targetStep === 'port') {
            if (!selectedSegments.length) {
                return 'Vispirms izveido maršrutu no vismaz viena segmenta.';
            }

            if (requiresFuelPlanning && !selectedFuelStations.length) {
                return 'Šim uzdevumam nepieciešams izvēlēties vismaz vienu degvielas pieturu.';
            }

            return null;
        }

        if (targetStep === 'ship') {
            if (!selectedPortId) {
                return 'Vispirms izvēlies ostu.';
            }

            return null;
        }

        if (targetStep === 'simulation') {
            if (!selectedShipId) {
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
        const stepOrder = ['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit'];
        const currentIndex = stepOrder.indexOf(attempt.current_step);

        if (currentIndex <= 0) return;

        await saveStep(stepOrder[currentIndex - 1]);
    };

    const goToVisitedStep = async (stepKey: string, index: number) => {
        const currentIndex = simulatorSteps.findIndex((step) => step.key === attempt.current_step);

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
        const stepOrder = ['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit'];
        const currentIndex = stepOrder.indexOf(attempt.current_step);
        const nextStep = stepOrder[currentIndex + 1];

        if (!nextStep) return;

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
                    />

                    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                        <div className="space-y-6">
                            {attempt.current_step === 'intro' && (
                                <IntroStep
                                    template={template}
                                    loading={loading}
                                    onStart={() => saveStep('transport')}
                                />
                            )}

                            {attempt.current_step === 'transport' && (
                                <TransportStep
                                    transports={transports}
                                    selectedTransportId={selectedTransportId}
                                    setSelectedTransportId={setSelectedTransportId}
                                    vehicleCount={vehicleCount}
                                    setVehicleCount={setVehicleCount}
                                    selectedTransport={selectedTransport}
                                    loading={loading}
                                    onSave={() => saveStep('route')}
                                />
                            )}

                            {attempt.current_step === 'route' && (
                                <RouteBuilderStep
                                    availableSegments={availableSegments}
                                    selectedSegments={selectedSegments}
                                    loading={loading}
                                    onAddSegment={addRouteSegment}
                                    onRemoveSegment={removeRouteSegment}
                                />
                            )}

                            {attempt.current_step === 'fuel' && (
                                <FuelPlanningStep
                                    availableStations={availableFuelStations}
                                    selectedStations={selectedFuelStations}
                                    loading={loading}
                                    onAddStation={addFuelStation}
                                    onRemoveStation={removeFuelStation}
                                />
                            )}

                            {attempt.current_step === 'port' && (
                                <PortSelectionStep
                                    ports={availablePorts}
                                    selectedPortId={selectedPortId}
                                    setSelectedPortId={setSelectedPortId}
                                    loading={loading}
                                />
                            )}

                            {attempt.current_step === 'ship' && (
                                <ShipSelectionStep
                                    ships={availableShips}
                                    selectedShipId={selectedShipId}
                                    setSelectedShipId={setSelectedShipId}
                                    loading={loading}
                                />
                            )}

                            {attempt.current_step === 'simulation' && (
                                <PreviewStep
                                    attempt={attempt}
                                    loading={loading}
                                    canPreview={canPreview}
                                    onPreview={() => saveStep('simulation')}
                                />
                            )}

                            {attempt.current_step === 'submit' && (
                                <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                        Solis 8
                                    </div>

                                    <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                                        Gatavs iesniegšanai
                                    </h2>

                                    <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                        Šis risinājums ir sagatavots iesniegšanai. Pārbaudi kopsavilkumu labajā pusē un
                                        iesniedz gala variantu pārbaudei.
                                    </p>

                                    <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] leading-6 text-[#4d5d53]">
                                        Kad iesniegsi risinājumu, tas parādīsies sadaļā “Mani mēģinājumi” ar gala statusu.
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={submitAttempt}
                                            disabled={loading || attempt.status === 'submitted' || !canSubmit}
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