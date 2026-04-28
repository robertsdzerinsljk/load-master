import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import FuelPlanningStep from '@/components/student/simulator/FuelPlanningStep';
import HandlingSelectionPanel from '@/components/student/simulator/HandlingSelectionPanel';
import IntroStep from '@/components/student/simulator/IntroStep';
import PortSelectionStep from '@/components/student/simulator/PortSelectionStep';
import PreviewStep from '@/components/student/simulator/PreviewStep';
import RouteBuilderStep from '@/components/student/simulator/RouteBuilderStep';
import ShipSelectionStep from '@/components/student/simulator/ShipSelectionStep';
import SimulatorHeader from '@/components/student/simulator/SimulatorHeader';
import SimulatorProgress from '@/components/student/simulator/SimulatorProgress';
import TransportStep from '@/components/student/simulator/TransportStep';

import {
    simulatorSteps,
    attemptPortName,
    attemptShipName,
} from '@/components/student/simulator/types';
import type { SimulatorStepStatus ,
    Attempt,
    PageProps,
    TimelineEvent,
    TimelineSummary} from '@/components/student/simulator/types';
import StudentLayout from '@/layouts/StudentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';

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
    simulatorMode?: 'student' | 'teacher';
    actionBaseUrl?: string;
    backHref?: string;
    backLabel?: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function StudentSimulatorShow() {
    const page = usePage<StudentSimulatorPageProps>();
    const template = page.props.template;
    const initialAttempt = page.props.attempt;
    const simulatorMode = page.props.simulatorMode ?? 'student';
    const actionBaseUrl =
        page.props.actionBaseUrl ?? '/student/simulator/attempt';
    const backHref = page.props.backHref ?? '/student';
    const backLabel = page.props.backLabel ?? 'Atpakaļ uz uzdevumiem';
    const isExamMode = template.evaluation_mode === 'exam';
    const Layout = (
        simulatorMode === 'teacher' ? TeacherLayout : StudentLayout
    ) as ComponentType<{
        children: ReactNode;
        active?: 'tasks' | 'attempts' | 'create' | 'orders' | 'students' | 'templates';
    }>;
    const layoutProps =
        simulatorMode === 'teacher'
            ? ({ active: 'templates' } as const)
            : ({ active: 'tasks' } as const);

    const initialAvailableSteps =
        page.props.availableSteps && page.props.availableSteps.length
            ? page.props.availableSteps
            : [
                  'intro',
                  'transport',
                  'route',
                  'fuel',
                  'port',
                  'ship',
                  'simulation',
                  'submit',
              ];

    const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
    const [availableSteps, setAvailableSteps] = useState<string[]>(
        initialAvailableSteps,
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'error' | 'success'>(
        'error',
    );
    const [showToast, setShowToast] = useState(false);

    const [selectedTransportId, setSelectedTransportId] = useState<string>(
        String(initialAttempt.selected_transport_template_id ?? ''),
    );
    const [vehicleCount, setVehicleCount] = useState<number>(
        initialAttempt.selected_vehicle_count ?? 1,
    );
    const [selectedPortId, setSelectedPortId] = useState<string>(
        String(initialAttempt.selected_port_id ?? ''),
    );
    const [selectedShipId, setSelectedShipId] = useState<string>(
        String(initialAttempt.selected_ship_id ?? ''),
    );
    const [selectedLoadingMethodCode, setSelectedLoadingMethodCode] =
        useState<string>(initialAttempt.selected_loading_method_code ?? '');
    const [selectedUnloadingMethodCode, setSelectedUnloadingMethodCode] =
        useState<string>(initialAttempt.selected_unloading_method_code ?? '');
    const [loadingMethodSource, setLoadingMethodSource] = useState<string>(
        initialAttempt.loading_method_source ?? 'port',
    );
    const [unloadingMethodSource, setUnloadingMethodSource] = useState<string>(
        initialAttempt.unloading_method_source ?? 'ship',
    );

    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

    const lastSavedDraftRef = useRef(
        JSON.stringify({
            selectedTransportId: String(
                initialAttempt.selected_transport_template_id ?? '',
            ),
            vehicleCount: initialAttempt.selected_vehicle_count ?? 1,
            selectedPortId: String(initialAttempt.selected_port_id ?? ''),
            selectedShipId: String(initialAttempt.selected_ship_id ?? ''),
            selectedLoadingMethodCode:
                initialAttempt.selected_loading_method_code ?? '',
            selectedUnloadingMethodCode:
                initialAttempt.selected_unloading_method_code ?? '',
            loadingMethodSource: initialAttempt.loading_method_source ?? 'port',
            unloadingMethodSource:
                initialAttempt.unloading_method_source ?? 'ship',
        }),
    );

    useEffect(() => {
        if (!message) {
            setShowToast(false);

            return;
        }

        setShowToast(true);

        const hideTimer = window.setTimeout(() => {
            setShowToast(false);
        }, 4000);

        const clearTimer = window.setTimeout(() => {
            setMessage(null);
        }, 4600);

        return () => {
            window.clearTimeout(hideTimer);
            window.clearTimeout(clearTimer);
        };
    }, [message]);

    const transports =
        template.transportTemplates ?? template.transport_templates ?? [];
    const availableSegments = template.landRoutes ?? template.land_routes ?? [];
    const availableFuelStations =
        template.fuelStations ?? template.fuel_stations ?? [];
    const availablePorts = template.ports ?? [];
    const availableShips = template.ships ?? [];
    const selectedSegments = attempt.ordered_route_segments ?? [];
    const selectedFuelStations = attempt.ordered_fuel_stations ?? [];
    const handlingContext = attempt.handling_context ?? null;
    const loadingSelectionRequired = !!handlingContext?.loading?.required;
    const unloadingSelectionRequired = !!handlingContext?.unloading?.required;
    const handlingErrors = handlingContext?.validation?.errors ?? [];

    const [highlightStep, setHighlightStep] = useState<string | null>(null);
    const [pendingProblemStep, setPendingProblemStep] = useState<string | null>(
        null,
    );
    const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const buildAttemptUrl = (suffix = '') =>
        `${actionBaseUrl}/${attempt.id}${suffix}`;

    const enabledStepDefs = useMemo(() => {
        return simulatorSteps.filter((step) =>
            availableSteps.includes(step.key),
        );
    }, [availableSteps]);

    const currentStepIndex = useMemo(() => {
        const idx = enabledStepDefs.findIndex(
            (step) => step.key === attempt.current_step,
        );

        return idx >= 0 ? idx : 0;
    }, [attempt.current_step, enabledStepDefs]);
    const currentStepNumber = currentStepIndex + 1;

    const currentStepKey = useMemo(() => {
        if (availableSteps.includes(attempt.current_step)) {
            return attempt.current_step;
        }

        return availableSteps[0] ?? 'intro';
    }, [attempt.current_step, availableSteps]);

    const selectedTransport = useMemo(
        () =>
            transports.find(
                (item) => String(item.id) === selectedTransportId,
            ) ?? null,
        [transports, selectedTransportId],
    );

    const timeline = attempt.preview_result?.timeline ?? null;
    const timelineSummary: TimelineSummary | null = timeline?.summary ?? null;
    const timelineEvents: TimelineEvent[] = Array.isArray(timeline?.events)
        ? timeline.events
        : [];
    const isSubmittedAttempt =
        attempt.status === 'submitted' ||
        attempt.status === 'teacher_test_submitted';

    useEffect(() => {
        const loadingSources =
            handlingContext?.loading?.sources?.filter((source) => source.enabled) ??
            [];
        const unloadingSources =
            handlingContext?.unloading?.sources?.filter((source) => source.enabled) ??
            [];
        const nextLoadingSource =
            loadingSources.find((source) => source.key === loadingMethodSource)
                ?.key ??
            loadingSources[0]?.key ??
            '';
        const nextUnloadingSource =
            unloadingSources.find((source) => source.key === unloadingMethodSource)
                ?.key ??
            unloadingSources[0]?.key ??
            '';

        if (nextLoadingSource !== loadingMethodSource) {
            setLoadingMethodSource(nextLoadingSource);
        }

        if (nextUnloadingSource !== unloadingMethodSource) {
            setUnloadingMethodSource(nextUnloadingSource);
        }

        const activeLoadingSource = loadingSources.find(
            (source) => source.key === nextLoadingSource,
        );
        const activeUnloadingSource = unloadingSources.find(
            (source) => source.key === nextUnloadingSource,
        );

        if (
            selectedLoadingMethodCode &&
            !activeLoadingSource?.methods.some(
                (method) => method.code === selectedLoadingMethodCode,
            )
        ) {
            setSelectedLoadingMethodCode('');
        }

        if (
            selectedUnloadingMethodCode &&
            !activeUnloadingSource?.methods.some(
                (method) => method.code === selectedUnloadingMethodCode,
            )
        ) {
            setSelectedUnloadingMethodCode('');
        }
    }, [
        handlingContext,
        loadingMethodSource,
        selectedLoadingMethodCode,
        selectedUnloadingMethodCode,
        unloadingMethodSource,
    ]);

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

    const setStepRef = (stepKey: string) => (node: HTMLDivElement | null) => {
        stepRefs.current[stepKey] = node;
    };

    const draftFingerprint = useMemo(
        () =>
            JSON.stringify({
                selectedTransportId,
                vehicleCount,
                selectedPortId,
                selectedShipId,
                selectedLoadingMethodCode,
                selectedUnloadingMethodCode,
                loadingMethodSource,
                unloadingMethodSource,
            }),
        [
            selectedPortId,
            selectedShipId,
            selectedTransportId,
            vehicleCount,
            selectedLoadingMethodCode,
            selectedUnloadingMethodCode,
            loadingMethodSource,
            unloadingMethodSource,
        ],
    );

    const markSaved = (fingerprint = draftFingerprint) => {
        lastSavedDraftRef.current = fingerprint;
        setSaveState('saved');
        setLastSavedAt(new Date().toISOString());
    };

    const syncAttemptResponse = (data: {
        attempt: Attempt;
        available_steps?: string[];
    }) => {
        setAttempt(data.attempt);

        setSelectedTransportId(
            String(data.attempt.selected_transport_template_id ?? ''),
        );
        setVehicleCount(data.attempt.selected_vehicle_count ?? 1);
        setSelectedPortId(String(data.attempt.selected_port_id ?? ''));
        setSelectedShipId(String(data.attempt.selected_ship_id ?? ''));
        setSelectedLoadingMethodCode(
            data.attempt.selected_loading_method_code ?? '',
        );
        setSelectedUnloadingMethodCode(
            data.attempt.selected_unloading_method_code ?? '',
        );
        setLoadingMethodSource(data.attempt.loading_method_source ?? 'port');
        setUnloadingMethodSource(data.attempt.unloading_method_source ?? 'ship');

        if (
            Array.isArray(data.available_steps) &&
            data.available_steps.length
        ) {
            setAvailableSteps(data.available_steps);
        }
    };

    const pickEarliestAvailableStep = (
        ...candidates: Array<string | null | undefined>
    ): string | null => {
        const filtered = [
            ...new Set(
                candidates.filter(
                    (candidate): candidate is string =>
                        !!candidate && availableSteps.includes(candidate),
                ),
            ),
        ];

        if (!filtered.length) {
            return null;
        }

        filtered.sort(
            (left, right) =>
                availableSteps.indexOf(left) - availableSteps.indexOf(right),
        );

        return filtered[0] ?? null;
    };

    const resolvePenaltyStep = (penaltyKey?: string | null): string | null => {
        switch (penaltyKey) {
            case 'insufficient_vehicles':
            case 'too_many_trips':
                return pickEarliestAvailableStep('transport', 'simulation');
            case 'route_chain':
            case 'deadline_delay':
                return pickEarliestAvailableStep('route', 'simulation');
            case 'missing_fuel_stop':
            case 'range_plan_invalid':
                return pickEarliestAvailableStep('fuel', 'simulation');
            case 'handling_selection':
            case 'port_ship_compatibility':
                return pickEarliestAvailableStep('ship', 'port', 'simulation');
            default:
                return null;
        }
    };

    const detectSubmissionProblemStep = (): string | null => {
        const penalties =
            attempt.preview_result?.result?.score_breakdown?.penalties ?? [];

        const penaltySteps = penalties
            .map((penalty) => resolvePenaltyStep(penalty.key))
            .filter((step): step is string => !!step);

        return pickEarliestAvailableStep(
            hasStep('transport') && (!selectedTransportId || vehicleCount < 1)
                ? 'transport'
                : null,
            hasStep('route') && !selectedSegments.length ? 'route' : null,
            requiresFuelPlanning && !selectedFuelStations.length
                ? 'fuel'
                : null,
            hasStep('port') && !selectedPortId ? 'port' : null,
            hasStep('ship') && !selectedShipId ? 'ship' : null,
            hasStep('ship') &&
            loadingSelectionRequired &&
            !selectedLoadingMethodCode
                ? 'ship'
                : null,
            hasStep('ship') &&
            unloadingSelectionRequired &&
            !selectedUnloadingMethodCode
                ? 'ship'
                : null,
            hasStep('ship') && handlingErrors.length ? 'ship' : null,
            ...penaltySteps,
            'simulation',
        );
    };

    async function focusProblemStep(targetStep: string | null) {
        if (isExamMode || !targetStep || !availableSteps.includes(targetStep)) {
            return;
        }

        setPendingProblemStep(targetStep);

        if (currentStepKey !== targetStep) {
            await saveStep(targetStep, {
                preserveMessage: true,
                skipProblemRedirect: true,
            });
        }
    }

    useEffect(() => {
        if (!pendingProblemStep || currentStepKey !== pendingProblemStep) {
            return;
        }

        const target = stepRefs.current[pendingProblemStep];

        if (!target) {
            return;
        }

        setHighlightStep(pendingProblemStep);
        setPendingProblemStep(null);

        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        const clearHighlight = window.setTimeout(() => {
            setHighlightStep((current) =>
                current === pendingProblemStep ? null : current,
            );
        }, 2500);

        return () => {
            window.clearTimeout(clearHighlight);
        };
    }, [currentStepKey, pendingProblemStep]);

    const requiresFuelPlanning =
        hasStep('fuel') && !!template.requires_refuel_planning;
    const isHandlingReady =
        (!loadingSelectionRequired || !!selectedLoadingMethodCode) &&
        (!unloadingSelectionRequired || !!selectedUnloadingMethodCode);

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

            if (!isHandlingReady) {
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
        selectedLoadingMethodCode,
        selectedUnloadingMethodCode,
        isHandlingReady,
    ]);

    const hasPreview = !!attempt.preview_result;
    const isPreviewValid = attempt.preview_result?.result?.is_valid === true;
    const showLegacyHandlingPanel = false as boolean;

    const stepStatuses = useMemo<Record<string, SimulatorStepStatus>>(() => {
        const statuses: Record<string, SimulatorStepStatus> = {};
        const practiceProblemSteps = new Set<string>();
        const penalties =
            attempt.preview_result?.result?.score_breakdown?.penalties ?? [];

        if (!isExamMode) {
            for (const penalty of penalties) {
                const step = resolvePenaltyStep(penalty.key);

                if (step) {
                    practiceProblemSteps.add(step);
                }
            }

            if (
                hasPreview &&
                !isPreviewValid &&
                practiceProblemSteps.size === 0
            ) {
                practiceProblemSteps.add('simulation');
            }
        }

        statuses.intro =
            currentStepKey === 'intro'
                ? {
                      label: 'Aktīvs',
                      tone: 'info',
                      detail: 'Sāc risinājumu šeit',
                  }
                : {
                      label: 'Pabeigts',
                      tone: 'success',
                  };

        if (hasStep('transport')) {
            statuses.transport =
                !selectedTransportId || vehicleCount < 1
                    ? {
                          label: 'Trūkst dati',
                          tone: 'warning',
                          detail: 'Izvēlies transportu un skaitu',
                      }
                    : practiceProblemSteps.has('transport')
                      ? {
                            label: 'Jāizlabo',
                            tone: 'danger',
                            detail: 'Nepietiek kapacitātes šim risinājumam',
                        }
                      : {
                            label: 'Pabeigts',
                            tone: 'success',
                        };
        }

        if (hasStep('route')) {
            statuses.route = !selectedSegments.length
                ? {
                      label: 'Trūkst dati',
                      tone: 'warning',
                      detail: 'Pievieno vismaz vienu segmentu',
                  }
                : practiceProblemSteps.has('route')
                  ? {
                        label: 'Jāizlabo',
                        tone: 'danger',
                        detail: 'Pārbaudi ķēdi vai termiņu',
                    }
                  : {
                        label: 'Pabeigts',
                        tone: 'success',
                    };
        }

        if (hasStep('fuel')) {
            statuses.fuel =
                requiresFuelPlanning && !selectedFuelStations.length
                    ? {
                          label: 'Trūkst dati',
                          tone: 'warning',
                          detail: 'Izvēlies degvielas pieturu',
                      }
                    : practiceProblemSteps.has('fuel')
                      ? {
                            label: 'Jāizlabo',
                            tone: 'danger',
                            detail: 'Pārbaudi attālumus starp uzpildēm',
                        }
                      : !requiresFuelPlanning && !selectedFuelStations.length
                        ? {
                              label: 'Neobligāts',
                              tone: 'neutral',
                              detail: 'Šim scenārijam nav obligāts',
                          }
                        : {
                              label: 'Pabeigts',
                              tone: 'success',
                          };
        }

        if (hasStep('port')) {
            statuses.port = !selectedPortId
                ? {
                      label: 'Trūkst dati',
                      tone: 'warning',
                      detail: 'Izvēlies ostu',
                  }
                : practiceProblemSteps.has('port')
                  ? {
                        label: 'Jāizlabo',
                        tone: 'danger',
                        detail: 'Pārbaudi ostas izvēli',
                    }
                  : {
                        label: 'Pabeigts',
                        tone: 'success',
                    };
        }

        if (hasStep('ship')) {
            statuses.ship = !selectedShipId
                ? {
                      label: 'Trūkst dati',
                      tone: 'warning',
                      detail: 'Izvēlies kuģi',
                  }
                : !isHandlingReady &&
                    ((loadingSelectionRequired &&
                        !selectedLoadingMethodCode) ||
                        (unloadingSelectionRequired &&
                            !selectedUnloadingMethodCode))
                  ? {
                        label: 'Trūkst dati',
                        tone: 'warning',
                        detail: 'Izvēlies iekraušanas un izkraušanas metodi',
                    }
                  : handlingErrors.length > 0
                    ? {
                          label: 'JÄizlabo',
                          tone: 'danger',
                          detail:
                              handlingErrors[0] ??
                              'Apstrades plans nav derigs',
                      }
                  : practiceProblemSteps.has('ship')
                    ? {
                          label: 'Jāizlabo',
                          tone: 'danger',
                          detail: 'Kuģis nav saderīgs ar risinājumu',
                      }
                    : {
                          label: 'Pabeigts',
                          tone: 'success',
                      };
        }

        if (hasStep('simulation')) {
            statuses.simulation =
                !hasPreview && !canPreview
                    ? {
                          label: 'Gaida datus',
                          tone: 'neutral',
                          detail: 'Pabeidz iepriekšējos soļus',
                      }
                    : !hasPreview
                      ? {
                            label: 'Jāpalaiž',
                            tone: 'warning',
                            detail:
                                'Palaid simulāciju un apskati notikumu ķēdi',
                        }
                      : isPreviewValid
                        ? {
                              label: 'Derīgs',
                              tone: 'success',
                              detail: 'Simulācija ir gatava iesniegšanai',
                          }
                        : isExamMode
                          ? {
                                label: 'Nav gatavs',
                                tone: 'warning',
                                detail: 'Iesniegšana pašlaik bloķēta',
                            }
                          : {
                                label: 'Jāizlabo',
                                tone: 'danger',
                                detail: 'Simulācija atrada kritiskas problēmas',
                            };
        }

        if (hasStep('submit')) {
            statuses.submit = isSubmittedAttempt
                ? {
                      label: 'Iesniegts',
                      tone: 'success',
                  }
                : !hasPreview
                  ? {
                        label: 'Bloķēts',
                        tone: 'neutral',
                        detail: 'Vispirms jāpalaiž simulācija',
                    }
                  : isPreviewValid
                    ? {
                          label: 'Gatavs',
                          tone: 'success',
                          detail: 'Risinājumu var iesniegt',
                      }
                    : {
                          label: 'Bloķēts',
                          tone: isExamMode ? 'warning' : 'neutral',
                          detail: isExamMode
                              ? 'Risinājums vēl neatbilst prasībām'
                              : 'Novērs problēmas practice režīmā',
                      };
        }

        return statuses;
    }, [
        availableSteps,
        attempt.preview_result,
        attempt.status,
        canPreview,
        currentStepKey,
        hasPreview,
        isExamMode,
        isPreviewValid,
        requiresFuelPlanning,
        selectedFuelStations.length,
        selectedPortId,
        selectedSegments.length,
        selectedShipId,
        selectedTransportId,
        vehicleCount,
        selectedLoadingMethodCode,
        selectedUnloadingMethodCode,
        loadingSelectionRequired,
        unloadingSelectionRequired,
        isHandlingReady,
        handlingErrors.length,
    ]);

    const buildStepPayload = (step: string): Record<string, unknown> => {
        return {
            current_step: step,
            selected_vehicle_count: vehicleCount,
            selected_transport_template_id: selectedTransportId
                ? Number(selectedTransportId)
                : null,
            selected_port_id: selectedPortId ? Number(selectedPortId) : null,
            selected_ship_id: selectedShipId ? Number(selectedShipId) : null,
            selected_loading_method_code: selectedLoadingMethodCode || null,
            selected_unloading_method_code: selectedUnloadingMethodCode || null,
            loading_method_source: loadingMethodSource || null,
            unloading_method_source: unloadingMethodSource || null,
        };
    };

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
            if (
                hasStep('transport') &&
                (!selectedTransportId || vehicleCount < 1)
            ) {
                return 'Vispirms izvēlies transportu un norādi transportu skaitu.';
            }

            return null;
        }

        if (targetStep === 'fuel') {
            if (
                hasStep('transport') &&
                (!selectedTransportId || vehicleCount < 1)
            ) {
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
            if (
                hasStep('transport') &&
                (!selectedTransportId || vehicleCount < 1)
            ) {
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

            if (loadingSelectionRequired && !selectedLoadingMethodCode) {
                return 'Vispirms izvēlies iekraušanas metodi.';
            }

            if (unloadingSelectionRequired && !selectedUnloadingMethodCode) {
                return 'Vispirms izvēlies izkraušanas metodi.';
            }

            if (handlingErrors.length) {
                return handlingErrors[0] ?? 'Apstrades plans nav derigs.';
            }

            return null;
        }

        if (targetStep === 'submit') {
            if (!attempt.preview_result) {
                return 'Vispirms palaid simulāciju.';
            }

            if (attempt.preview_result?.result?.is_valid === false) {
                return 'Risinājumu nevar iesniegt, kamēr tajā ir kritiskas problēmas.';
            }

            return null;
        }

        return null;
    };

    const saveDraft = async (step: string, fingerprint: string) => {
        setSaveState('saving');

        try {
            const response = await fetch(buildAttemptUrl('/draft'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(buildStepPayload(step)),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.attempt) {
                    syncAttemptResponse(data);
                }

                setSaveState('error');

                return;
            }

            syncAttemptResponse(data);
            markSaved(fingerprint);
        } catch (error) {
            console.error(error);
            setSaveState('error');
        }
    };

    useEffect(() => {
        if (!['transport', 'port', 'ship'].includes(currentStepKey)) {
            return;
        }

        if (draftFingerprint === lastSavedDraftRef.current) {
            return;
        }

        const timer = window.setTimeout(() => {
            void saveDraft(currentStepKey, draftFingerprint);
        }, 700);

        return () => {
            window.clearTimeout(timer);
        };
    }, [currentStepKey, draftFingerprint]);

    async function saveStep(
        step: string,
        options: {
            preserveMessage?: boolean;
            skipProblemRedirect?: boolean;
        } = {},
    ) {
        const validationError = validateStepTransition(step);

        if (validationError) {
            setMessageType('error');
            setMessage(validationError);

            if (step === 'submit' && !options.skipProblemRedirect) {
                await focusProblemStep(detectSubmissionProblemStep());
            }

            return;
        }

        setLoading(true);

        if (!options.preserveMessage) {
            setMessage(null);
        }

        try {
            const response = await fetch(buildAttemptUrl('/step'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(buildStepPayload(step)),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.attempt) {
                    syncAttemptResponse(data);
                }

                setMessageType('error');
                setSaveState('error');
                setMessage(data.message || 'Neizdevās iesniegt risinājumu.');

                if (step === 'submit' && !options.skipProblemRedirect) {
                    await focusProblemStep(
                        data.target_step ?? detectSubmissionProblemStep(),
                    );
                }

                return;
            }

            syncAttemptResponse(data);
            markSaved();

            if (!options.preserveMessage) {
                setMessage(null);
            }
        } catch (error) {
            console.error(error);
            setMessageType('error');
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    }

    const addRouteSegment = async (segmentId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(buildAttemptUrl('/route-segments'), {
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
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās pievienot segmentu.');

                return;
            }

            syncAttemptResponse(data);
            markSaved();
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
                buildAttemptUrl(`/route-segments/${segmentId}`),
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās noņemt segmentu.');

                return;
            }

            syncAttemptResponse(data);
            markSaved();
            setMessage(null);
        } catch (error) {
            console.error(error);
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const moveRouteSegment = async (
        segmentId: number,
        direction: 'up' | 'down',
    ) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                buildAttemptUrl(`/route-segments/${segmentId}/move`),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({ direction }),
                    credentials: 'same-origin',
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās pārvietot segmentu.');

                return;
            }

            syncAttemptResponse(data);
            markSaved();
            setMessage(null);
        } catch (error) {
            console.error(error);
            setSaveState('error');
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const addFuelStation = async (stationId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(buildAttemptUrl('/fuel-stations'), {
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
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || 'Neizdevās pievienot degvielas pieturu.',
                );

                return;
            }

            syncAttemptResponse(data);
            markSaved();
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
                buildAttemptUrl(`/fuel-stations/${stationId}`),
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || 'Neizdevās noņemt degvielas pieturu.',
                );

                return;
            }

            syncAttemptResponse(data);
            markSaved();
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
            (step) => step.key === currentStepKey,
        );

        if (index <= currentIndex) {
            await saveStep(stepKey);

            return;
        }

        const validationError = validateStepTransition(stepKey);

        if (validationError) {
            setMessageType('error');
            setMessage(validationError);

            if (stepKey === 'submit') {
                await focusProblemStep(detectSubmissionProblemStep());
            }

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
            const response = await fetch(buildAttemptUrl('/submit'), {
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
                setMessageType('error');
                setSaveState('error');
                setMessage(data.message || 'Neizdevās iesniegt risinājumu.');

                if (!isExamMode) {
                    await focusProblemStep(
                        data.target_step ?? detectSubmissionProblemStep(),
                    );
                }

                return;
            }

            syncAttemptResponse({ attempt: data.attempt });
            markSaved();
            setMessageType('success');
            setMessage('Risinājums iesniegts.');
        } catch (error) {
            console.error(error);
            setMessageType('error');
            setSaveState('error');
            setSaveState('error');
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const moveFuelStation = async (
        stationId: number,
        direction: 'up' | 'down',
    ) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                buildAttemptUrl(`/fuel-stations/${stationId}/move`),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({ direction }),
                    credentials: 'same-origin',
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || 'Neizdevās pārvietot degvielas pieturu.',
                );

                return;
            }

            syncAttemptResponse(data);
            markSaved();
            setMessage(null);
        } catch (error) {
            console.error(error);
            setSaveState('error');
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const introNextStep = getNextStep('intro') ?? 'intro';
    const transportNextStep = getNextStep('transport') ?? 'transport';

    return (
        <>
            <Head
                title={
                    simulatorMode === 'teacher'
                        ? template.title || 'Scenārija testēšana'
                        : template.title || 'Studenta simulators'
                }
            />

            {message ? (
                <div
                    className={`pointer-events-none fixed top-5 left-1/2 z-[9999] -translate-x-1/2 transform transition-all duration-500 ${
                        showToast
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-3 opacity-0'
                    }`}
                >
                    <div
                        className={`pointer-events-auto flex max-w-[90vw] min-w-[320px] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
                            messageType === 'error'
                                ? 'border-red-300 bg-red-600 text-white'
                                : 'border-emerald-300 bg-emerald-600 text-white'
                        }`}
                    >
                        <div className="mt-0.5 text-sm font-semibold">
                            {messageType === 'error' ? 'Kļūda' : 'Veiksmīgi'}
                        </div>

                        <div className="flex-1 text-sm leading-6">
                            {message}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowToast(false);
                                window.setTimeout(() => setMessage(null), 500);
                            }}
                            className="rounded-md px-2 py-1 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ) : null}

            <Layout {...layoutProps}>
                <div className="space-y-6">
                    <SimulatorHeader
                        template={template}
                        attempt={attempt}
                        saveState={saveState}
                        lastSavedAt={lastSavedAt}
                        backHref={backHref}
                        backLabel={backLabel}
                        simulatorMode={simulatorMode}
                    />

                    <SimulatorProgress
                        currentStepIndex={currentStepIndex}
                        highlightStep={highlightStep}
                        loading={loading}
                        stepStatuses={stepStatuses}
                        scenarioStartAt={template.scenario_start_at}
                        deadlineAt={
                            template.deadline_at ?? template.deadline_date
                        }
                        timelineEvents={timelineEvents}
                        timelineSummary={timelineSummary}
                        onStepClick={goToVisitedStep}
                        onPrev={goBackStep}
                        onNext={goNextStep}
                        availableSteps={availableSteps}
                        hideNextButton={currentStepKey === 'intro'}
                        isExamMode={isExamMode}
                    />

                    <div
                        ref={setStepRef(currentStepKey)}
                        className={`scroll-mt-24 space-y-6 ${
                            highlightStep === currentStepKey
                                ? 'rounded-[24px] border-2 border-red-500 p-1 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]'
                                : ''
                        }`}
                    >
                            {currentStepKey === 'intro' && (
                                <IntroStep
                                    template={template}
                                    loading={loading}
                                    onStart={() => saveStep(introNextStep)}
                                />
                            )}

                            {currentStepKey === 'transport' && (
                                <TransportStep
                                    stepNumber={currentStepNumber}
                                    transports={transports}
                                    selectedTransportId={selectedTransportId}
                                    setSelectedTransportId={
                                        setSelectedTransportId
                                    }
                                    vehicleCount={vehicleCount}
                                    setVehicleCount={setVehicleCount}
                                    selectedTransport={selectedTransport}
                                    loading={loading}
                                    onSave={() => saveStep(transportNextStep)}
                                />
                            )}

                            {currentStepKey === 'route' && (
                                <RouteBuilderStep
                                    stepNumber={currentStepNumber}
                                    availableSegments={availableSegments}
                                    selectedSegments={selectedSegments}
                                    loading={loading}
                                    onAddSegment={addRouteSegment}
                                    onRemoveSegment={removeRouteSegment}
                                    onMoveSegment={moveRouteSegment}
                                />
                            )}

                            {currentStepKey === 'fuel' && (
                                <FuelPlanningStep
                                    stepNumber={currentStepNumber}
                                    availableStations={availableFuelStations}
                                    selectedStations={selectedFuelStations}
                                    loading={loading}
                                    onAddStation={addFuelStation}
                                    onRemoveStation={removeFuelStation}
                                    onMoveStation={moveFuelStation}
                                />
                            )}

                            {currentStepKey === 'port' && (
                                <PortSelectionStep
                                    stepNumber={currentStepNumber}
                                    ports={availablePorts}
                                    selectedPortId={selectedPortId}
                                    setSelectedPortId={setSelectedPortId}
                                    loading={loading}
                                />
                            )}

                            {currentStepKey === 'ship' && (
                                <div className="space-y-6">
                                    <ShipSelectionStep
                                        stepNumber={currentStepNumber}
                                        ships={availableShips}
                                        selectedShipId={selectedShipId}
                                        setSelectedShipId={setSelectedShipId}
                                        loading={loading}
                                    />

                                    <HandlingSelectionPanel
                                        stepNumber={currentStepNumber}
                                        handlingContext={handlingContext}
                                        selectedPortName={attemptPortName(attempt)}
                                        selectedShipName={attemptShipName(attempt)}
                                        selectedLoadingMethodCode={
                                            selectedLoadingMethodCode
                                        }
                                        selectedUnloadingMethodCode={
                                            selectedUnloadingMethodCode
                                        }
                                        loadingMethodSource={loadingMethodSource}
                                        unloadingMethodSource={
                                            unloadingMethodSource
                                        }
                                        setSelectedLoadingMethodCode={
                                            setSelectedLoadingMethodCode
                                        }
                                        setSelectedUnloadingMethodCode={
                                            setSelectedUnloadingMethodCode
                                        }
                                        setLoadingMethodSource={
                                            setLoadingMethodSource
                                        }
                                        setUnloadingMethodSource={
                                            setUnloadingMethodSource
                                        }
                                        loadingDurationMinutes={
                                            attempt.loading_duration_minutes
                                        }
                                        unloadingDurationMinutes={
                                            attempt.unloading_duration_minutes
                                        }
                                        loading={loading}
                                    />

                                    {showLegacyHandlingPanel && (
                                        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                                            Kravas apstrāde
                                        </div>

                                        <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#182219]">
                                            Izvēlies iekraušanas un izkraušanas
                                            metodi
                                        </h3>

                                        <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                            Norādi, kā krava tiks iekrauta un
                                            izkrauta. Šīs izvēles tiks
                                            pārbaudītas pret ostas, kuģa un
                                            scenārija prasībām.
                                        </p>

                                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[#1f2a21]">
                                                    Iekraušanas metode
                                                </label>
                                                <select
                                                    value={
                                                        selectedLoadingMethodCode
                                                    }
                                                    onChange={(e) =>
                                                        setSelectedLoadingMethodCode(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-[#d7ddd8] bg-white px-4 py-3 text-sm text-[#1f2a21] outline-none transition focus:border-[#166a4d] focus:ring-2 focus:ring-[#166a4d]/10"
                                                >
                                                    <option value="">
                                                        Izvēlies metodi...
                                                    </option>
                                                    <option value="conveyor">
                                                        Conveyor
                                                    </option>
                                                    <option value="crane">
                                                        Crane
                                                    </option>
                                                    <option value="forklift">
                                                        Forklift
                                                    </option>
                                                    <option value="manual">
                                                        Manual labor
                                                    </option>
                                                    <option value="pump">
                                                        Pump
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[#1f2a21]">
                                                    Iekraušanas avots
                                                </label>
                                                <select
                                                    value={loadingMethodSource}
                                                    onChange={(e) =>
                                                        setLoadingMethodSource(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-[#d7ddd8] bg-white px-4 py-3 text-sm text-[#1f2a21] outline-none transition focus:border-[#166a4d] focus:ring-2 focus:ring-[#166a4d]/10"
                                                >
                                                    <option value="port">
                                                        Port
                                                    </option>
                                                    <option value="ship">
                                                        Ship
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[#1f2a21]">
                                                    Izkraušanas metode
                                                </label>
                                                <select
                                                    value={
                                                        selectedUnloadingMethodCode
                                                    }
                                                    onChange={(e) =>
                                                        setSelectedUnloadingMethodCode(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-[#d7ddd8] bg-white px-4 py-3 text-sm text-[#1f2a21] outline-none transition focus:border-[#166a4d] focus:ring-2 focus:ring-[#166a4d]/10"
                                                >
                                                    <option value="">
                                                        Izvēlies metodi...
                                                    </option>
                                                    <option value="conveyor">
                                                        Conveyor
                                                    </option>
                                                    <option value="crane">
                                                        Crane
                                                    </option>
                                                    <option value="forklift">
                                                        Forklift
                                                    </option>
                                                    <option value="manual">
                                                        Manual labor
                                                    </option>
                                                    <option value="pump">
                                                        Pump
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[#1f2a21]">
                                                    Izkraušanas avots
                                                </label>
                                                <select
                                                    value={
                                                        unloadingMethodSource
                                                    }
                                                    onChange={(e) =>
                                                        setUnloadingMethodSource(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-[#d7ddd8] bg-white px-4 py-3 text-sm text-[#1f2a21] outline-none transition focus:border-[#166a4d] focus:ring-2 focus:ring-[#166a4d]/10"
                                                >
                                                    <option value="port">
                                                        Port
                                                    </option>
                                                    <option value="ship">
                                                        Ship
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                        </section>
                                    )}
                                </div>
                            )}

                            {currentStepKey === 'simulation' && (
                                <PreviewStep
                                    key={`${attempt.id}-${timelineSummary?.finished_at ?? 'empty'}-${timelineEvents.length}-${attempt.preview_result?.result?.score ?? 'na'}`}
                                    stepNumber={currentStepNumber}
                                    attempt={attempt}
                                    loading={loading}
                                    canPreview={canPreview}
                                    onPreview={() => saveStep('simulation')}
                                    isExamMode={isExamMode}
                                />
                            )}

                            {currentStepKey === 'submit' && (
                                <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                                        Pēdējais solis
                                    </div>

                                    <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                                        Gatavs iesniegšanai
                                    </h2>

                                    <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                        Šis risinājums ir sagatavots
                                        iesniegšanai. Pārej vēlreiz cauri
                                        galvenajām izvēlēm un iesniedz gala
                                        variantu pārbaudei.
                                    </p>

                                    <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] leading-6 text-[#4d5d53]">
                                        Kad iesniegsi risinājumu, tas parādīsies
                                        sadaļā “Mani mēģinājumi” ar gala
                                        statusu.
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={submitAttempt}
                                            disabled={
                                                loading || isSubmittedAttempt
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSubmittedAttempt
                                                ? 'Risinājums jau ir iesniegts'
                                                : 'Iesniegt risinājumu'}
                                        </button>
                                    </div>
                                </section>
                            )}
                    </div>
                </div>
            </Layout>
        </>
    );
}
