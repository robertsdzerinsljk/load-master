export type NamedItem = {
    id: number;
    name: string;
    type?: string | null;
    container_capacity?: number | string | null;
    average_speed_kmh?: number | string | null;
    fuel_consumption_per_100km?: number | string | null;
    cost_per_km?: number | string | null;
    max_range_km?: number | string | null;
};

export type FuelStationItem = {
    id: number;
    name: string;
    location_name?: string | null;
    fuel_type?: string | null;
    price_per_liter?: number | string | null;
    pivot?: {
        position?: number;
    };
};

export type RouteItem = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: { name: string } | null;
    toLocation?: { name: string } | null;
    from_location?: { name: string } | null;
    to_location?: { name: string } | null;
    pivot?: {
        position?: number;
    };
};

export type PortItem = {
    id: number;
    name: string;
    location_name?: string | null;
    depth_m?: number | string | null;
};

export type ShipItem = {
    id: number;
    name: string;
    ship_type?: string | null;
    draft_m?: number | string | null;
    capacity_containers?: number | string | null;
    capacity_tons?: number | string | null;
};

export type Template = {
    id: number;
    title: string;
    scenario_type?: string | null;
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
    requires_refuel_planning?: boolean | number | null;
    max_trips?: string | number | null;
    priority?: string | null;

    startLocation?: {
        id: number;
        name: string;
    } | null;
    endLocation?: {
        id: number;
        name: string;
    } | null;

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
    result?: {
        required_vehicles?: number;
        selected_vehicles?: number;
        trip_time_hours?: number | string;
        total_cost?: number | string;
        fuel_needed_liters?: number | string;
        needs_refuel?: boolean;
        is_valid?: boolean;
        score?: number | string;
        warnings?: string[];
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
    preview_result?: PreviewResult | null;
    ordered_route_segments?: RouteItem[];
    ordered_fuel_stations?: FuelStationItem[];
};

export type PageProps = {
    template: Template;
    attempt: Attempt;
};

export const simulatorSteps = [
    { key: 'intro', label: 'Uzdevuma pārskats' },
    { key: 'transport', label: 'Transporta izvēle' },
    { key: 'route', label: 'Maršruta veidošana' },
    { key: 'fuel', label: 'Degvielas plānošana' },
    { key: 'port', label: 'Ostas izvēle' },
    { key: 'ship', label: 'Kuģa izvēle' },
    { key: 'simulation', label: 'Rezultāta pārbaude' },
    { key: 'submit', label: 'Iesniegšana' },
] as const;

export function getStatusLabel(status?: string | null) {
    const map: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        reviewed: 'Pārskatīts',
        draft: 'Melnraksts',
    };

    if (!status) return 'Procesā';
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