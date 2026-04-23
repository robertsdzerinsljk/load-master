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

export type PortItem = {
    id: number;
    name: string;
    country?: string | null;
    location_name?: string | null;
    depth_m?: number | string | null;
    depth_value?: number | string | null;
    max_depth_m?: number | string | null;
    draft_limit_m?: number | string | null;
    location?: LocationItem | null;
};

export type ShipItem = {
    id: number;
    name: string;
    ship_type?: string | null;
    cargo_type?: string | null;
    draft_m?: number | string | null;
    draft_value?: number | string | null;
    draught_m?: number | string | null;
    required_depth_m?: number | string | null;
    capacity_containers?: number | string | null;
    capacity_containers_value?: number | string | null;
    container_capacity?: number | string | null;
    capacity_tons?: number | string | null;
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

    specialCondition?: {
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
        stops?: Array<{
            id: number;
            name: string;
            location_name?: string | null;
            position?: number | null;
        }>;
    };
    port?: {
        id?: number;
        name?: string;
        depth_m?: number | string | null;
    };
    ship?: {
        id?: number;
        name?: string;
        ship_type?: string | null;
        draft_m?: number | string | null;
        capacity_containers?: number | string | null;
    };
    cargo?: {
        containers?: number | string | null;
    };
    timeline?: {
        events?: TimelineEvent[];
        summary?: TimelineSummary;
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

    selectedTransportTemplate?: NamedItem | null;
    selectedPort?: PortItem | null;
    selectedShip?: ShipItem | null;

    total_cost?: number | string | null;
    total_time_hours?: number | string | null;
    total_fuel_liters?: number | string | null;
    is_valid?: boolean | null;
    score?: number | string | null;
    preview_result?: PreviewResult | null;
    ordered_route_segments?: RouteItem[];
    ordered_fuel_stations?: FuelStationItem[];
};

export type PageProps = {
    template: Template;
    attempt: Attempt;
};

export type SimulatorStepStatusTone =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger';

export type SimulatorStepStatus = {
    label: string;
    tone: SimulatorStepStatusTone;
    detail?: string;
};

export const simulatorSteps = [
    { key: 'intro', label: 'Uzdevuma pārskats' },
    { key: 'transport', label: 'Transporta izvēle' },
    { key: 'route', label: 'Maršruta veidošana' },
    { key: 'fuel', label: 'Degvielas plānošana' },
    { key: 'port', label: 'Ostas izvēle' },
    { key: 'ship', label: 'Kuģa izvēle' },
    { key: 'simulation', label: 'Palaist simulāciju' },
    { key: 'submit', label: 'Iesniegšana' },
] as const;

export function getStatusLabel(status?: string | null) {
    const map: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        reviewed: 'Pārskatīts',
        draft: 'Melnraksts',
        teacher_testing: 'Testēšana',
        teacher_test_submitted: 'Tests iesniegts',
    };

    if (!status) {
        return 'Procesā';
    }

    return map[status] ?? status;
}

export function getStepTitle(step?: string | null) {
    const item = simulatorSteps.find((s) => s.key === step);

    return item?.label ?? 'Uzdevuma pārskats';
}

export function routeName(item: RouteItem, side: 'from' | 'to') {
    if (side === 'from') {
        return item.fromLocation?.name ?? item.from_location?.name ?? '—';
    }

    return item.toLocation?.name ?? item.to_location?.name ?? '—';
}
