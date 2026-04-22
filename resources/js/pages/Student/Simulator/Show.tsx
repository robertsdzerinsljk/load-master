import StudentLayout from '@/layouts/StudentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';


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
import type { SimulatorStepStatus } from '@/components/student/simulator/types';

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

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function StudentSimulatorShow() {
    const page = usePage<StudentSimulatorPageProps>();
    const template = page.props.template;
    const initialAttempt = page.props.attempt;
    const simulatorMode = page.props.simulatorMode ?? 'student';
    const actionBaseUrl = page.props.actionBaseUrl ?? '/student/simulator/attempt';
    const backHref = page.props.backHref ?? '/student';
    const backLabel = page.props.backLabel ?? 'Atpakaļ uz uzdevumiem';
    const isExamMode = template.evaluation_mode === 'exam';
    const Layout = simulatorMode === 'teacher' ? TeacherLayout : StudentLayout;
    const layoutProps =
        simulatorMode === 'teacher'
            ? ({ active: 'templates' } as const)
            : ({ active: 'tasks' } as const);

    const initialAvailableSteps =
        page.props.availableSteps && page.props.availableSteps.length
            ? page.props.availableSteps
            : ['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit'];

    const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
    const [availableSteps, setAvailableSteps] = useState<string[]>(initialAvailableSteps);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'error' | 'success'>('error');
    const [showToast, setShowToast] = useState(false);
    const [showHints, setShowHints] = useState(false);

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
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const lastSavedDraftRef = useRef(
        JSON.stringify({
            selectedTransportId: String(initialAttempt.selected_transport_template_id ?? ''),
            vehicleCount: initialAttempt.selected_vehicle_count ?? 1,
            selectedPortId: String(initialAttempt.selected_port_id ?? ''),
            selectedShipId: String(initialAttempt.selected_ship_id ?? ''),
        })
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

    const transports = template.transportTemplates ?? template.transport_templates ?? [];
    const availableSegments = template.landRoutes ?? template.land_routes ?? [];
    const availableFuelStations = template.fuelStations ?? template.fuel_stations ?? [];
    const availablePorts = template.ports ?? [];
    const availableShips = template.ships ?? [];
    const selectedSegments = attempt.ordered_route_segments ?? [];
    const selectedFuelStations = attempt.ordered_fuel_stations ?? [];

    const [highlightStep, setHighlightStep] = useState<string | null>(null);
    const [pendingProblemStep, setPendingProblemStep] = useState<string | null>(null);
    const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const buildAttemptUrl = (suffix = '') => `${actionBaseUrl}/${attempt.id}${suffix}`;

    const enabledStepDefs = useMemo(() => {
        return simulatorSteps.filter((step) => availableSteps.includes(step.key));
    }, [availableSteps]);

    const currentStepIndex = useMemo(() => {
        const idx = enabledStepDefs.findIndex((step) => step.key === attempt.current_step);
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
        () => transports.find((item) => String(item.id) === selectedTransportId) ?? null,
        [transports, selectedTransportId]
    );

    const timeline = attempt.preview_result?.timeline ?? null;
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

    const previewHints = attempt.preview_result?.hints;
    const criticalHints = previewHints?.critical ?? [];
    const optimizationHints = previewHints?.optimization ?? [];
    const infoHints = previewHints?.info ?? [];
    const isSubmittedAttempt =
        attempt.status === 'submitted' || attempt.status === 'teacher_test_submitted';

    const totalHintsCount =
        criticalHints.length + optimizationHints.length + infoHints.length;

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
            }),
        [selectedPortId, selectedShipId, selectedTransportId, vehicleCount]
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

        if (Array.isArray(data.available_steps) && data.available_steps.length) {
            setAvailableSteps(data.available_steps);
        }
    };

    const pickEarliestAvailableStep = (
        ...candidates: Array<string | null | undefined>
    ): string | null => {
        const filtered = [...new Set(
            candidates.filter(
                (candidate): candidate is string =>
                    !!candidate && availableSteps.includes(candidate)
            )
        )];

        if (!filtered.length) {
            return null;
        }

        filtered.sort(
            (left, right) => availableSteps.indexOf(left) - availableSteps.indexOf(right)
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
            case 'port_ship_compatibility':
                return pickEarliestAvailableStep('ship', 'port', 'simulation');
            default:
                return null;
        }
    };

    const detectSubmissionProblemStep = (): string | null => {
        const penalties = attempt.preview_result?.result?.score_breakdown?.penalties ?? [];

        const penaltySteps = penalties
            .map((penalty) => resolvePenaltyStep(penalty.key))
            .filter((step): step is string => !!step);

        return pickEarliestAvailableStep(
            hasStep('transport') && (!selectedTransportId || vehicleCount < 1)
                ? 'transport'
                : null,
            hasStep('route') && !selectedSegments.length ? 'route' : null,
            requiresFuelPlanning && !selectedFuelStations.length ? 'fuel' : null,
            hasStep('port') && !selectedPortId ? 'port' : null,
            hasStep('ship') && !selectedShipId ? 'ship' : null,
            ...penaltySteps,
            'simulation'
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
                current === pendingProblemStep ? null : current
            );
        }, 2500);

        return () => {
            window.clearTimeout(clearHighlight);
        };
    }, [currentStepKey, pendingProblemStep]);

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
    const hasPreview = !!attempt.preview_result;
    const isPreviewValid = attempt.preview_result?.result?.is_valid === true;

    const stepStatuses = useMemo<Record<string, SimulatorStepStatus>>(() => {
        const statuses: Record<string, SimulatorStepStatus> = {};
        const practiceProblemSteps = new Set<string>();
        const penalties = attempt.preview_result?.result?.score_breakdown?.penalties ?? [];

        if (!isExamMode) {
            for (const penalty of penalties) {
                const step = resolvePenaltyStep(penalty.key);

                if (step) {
                    practiceProblemSteps.add(step);
                }
            }

            if (hasPreview && !isPreviewValid && practiceProblemSteps.size === 0) {
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
            statuses.transport = !selectedTransportId || vehicleCount < 1
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
            statuses.fuel = requiresFuelPlanning && !selectedFuelStations.length
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
            statuses.simulation = !hasPreview && !canPreview
                ? {
                    label: 'Gaida datus',
                    tone: 'neutral',
                    detail: 'Pabeidz iepriekšējos soļus',
                }
                : !hasPreview
                ? {
                    label: 'Jāaprēķina',
                    tone: 'warning',
                    detail: 'Palaid preview pārbaudi',
                }
                : isPreviewValid
                ? {
                    label: 'Derīgs',
                    tone: 'success',
                    detail: 'Preview ir gatavs iesniegšanai',
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
                    detail: 'Preview atrada kritiskas problēmas',
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
                    detail: 'Vispirms jāaprēķina preview',
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
    ]);

    const buildStepPayload = (step: string): Record<string, unknown> => {
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

        return payload;
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
        } = {}
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
            setMessageType('error');
            setSaveState('error');
            setMessage(data.message || 'Neizdevās iesniegt risinājumu.');

            if (step === 'submit' && !options.skipProblemRedirect) {
                await focusProblemStep(data.target_step ?? detectSubmissionProblemStep());
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
    };

    const addRouteSegment = async (segmentId: number) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(
                buildAttemptUrl('/route-segments'),
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
                }
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

    const moveRouteSegment = async (segmentId: number, direction: 'up' | 'down') => {
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
                }
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
            const response = await fetch(
                buildAttemptUrl('/fuel-stations'),
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
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās noņemt degvielas pieturu.');
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
    }

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
                    await focusProblemStep(data.target_step ?? detectSubmissionProblemStep());
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

    const moveFuelStation = async (stationId: number, direction: 'up' | 'down') => {
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
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās pārvietot degvielas pieturu.');
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
        className={`pointer-events-none fixed left-1/2 top-5 z-[9999] -translate-x-1/2 transform transition-all duration-500 ${
            showToast
                ? 'translate-y-0 opacity-100'
                : '-translate-y-3 opacity-0'
        }`}
    >
                <div
                    className={`pointer-events-auto flex min-w-[320px] max-w-[90vw] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
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
                        onStepClick={goToVisitedStep}
                        onPrev={goBackStep}
                        onNext={goNextStep}
                        availableSteps={availableSteps}
                    />

                    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                        <div
                            ref={setStepRef(currentStepKey)}
                            className={`space-y-6 scroll-mt-24 ${
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
                                <ShipSelectionStep
                                    stepNumber={currentStepNumber}
                                    ships={availableShips}
                                    selectedShipId={selectedShipId}
                                    setSelectedShipId={setSelectedShipId}
                                    loading={loading}
                                />
                            )}

                            {currentStepKey === 'simulation' && (
                                <div className="space-y-6">
                                    <PreviewStep
                                        stepNumber={currentStepNumber}
                                        attempt={attempt}
                                        loading={loading}
                                        canPreview={canPreview}
                                        onPreview={() => saveStep('simulation')}
                                        isExamMode={isExamMode}
                                    />

                                    {!isExamMode && totalHintsCount > 0 ? (
                                        <section className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <div className="text-[12px] font-medium uppercase tracking-wide text-[#7a877f]">
                                                        Practice hints
                                                    </div>
                                                    <div className="mt-1 text-[16px] font-semibold text-[#182219]">
                                                        Pieejami {totalHintsCount} ieteikumi šī risinājuma uzlabošanai
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowHints((prev) => !prev)}
                                                    className="inline-flex items-center justify-center rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[14px] font-medium text-[#182219] hover:bg-[#f7f9f7]"
                                                >
                                                    {showHints ? 'Paslēpt ieteikumus' : 'Skatīt ieteikumus'}
                                                </button>
                                            </div>

                                            {showHints ? (
                                                <div className="mt-5 space-y-5">
                                                    {criticalHints.length ? (
                                                        <HintGroup
                                                            title="Kritiski"
                                                            items={criticalHints}
                                                            variant="critical"
                                                        />
                                                    ) : null}

                                                    {optimizationHints.length ? (
                                                        <HintGroup
                                                            title="Optimizācija"
                                                            items={optimizationHints}
                                                            variant="optimization"
                                                        />
                                                    ) : null}

                                                    {infoHints.length ? (
                                                        <HintGroup
                                                            title="Informatīvi"
                                                            items={infoHints}
                                                            variant="info"
                                                        />
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </section>
                                    ) : null}

                                    {!isExamMode ? (
                                        timelineSummary ? (
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
                                                    value={timelineSummary.deadline_at ?? 'Nav norādīts'}
                                                />
                                                <TimelineStatCard
                                                    label="Kavējums"
                                                    value={`${timelineSummary.delay_minutes ?? 0} min`}
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
                                                                    <div>Sākums: {event.start_at}</div>
                                                                    <div>Beigas: {event.end_at}</div>
                                                                    <div>Ilgums: {event.duration_minutes} min</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {hiddenTimelineCount > 0 ? (
                                                        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-4 text-[14px] text-[#4d5d53]">
                                                            Timeline ir saīsināts priekšskatījumam. Vēl paslēpti {hiddenTimelineCount} notikumi.
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </section>
                                        ) : null
                                    ) : hasPreview ? (
                                        <section className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                                            <div className="text-[12px] font-medium uppercase tracking-wide text-[#7a877f]">
                                                Exam mode
                                            </div>
                                            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                                Detalizētais timeline nav pieejams pārbaudes darba režīmā
                                            </div>
                                            <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                                Kopsavilkumā redzēsi tikai iesniegšanai nepieciešamo preview informāciju bez diagnostikas ķēdes un detalizētiem notikumiem.
                                            </p>
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
                                                isSubmittedAttempt
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

                        <div className="space-y-6">
                            <SimulatorSummary template={template} attempt={attempt} />
                        </div>
                    </div>
                </div>
            </Layout>
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

function HintGroup({
    title,
    items,
    variant,
}: {
    title: string;
    items: string[];
    variant: 'critical' | 'optimization' | 'info';
}) {
    const classes =
        variant === 'critical'
            ? 'border-red-200 bg-red-50 text-red-800'
            : variant === 'optimization'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-[#d9ded9] bg-[#f8fbf9] text-[#4d5d53]';

    return (
        <div>
            <h3 className="text-[15px] font-semibold text-[#182219]">{title}</h3>
            <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                    <div
                        key={`${title}-${index}`}
                        className={`rounded-2xl border px-4 py-3 text-[14px] leading-6 ${classes}`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
