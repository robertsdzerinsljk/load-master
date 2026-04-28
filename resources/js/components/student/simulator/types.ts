export type NamedItem = {
    id: number;
    name: string;
    type?: string | null;
    container_capacity?: number | string | null;
    capacity_containers?: number | string | null;
    average_speed_kmh?: number | string | null;
    avg_speed_kmh?: number | string | null;
    fuel_consumption_per_100km?: number | string | null;
    cost_per_km?: number | string | null;
    max_range_km?: number | string | null;
};

export type FuelStationItem = {
    id: number;
    name?: string | null;
    display_name?: string | null;
    location_name?: string | null;
    fuel_type?: string | null;
    price_per_liter?: number | string | null;
    pivot?: {
        position?: number;
    };
};

export type LocationItem = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
};

export type RouteItem = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: LocationItem | null;
    toLocation?: LocationItem | null;
    from_location?: LocationItem | null;
    to_location?: LocationItem | null;
    pivot?: {
        position?: number;
    };
};

export type ResourceHandlingMethod = {
    id?: number;
    name: string;
    code: string;
    category?: string | null;
    pivot?: {
        is_loading?: boolean;
        is_unloading?: boolean;
        throughput_override_containers_per_hour?: number | string | null;
        throughput_override_tons_per_hour?: number | string | null;
        notes?: string | null;
    };
};

export type PortItem = {
    id: number;
    name: string;
    country?: string | null;
    location_name?: string | null;
    depth_m?: number | string | null;
    depth_value?: number | string | null;
    max_depth_m?: number | string | null;
    draft_limit_m?: number | string | null;
    max_draft_m?: number | string | null;
    city_distance_km?: number | string | null;
    loading_rate_containers_per_hour?: number | string | null;
    loading_rate_tons_per_hour?: number | string | null;
    supports_bulk?: boolean | null;
    supports_container?: boolean | null;
    supports_liquid?: boolean | null;
    supports_refrigerated?: boolean | null;
    supports_hazardous?: boolean | null;
    has_crane?: boolean | null;
    has_forklift?: boolean | null;
    has_pump?: boolean | null;
    has_conveyor?: boolean | null;
    location?: LocationItem | null;
    handlingMethods?: ResourceHandlingMethod[];
};

export type ShipItem = {
    id: number;
    name: string;
    ship_type?: string | null;
    cargo_type?: string | null;
    cargo_mode?: string | null;
    is_open_cargo?: boolean | null;
    is_closed_cargo?: boolean | null;
    supports_bulk?: boolean | null;
    supports_container?: boolean | null;
    supports_liquid?: boolean | null;
    supports_refrigerated?: boolean | null;
    supports_hazardous?: boolean | null;
    has_onboard_crane?: boolean | null;
    draft_m?: number | string | null;
    draft_value?: number | string | null;
    draught_m?: number | string | null;
    required_depth_m?: number | string | null;
    capacity_containers?: number | string | null;
    capacity_containers_value?: number | string | null;
    container_capacity?: number | string | null;
    capacity_tons?: number | string | null;
    fuel_consumption_per_hour?: number | string | null;
    speed_kmh?: number | string | null;
    loading_capacity_containers_per_hour?: number | string | null;
    loading_capacity_tons_per_hour?: number | string | null;
    handlingMethods?: ResourceHandlingMethod[];
};

export type TimelineEvent = {
    type: string;
    label: string;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    meta?: Record<string, unknown>;
};

export type TimelineSummary = {
    started_at?: string | null;
    finished_at?: string | null;
    total_minutes?: number | null;
    total_hours?: number | null;
    deadline_at?: string | null;
    delay_minutes?: number | null;
    is_within_deadline?: boolean;
};

export type HandlingMethodOption = {
    code: string;
    name: string;
    source: 'port' | 'ship';
    origin?: string | null;
    throughput_containers_per_hour?: number | string | null;
    throughput_tons_per_hour?: number | string | null;
    notes?: string | null;
};

export type HandlingSource = {
    key: 'port' | 'ship';
    label: string;
    enabled: boolean;
    resource_name?: string | null;
    methods: HandlingMethodOption[];
    reasons?: string[];
};

export type HandlingSelection = {
    code?: string | null;
    name?: string | null;
    source?: 'port' | 'ship' | null;
    valid?: boolean;
    auto_selected?: boolean;
    reason?: string | null;
    throughput_containers_per_hour?: number | string | null;
    throughput_tons_per_hour?: number | string | null;
};

export type CompatibilityCheck = {
    compatible?: boolean;
    reasons?: string[];
    supported_modes?: string[];
};

export type HandlingContext = {
    cargo_mode?: string | null;
    protections?: {
        requires_temperature_control?: boolean;
        requires_closed_space?: boolean;
        requires_ventilation?: boolean;
        requires_hazardous_support?: boolean;
    };
    loading?: {
        required?: boolean;
        sources?: HandlingSource[];
        shared_method_codes?: string[];
        selected?: HandlingSelection;
    };
    unloading?: {
        required?: boolean;
        sources?: HandlingSource[];
        shared_method_codes?: string[];
        selected?: HandlingSelection;
    };
    validation?: {
        valid?: boolean;
        errors?: string[];
        warnings?: string[];
        required_codes?: string[];
    };
    resource_checks?: {
        port?: CompatibilityCheck | null;
        ship?: CompatibilityCheck | null;
        pair?: {
            compatible?: boolean;
            reasons?: string[];
        } | null;
        valid?: boolean;
    };
};

export type Template = {
    id: number;
    title: string;
    scenario_type?: string | null;
    scenario_focus?: string | null;
    evaluation_mode?: string | null;
    status?: string | null;
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
    budget_limit?: string | number | null;
    deadline_date?: string | null;
    scenario_start_at?: string | null;
    deadline_at?: string | null;
    requires_refuel_planning?: boolean | number | null;
    max_trips?: string | number | null;
    priority?: string | null;
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
    step_config?: Record<string, boolean> | null;
    scenario_config?: Record<string, unknown> | null;
    startLocation?: LocationItem | null;
    endLocation?: LocationItem | null;
    startPort?: PortItem | null;
    endPort?: PortItem | null;
    temperatureMode?: {
        id: number;
        name: string;
    } | null;
    temperature_mode?: {
        id: number;
        name: string;
    } | null;
    specialCondition?: {
        id: number;
        name: string;
    } | null;
    special_condition?: {
        id: number;
        name: string;
    } | null;
    transportTemplates?: NamedItem[];
    transport_templates?: NamedItem[];
    landRoutes?: RouteItem[];
    land_routes?: RouteItem[];
    fuelStations?: FuelStationItem[];
    fuel_stations?: FuelStationItem[];
    ports?: PortItem[];
    ships?: ShipItem[];
};

export type PreviewResult = {
    transport?: {
        id?: number;
        name?: string;
    };
    route?: {
        segments_count?: number;
        distance_km?: number | string;
        total_driven_distance_km?: number | string;
        outbound_distance_km?: number | string;
        return_distance_km?: number | string;
        start?: string;
        end?: string;
        segments?: Array<{
            id: number;
            from: string;
            to: string;
            distance_km?: number | string;
            position?: number | null;
        }>;
    };
    fuel?: {
        stops_count?: number;
        approx_leg_distance_km?: number | string;
        max_range_km?: number | string;
        total_driven_distance_km?: number | string;
        estimated_tank_loads?: number;
        estimated_refuel_events?: number;
        assumes_depot_refuel?: boolean;
        stops?: Array<{
            id: number;
            name: string;
            location_name?: string | null;
            position?: number | null;
            distance_from_start_km?: number | string | null;
            is_logical?: boolean;
        }>;
    };
    port?: {
        id?: number;
        name?: string;
        depth_m?: number | string | null;
        max_draft_m?: number | string | null;
    };
    ship?: {
        id?: number;
        name?: string;
        ship_type?: string | null;
        cargo_type?: string | null;
        cargo_mode?: string | null;
        draft_m?: number | string | null;
        capacity_containers?: number | string | null;
        capacity_tons?: number | string | null;
    };
    cargo?: {
        containers?: number | string | null;
        tons?: number | string | null;
    };
    handling?: {
        loading?: {
            code?: string | null;
            name?: string | null;
            source?: string | null;
            duration_minutes?: number | string | null;
        };
        unloading?: {
            code?: string | null;
            name?: string | null;
            source?: string | null;
            duration_minutes?: number | string | null;
        };
        validation?: {
            valid?: boolean;
            errors?: string[];
            warnings?: string[];
        };
    };
    timeline?: {
        events?: TimelineEvent[];
        summary?: TimelineSummary;
        costs?: {
            operations_total_eur?: number | string | null;
            day_operations_eur?: number | string | null;
            night_operations_eur?: number | string | null;
            day_operation_minutes?: number | null;
            night_operation_minutes?: number | null;
            night_shift_multiplier?: number | string | null;
        };
    };
    hints?: {
        critical?: string[];
        optimization?: string[];
        info?: string[];
    };
    result?: {
        required_vehicles?: number;
        selected_vehicles?: number;
        vehicle_capacity?: number;
        capacity_per_trip?: number;
        required_trips?: number;
        trip_time_hours?: number | string;
        total_cost?: number | string;
        fuel_needed_liters?: number | string;
        needs_refuel?: boolean;
        is_valid?: boolean;
        score?: number | string;
        loading_duration_minutes?: number | string | null;
        unloading_duration_minutes?: number | string | null;
        score_breakdown?: {
            base_score?: number;
            final_score?: number;
            penalties?: Array<{
                key: string;
                label: string;
                category: string;
                amount: number;
                details?: string;
            }>;
        };
        scoring?: {
            time_weight?: number;
            cost_weight?: number;
            compatibility_weight?: number;
            trips_weight?: number;
        };
        cost_breakdown?: {
            transport_cost?: number | string | null;
            fuel_cost?: number | string | null;
            fuel_price_per_liter?: number | string | null;
            fuel_price_source?: string | null;
            operations_cost?: number | string | null;
            day_operations_cost?: number | string | null;
            night_operations_cost?: number | string | null;
        };
        warnings?: string[];
        delay_minutes?: number;
        is_within_deadline?: boolean;
    };
};

export type Attempt = {
    id: number;
    status: string;
    current_step: string;
    selected_transport_template_id?: number | null;
    selected_vehicle_count?: number | null;
    selected_port_id?: number | null;
    selected_ship_id?: number | null;
    selected_loading_method_code?: string | null;
    selected_unloading_method_code?: string | null;
    loading_method_source?: 'port' | 'ship' | null;
    unloading_method_source?: 'port' | 'ship' | null;
    loading_duration_minutes?: string | number | null;
    unloading_duration_minutes?: string | number | null;
    selectedTransportTemplate?: NamedItem | null;
    selected_transport_template?: NamedItem | null;
    selectedPort?: PortItem | null;
    selected_port?: PortItem | null;
    selectedShip?: ShipItem | null;
    selected_ship?: ShipItem | null;
    total_cost?: number | string | null;
    total_time_hours?: number | string | null;
    total_fuel_liters?: number | string | null;
    is_valid?: boolean | null;
    score?: number | string | null;
    preview_result?: PreviewResult | null;
    ordered_route_segments?: RouteItem[];
    ordered_fuel_stations?: FuelStationItem[];
    handling_context?: HandlingContext | null;
};

export type PageProps = {
    template: Template;
    attempt: Attempt;
};

export type SimulatorStep = {
    key: string;
    label: string;
};

export type SimulatorStepStatus = {
    label: string;
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    detail?: string;
};

export const simulatorSteps: SimulatorStep[] = [
    { key: 'intro', label: 'Ievads' },
    { key: 'transport', label: 'Transports' },
    { key: 'route', label: 'Maršruts' },
    { key: 'fuel', label: 'Degviela' },
    { key: 'port', label: 'Osta' },
    { key: 'ship', label: 'Kuģis' },
    { key: 'simulation', label: 'Simulācija' },
    { key: 'submit', label: 'Iesniegšana' },
];

const stepTitleMap: Record<string, string> = Object.fromEntries(
    simulatorSteps.map((step) => [step.key, step.label]),
);

const statusLabelMap: Record<string, string> = {
    draft: 'Melnraksts',
    ready: 'Gatavs',
    in_progress: 'Procesā',
    submitted: 'Iesniegts',
    reviewed: 'Pārskatīts',
    teacher_testing: 'Skolotāja tests',
    teacher_test_submitted: 'Skolotāja tests iesniegts',
    teacher_test_archived: 'Skolotāja tests arhivēts',
};

export function getStepTitle(stepKey?: string | null): string {
    if (!stepKey) {
        return 'Nezināms solis';
    }

    return stepTitleMap[stepKey] ?? stepKey;
}

export function getStatusLabel(status?: string | null): string {
    if (!status) {
        return 'Nezināms statuss';
    }

    return statusLabelMap[status] ?? status;
}

export function routeName(
    route: Pick<
        RouteItem,
        'fromLocation' | 'toLocation' | 'from_location' | 'to_location'
    >,
    side: 'from' | 'to',
): string {
    const direct = side === 'from' ? route.fromLocation : route.toLocation;
    const fallback = side === 'from' ? route.from_location : route.to_location;

    return direct?.name ?? fallback?.name ?? '—';
}

export function attemptTransportName(attempt: Attempt): string | null {
    return (
        attempt.selectedTransportTemplate?.name ??
        attempt.selected_transport_template?.name ??
        null
    );
}

export function attemptPortName(attempt: Attempt): string | null {
    return attempt.selectedPort?.name ?? attempt.selected_port?.name ?? null;
}

export function attemptShipName(attempt: Attempt): string | null {
    return attempt.selectedShip?.name ?? attempt.selected_ship?.name ?? null;
}
