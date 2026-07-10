import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import OrderTemplateFormSection from './OrderTemplateFormSection';
import MapRouteBuilder, {
    type RouteBuilderPoint,
    type RouteBuilderPreview,
} from '@/components/routing/MapRouteBuilder';
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
    latitude?: number | string | null;
    longitude?: number | string | null;
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

type RouteTemplatePoint = {
    id?: number;
    location_id?: number | null;
    name: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    point_type?: string | null;
    type?: string | null;
    metadata?: Partial<RouteBuilderPoint> | null;
};

type RouteTemplateOption = {
    id: number;
    name: string;
    mode?: string | null;
    total_distance_km?: number | string | null;
    total_duration_hours?: number | string | null;
    points?: RouteTemplatePoint[];
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
    routeTemplates?: RouteTemplateOption[];
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
    route_template_id?: number | string | null;
    routeTemplate?: RouteTemplateOption | null;
    route_template?: RouteTemplateOption | null;
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
        costs?: {
            day_shift_start_hour?: number | string | null;
            night_shift_start_hour?: number | string | null;
            labor_cost_per_hour_day?: number | string | null;
            machine_cost_per_hour_day?: number | string | null;
            night_shift_multiplier?: number | string | null;
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
            distance_from_start_km?: number | null;
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

const DRAFT_STORAGE_PREFIX = 'loadmaster.order-template-form';

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
            getDefaultScenarioFocus(
                initialData.scenario_type ?? 'land_transport',
            ),
    );
    const [evaluationMode, setEvaluationMode] = useState(
        initialData.evaluation_mode ?? 'practice',
    );
    const [status, setStatus] = useState(initialData.status ?? 'draft');
    const [priority, setPriority] = useState(initialData.priority ?? '');
    const [description, setDescription] = useState(
        initialData.description ?? '',
    );
    const [studentBrief, setStudentBrief] = useState(
        initialData.student_brief ?? '',
    );
    const [teacherNotes, setTeacherNotes] = useState(
        initialData.teacher_notes ?? '',
    );

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
    const [routeTemplateId, setRouteTemplateId] = useState(
        String(initialData.route_template_id ?? ''),
    );
    const [attachedRouteName, setAttachedRouteName] = useState(
        (initialData.routeTemplate ?? initialData.route_template)?.name ?? '',
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
    const [maxTrips, setMaxTrips] = useState(
        String(initialData.max_trips ?? ''),
    );
    const [requiresRefuelPlanning, setRequiresRefuelPlanning] = useState(
        Boolean(initialData.requires_refuel_planning ?? false),
    );

    const [timingLoadingFixedMinutes, setTimingLoadingFixedMinutes] = useState(
        String(
            initialData.scenario_config?.timing?.loading_fixed_minutes ?? 45,
        ),
    );
    const [timingFuelStopMinutes, setTimingFuelStopMinutes] = useState(
        String(initialData.scenario_config?.timing?.fuel_stop_minutes ?? 20),
    );
    const [timingPortProcessingMinutes, setTimingPortProcessingMinutes] =
        useState(
            String(
                initialData.scenario_config?.timing?.port_processing_minutes ??
                    60,
            ),
        );
    const [timingShipLoadingMinutes, setTimingShipLoadingMinutes] = useState(
        String(initialData.scenario_config?.timing?.ship_loading_minutes ?? 90),
    );
    const [timingSeaTransitMinutes, setTimingSeaTransitMinutes] = useState(
        String(initialData.scenario_config?.timing?.sea_transit_minutes ?? 360),
    );
    const [
        timingMaxDriveMinutesBeforeRest,
        setTimingMaxDriveMinutesBeforeRest,
    ] = useState(
        String(
            initialData.scenario_config?.timing
                ?.max_drive_minutes_before_rest ?? 270,
        ),
    );
    const [timingRestMinutes, setTimingRestMinutes] = useState(
        String(initialData.scenario_config?.timing?.rest_minutes ?? 45),
    );
    const [costDayShiftStartHour, setCostDayShiftStartHour] = useState(
        String(initialData.scenario_config?.costs?.day_shift_start_hour ?? 6),
    );
    const [costNightShiftStartHour, setCostNightShiftStartHour] = useState(
        String(
            initialData.scenario_config?.costs?.night_shift_start_hour ?? 20,
        ),
    );
    const [costLaborCostPerHourDay, setCostLaborCostPerHourDay] = useState(
        String(
            initialData.scenario_config?.costs?.labor_cost_per_hour_day ?? 18,
        ),
    );
    const [costMachineCostPerHourDay, setCostMachineCostPerHourDay] = useState(
        String(
            initialData.scenario_config?.costs?.machine_cost_per_hour_day ?? 30,
        ),
    );
    const [costNightShiftMultiplier, setCostNightShiftMultiplier] = useState(
        String(
            initialData.scenario_config?.costs?.night_shift_multiplier ?? 1.35,
        ),
    );

    const [waitingPortQueueMinutes, setWaitingPortQueueMinutes] = useState(
        String(
            initialData.scenario_config?.availability?.port_queue_minutes ?? 0,
        ),
    );
    const [waitingShipReadyAt, setWaitingShipReadyAt] = useState(
        normalizeDateTime(
            initialData.scenario_config?.availability?.ship_ready_at,
        ),
    );

    const [scoringTimeWeight, setScoringTimeWeight] = useState(
        String(initialData.scenario_config?.scoring?.time_weight ?? 35),
    );
    const [scoringCostWeight, setScoringCostWeight] = useState(
        String(initialData.scenario_config?.scoring?.cost_weight ?? 25),
    );
    const [scoringCompatibilityWeight, setScoringCompatibilityWeight] =
        useState(
            String(
                initialData.scenario_config?.scoring?.compatibility_weight ??
                    25,
            ),
        );
    const [scoringTripsWeight, setScoringTripsWeight] = useState(
        String(initialData.scenario_config?.scoring?.trips_weight ?? 15),
    );

    const [requiresLoadingMethodChoice, setRequiresLoadingMethodChoice] =
        useState(Boolean(initialData.requires_loading_method_choice ?? false));
    const [requiresUnloadingMethodChoice, setRequiresUnloadingMethodChoice] =
        useState(
            Boolean(initialData.requires_unloading_method_choice ?? false),
        );
    const [allowManualHandling, setAllowManualHandling] = useState(
        Boolean(initialData.allow_manual_handling ?? true),
    );
    const [allowPortEquipment, setAllowPortEquipment] = useState(
        Boolean(initialData.allow_port_equipment ?? true),
    );
    const [allowShipEquipment, setAllowShipEquipment] = useState(
        Boolean(initialData.allow_ship_equipment ?? true),
    );
    const [allowedHandlingMethodCodes, setAllowedHandlingMethodCodes] =
        useState<string[]>(initialData.allowed_handling_method_codes ?? []);
    const [requiredHandlingMethodCodes, setRequiredHandlingMethodCodes] =
        useState<string[]>(initialData.required_handling_method_codes ?? []);
    const [allowedShipCargoModes, setAllowedShipCargoModes] = useState<
        string[]
    >(initialData.allowed_ship_cargo_modes ?? []);
    const [forbiddenShipCargoModes, setForbiddenShipCargoModes] = useState<
        string[]
    >(initialData.forbidden_ship_cargo_modes ?? []);
    const [
        compatibilityEnforcePortCargoSupport,
        setCompatibilityEnforcePortCargoSupport,
    ] = useState(
        initialData.scenario_config?.compatibility
            ?.enforce_port_cargo_support ?? true,
    );
    const [
        compatibilityEnforceShipCargoSupport,
        setCompatibilityEnforceShipCargoSupport,
    ] = useState(
        initialData.scenario_config?.compatibility
            ?.enforce_ship_cargo_support ?? true,
    );
    const [
        compatibilityEnforcePortShipDraft,
        setCompatibilityEnforcePortShipDraft,
    ] = useState(
        initialData.scenario_config?.compatibility?.enforce_port_ship_draft ??
            true,
    );
    const [
        compatibilityEnforceHandlingCompatibility,
        setCompatibilityEnforceHandlingCompatibility,
    ] = useState(
        initialData.scenario_config?.compatibility
            ?.enforce_handling_compatibility ?? true,
    );

    const [transportTemplateIds, setTransportTemplateIds] = useState<number[]>(
        (
            initialData.transportTemplates ??
            initialData.transport_templates ??
            []
        ).map((item) => item.id),
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
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(
        null,
    );
    const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
    const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);

    const caps = useMemo(
        () => getScenarioCapabilities(scenarioType),
        [scenarioType],
    );
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
    const sortedRouteTemplateOptions = useMemo(
        () =>
            [...(options.routeTemplates ?? [])].sort((left, right) =>
                left.name.localeCompare(right.name),
            ),
        [options.routeTemplates],
    );
    const selectedRouteTemplate = useMemo(
        () =>
            sortedRouteTemplateOptions.find(
                (template) => String(template.id) === String(routeTemplateId),
            ) ?? null,
        [routeTemplateId, sortedRouteTemplateOptions],
    );
    const initialRouteTemplate =
        initialData.routeTemplate ?? initialData.route_template;
    const routeBuilderInitialPoints = useMemo(() => {
        const templatePoints = initialRouteTemplate?.points ?? [];

        if (templatePoints.length > 0) {
            return templatePoints
                .filter(
                    (point) =>
                        Number.isFinite(Number(point.latitude)) &&
                        Number.isFinite(Number(point.longitude)),
                )
                .map(routeTemplatePointToRoutePoint);
        }

        return [startLocationId, endLocationId]
            .map((id) =>
                options.locations.find(
                    (location) => String(location.id) === String(id),
                ),
            )
            .filter(
                (location): location is LocationOption =>
                    Boolean(location) &&
                    Number.isFinite(Number(location?.latitude)) &&
                    Number.isFinite(Number(location?.longitude)),
            )
            .map(locationOptionToRoutePoint);
    }, [
        endLocationId,
        initialRouteTemplate?.points,
        options.locations,
        startLocationId,
    ]);

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
            setRouteTemplateId('');
            setAttachedRouteName('');
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
        cargo_amount_tons:
            cargoAmountTons === '' ? null : Number(cargoAmountTons),
        cargo_volume_m3: cargoVolumeM3 === '' ? null : Number(cargoVolumeM3),
        cargo_value: cargoValue === '' ? null : Number(cargoValue),
        temperature_mode_id:
            temperatureModeId === '' ? null : Number(temperatureModeId),
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
        route_template_id:
            caps.route && routeTemplateId !== ''
                ? Number(routeTemplateId)
                : null,
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
        cost_day_shift_start_hour:
            costDayShiftStartHour === '' ? null : Number(costDayShiftStartHour),
        cost_night_shift_start_hour:
            costNightShiftStartHour === ''
                ? null
                : Number(costNightShiftStartHour),
        cost_labor_cost_per_hour_day:
            costLaborCostPerHourDay === ''
                ? null
                : Number(costLaborCostPerHourDay),
        cost_machine_cost_per_hour_day:
            costMachineCostPerHourDay === ''
                ? null
                : Number(costMachineCostPerHourDay),
        cost_night_shift_multiplier:
            costNightShiftMultiplier === ''
                ? null
                : Number(costNightShiftMultiplier),
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

    type DraftPayload = Partial<ReturnType<typeof buildPayload>>;

    const draftStorageKey = `${DRAFT_STORAGE_PREFIX}.${isEdit && id ? `edit.${id}` : 'create'}`;

    const stringValue = (value: unknown) =>
        value === null || value === undefined ? '' : String(value);

    const booleanValue = (value: unknown, fallback = false) =>
        typeof value === 'boolean' ? value : fallback;

    const numberArrayValue = (value: unknown) =>
        Array.isArray(value)
            ? value
                  .map((item) => Number(item))
                  .filter((item) => Number.isFinite(item))
            : [];

    const stringArrayValue = (value: unknown) =>
        Array.isArray(value)
            ? value
                  .map((item) => String(item))
                  .filter((item) => item.length > 0)
            : [];

    const applyDraftPayload = (payload: DraftPayload) => {
        setTitle(stringValue(payload.title));
        setScenarioType(stringValue(payload.scenario_type) || 'land_transport');
        setScenarioFocus(
            stringValue(payload.scenario_focus) ||
                getDefaultScenarioFocus(
                    stringValue(payload.scenario_type) || 'land_transport',
                ),
        );
        setEvaluationMode(stringValue(payload.evaluation_mode) || 'practice');
        setStatus(stringValue(payload.status) || 'draft');
        setPriority(stringValue(payload.priority));
        setDescription(stringValue(payload.description));
        setStudentBrief(stringValue(payload.student_brief));
        setTeacherNotes(stringValue(payload.teacher_notes));
        setCargoName(stringValue(payload.cargo_name));
        setCargoType(stringValue(payload.cargo_type));
        setCargoMode(stringValue(payload.cargo_mode));
        setCargoAmountContainers(stringValue(payload.cargo_amount_containers));
        setCargoAmountTons(stringValue(payload.cargo_amount_tons));
        setCargoVolumeM3(stringValue(payload.cargo_volume_m3));
        setCargoValue(stringValue(payload.cargo_value));
        setTemperatureModeId(stringValue(payload.temperature_mode_id));
        setSpecialConditionId(stringValue(payload.special_condition_id));
        setRequiresClosedSpace(booleanValue(payload.requires_closed_space));
        setRequiresVentilation(booleanValue(payload.requires_ventilation));
        setRequiresHazardousSupport(
            booleanValue(payload.requires_hazardous_support),
        );
        setAllowedShipCargoModes(
            stringArrayValue(payload.allowed_ship_cargo_modes),
        );
        setForbiddenShipCargoModes(
            stringArrayValue(payload.forbidden_ship_cargo_modes),
        );
        setRequiresLoadingMethodChoice(
            booleanValue(payload.requires_loading_method_choice),
        );
        setRequiresUnloadingMethodChoice(
            booleanValue(payload.requires_unloading_method_choice),
        );
        setAllowManualHandling(
            booleanValue(payload.allow_manual_handling, true),
        );
        setAllowPortEquipment(booleanValue(payload.allow_port_equipment, true));
        setAllowShipEquipment(booleanValue(payload.allow_ship_equipment, true));
        setAllowedHandlingMethodCodes(
            stringArrayValue(payload.allowed_handling_method_codes),
        );
        setRequiredHandlingMethodCodes(
            stringArrayValue(payload.required_handling_method_codes),
        );
        setCompatibilityEnforcePortCargoSupport(
            booleanValue(
                payload.compatibility_enforce_port_cargo_support,
                true,
            ),
        );
        setCompatibilityEnforceShipCargoSupport(
            booleanValue(
                payload.compatibility_enforce_ship_cargo_support,
                true,
            ),
        );
        setCompatibilityEnforcePortShipDraft(
            booleanValue(payload.compatibility_enforce_port_ship_draft, true),
        );
        setCompatibilityEnforceHandlingCompatibility(
            booleanValue(
                payload.compatibility_enforce_handling_compatibility,
                true,
            ),
        );
        setStartLocationId(stringValue(payload.start_location_id));
        setEndLocationId(stringValue(payload.end_location_id));
        setStartPortId(stringValue(payload.start_port_id));
        setEndPortId(stringValue(payload.end_port_id));
        setRouteTemplateId(stringValue(payload.route_template_id));
        setScenarioStartAt(stringValue(payload.scenario_start_at));
        setDeadlineAt(stringValue(payload.deadline_at));
        setDeadlineDate(stringValue(payload.deadline_date));
        setBudgetLimit(stringValue(payload.budget_limit));
        setMaxTrips(stringValue(payload.max_trips));
        setRequiresRefuelPlanning(
            booleanValue(payload.requires_refuel_planning),
        );
        setTimingLoadingFixedMinutes(
            stringValue(payload.timing_loading_fixed_minutes),
        );
        setTimingFuelStopMinutes(stringValue(payload.timing_fuel_stop_minutes));
        setTimingPortProcessingMinutes(
            stringValue(payload.timing_port_processing_minutes),
        );
        setTimingShipLoadingMinutes(
            stringValue(payload.timing_ship_loading_minutes),
        );
        setTimingSeaTransitMinutes(
            stringValue(payload.timing_sea_transit_minutes),
        );
        setTimingMaxDriveMinutesBeforeRest(
            stringValue(payload.timing_max_drive_minutes_before_rest),
        );
        setTimingRestMinutes(stringValue(payload.timing_rest_minutes));
        setCostDayShiftStartHour(
            stringValue(payload.cost_day_shift_start_hour),
        );
        setCostNightShiftStartHour(
            stringValue(payload.cost_night_shift_start_hour),
        );
        setCostLaborCostPerHourDay(
            stringValue(payload.cost_labor_cost_per_hour_day),
        );
        setCostMachineCostPerHourDay(
            stringValue(payload.cost_machine_cost_per_hour_day),
        );
        setCostNightShiftMultiplier(
            stringValue(payload.cost_night_shift_multiplier),
        );
        setWaitingPortQueueMinutes(
            stringValue(payload.waiting_port_queue_minutes),
        );
        setWaitingShipReadyAt(stringValue(payload.waiting_ship_ready_at));
        setScoringTimeWeight(stringValue(payload.scoring_time_weight));
        setScoringCostWeight(stringValue(payload.scoring_cost_weight));
        setScoringCompatibilityWeight(
            stringValue(payload.scoring_compatibility_weight),
        );
        setScoringTripsWeight(stringValue(payload.scoring_trips_weight));
        setTransportTemplateIds(
            numberArrayValue(payload.transport_template_ids),
        );
        setShipIds(numberArrayValue(payload.ship_ids));
        setPortIds(numberArrayValue(payload.port_ids));
        setLandRouteIds(numberArrayValue(payload.land_route_ids));
        setFuelStationIds(numberArrayValue(payload.fuel_station_ids));
    };

    const clearSavedDraft = () => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.removeItem(draftStorageKey);
        setRestoredDraftAt(null);
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            setHasRestoredDraft(true);
            return;
        }

        const storedDraft = window.localStorage.getItem(draftStorageKey);

        if (storedDraft) {
            try {
                const parsed = JSON.parse(storedDraft) as {
                    payload?: DraftPayload;
                    savedAt?: string;
                };

                if (parsed.payload) {
                    applyDraftPayload(parsed.payload);
                    setRestoredDraftAt(parsed.savedAt ?? null);
                }
            } catch {
                window.localStorage.removeItem(draftStorageKey);
            }
        }

        setHasRestoredDraft(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftStorageKey]);

    useEffect(() => {
        if (!hasRestoredDraft || typeof window === 'undefined') {
            return;
        }

        const timeout = window.setTimeout(() => {
            window.localStorage.setItem(
                draftStorageKey,
                JSON.stringify({
                    savedAt: new Date().toISOString(),
                    payload: buildPayload(),
                }),
            );
        }, 400);

        return () => window.clearTimeout(timeout);
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const payload = buildPayload();

        if (
            caps.route &&
            !payload.route_template_id &&
            payload.land_route_ids.length === 0
        ) {
            setPreviewData(null);
            setPreviewError(
                'Build and attach a map route before saving this task.',
            );
            return;
        }

        if (isEdit && id) {
            router.put(`/teacher/templates/order-templates/${id}`, payload, {
                onSuccess: clearSavedDraft,
            });
            return;
        }

        router.post('/teacher/templates/order-templates', payload, {
            onSuccess: clearSavedDraft,
        });
    };

    const handleTryScenario = async () => {
        setIsTryingScenario(true);
        setPreviewError(null);
        setPreviewData(null);

        try {
            const response = await fetch(
                '/teacher/templates/order-templates/preview',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(buildPayload()),
                    credentials: 'same-origin',
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setPreviewError(
                    data.message || 'Neizdevās aprēķināt priekšskatījumu.',
                );
                return;
            }

            setPreviewData(data);
        } catch {
            setPreviewError('Neizdevās sasniegt serveri.');
        } finally {
            setIsTryingScenario(false);
        }
    };

    const handleUseMapRoute = (routePreview: RouteBuilderPreview) => {
        if (routePreview.route_template?.id) {
            setRouteTemplateId(String(routePreview.route_template.id));
            setAttachedRouteName(routePreview.route_template.name);
            setLandRouteIds([]);
        }

        const landIds = routePreview.land_route_ids ?? [];

        if (!routePreview.route_template?.id && landIds.length > 0) {
            setLandRouteIds((current) =>
                Array.from(new Set([...current, ...landIds])),
            );
        }

        const firstPoint = routePreview.points[0];
        const lastPoint = routePreview.points[routePreview.points.length - 1];

        if (firstPoint?.location_id && caps.startLocation) {
            setStartLocationId(String(firstPoint.location_id));
        }

        if (lastPoint?.location_id && caps.endLocation) {
            setEndLocationId(String(lastPoint.location_id));
        }

        setPreviewError(null);
        setPreviewData({
            route: {
                from: firstPoint?.name ?? null,
                to: lastPoint?.name ?? null,
                distance_km: Number(routePreview.total_distance_km ?? 0),
            },
            result: {
                can_complete_with_current_route_data:
                    (routePreview.errors ?? []).length === 0,
            },
        });
    };

    const handleUseSavedRouteTemplate = (templateId: string) => {
        setRouteTemplateId(templateId);
        setLandRouteIds([]);

        const template =
            sortedRouteTemplateOptions.find(
                (option) => String(option.id) === String(templateId),
            ) ?? null;

        if (!template) {
            setAttachedRouteName('');
            setPreviewData(null);
            return;
        }

        setAttachedRouteName(template.name);

        const points = template.points ?? [];
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        if (firstPoint?.location_id && caps.startLocation) {
            setStartLocationId(String(firstPoint.location_id));
        }

        if (lastPoint?.location_id && caps.endLocation) {
            setEndLocationId(String(lastPoint.location_id));
        }

        setPreviewError(null);
        setPreviewData({
            route: {
                from: firstPoint?.name ?? null,
                to: lastPoint?.name ?? null,
                distance_km: Number(template.total_distance_km ?? 0),
            },
            result: {
                can_complete_with_current_route_data: true,
            },
        });
    };

    const handleMapPreviewChange = (
        routePreview: RouteBuilderPreview | null,
    ) => {
        if (routePreview === null) {
            setRouteTemplateId('');
            setAttachedRouteName('');
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';
    const textareaClass = `${inputClass} min-h-[120px]`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-[#cfe3d8] bg-[#f3faf6] px-4 py-3 text-[14px] text-[#32523f]">
                <span className="font-semibold">
                    Melnraksta autosaglabāšana ir ieslēgta.
                </span>{' '}
                {restoredDraftAt
                    ? `Atjaunots pārlūka melnraksts no ${new Intl.DateTimeFormat(
                          'lv-LV',
                          {
                              dateStyle: 'short',
                              timeStyle: 'short',
                          },
                      ).format(new Date(restoredDraftAt))}.`
                    : 'Izmaiņas paliek šajā pārlūkā līdz sagataves saglabāšanai.'}
            </div>

            <OrderTemplateFormSection
                title="Pamatinformācija"
                description="Sāc ar scenārija tipu, mācību mērķi un datiem, kas nosaka, kā simulators atvērsies studentam."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Nosaukums" error={errors.title}>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className={inputClass}
                            placeholder="Konteineru piegāde uz ostu"
                            required
                        />
                    </Field>

                    <Field label="Scenārija tips" error={errors.scenario_type}>
                        <select
                            value={scenarioType}
                            onChange={(event) =>
                                setScenarioType(event.target.value)
                            }
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

                    <Field
                        label="Scenārija fokuss"
                        error={errors.scenario_focus}
                    >
                        <select
                            value={scenarioFocus}
                            onChange={(event) =>
                                setScenarioFocus(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">Automātiski</option>
                            {(options.scenarioFocuses ?? []).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Vērtēšanas režīms"
                        error={errors.evaluation_mode}
                    >
                        <select
                            value={evaluationMode}
                            onChange={(event) =>
                                setEvaluationMode(event.target.value)
                            }
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

                    <Field label="Statuss" error={errors.status}>
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

                    <Field label="Prioritāte" error={errors.priority}>
                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">Nav izvēlēts</option>
                            {options.priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Skolotāja apraksts" error={errors.description}>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className={textareaClass}
                        placeholder="Iekšējs apraksts par uzdevuma uzstādījumu, grūtību un mācību mērķi."
                    />
                </Field>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Uzdevuma teksts"
                description="Atdali studentam redzamo ievadu no skolotāja piezīmēm, lai uzdevums paliek skaidrs."
            >
                <div className="grid gap-4 xl:grid-cols-2">
                    <Field label="Studenta ievads" error={errors.student_brief}>
                        <textarea
                            value={studentBrief}
                            onChange={(event) =>
                                setStudentBrief(event.target.value)
                            }
                            className={textareaClass}
                            placeholder="Teksts, ko students redz, atverot simulatoru."
                        />
                    </Field>

                    <Field
                        label="Skolotāja piezīmes"
                        error={errors.teacher_notes}
                    >
                        <textarea
                            value={teacherNotes}
                            onChange={(event) =>
                                setTeacherNotes(event.target.value)
                            }
                            className={textareaClass}
                            placeholder="Privātas piezīmes par mācību nolūku, biežām kļūdām vai vērtēšanas pieņēmumiem."
                        />
                    </Field>
                </div>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Kravas profils"
                description="Definē kravu, tās apjomu un saderības noteikumus, kas jāņem vērā visa scenārija laikā."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Kravas nosaukums" error={errors.cargo_name}>
                        <input
                            type="text"
                            value={cargoName}
                            onChange={(event) =>
                                setCargoName(event.target.value)
                            }
                            className={inputClass}
                            placeholder="Saldēta pārtika"
                        />
                    </Field>

                    <Field label="Kravas tips" error={errors.cargo_type}>
                        <input
                            type="text"
                            value={cargoType}
                            onChange={(event) =>
                                setCargoType(event.target.value)
                            }
                            className={inputClass}
                            placeholder="Konteineru krava"
                        />
                    </Field>

                    <Field label="Kravas režīms" error={errors.cargo_mode}>
                        <select
                            value={cargoMode}
                            onChange={(event) =>
                                setCargoMode(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">Nav norādīts</option>
                            {cargoModeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Temperatūras režīms"
                        error={errors.temperature_mode_id}
                    >
                        <select
                            value={temperatureModeId}
                            onChange={(event) =>
                                setTemperatureModeId(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">Nav izvēlēts</option>
                            {options.temperatureModes.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Konteineri"
                        error={errors.cargo_amount_containers}
                    >
                        <input
                            type="number"
                            min="0"
                            value={cargoAmountContainers}
                            onChange={(event) =>
                                setCargoAmountContainers(event.target.value)
                            }
                            className={inputClass}
                            placeholder="500"
                        />
                    </Field>

                    <Field label="Tonnas" error={errors.cargo_amount_tons}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoAmountTons}
                            onChange={(event) =>
                                setCargoAmountTons(event.target.value)
                            }
                            className={inputClass}
                            placeholder="10000"
                        />
                    </Field>

                    <Field label="Tilpums m3" error={errors.cargo_volume_m3}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoVolumeM3}
                            onChange={(event) =>
                                setCargoVolumeM3(event.target.value)
                            }
                            className={inputClass}
                            placeholder="120"
                        />
                    </Field>

                    <Field label="Kravas vērtība" error={errors.cargo_value}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoValue}
                            onChange={(event) =>
                                setCargoValue(event.target.value)
                            }
                            className={inputClass}
                            placeholder="25000"
                        />
                    </Field>

                    <Field
                        label="Īpašais nosacījums"
                        error={errors.special_condition_id}
                    >
                        <select
                            value={specialConditionId}
                            onChange={(event) =>
                                setSpecialConditionId(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">Nav izvēlēts</option>
                            {options.specialConditions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <ToggleGrid
                    title="Aizsardzības prasības"
                    description="Šie nosacījumi ietekmē kuģa, ostas un apstrādes saderību."
                    items={[
                        {
                            label: 'Nepieciešama slēgta kravas telpa',
                            checked: requiresClosedSpace,
                            onChange: setRequiresClosedSpace,
                            error: errors.requires_closed_space,
                        },
                        {
                            label: 'Nepieciešama ventilācija',
                            checked: requiresVentilation,
                            onChange: setRequiresVentilation,
                            error: errors.requires_ventilation,
                        },
                        {
                            label: 'Nepieciešams bīstamo kravu atbalsts',
                            checked: requiresHazardousSupport,
                            onChange: setRequiresHazardousSupport,
                            error: errors.requires_hazardous_support,
                        },
                    ]}
                />

                <SelectionPills
                    title="Atļautie kuģa kravas režīmi"
                    description="Neobligāts atļauto režīmu saraksts. Atstāj tukšu, lai pieņemtu jebkuru saderīgu kuģa profilu."
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
                    title="Aizliegtie kuģa kravas režīmi"
                    description="Neobligāts aizliegto režīmu saraksts konkrētiem kuģa kravas profiliem."
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

            {(caps.startLocation ||
                caps.endLocation ||
                caps.startPort ||
                caps.endPort) && (
                <OrderTemplateFormSection
                    title="Maršruts un kontroles punkti"
                    description="Izveido piegādes maršrutu kartē un pievieno to uzdevumam. Sākuma un gala punkti tiek izmantoti pārbaudei."
                >
                    {caps.route ? (
                        <>
                            <div className="mb-5 rounded-xl border border-[#d9ded9] bg-white p-4">
                                <label
                                    htmlFor="route_template_picker"
                                    className="text-[13px] font-semibold text-[#344137]"
                                >
                                    SaglabÄts marÅ¡ruts
                                </label>
                                <select
                                    id="route_template_picker"
                                    value={routeTemplateId}
                                    onChange={(event) =>
                                        handleUseSavedRouteTemplate(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">
                                        IzvÄ“lies kartes marÅ¡rutu
                                    </option>
                                    {sortedRouteTemplateOptions.map(
                                        (template) => (
                                            <option
                                                key={template.id}
                                                value={template.id}
                                            >
                                                {formatRouteTemplateLabel(
                                                    template,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                                {selectedRouteTemplate ? (
                                    <p className="mt-2 text-[13px] leading-5 text-[#5d6b61]">
                                        {formatRouteTemplateDescription(
                                            selectedRouteTemplate,
                                        )}
                                    </p>
                                ) : null}
                            </div>

                            <MapRouteBuilder
                                title="Izveido uzdevuma maršrutu"
                                initialPoints={routeBuilderInitialPoints}
                                isAttached={routeTemplateId !== ''}
                                attachedRouteName={
                                    attachedRouteName ||
                                    (routeTemplateId
                                        ? `Maršruts #${routeTemplateId}`
                                        : '')
                                }
                                onUseRoute={handleUseMapRoute}
                                onPreviewChange={handleMapPreviewChange}
                                className="mb-5"
                            />
                            {routeTemplateId ? (
                                <div className="mb-5 rounded-2xl border border-[#cfe3d8] bg-[#f3faf6] px-4 py-3 text-[14px] leading-6 text-[#32523f]">
                                    <span className="font-semibold">
                                        Kartes maršruts pievienots.
                                    </span>{' '}
                                    {attachedRouteName ||
                                        `Maršruts #${routeTemplateId}`}{' '}
                                    tiks saglabāts kā maršruts, ko studenti
                                    redzēs simulatorā.
                                </div>
                            ) : null}

                            {errors.route_template_id ? (
                                <div className="mb-5">
                                    <FieldError
                                        error={errors.route_template_id}
                                    />
                                </div>
                            ) : null}

                            {!routeTemplateId ? (
                                <div className="mb-5">
                                    <AdvancedDisclosure
                                        title="Vecie saglabātie sauszemes maršruti"
                                        description="Izmanto tikai veciem uzdevumiem, kam vēl vajadzīgi saglabātie sauszemes maršrutu ieraksti. V2 uzdevumiem pievieno kartes maršrutu augstāk."
                                    >
                                        <SelectableGrid
                                            title="Sauszemes maršruti"
                                            items={sortedLandRouteOptions.map(
                                                (item) => ({
                                                    id: item.id,
                                                    title: formatRouteOptionLabel(
                                                        item,
                                                    ),
                                                    description:
                                                        formatRouteOptionDescription(
                                                            item,
                                                        ),
                                                }),
                                            )}
                                            selected={landRouteIds}
                                            onToggle={(value) =>
                                                toggleNumberSelection(
                                                    landRouteIds,
                                                    setLandRouteIds,
                                                    value,
                                                )
                                            }
                                        />
                                    </AdvancedDisclosure>
                                </div>
                            ) : null}
                        </>
                    ) : null}

                    <div className="mb-3">
                        <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                            Pārbaudes punkti
                        </div>
                        <p className="mt-1 text-[14px] leading-6 text-[#5b6b61]">
                            Šie ir oficiālie uzdevuma sākuma un gala punkti. Ja
                            kartes punkti nāk no saglabātām vietām, tie tiek
                            aizpildīti automātiski.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {caps.startLocation ? (
                            <Field
                                label="Sākuma vieta"
                                error={errors.start_location_id}
                            >
                                <select
                                    value={startLocationId}
                                    onChange={(event) =>
                                        setStartLocationId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Nav izvēlēts</option>
                                    {sortedLocationOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {formatLocationOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.endLocation ? (
                            <Field
                                label="Gala vieta"
                                error={errors.end_location_id}
                            >
                                <select
                                    value={endLocationId}
                                    onChange={(event) =>
                                        setEndLocationId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Nav izvēlēts</option>
                                    {sortedLocationOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {formatLocationOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.startPort ? (
                            <Field
                                label="Sākuma osta"
                                error={errors.start_port_id}
                            >
                                <select
                                    value={startPortId}
                                    onChange={(event) =>
                                        setStartPortId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Nav izvēlēts</option>
                                    {sortedPortOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {formatPortOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}

                        {caps.endPort ? (
                            <Field label="Gala osta" error={errors.end_port_id}>
                                <select
                                    value={endPortId}
                                    onChange={(event) =>
                                        setEndPortId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Nav izvēlēts</option>
                                    {sortedPortOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {formatPortOptionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        ) : null}
                    </div>
                </OrderTemplateFormSection>
            )}

            <AdvancedDisclosure
                title="Papildu laiki, izmaksas un vērtēšana"
                description="Atver tikai tad, ja scenārijam vajag pielāgot termiņus, nakts tarifus, atpūtas noteikumus vai punktu svarus."
            >
                <OrderTemplateFormSection
                    title="Laiki, limiti un vērtēšana"
                    description="Operatīvie ierobežojumi un vērtēšanas svari šim scenārijam."
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field
                            label="Scenārija sākums"
                            error={errors.scenario_start_at}
                        >
                            <input
                                type="datetime-local"
                                value={scenarioStartAt}
                                onChange={(event) =>
                                    setScenarioStartAt(event.target.value)
                                }
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Termiņš" error={errors.deadline_at}>
                            <input
                                type="datetime-local"
                                value={deadlineAt}
                                onChange={(event) =>
                                    setDeadlineAt(event.target.value)
                                }
                                className={inputClass}
                            />
                        </Field>

                        <Field
                            label="Rezerves termiņa datums"
                            error={errors.deadline_date}
                        >
                            <input
                                type="date"
                                value={deadlineDate}
                                onChange={(event) =>
                                    setDeadlineDate(event.target.value)
                                }
                                className={inputClass}
                            />
                        </Field>

                        <Field
                            label="Budžeta limits"
                            error={errors.budget_limit}
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budgetLimit}
                                onChange={(event) =>
                                    setBudgetLimit(event.target.value)
                                }
                                className={inputClass}
                                placeholder="15000"
                            />
                        </Field>

                        <Field label="Maks. reisi" error={errors.max_trips}>
                            <input
                                type="number"
                                min="0"
                                value={maxTrips}
                                onChange={(event) =>
                                    setMaxTrips(event.target.value)
                                }
                                className={inputClass}
                                placeholder="2"
                            />
                        </Field>
                    </div>

                    {caps.fuel ? (
                        <ToggleGrid
                            title="Plānošanas slēdži"
                            description="Ieslēdz, ja scenārijam jāliek studentam plānot konkrētus operatīvos ierobežojumus."
                            items={[
                                {
                                    label: 'Prasīt degvielas plānošanu',
                                    checked: requiresRefuelPlanning,
                                    onChange: setRequiresRefuelPlanning,
                                    error: errors.requires_refuel_planning,
                                },
                            ]}
                        />
                    ) : null}

                    <CompactGrid
                        title="Timeline noklusējumi"
                        description="Šīs vērtības vada aprēķināto notikumu līniju un ir ātri pielāgojamas."
                        fields={[
                            {
                                label: 'Sākuma iekraušana min',
                                value: timingLoadingFixedMinutes,
                                onChange: setTimingLoadingFixedMinutes,
                                error: errors.timing_loading_fixed_minutes,
                            },
                            {
                                label: 'Uzpildes pietura min',
                                value: timingFuelStopMinutes,
                                onChange: setTimingFuelStopMinutes,
                                error: errors.timing_fuel_stop_minutes,
                                disabled: !caps.fuel,
                            },
                            {
                                label: 'Ostas apstrāde min',
                                value: timingPortProcessingMinutes,
                                onChange: setTimingPortProcessingMinutes,
                                error: errors.timing_port_processing_minutes,
                                disabled: !caps.port,
                            },
                            {
                                label: 'Kuģa iekraušana min',
                                value: timingShipLoadingMinutes,
                                onChange: setTimingShipLoadingMinutes,
                                error: errors.timing_ship_loading_minutes,
                                disabled: !caps.ship,
                            },
                            {
                                label: 'Jūras tranzīts min',
                                value: timingSeaTransitMinutes,
                                onChange: setTimingSeaTransitMinutes,
                                error: errors.timing_sea_transit_minutes,
                                disabled: !caps.ship,
                            },
                            {
                                label: 'Maks. braukšana pirms atpūtas',
                                value: timingMaxDriveMinutesBeforeRest,
                                onChange: setTimingMaxDriveMinutesBeforeRest,
                                error: errors.timing_max_drive_minutes_before_rest,
                                disabled: !caps.transport && !caps.route,
                            },
                            {
                                label: 'Atpūta min',
                                value: timingRestMinutes,
                                onChange: setTimingRestMinutes,
                                error: errors.timing_rest_minutes,
                                disabled: !caps.transport && !caps.route,
                            },
                            {
                                label: 'Ostas rinda min',
                                value: waitingPortQueueMinutes,
                                onChange: setWaitingPortQueueMinutes,
                                error: errors.waiting_port_queue_minutes,
                                disabled: !caps.port,
                            },
                            {
                                label: 'Kuģis gatavs',
                                value: waitingShipReadyAt,
                                onChange: setWaitingShipReadyAt,
                                error: errors.waiting_ship_ready_at,
                                type: 'datetime-local',
                                disabled: !caps.ship,
                            },
                        ]}
                    />

                    <CompactGrid
                        title="Dienas un nakts izmaksas"
                        description="Nakts darbs var būt dārgāks iekraušanai, uzpildei, ostas apstrādei un kuģa operācijām."
                        fields={[
                            {
                                label: 'Dienas maiņa sākas',
                                value: costDayShiftStartHour,
                                onChange: setCostDayShiftStartHour,
                                error: errors.cost_day_shift_start_hour,
                            },
                            {
                                label: 'Nakts maiņa sākas',
                                value: costNightShiftStartHour,
                                onChange: setCostNightShiftStartHour,
                                error: errors.cost_night_shift_start_hour,
                            },
                            {
                                label: 'Darbs EUR/h (dienā)',
                                value: costLaborCostPerHourDay,
                                onChange: setCostLaborCostPerHourDay,
                                error: errors.cost_labor_cost_per_hour_day,
                                step: '0.01',
                            },
                            {
                                label: 'Tehnika EUR/h (dienā)',
                                value: costMachineCostPerHourDay,
                                onChange: setCostMachineCostPerHourDay,
                                error: errors.cost_machine_cost_per_hour_day,
                                step: '0.01',
                            },
                            {
                                label: 'Nakts koeficients',
                                value: costNightShiftMultiplier,
                                onChange: setCostNightShiftMultiplier,
                                error: errors.cost_night_shift_multiplier,
                                type: 'number',
                                min: '1',
                                step: '0.01',
                            },
                        ]}
                    />

                    <CompactGrid
                        title="Vērtēšanas svari"
                        description="Svari ir grupēti, lai tos varētu pielāgot bez datubāzes izmaiņām."
                        fields={[
                            {
                                label: 'Laika svars',
                                value: scoringTimeWeight,
                                onChange: setScoringTimeWeight,
                                error: errors.scoring_time_weight,
                            },
                            {
                                label: 'Izmaksu svars',
                                value: scoringCostWeight,
                                onChange: setScoringCostWeight,
                                error: errors.scoring_cost_weight,
                            },
                            {
                                label: 'Saderības svars',
                                value: scoringCompatibilityWeight,
                                onChange: setScoringCompatibilityWeight,
                                error: errors.scoring_compatibility_weight,
                            },
                            {
                                label: 'Reisu svars',
                                value: scoringTripsWeight,
                                onChange: setScoringTripsWeight,
                                error: errors.scoring_trips_weight,
                            },
                        ]}
                    />
                </OrderTemplateFormSection>
            </AdvancedDisclosure>

            {supportsHandling ? (
                <AdvancedDisclosure
                    title="Papildu kravas apstrāde un saderība"
                    description="Atver, ja uzdevumam vajag īpašus iekraušanas/izkraušanas noteikumus vai stingru ostas un kuģa saderību."
                >
                    <OrderTemplateFormSection
                        title="Kravas apstrāde un saderība"
                        description="Ostas/kuģa apstrādes noteikumi un saderības pārbaudes šim scenārijam."
                    >
                        <ToggleGrid
                            title="Apstrādes izvēles"
                            description="Norādi, vai studentam pašam jāizvēlas iekraušanas un izkraušanas metodes."
                            items={[
                                {
                                    label: 'Studentam jāizvēlas iekraušanas metode',
                                    checked: requiresLoadingMethodChoice,
                                    onChange: setRequiresLoadingMethodChoice,
                                    error: errors.requires_loading_method_choice,
                                },
                                {
                                    label: 'Studentam jāizvēlas izkraušanas metode',
                                    checked: requiresUnloadingMethodChoice,
                                    onChange: setRequiresUnloadingMethodChoice,
                                    error: errors.requires_unloading_method_choice,
                                },
                                {
                                    label: 'Atļaut manuālu apstrādi',
                                    checked: allowManualHandling,
                                    onChange: setAllowManualHandling,
                                    error: errors.allow_manual_handling,
                                },
                                {
                                    label: 'Atļaut ostas aprīkojumu',
                                    checked: allowPortEquipment,
                                    onChange: setAllowPortEquipment,
                                    error: errors.allow_port_equipment,
                                },
                                {
                                    label: 'Atļaut kuģa aprīkojumu',
                                    checked: allowShipEquipment,
                                    onChange: setAllowShipEquipment,
                                    error: errors.allow_ship_equipment,
                                },
                            ]}
                        />

                        <SelectionPills
                            title="Atļautās apstrādes metodes"
                            description="Neobligāts atļauto metožu saraksts. Atstāj tukšu, lai atļautu jebkuru saderīgu metodi."
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
                            title="Obligātās apstrādes metodes"
                            description="Ja kādai metodei obligāti jāparādās gala apstrādes plānā, atzīmē to šeit."
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
                            title="Saderības pārbaudes"
                            description="Šie slēdži nosaka, kuras saderības pārbaudes simulators izmantos."
                            items={[
                                {
                                    label: 'Pārbaudīt ostas kravas atbalstu',
                                    checked:
                                        compatibilityEnforcePortCargoSupport,
                                    onChange:
                                        setCompatibilityEnforcePortCargoSupport,
                                    error: errors.compatibility_enforce_port_cargo_support,
                                },
                                {
                                    label: 'Pārbaudīt kuģa kravas atbalstu',
                                    checked:
                                        compatibilityEnforceShipCargoSupport,
                                    onChange:
                                        setCompatibilityEnforceShipCargoSupport,
                                    error: errors.compatibility_enforce_ship_cargo_support,
                                },
                                {
                                    label: 'Pārbaudīt ostas un kuģa iegrimi',
                                    checked: compatibilityEnforcePortShipDraft,
                                    onChange:
                                        setCompatibilityEnforcePortShipDraft,
                                    error: errors.compatibility_enforce_port_ship_draft,
                                },
                                {
                                    label: 'Pārbaudīt apstrādes saderību',
                                    checked:
                                        compatibilityEnforceHandlingCompatibility,
                                    onChange:
                                        setCompatibilityEnforceHandlingCompatibility,
                                    error: errors.compatibility_enforce_handling_compatibility,
                                },
                            ]}
                        />
                    </OrderTemplateFormSection>
                </AdvancedDisclosure>
            ) : null}

            {(caps.transport || caps.route || caps.port || caps.ship) && (
                <OrderTemplateFormSection
                    title="Studenta izvēles"
                    description="Izvēlies opcijas, ko students var salīdzināt. Iekļauj arī nepareizas vai neefektīvas opcijas, ja uzdevumam jātrenē spriestspēja."
                >
                    <div className="space-y-5">
                        {caps.transport ? (
                            <SelectableGrid
                                title="Sauszemes transports"
                                items={options.transportTemplates.map(
                                    (item) => ({
                                        id: item.id,
                                        title: item.name,
                                        description:
                                            item.type || 'Tips nav norādīts',
                                    }),
                                )}
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

                        {caps.port ? (
                            <SelectableGrid
                                title="Ostas"
                                items={sortedPortOptions.map((item) => ({
                                    id: item.id,
                                    title: formatPortOptionLabel(item),
                                    description:
                                        item.country || 'Valsts nav norādīta',
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
                                title="Kuģi"
                                items={options.ships.map((item) => ({
                                    id: item.id,
                                    title: item.name,
                                    description:
                                        item.cargo_mode ||
                                        item.cargo_type ||
                                        'Kravas profils nav norādīts',
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
                                title="Ieteiktās uzpildes pieturas"
                                items={options.fuelStations.map((item) => ({
                                    id: item.id,
                                    title:
                                        item.display_name ||
                                        item.location_name ||
                                        `Uzpildes pietura #${item.id}`,
                                    description:
                                        [
                                            item.location_name,
                                            item.fuel_type
                                                ? item.fuel_type.toUpperCase()
                                                : null,
                                            item.price_per_liter !== null &&
                                            item.price_per_liter !==
                                                undefined &&
                                            item.price_per_liter !== ''
                                                ? `${item.price_per_liter} €/L`
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' • ') ||
                                        'Degvielas dati nav norādīti',
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
                    title="Scenārija priekšskatījums"
                    description="Ātra skolotāja pārbaude izvēlētajam transportam un pievienotajam uzdevuma maršrutam."
                >
                    {previewError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
                            {previewError}
                        </div>
                    ) : null}

                    {previewData ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                                label="Nepieciešamie transporti"
                                value={
                                    previewData.result?.required_vehicles ?? '—'
                                }
                            />
                            <PreviewCard
                                label="Reisa laiks"
                                value={`${previewData.result?.trip_time_hours ?? '—'} h`}
                            />
                            <PreviewCard
                                label="Cikla laiks"
                                value={`${previewData.result?.cycle_time_hours ?? '—'} h`}
                            />
                            <PreviewCard
                                label="Bāzes izmaksas"
                                value={`${previewData.result?.total_base_cost ?? '—'} €`}
                            />
                            <PreviewCard
                                label="Kopējās izmaksas"
                                value={`${previewData.result?.total_cost ?? '—'} €`}
                            />
                            <PreviewCard
                                label="Degviela uz transportu"
                                value={`${previewData.result?.fuel_used_liters_per_vehicle ?? '—'} l`}
                            />
                            <PreviewCard
                                label="Vajag uzpildi"
                                value={
                                    previewData.result?.needs_refuel
                                        ? 'Jā'
                                        : 'Nē'
                                }
                            />
                            <PreviewCard
                                label="Maršruts derīgs"
                                value={
                                    previewData.result
                                        ?.can_complete_with_current_route_data
                                        ? 'Jā'
                                        : 'Nē'
                                }
                            />
                            <PreviewCard
                                label="Ieteiktā uzpildes pietura"
                                value={
                                    previewData.fuel?.recommended_fuel_stop
                                        ? previewData.fuel.recommended_fuel_stop
                                              .distance_from_start_km !==
                                              null &&
                                          previewData.fuel.recommended_fuel_stop
                                              .distance_from_start_km !==
                                              undefined
                                            ? `${previewData.fuel.recommended_fuel_stop.station_name ?? '—'} (${previewData.fuel.recommended_fuel_stop.distance_from_start_km} km)`
                                            : (previewData.fuel
                                                  .recommended_fuel_stop
                                                  .station_name ?? '—')
                                        : 'Nav'
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
                    Atcelt
                </button>

                <button
                    type="button"
                    onClick={handleTryScenario}
                    disabled={isTryingScenario}
                    className="rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:opacity-60"
                >
                    {isTryingScenario ? 'Aprēķina...' : 'Pārbaudīt scenāriju'}
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
            <label className="text-[13px] font-semibold tracking-[0.12em] text-[#6b7870] uppercase">
                {label}
            </label>
            {children}
            {error ? <FieldError error={error} /> : null}
        </div>
    );
}

function AdvancedDisclosure({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <details className="group rounded-2xl border border-dashed border-[#cfdad1] bg-[#fbfdfb] p-4">
            <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                            Papildu
                        </div>
                        <div className="mt-1 text-[16px] font-semibold text-[#182219]">
                            {title}
                        </div>
                    </div>

                    <span className="text-[13px] font-semibold text-[#166a4d] group-open:hidden">
                        Atvērt iestatījumus
                    </span>
                    <span className="hidden text-[13px] font-semibold text-[#166a4d] group-open:inline">
                        Paslēpt iestatījumus
                    </span>
                </div>

                <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            </summary>

            <div className="mt-5">{children}</div>
        </details>
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
            <div className="text-[15px] font-semibold text-[#182219]">
                {title}
            </div>
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
                                onChange={(event) =>
                                    item.onChange(event.target.checked)
                                }
                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                            />
                            <span className="min-w-0">
                                <span className="block font-medium">
                                    {item.label}
                                </span>
                                {item.error ? (
                                    <FieldError error={item.error} />
                                ) : null}
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
            <div className="text-[15px] font-semibold text-[#182219]">
                {title}
            </div>
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
        min?: string;
        step?: string;
    }>;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="text-[15px] font-semibold text-[#182219]">
                {title}
            </div>
            {description ? (
                <p className="mt-1 text-[13px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fields.map((field) => (
                    <Field
                        key={field.label}
                        label={field.label}
                        error={field.error}
                    >
                        <input
                            type={field.type ?? 'number'}
                            min={
                                field.type === 'datetime-local'
                                    ? undefined
                                    : (field.min ?? '0')
                            }
                            step={
                                field.type === 'datetime-local'
                                    ? undefined
                                    : (field.step ?? '1')
                            }
                            value={field.value}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                            disabled={field.disabled}
                            className="mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] transition outline-none placeholder:text-[#94a197] focus:border-[#166a4d] disabled:opacity-60"
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
            <div className="text-[15px] font-semibold text-[#182219]">
                {title}
            </div>
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
            <div className="text-[12px] font-semibold tracking-[0.16em] text-[#7a877f] uppercase">
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== ''
                    ? value
                    : '—'}
            </div>
        </div>
    );
}

function locationOptionToRoutePoint(
    location: LocationOption,
): RouteBuilderPoint {
    return {
        location_id: location.id,
        source: 'local',
        name: location.name,
        display_name: [location.name, location.city, location.country]
            .filter(Boolean)
            .join(', '),
        country: location.country,
        city: location.city,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        type: location.type ?? 'custom',
        is_saved: true,
    };
}

function routeTemplatePointToRoutePoint(
    point: RouteTemplatePoint,
): RouteBuilderPoint {
    const metadata = point.metadata ?? {};

    return {
        location_id: point.location_id ?? metadata.location_id ?? null,
        source: metadata.source ?? 'local',
        external_id: metadata.external_id ?? null,
        name: point.name,
        display_name: metadata.display_name ?? point.name,
        country: metadata.country ?? null,
        city: metadata.city ?? null,
        latitude: point.latitude ?? metadata.latitude ?? null,
        longitude: point.longitude ?? metadata.longitude ?? null,
        type: point.point_type ?? metadata.type ?? point.type ?? 'custom',
        is_saved: true,
    };
}

function formatRouteTemplateLabel(template: RouteTemplateOption): string {
    const distance = Number(template.total_distance_km ?? 0);
    const distanceText = distance > 0 ? ` - ${Math.round(distance)} km` : '';

    return `${template.name}${distanceText}`;
}

function formatRouteTemplateDescription(template: RouteTemplateOption): string {
    const points = template.points ?? [];
    const firstPoint = points[0]?.name;
    const lastPoint = points[points.length - 1]?.name;
    const duration = Number(template.total_duration_hours ?? 0);
    const durationText = duration > 0 ? `${Math.round(duration)} h` : null;
    const endpointText =
        firstPoint && lastPoint ? `${firstPoint} -> ${lastPoint}` : null;

    return [endpointText, durationText, template.mode ?? null]
        .filter(Boolean)
        .join(' | ');
}
