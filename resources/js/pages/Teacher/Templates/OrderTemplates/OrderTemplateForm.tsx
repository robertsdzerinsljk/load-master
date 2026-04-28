import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import OrderTemplateFormSection from './OrderTemplateFormSection';
import {
    formatLocationOptionLabel,
    formatPortOptionLabel,
    formatRouteOptionDescription,
    formatRouteOptionLabel,
} from '@/utils/templateOptionLabels';

type SimpleOption = {
    id: number;
    name: string;
};

type ScenarioOption = {
    value: string;
    label: string;
};

type LocationOption = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
    type?: string | null;
};

type PortOption = {
    id: number;
    name: string;
    country?: string | null;
};

type TransportOption = {
    id: number;
    name: string;
    type?: string | null;
};

type ShipOption = {
    id: number;
    name: string;
    cargo_type?: string | null;
    cargo_mode?: string | null;
};

type FuelStationOption = {
    id: number;
    fuel_type?: string | null;
    price_per_liter?: number | string | null;
    display_name?: string | null;
    location_name?: string | null;
};

type HandlingMethodOption = {
    id: number;
    name: string;
    code: string;
    category?: string | null;
};

type LandRouteOption = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: {
        id: number;
        name: string;
        city?: string | null;
        country?: string | null;
        type?: string | null;
    } | null;
    toLocation?: {
        id: number;
        name: string;
        city?: string | null;
        country?: string | null;
        type?: string | null;
    } | null;
    from_location?: {
        id: number;
        name: string;
        city?: string | null;
        country?: string | null;
        type?: string | null;
    } | null;
    to_location?: {
        id: number;
        name: string;
        city?: string | null;
        country?: string | null;
        type?: string | null;
    } | null;
};

type Options = {
    temperatureModes: SimpleOption[];
    specialConditions: SimpleOption[];
    locations: LocationOption[];
    ports: PortOption[];
    transportTemplates: TransportOption[];
    ships: ShipOption[];
    fuelStations: FuelStationOption[];
    handlingMethods: HandlingMethodOption[];
    landRoutes: LandRouteOption[];
    scenarioTypes: ScenarioOption[];
    scenarioFocuses?: ScenarioOption[];
    evaluationModes: ScenarioOption[];
    statusOptions: ScenarioOption[];
    priorityOptions: ScenarioOption[];
    cargoModes?: ScenarioOption[];
};

type InitialData = {
    title?: string;
    scenario_type?: string;
    scenario_focus?: string | null;
    evaluation_mode?: string | null;
    status?: string;
    description?: string | null;
    student_brief?: string | null;
    teacher_notes?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_mode?: string | null;
    cargo_amount_containers?: string | number | null;
    cargo_amount_tons?: string | number | null;
    cargo_volume_m3?: string | number | null;
    cargo_value?: string | number | null;
    requires_closed_space?: boolean | null;
    requires_ventilation?: boolean | null;
    requires_hazardous_support?: boolean | null;
    allowed_ship_cargo_modes?: string[] | null;
    forbidden_ship_cargo_modes?: string[] | null;
    requires_loading_method_choice?: boolean | null;
    requires_unloading_method_choice?: boolean | null;
    allow_manual_handling?: boolean | null;
    allow_port_equipment?: boolean | null;
    allow_ship_equipment?: boolean | null;
    allowed_handling_method_codes?: string[] | null;
    required_handling_method_codes?: string[] | null;
    temperature_mode_id?: number | string | null;
    special_condition_id?: number | string | null;
    start_location_id?: number | string | null;
    end_location_id?: number | string | null;
    start_port_id?: number | string | null;
    end_port_id?: number | string | null;
    deadline_date?: string | null;
    scenario_start_at?: string | null;
    deadline_at?: string | null;
    budget_limit?: string | number | null;
    requires_refuel_planning?: boolean | null;
    max_trips?: string | number | null;
    priority?: string | null;
    scenario_config?: {
        timing?: {
            loading_fixed_minutes?: number | string | null;
            fuel_stop_minutes?: number | string | null;
            port_processing_minutes?: number | string | null;
            ship_loading_minutes?: number | string | null;
            sea_transit_minutes?: number | string | null;
            max_drive_minutes_before_rest?: number | string | null;
            rest_minutes?: number | string | null;
        } | null;
        availability?: {
            port_queue_minutes?: number | string | null;
            ship_ready_at?: string | null;
        } | null;
        scoring?: {
            time_weight?: number | string | null;
            cost_weight?: number | string | null;
            compatibility_weight?: number | string | null;
            trips_weight?: number | string | null;
        } | null;
        compatibility?: {
            enforce_port_cargo_support?: boolean | null;
            enforce_ship_cargo_support?: boolean | null;
            enforce_port_ship_draft?: boolean | null;
            enforce_handling_compatibility?: boolean | null;
        } | null;
    } | null;
    transportTemplates?: Array<{ id: number }>;
    transport_templates?: Array<{ id: number }>;
    ships?: Array<{ id: number }>;
    ports?: Array<{ id: number }>;
    landRoutes?: Array<{ id: number }>;
    land_routes?: Array<{ id: number }>;
    fuelStations?: Array<{ id: number }>;
    fuel_stations?: Array<{ id: number }>;
};

type PreviewResponse = {
    route?: {
        from?: string | null;
        to?: string | null;
        distance_km?: number;
    };
    transport?: {
        name?: string | null;
        type?: string | null;
    };
    result?: {
        required_vehicles?: number;
        trip_time_hours?: number;
        cycle_time_hours?: number;
        total_base_cost?: number;
        total_cost?: number;
        fuel_used_liters_per_vehicle?: number;
        needs_refuel?: boolean;
        can_complete_with_current_route_data?: boolean;
    };
    fuel?: {
        recommended_fuel_stop?: {
            distance_from_start_km: number;
            station_name?: string | null;
        } | null;
    };
};

type Props = {
    options: Options;
    initialData?: InitialData;
    submitLabel?: string;
    isEdit?: boolean;
    id?: number;
    onCancel?: () => void;
};

type ScenarioCapabilities = {
    transport: boolean;
    route: boolean;
    fuel: boolean;
    port: boolean;
    ship: boolean;
    startLocation: boolean;
    endLocation: boolean;
    startPort: boolean;
    endPort: boolean;
};

function getScenarioCapabilities(type: string): ScenarioCapabilities {
    switch (type) {
        case 'land_transport':
            return {
                transport: true,
                route: true,
                fuel: true,
                port: false,
                ship: false,
                startLocation: true,
                endLocation: true,
                startPort: false,
                endPort: false,
            };
        case 'land_to_port':
            return {
                transport: true,
                route: true,
                fuel: true,
                port: true,
                ship: false,
                startLocation: true,
                endLocation: false,
                startPort: false,
                endPort: true,
            };
        case 'port_to_ship':
            return {
                transport: false,
                route: false,
                fuel: false,
                port: true,
                ship: true,
                startLocation: false,
                endLocation: false,
                startPort: true,
                endPort: false,
            };
        case 'full_chain':
            return {
                transport: true,
                route: true,
                fuel: true,
                port: true,
                ship: true,
                startLocation: true,
                endLocation: true,
                startPort: true,
                endPort: true,
            };
        default:
            return {
                transport: false,
                route: false,
                fuel: false,
                port: false,
                ship: false,
                startLocation: false,
                endLocation: false,
                startPort: false,
                endPort: false,
            };
    }
}

function getDefaultScenarioFocus(type: string): string {
    switch (type) {
        case 'land_transport':
            return 'fuel';
        case 'land_to_port':
            return 'deadline';
        case 'port_to_ship':
            return 'compatibility';
        case 'full_chain':
            return 'general';
        default:
            return 'general';
    }
}

function normalizeDateTime(value?: string | null) {
    return value ? String(value).slice(0, 16) : '';
}

export default function OrderTemplateForm({
    options,
    initialData = {},
    submitLabel = 'Save template',
    isEdit = false,
    id,
    onCancel,
}: Props) {
    const page = usePage<{ props: { errors?: Record<string, string> } }>();
    const errors = page.props.errors ?? {};

    const [title, setTitle] = useState(initialData.title ?? '');
    const [scenarioType, setScenarioType] = useState(
        initialData.scenario_type ?? 'land_transport',
    );
    const [scenarioFocus, setScenarioFocus] = useState(
        initialData.scenario_focus ??
            getDefaultScenarioFocus(initialData.scenario_type ?? 'land_transport'),
    );
    const [evaluationMode, setEvaluationMode] = useState(
        initialData.evaluation_mode ?? 'practice',
    );
    const [status, setStatus] = useState(initialData.status ?? 'draft');
    const [priority, setPriority] = useState(initialData.priority ?? '');
    const [description, setDescription] = useState(initialData.description ?? '');
    const [studentBrief, setStudentBrief] = useState(initialData.student_brief ?? '');
    const [teacherNotes, setTeacherNotes] = useState(initialData.teacher_notes ?? '');

    const [cargoName, setCargoName] = useState(initialData.cargo_name ?? '');
    const [cargoType, setCargoType] = useState(initialData.cargo_type ?? '');
    const [cargoMode, setCargoMode] = useState(initialData.cargo_mode ?? '');
    const [cargoAmountContainers, setCargoAmountContainers] = useState(
        String(initialData.cargo_amount_containers ?? ''),
    );
    const [cargoAmountTons, setCargoAmountTons] = useState(
        String(initialData.cargo_amount_tons ?? ''),
    );
    const [cargoVolumeM3, setCargoVolumeM3] = useState(
        String(initialData.cargo_volume_m3 ?? ''),
    );
    const [cargoValue, setCargoValue] = useState(
        String(initialData.cargo_value ?? ''),
    );
    const [requiresClosedSpace, setRequiresClosedSpace] = useState(
        Boolean(initialData.requires_closed_space ?? false),
    );
    const [requiresVentilation, setRequiresVentilation] = useState(
        Boolean(initialData.requires_ventilation ?? false),
    );
    const [requiresHazardousSupport, setRequiresHazardousSupport] = useState(
        Boolean(initialData.requires_hazardous_support ?? false),
    );

    const [temperatureModeId, setTemperatureModeId] = useState(
        String(initialData.temperature_mode_id ?? ''),
    );
    const [specialConditionId, setSpecialConditionId] = useState(
        String(initialData.special_condition_id ?? ''),
    );

    const [startLocationId, setStartLocationId] = useState(
        String(initialData.start_location_id ?? ''),
    );
    const [endLocationId, setEndLocationId] = useState(
        String(initialData.end_location_id ?? ''),
    );
    const [startPortId, setStartPortId] = useState(
        String(initialData.start_port_id ?? ''),
    );
    const [endPortId, setEndPortId] = useState(
        String(initialData.end_port_id ?? ''),
    );

    const [scenarioStartAt, setScenarioStartAt] = useState(
        normalizeDateTime(initialData.scenario_start_at),
    );
    const [deadlineAt, setDeadlineAt] = useState(
        normalizeDateTime(initialData.deadline_at),
    );
    const [deadlineDate, setDeadlineDate] = useState(
        initialData.deadline_date ?? '',
    );
    const [budgetLimit, setBudgetLimit] = useState(
        String(initialData.budget_limit ?? ''),
    );
    const [maxTrips, setMaxTrips] = useState(String(initialData.max_trips ?? ''));
    const [requiresRefuelPlanning, setRequiresRefuelPlanning] = useState(
        Boolean(initialData.requires_refuel_planning ?? false),
    );

    const [timingLoadingFixedMinutes, setTimingLoadingFixedMinutes] = useState(
        String(initialData.scenario_config?.timing?.loading_fixed_minutes ?? 45),
    );
    const [timingFuelStopMinutes, setTimingFuelStopMinutes] = useState(
        String(initialData.scenario_config?.timing?.fuel_stop_minutes ?? 20),
    );
    const [timingPortProcessingMinutes, setTimingPortProcessingMinutes] = useState(
        String(initialData.scenario_config?.timing?.port_processing_minutes ?? 60),
    );
    const [timingShipLoadingMinutes, setTimingShipLoadingMinutes] = useState(
        String(initialData.scenario_config?.timing?.ship_loading_minutes ?? 90),
    );
    const [timingSeaTransitMinutes, setTimingSeaTransitMinutes] = useState(
        String(initialData.scenario_config?.timing?.sea_transit_minutes ?? 360),
    );
    const [timingMaxDriveMinutesBeforeRest, setTimingMaxDriveMinutesBeforeRest] =
        useState(
            String(
                initialData.scenario_config?.timing?.max_drive_minutes_before_rest ??
                    270,
            ),
        );
    const [timingRestMinutes, setTimingRestMinutes] = useState(
        String(initialData.scenario_config?.timing?.rest_minutes ?? 45),
    );

    const [waitingPortQueueMinutes, setWaitingPortQueueMinutes] = useState(
        String(initialData.scenario_config?.availability?.port_queue_minutes ?? 0),
    );
    const [waitingShipReadyAt, setWaitingShipReadyAt] = useState(
        normalizeDateTime(initialData.scenario_config?.availability?.ship_ready_at),
    );

    const [scoringTimeWeight, setScoringTimeWeight] = useState(
        String(initialData.scenario_config?.scoring?.time_weight ?? 35),
    );
    const [scoringCostWeight, setScoringCostWeight] = useState(
        String(initialData.scenario_config?.scoring?.cost_weight ?? 25),
    );
    const [scoringCompatibilityWeight, setScoringCompatibilityWeight] = useState(
        String(initialData.scenario_config?.scoring?.compatibility_weight ?? 25),
    );
    const [scoringTripsWeight, setScoringTripsWeight] = useState(
        String(initialData.scenario_config?.scoring?.trips_weight ?? 15),
    );

    const [requiresLoadingMethodChoice, setRequiresLoadingMethodChoice] = useState(
        Boolean(initialData.requires_loading_method_choice ?? false),
    );
    const [requiresUnloadingMethodChoice, setRequiresUnloadingMethodChoice] =
        useState(Boolean(initialData.requires_unloading_method_choice ?? false));
    const [allowManualHandling, setAllowManualHandling] = useState(
        Boolean(initialData.allow_manual_handling ?? true),
    );
    const [allowPortEquipment, setAllowPortEquipment] = useState(
        Boolean(initialData.allow_port_equipment ?? true),
    );
    const [allowShipEquipment, setAllowShipEquipment] = useState(
        Boolean(initialData.allow_ship_equipment ?? true),
    );
    const [allowedHandlingMethodCodes, setAllowedHandlingMethodCodes] = useState<string[]>(
        initialData.allowed_handling_method_codes ?? [],
    );
    const [requiredHandlingMethodCodes, setRequiredHandlingMethodCodes] = useState<string[]>(
        initialData.required_handling_method_codes ?? [],
    );
    const [allowedShipCargoModes, setAllowedShipCargoModes] = useState<string[]>(
        initialData.allowed_ship_cargo_modes ?? [],
    );
    const [forbiddenShipCargoModes, setForbiddenShipCargoModes] = useState<string[]>(
        initialData.forbidden_ship_cargo_modes ?? [],
    );
    const [compatibilityEnforcePortCargoSupport, setCompatibilityEnforcePortCargoSupport] =
        useState(
            initialData.scenario_config?.compatibility?.enforce_port_cargo_support ??
                true,
        );
    const [compatibilityEnforceShipCargoSupport, setCompatibilityEnforceShipCargoSupport] =
        useState(
            initialData.scenario_config?.compatibility?.enforce_ship_cargo_support ??
                true,
        );
    const [compatibilityEnforcePortShipDraft, setCompatibilityEnforcePortShipDraft] =
        useState(
            initialData.scenario_config?.compatibility?.enforce_port_ship_draft ??
                true,
        );
    const [
        compatibilityEnforceHandlingCompatibility,
        setCompatibilityEnforceHandlingCompatibility,
    ] = useState(
        initialData.scenario_config?.compatibility?.enforce_handling_compatibility ??
            true,
    );

    const [transportTemplateIds, setTransportTemplateIds] = useState<number[]>(
        (initialData.transportTemplates ?? initialData.transport_templates ?? []).map(
            (item) => item.id,
        ),
    );
    const [shipIds, setShipIds] = useState<number[]>(
        initialData.ships?.map((item) => item.id) ?? [],
    );
    const [portIds, setPortIds] = useState<number[]>(
        initialData.ports?.map((item) => item.id) ?? [],
    );
    const [landRouteIds, setLandRouteIds] = useState<number[]>(
        (initialData.landRoutes ?? initialData.land_routes ?? []).map(
            (item) => item.id,
        ),
    );
    const [fuelStationIds, setFuelStationIds] = useState<number[]>(
        (initialData.fuelStations ?? initialData.fuel_stations ?? []).map(
            (item) => item.id,
        ),
    );

    const [isTryingScenario, setIsTryingScenario] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

    const caps = useMemo(() => getScenarioCapabilities(scenarioType), [scenarioType]);
    const supportsHandling = caps.port && caps.ship;
    const cargoModeOptions =
        options.cargoModes && options.cargoModes.length
            ? options.cargoModes
            : [
                  { value: 'bulk', label: 'Bulk' },
                  { value: 'containerized', label: 'Containerized' },
                  { value: 'liquid', label: 'Liquid' },
                  { value: 'palletized', label: 'Palletized' },
                  { value: 'break_bulk', label: 'Break bulk' },
              ];
    const sortedLocationOptions = useMemo(
        () =>
            [...options.locations].sort((left, right) =>
                formatLocationOptionLabel(left).localeCompare(
                    formatLocationOptionLabel(right),
                ),
            ),
        [options.locations],
    );
    const sortedPortOptions = useMemo(
        () =>
            [...options.ports].sort((left, right) =>
                formatPortOptionLabel(left).localeCompare(
                    formatPortOptionLabel(right),
                ),
            ),
        [options.ports],
    );
    const sortedLandRouteOptions = useMemo(
        () =>
            [...options.landRoutes].sort((left, right) =>
                formatRouteOptionLabel(left).localeCompare(
                    formatRouteOptionLabel(right),
                ),
            ),
        [options.landRoutes],
    );

    useEffect(() => {
        setScenarioFocus((current) =>
            current ? current : getDefaultScenarioFocus(scenarioType),
        );
    }, [scenarioType]);

    useEffect(() => {
        if (!caps.transport) {
            setTransportTemplateIds([]);
        }

        if (!caps.route) {
            setLandRouteIds([]);
        }

        if (!caps.fuel) {
            setRequiresRefuelPlanning(false);
            setFuelStationIds([]);
        }

        if (!caps.port) {
            setPortIds([]);
        }

        if (!caps.ship) {
            setShipIds([]);
        }

        if (!caps.startLocation) {
            setStartLocationId('');
        }

        if (!caps.endLocation) {
            setEndLocationId('');
        }

        if (!caps.startPort) {
            setStartPortId('');
        }

        if (!caps.endPort) {
            setEndPortId('');
        }
    }, [caps]);

    const toggleNumberSelection = (
        current: number[],
        setValue: (value: number[]) => void,
        nextValue: number,
    ) => {
        if (current.includes(nextValue)) {
            setValue(current.filter((item) => item !== nextValue));
            return;
        }

        setValue([...current, nextValue]);
    };

    const toggleStringSelection = (
        current: string[],
        setValue: (value: string[]) => void,
        nextValue: string,
    ) => {
        if (current.includes(nextValue)) {
            setValue(current.filter((item) => item !== nextValue));
            return;
        }

        setValue([...current, nextValue]);
    };

    const buildPayload = () => ({
        title,
        scenario_type: scenarioType,
        scenario_focus: scenarioFocus || getDefaultScenarioFocus(scenarioType),
        evaluation_mode: evaluationMode,
        status,
        priority: priority || null,
        description: description || null,
        student_brief: studentBrief || null,
        teacher_notes: teacherNotes || null,
        cargo_name: cargoName || null,
        cargo_type: cargoType || null,
        cargo_mode: cargoMode || null,
        cargo_amount_containers:
            cargoAmountContainers === '' ? null : Number(cargoAmountContainers),
        cargo_amount_tons: cargoAmountTons === '' ? null : Number(cargoAmountTons),
        cargo_volume_m3: cargoVolumeM3 === '' ? null : Number(cargoVolumeM3),
        cargo_value: cargoValue === '' ? null : Number(cargoValue),
        temperature_mode_id: temperatureModeId === '' ? null : Number(temperatureModeId),
        special_condition_id:
            specialConditionId === '' ? null : Number(specialConditionId),
        requires_closed_space: requiresClosedSpace,
        requires_ventilation: requiresVentilation,
        requires_hazardous_support: requiresHazardousSupport,
        allowed_ship_cargo_modes: allowedShipCargoModes,
        forbidden_ship_cargo_modes: forbiddenShipCargoModes,
        requires_loading_method_choice: supportsHandling
            ? requiresLoadingMethodChoice
            : false,
        requires_unloading_method_choice: supportsHandling
            ? requiresUnloadingMethodChoice
            : false,
        allow_manual_handling: supportsHandling ? allowManualHandling : true,
        allow_port_equipment: supportsHandling ? allowPortEquipment : true,
        allow_ship_equipment: supportsHandling ? allowShipEquipment : true,
        allowed_handling_method_codes: supportsHandling
            ? allowedHandlingMethodCodes
            : [],
        required_handling_method_codes: supportsHandling
            ? requiredHandlingMethodCodes
            : [],
        compatibility_enforce_port_cargo_support:
            compatibilityEnforcePortCargoSupport,
        compatibility_enforce_ship_cargo_support:
            compatibilityEnforceShipCargoSupport,
        compatibility_enforce_port_ship_draft:
            compatibilityEnforcePortShipDraft,
        compatibility_enforce_handling_compatibility:
            compatibilityEnforceHandlingCompatibility,
        start_location_id:
            caps.startLocation && startLocationId !== ''
                ? Number(startLocationId)
                : null,
        end_location_id:
            caps.endLocation && endLocationId !== ''
                ? Number(endLocationId)
                : null,
        start_port_id:
            caps.startPort && startPortId !== '' ? Number(startPortId) : null,
        end_port_id:
            caps.endPort && endPortId !== '' ? Number(endPortId) : null,
        scenario_start_at: scenarioStartAt || null,
        deadline_at: deadlineAt || null,
        deadline_date: deadlineDate || null,
        budget_limit: budgetLimit === '' ? null : Number(budgetLimit),
        max_trips: maxTrips === '' ? null : Number(maxTrips),
        requires_refuel_planning: caps.fuel ? requiresRefuelPlanning : false,
        timing_loading_fixed_minutes:
            timingLoadingFixedMinutes === ''
                ? null
                : Number(timingLoadingFixedMinutes),
        timing_fuel_stop_minutes:
            timingFuelStopMinutes === '' ? null : Number(timingFuelStopMinutes),
        timing_port_processing_minutes:
            timingPortProcessingMinutes === ''
                ? null
                : Number(timingPortProcessingMinutes),
        timing_ship_loading_minutes:
            timingShipLoadingMinutes === ''
                ? null
                : Number(timingShipLoadingMinutes),
        timing_sea_transit_minutes:
            timingSeaTransitMinutes === ''
                ? null
                : Number(timingSeaTransitMinutes),
        timing_max_drive_minutes_before_rest:
            timingMaxDriveMinutesBeforeRest === ''
                ? null
                : Number(timingMaxDriveMinutesBeforeRest),
        timing_rest_minutes:
            timingRestMinutes === '' ? null : Number(timingRestMinutes),
        waiting_port_queue_minutes:
            waitingPortQueueMinutes === ''
                ? null
                : Number(waitingPortQueueMinutes),
        waiting_ship_ready_at: waitingShipReadyAt || null,
        scoring_time_weight:
            scoringTimeWeight === '' ? null : Number(scoringTimeWeight),
        scoring_cost_weight:
            scoringCostWeight === '' ? null : Number(scoringCostWeight),
        scoring_compatibility_weight:
            scoringCompatibilityWeight === ''
                ? null
                : Number(scoringCompatibilityWeight),
        scoring_trips_weight:
            scoringTripsWeight === '' ? null : Number(scoringTripsWeight),
        transport_template_ids: caps.transport ? transportTemplateIds : [],
        ship_ids: caps.ship ? shipIds : [],
        port_ids: caps.port ? portIds : [],
        land_route_ids: caps.route ? landRouteIds : [],
        fuel_station_ids: caps.fuel ? fuelStationIds : [],
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const payload = buildPayload();

        if (isEdit && id) {
            router.put(`/teacher/templates/order-templates/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/order-templates', payload);
    };

    const handleTryScenario = async () => {
        setIsTryingScenario(true);
        setPreviewError(null);
        setPreviewData(null);

        try {
            const response = await fetch('/teacher/templates/order-templates/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(buildPayload()),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                setPreviewError(data.message || 'Could not calculate preview.');
                return;
            }

            setPreviewData(data);
        } catch {
            setPreviewError('Could not reach the server.');
        } finally {
            setIsTryingScenario(false);
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';
    const textareaClass = `${inputClass} min-h-[120px]`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <OrderTemplateFormSection
                title="Basic info"
                description="Start with the scenario type, its teaching goal, and the metadata that will control how the simulator opens."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Title" error={errors.title}>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className={inputClass}
                            placeholder="Container delivery to port"
                            required
                        />
                    </Field>

                    <Field label="Scenario type" error={errors.scenario_type}>
                        <select
                            value={scenarioType}
                            onChange={(event) => setScenarioType(event.target.value)}
                            className={inputClass}
                            required
                        >
                            {options.scenarioTypes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Scenario focus" error={errors.scenario_focus}>
                        <select
                            value={scenarioFocus}
                            onChange={(event) => setScenarioFocus(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Auto</option>
                            {(options.scenarioFocuses ?? []).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Evaluation mode" error={errors.evaluation_mode}>
                        <select
                            value={evaluationMode}
                            onChange={(event) => setEvaluationMode(event.target.value)}
                            className={inputClass}
                            required
                        >
                            {options.evaluationModes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Status" error={errors.status}>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className={inputClass}
                            required
                        >
                            {options.statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Priority" error={errors.priority}>
                        <select
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">None</option>
                            {options.priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Teacher description" error={errors.description}>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className={textareaClass}
                        placeholder="Internal description of the task setup, expected difficulty, and why it exists."
                    />
                </Field>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Task copy"
                description="Keep the student brief and teacher notes separate so the student gets a clean problem statement."
            >
                <div className="grid gap-4 xl:grid-cols-2">
                    <Field label="Student brief" error={errors.student_brief}>
                        <textarea
                            value={studentBrief}
                            onChange={(event) => setStudentBrief(event.target.value)}
                            className={textareaClass}
                            placeholder="What the student should see when the simulator opens."
                        />
                    </Field>

                    <Field label="Teacher notes" error={errors.teacher_notes}>
                        <textarea
                            value={teacherNotes}
                            onChange={(event) => setTeacherNotes(event.target.value)}
                            className={textareaClass}
                            placeholder="Private notes about teaching intent, common failure points, or scoring assumptions."
                        />
                    </Field>
                </div>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Cargo profile"
                description="Define the cargo, its scale, and the compatibility rules that should follow the student throughout the scenario."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Cargo name" error={errors.cargo_name}>
                        <input
                            type="text"
                            value={cargoName}
                            onChange={(event) => setCargoName(event.target.value)}
                            className={inputClass}
                            placeholder="Frozen food"
                        />
                    </Field>

                    <Field label="Cargo type" error={errors.cargo_type}>
                        <input
                            type="text"
                            value={cargoType}
                            onChange={(event) => setCargoType(event.target.value)}
                            className={inputClass}
                            placeholder="Container cargo"
                        />
                    </Field>

                    <Field label="Cargo mode" error={errors.cargo_mode}>
                        <select
                            value={cargoMode}
                            onChange={(event) => setCargoMode(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Unspecified</option>
                            {cargoModeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Temperature mode" error={errors.temperature_mode_id}>
                        <select
                            value={temperatureModeId}
                            onChange={(event) => setTemperatureModeId(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">None</option>
                            {options.temperatureModes.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Containers" error={errors.cargo_amount_containers}>
                        <input
                            type="number"
                            min="0"
                            value={cargoAmountContainers}
                            onChange={(event) => setCargoAmountContainers(event.target.value)}
                            className={inputClass}
                            placeholder="500"
                        />
                    </Field>

                    <Field label="Tons" error={errors.cargo_amount_tons}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoAmountTons}
                            onChange={(event) => setCargoAmountTons(event.target.value)}
                            className={inputClass}
                            placeholder="10000"
                        />
                    </Field>

                    <Field label="Volume m3" error={errors.cargo_volume_m3}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoVolumeM3}
                            onChange={(event) => setCargoVolumeM3(event.target.value)}
                            className={inputClass}
                            placeholder="120"
                        />
                    </Field>

                    <Field label="Cargo value" error={errors.cargo_value}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoValue}
                            onChange={(event) => setCargoValue(event.target.value)}
                            className={inputClass}
                            placeholder="25000"
                        />
                    </Field>

                    <Field label="Special condition" error={errors.special_condition_id}>
                        <select
                            value={specialConditionId}
                            onChange={(event) => setSpecialConditionId(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">None</option>
                            {options.specialConditions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <ToggleGrid
                    title="Protection requirements"
                    description="These flags influence ship, port, and handling compatibility."
                    items={[
                        {
                            label: 'Requires closed cargo space',
                            checked: requiresClosedSpace,
                            onChange: setRequiresClosedSpace,
                            error: errors.requires_closed_space,
                        },
                        {
                            label: 'Requires ventilation',
                            checked: requiresVentilation,
                            onChange: setRequiresVentilation,
                            error: errors.requires_ventilation,
                        },
                        {
                            label: 'Requires hazardous support',
                            checked: requiresHazardousSupport,
                            onChange: setRequiresHazardousSupport,
                            error: errors.requires_hazardous_support,
                        },
                    ]}
                />

                    <SelectionPills
                        title="Allowed ship cargo modes"
                    description="Optional whitelist. Leave empty to accept any compatible ship profile."
                    options={cargoModeOptions}
                        selected={allowedShipCargoModes}
                        onToggle={(value) =>
                            toggleStringSelection(
                                allowedShipCargoModes,
                                setAllowedShipCargoModes,
                                value,
                            )
                        }
                    error={errors.allowed_ship_cargo_modes}
                />

                <SelectionPills
                    title="Forbidden ship cargo modes"
                    description="Optional blacklist for specific ship cargo profiles."
                    options={cargoModeOptions}
                        selected={forbiddenShipCargoModes}
                        onToggle={(value) =>
                            toggleStringSelection(
                                forbiddenShipCargoModes,
                                setForbiddenShipCargoModes,
                                value,
                            )
                        }
                    error={errors.forbidden_ship_cargo_modes}
                />
            </OrderTemplateFormSection>

            {(caps.startLocation || caps.endLocation || caps.startPort || caps.endPort) && (
                <OrderTemplateFormSection
                    title="Route and endpoints"
                    description="Only the fields needed for the selected scenario type stay visible."
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {caps.startLocation ? (
                            <Field label="Start location" error={errors.start_location_id}>
                                <select
                                    value={startLocationId}
                                    onChange={(event) => setStartLocationId(event.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">None</option>
                                    {sortedLocationOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {formatLocationOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.endLocation ? (
                            <Field label="End location" error={errors.end_location_id}>
                                <select
                                    value={endLocationId}
                                    onChange={(event) => setEndLocationId(event.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">None</option>
                                    {sortedLocationOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {formatLocationOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.startPort ? (
                            <Field label="Start port" error={errors.start_port_id}>
                                <select
                                    value={startPortId}
                                    onChange={(event) => setStartPortId(event.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">None</option>
                                    {sortedPortOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {formatPortOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.endPort ? (
                            <Field label="End port" error={errors.end_port_id}>
                                <select
                                    value={endPortId}
                                    onChange={(event) => setEndPortId(event.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">None</option>
                                    {sortedPortOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {formatPortOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}
                    </div>
                </OrderTemplateFormSection>
            )}

            <OrderTemplateFormSection
                title="Time, limits, and scoring"
                description="Group the operational limits and scoring weights so the scenario stays realistic without becoming a giant flat form."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Scenario start" error={errors.scenario_start_at}>
                        <input
                            type="datetime-local"
                            value={scenarioStartAt}
                            onChange={(event) => setScenarioStartAt(event.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Deadline date/time" error={errors.deadline_at}>
                        <input
                            type="datetime-local"
                            value={deadlineAt}
                            onChange={(event) => setDeadlineAt(event.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Fallback deadline date" error={errors.deadline_date}>
                        <input
                            type="date"
                            value={deadlineDate}
                            onChange={(event) => setDeadlineDate(event.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Budget limit" error={errors.budget_limit}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={budgetLimit}
                            onChange={(event) => setBudgetLimit(event.target.value)}
                            className={inputClass}
                            placeholder="15000"
                        />
                    </Field>

                    <Field label="Max trips" error={errors.max_trips}>
                        <input
                            type="number"
                            min="0"
                            value={maxTrips}
                            onChange={(event) => setMaxTrips(event.target.value)}
                            className={inputClass}
                            placeholder="2"
                        />
                    </Field>
                </div>

                {caps.fuel ? (
                    <ToggleGrid
                        title="Planning switches"
                        description="Use these toggles when the scenario should actively force students to plan around operational limits."
                        items={[
                            {
                                label: 'Require refuel planning',
                                checked: requiresRefuelPlanning,
                                onChange: setRequiresRefuelPlanning,
                                error: errors.requires_refuel_planning,
                            },
                        ]}
                    />
                ) : null}

                <CompactGrid
                    title="Timeline defaults"
                    description="These scalar values drive the linear timeline and stay easy to adjust later."
                    fields={[
                        {
                            label: 'Initial loading min',
                            value: timingLoadingFixedMinutes,
                            onChange: setTimingLoadingFixedMinutes,
                            error: errors.timing_loading_fixed_minutes,
                        },
                        {
                            label: 'Fuel stop min',
                            value: timingFuelStopMinutes,
                            onChange: setTimingFuelStopMinutes,
                            error: errors.timing_fuel_stop_minutes,
                            disabled: !caps.fuel,
                        },
                        {
                            label: 'Port processing min',
                            value: timingPortProcessingMinutes,
                            onChange: setTimingPortProcessingMinutes,
                            error: errors.timing_port_processing_minutes,
                            disabled: !caps.port,
                        },
                        {
                            label: 'Ship loading min',
                            value: timingShipLoadingMinutes,
                            onChange: setTimingShipLoadingMinutes,
                            error: errors.timing_ship_loading_minutes,
                            disabled: !caps.ship,
                        },
                        {
                            label: 'Sea transit min',
                            value: timingSeaTransitMinutes,
                            onChange: setTimingSeaTransitMinutes,
                            error: errors.timing_sea_transit_minutes,
                            disabled: !caps.ship,
                        },
                        {
                            label: 'Max drive before rest',
                            value: timingMaxDriveMinutesBeforeRest,
                            onChange: setTimingMaxDriveMinutesBeforeRest,
                            error: errors.timing_max_drive_minutes_before_rest,
                            disabled: !caps.transport && !caps.route,
                        },
                        {
                            label: 'Rest min',
                            value: timingRestMinutes,
                            onChange: setTimingRestMinutes,
                            error: errors.timing_rest_minutes,
                            disabled: !caps.transport && !caps.route,
                        },
                        {
                            label: 'Port queue min',
                            value: waitingPortQueueMinutes,
                            onChange: setWaitingPortQueueMinutes,
                            error: errors.waiting_port_queue_minutes,
                            disabled: !caps.port,
                        },
                        {
                            label: 'Ship ready at',
                            value: waitingShipReadyAt,
                            onChange: setWaitingShipReadyAt,
                            error: errors.waiting_ship_ready_at,
                            type: 'datetime-local',
                            disabled: !caps.ship,
                        },
                    ]}
                />

                <CompactGrid
                    title="Scoring weights"
                    description="Keep the weights readable and grouped so future tuning does not need schema work."
                    fields={[
                        {
                            label: 'Time weight',
                            value: scoringTimeWeight,
                            onChange: setScoringTimeWeight,
                            error: errors.scoring_time_weight,
                        },
                        {
                            label: 'Cost weight',
                            value: scoringCostWeight,
                            onChange: setScoringCostWeight,
                            error: errors.scoring_cost_weight,
                        },
                        {
                            label: 'Compatibility weight',
                            value: scoringCompatibilityWeight,
                            onChange: setScoringCompatibilityWeight,
                            error: errors.scoring_compatibility_weight,
                        },
                        {
                            label: 'Trips weight',
                            value: scoringTripsWeight,
                            onChange: setScoringTripsWeight,
                            error: errors.scoring_trips_weight,
                        },
                    ]}
                />
            </OrderTemplateFormSection>

            {supportsHandling ? (
                <OrderTemplateFormSection
                    title="Handling and compatibility"
                    description="This section controls the port/ship handling layer, method whitelists, and the compatibility rules enforced during simulation."
                >
                    <ToggleGrid
                        title="Handling decisions"
                        description="Choose whether the student must actively decide loading and unloading methods."
                        items={[
                            {
                                label: 'Student must choose loading method',
                                checked: requiresLoadingMethodChoice,
                                onChange: setRequiresLoadingMethodChoice,
                                error: errors.requires_loading_method_choice,
                            },
                            {
                                label: 'Student must choose unloading method',
                                checked: requiresUnloadingMethodChoice,
                                onChange: setRequiresUnloadingMethodChoice,
                                error: errors.requires_unloading_method_choice,
                            },
                            {
                                label: 'Allow manual handling',
                                checked: allowManualHandling,
                                onChange: setAllowManualHandling,
                                error: errors.allow_manual_handling,
                            },
                            {
                                label: 'Allow port equipment',
                                checked: allowPortEquipment,
                                onChange: setAllowPortEquipment,
                                error: errors.allow_port_equipment,
                            },
                            {
                                label: 'Allow ship equipment',
                                checked: allowShipEquipment,
                                onChange: setAllowShipEquipment,
                                error: errors.allow_ship_equipment,
                            },
                        ]}
                    />

                    <SelectionPills
                        title="Allowed handling methods"
                        description="Optional whitelist. Leave empty to allow any compatible configured method."
                        options={options.handlingMethods.map((method) => ({
                            value: method.code,
                            label: method.name,
                        }))}
                        selected={allowedHandlingMethodCodes}
                        onToggle={(value) =>
                            toggleStringSelection(
                                allowedHandlingMethodCodes,
                                setAllowedHandlingMethodCodes,
                                value,
                            )
                        }
                        error={errors.allowed_handling_method_codes}
                    />

                    <SelectionPills
                        title="Required handling methods"
                        description="If one of these methods must appear in the final handling plan, mark it here."
                        options={options.handlingMethods.map((method) => ({
                            value: method.code,
                            label: method.name,
                        }))}
                        selected={requiredHandlingMethodCodes}
                        onToggle={(value) =>
                            toggleStringSelection(
                                requiredHandlingMethodCodes,
                                setRequiredHandlingMethodCodes,
                                value,
                            )
                        }
                        error={errors.required_handling_method_codes}
                    />

                    <ToggleGrid
                        title="Compatibility engine"
                        description="These switches prepare the simulation engine while keeping the rules editable in a compact place."
                        items={[
                            {
                                label: 'Enforce port cargo support',
                                checked: compatibilityEnforcePortCargoSupport,
                                onChange: setCompatibilityEnforcePortCargoSupport,
                                error: errors.compatibility_enforce_port_cargo_support,
                            },
                            {
                                label: 'Enforce ship cargo support',
                                checked: compatibilityEnforceShipCargoSupport,
                                onChange: setCompatibilityEnforceShipCargoSupport,
                                error: errors.compatibility_enforce_ship_cargo_support,
                            },
                            {
                                label: 'Enforce port draft vs ship draft',
                                checked: compatibilityEnforcePortShipDraft,
                                onChange: setCompatibilityEnforcePortShipDraft,
                                error: errors.compatibility_enforce_port_ship_draft,
                            },
                            {
                                label: 'Enforce handling compatibility',
                                checked: compatibilityEnforceHandlingCompatibility,
                                onChange: setCompatibilityEnforceHandlingCompatibility,
                                error: errors.compatibility_enforce_handling_compatibility,
                            },
                        ]}
                    />
                </OrderTemplateFormSection>
            ) : null}

            {(caps.transport || caps.route || caps.port || caps.ship) && (
                <OrderTemplateFormSection
                    title="Allowed assets"
                    description="Keep resource selection compact by grouping each asset type into its own grid of concise cards."
                >
                    <div className="space-y-5">
                        {caps.transport ? (
                            <SelectableGrid
                                title="Land transport"
                                items={options.transportTemplates.map((item) => ({
                                    id: item.id,
                                    title: item.name,
                                    description: item.type || 'No type',
                                }))}
                                selected={transportTemplateIds}
                                onToggle={(value) =>
                                    toggleNumberSelection(
                                        transportTemplateIds,
                                        setTransportTemplateIds,
                                        value,
                                    )
                                }
                            />
                        ) : null}

                        {caps.route ? (
                            <SelectableGrid
                                title="Land routes"
                                items={sortedLandRouteOptions.map((item) => ({
                                    id: item.id,
                                    title: formatRouteOptionLabel(item),
                                    description: formatRouteOptionDescription(item),
                                }))}
                                selected={landRouteIds}
                                onToggle={(value) =>
                                    toggleNumberSelection(
                                        landRouteIds,
                                        setLandRouteIds,
                                        value,
                                    )
                                }
                            />
                        ) : null}

                        {caps.port ? (
                            <SelectableGrid
                                title="Ports"
                                items={sortedPortOptions.map((item) => ({
                                    id: item.id,
                                    title: formatPortOptionLabel(item),
                                    description: item.country || 'No country',
                                }))}
                                selected={portIds}
                                onToggle={(value) =>
                                    toggleNumberSelection(
                                        portIds,
                                        setPortIds,
                                        value,
                                    )
                                }
                            />
                        ) : null}

                        {caps.ship ? (
                            <SelectableGrid
                                title="Ships"
                                items={options.ships.map((item) => ({
                                    id: item.id,
                                    title: item.name,
                                    description: item.cargo_mode || item.cargo_type || 'No cargo profile',
                                }))}
                                selected={shipIds}
                                onToggle={(value) =>
                                    toggleNumberSelection(
                                        shipIds,
                                        setShipIds,
                                        value,
                                    )
                                }
                            />
                        ) : null}

                        {caps.fuel ? (
                            <SelectableGrid
                                title="Suggested fuel stops"
                                items={options.fuelStations.map((item) => ({
                                    id: item.id,
                                    title:
                                        item.display_name ||
                                        item.location_name ||
                                        `Fuel stop #${item.id}`,
                                    description:
                                        [
                                            item.location_name,
                                            item.fuel_type
                                                ? item.fuel_type.toUpperCase()
                                                : null,
                                            item.price_per_liter !== null &&
                                            item.price_per_liter !== undefined &&
                                            item.price_per_liter !== ''
                                                ? `${item.price_per_liter} €/L`
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' • ') || 'No fuel details',
                                }))}
                                selected={fuelStationIds}
                                onToggle={(value) =>
                                    toggleNumberSelection(
                                        fuelStationIds,
                                        setFuelStationIds,
                                        value,
                                    )
                                }
                            />
                        ) : null}
                    </div>
                </OrderTemplateFormSection>
            )}

            {(previewError || previewData) && (
                <OrderTemplateFormSection
                    title="Scenario preview"
                    description="Quick teacher-side smoke test for the chosen land transport and route defaults."
                >
                    {previewError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
                            {previewError}
                        </div>
                    ) : null}

                    {previewData ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <PreviewCard
                                label="Route"
                                value={`${previewData.route?.from ?? '—'} → ${previewData.route?.to ?? '—'}`}
                            />
                            <PreviewCard
                                label="Distance"
                                value={`${previewData.route?.distance_km ?? '—'} km`}
                            />
                            <PreviewCard
                                label="Transport"
                                value={previewData.transport?.name ?? '—'}
                            />
                            <PreviewCard
                                label="Required vehicles"
                                value={previewData.result?.required_vehicles ?? '—'}
                            />
                            <PreviewCard
                                label="Trip time"
                                value={`${previewData.result?.trip_time_hours ?? '—'} h`}
                            />
                            <PreviewCard
                                label="Cycle time"
                                value={`${previewData.result?.cycle_time_hours ?? '—'} h`}
                            />
                            <PreviewCard
                                label="Base cost"
                                value={`${previewData.result?.total_base_cost ?? '—'} €`}
                            />
                            <PreviewCard
                                label="Total cost"
                                value={`${previewData.result?.total_cost ?? '—'} €`}
                            />
                            <PreviewCard
                                label="Fuel per vehicle"
                                value={`${previewData.result?.fuel_used_liters_per_vehicle ?? '—'} l`}
                            />
                            <PreviewCard
                                label="Needs refuel"
                                value={previewData.result?.needs_refuel ? 'Yes' : 'No'}
                            />
                            <PreviewCard
                                label="Route valid"
                                value={
                                    previewData.result?.can_complete_with_current_route_data
                                        ? 'Yes'
                                        : 'No'
                                }
                            />
                            <PreviewCard
                                label="Suggested fuel stop"
                                value={
                                    previewData.fuel?.recommended_fuel_stop
                                        ? `${previewData.fuel.recommended_fuel_stop.station_name ?? '—'} (${previewData.fuel.recommended_fuel_stop.distance_from_start_km} km)`
                                        : 'None'
                                }
                            />
                        </div>
                    ) : null}
                </OrderTemplateFormSection>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => onCancel?.()}
                    className="rounded-xl border border-[#d9ded9] bg-white px-5 py-3 text-[15px] font-medium text-[#182219] hover:bg-[#f7f9f7]"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleTryScenario}
                    disabled={isTryingScenario}
                    className="rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:opacity-60"
                >
                    {isTryingScenario ? 'Calculating…' : 'Preview scenario'}
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white hover:bg-[#135740]"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6b7870]">
                {label}
            </label>
            {children}
            {error ? <FieldError error={error} /> : null}
        </div>
    );
}

function FieldError({ error }: { error: string }) {
    return <div className="mt-2 text-[12px] text-red-700">{error}</div>;
}

function ToggleGrid({
    title,
    description,
    items,
}: {
    title: string;
    description?: string;
    items: Array<{
        label: string;
        checked: boolean;
        onChange: (value: boolean) => void;
        error?: string;
    }>;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="text-[15px] font-semibold text-[#182219]">{title}</div>
            {description ? (
                <p className="mt-1 text-[13px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            ) : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                    <label
                        key={item.label}
                        className="rounded-2xl border border-[#d9ded9] bg-white px-4 py-3 text-[14px] text-[#182219]"
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(event) => item.onChange(event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                            />
                            <span className="min-w-0">
                                <span className="block font-medium">{item.label}</span>
                                {item.error ? <FieldError error={item.error} /> : null}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

function SelectionPills({
    title,
    description,
    options,
    selected,
    onToggle,
    error,
}: {
    title: string;
    description?: string;
    options: Array<{ value: string; label: string }>;
    selected: string[];
    onToggle: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="text-[15px] font-semibold text-[#182219]">{title}</div>
            {description ? (
                <p className="mt-1 text-[13px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
                {options.map((option) => {
                    const active = selected.includes(option.value);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onToggle(option.value)}
                            className={`rounded-full border px-3 py-2 text-[13px] font-medium transition ${
                                active
                                    ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                    : 'border-[#d9ded9] bg-white text-[#182219] hover:bg-[#f7f9f7]'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
            {error ? <FieldError error={error} /> : null}
        </div>
    );
}

function CompactGrid({
    title,
    description,
    fields,
}: {
    title: string;
    description?: string;
    fields: Array<{
        label: string;
        value: string;
        onChange: (value: string) => void;
        error?: string;
        disabled?: boolean;
        type?: string;
    }>;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="text-[15px] font-semibold text-[#182219]">{title}</div>
            {description ? (
                <p className="mt-1 text-[13px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fields.map((field) => (
                    <Field key={field.label} label={field.label} error={field.error}>
                        <input
                            type={field.type ?? 'number'}
                            min={field.type === 'datetime-local' ? undefined : '0'}
                            step={field.type === 'datetime-local' ? undefined : '1'}
                            value={field.value}
                            onChange={(event) => field.onChange(event.target.value)}
                            disabled={field.disabled}
                            className="mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d] disabled:opacity-60"
                        />
                    </Field>
                ))}
            </div>
        </div>
    );
}

function SelectableGrid({
    title,
    items,
    selected,
    onToggle,
}: {
    title: string;
    items: Array<{ id: number; title: string; description: string }>;
    selected: number[];
    onToggle: (id: number) => void;
}) {
    return (
        <div>
            <div className="text-[15px] font-semibold text-[#182219]">{title}</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const active = selected.includes(item.id);

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggle(item.id)}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                                active
                                    ? 'border-[#166a4d] bg-[#edf6f0]'
                                    : 'border-[#d9ded9] bg-[#fbfcfb] hover:bg-white'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[14px] font-semibold text-[#182219]">
                                        {item.title}
                                    </div>
                                    <div className="mt-1 text-[13px] text-[#5b6b61]">
                                        {item.description}
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                                        active
                                            ? 'bg-[#166a4d] text-white'
                                            : 'bg-[#eef2ef] text-[#64756a]'
                                    }`}
                                >
                                    {active ? 'Selected' : 'Available'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
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
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7a877f]">
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}
