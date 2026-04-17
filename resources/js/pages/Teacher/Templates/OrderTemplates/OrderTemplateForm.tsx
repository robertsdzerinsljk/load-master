import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import OrderTemplateFormSection from './OrderTemplateFormSection';

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
};

type LandRouteOption = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: {
        id: number;
        name: string;
    } | null;
    toLocation?: {
        id: number;
        name: string;
    } | null;
    from_location?: {
        id: number;
        name: string;
    } | null;
    to_location?: {
        id: number;
        name: string;
    } | null;
};

type Options = {
    temperatureModes: SimpleOption[];
    specialConditions: SimpleOption[];
    locations: LocationOption[];
    ports: PortOption[];
    transportTemplates: TransportOption[];
    ships: ShipOption[];
    landRoutes: LandRouteOption[];
    scenarioTypes: ScenarioOption[];
    scenarioFocuses?: ScenarioOption[];
    statusOptions: ScenarioOption[];
    priorityOptions: ScenarioOption[];
};

type InitialData = {
    title?: string;
    scenario_type?: string;
    scenario_focus?: string | null;
    status?: string;
    description?: string | null;
    student_brief?: string | null;
    teacher_notes?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: string | number | null;
    cargo_amount_tons?: string | number | null;
    cargo_volume_m3?: string | number | null;
    cargo_value?: string | number | null;
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
    requires_refuel_planning?: boolean;
    max_trips?: string | number | null;
    priority?: string | null;
    transportTemplates?: Array<{ id: number }>;
    transport_templates?: Array<{ id: number }>;
    ships?: Array<{ id: number }>;
    ports?: Array<{ id: number }>;
    landRoutes?: Array<{ id: number }>;
    land_routes?: Array<{ id: number }>;
};

type PreviewResponse = {
    route?: {
        from?: string | null;
        to?: string | null;
        distance_km?: number;
        toll_cost?: number;
    };
    transport?: {
        name?: string | null;
        type?: string | null;
        capacity_containers?: number;
        avg_speed_kmh?: number;
        cost_per_km?: number;
        fuel_consumption_per_100km?: number;
        max_range_km?: number;
        loading_time_minutes?: number;
        unloading_time_minutes?: number;
    };
    cargo?: {
        amount_containers?: number;
    };
    result?: {
        required_vehicles?: number;
        trip_time_hours?: number;
        cycle_time_hours?: number;
        transport_cost_per_vehicle?: number;
        base_cost_per_vehicle?: number;
        total_base_cost?: number;
        fuel_used_liters_per_vehicle?: number;
        needs_refuel?: boolean;
        can_complete_with_current_route_data?: boolean;
        fuel_cost_per_vehicle?: number | null;
        total_fuel_cost?: number | null;
        total_cost?: number;
    };
    fuel?: {
        available_fuel_stops?: Array<{
            distance_from_start_km: number;
            station_name?: string | null;
            station_city?: string | null;
            fuel_type?: string | null;
            price_per_liter?: number | null;
        }>;
        recommended_fuel_stop?: {
            distance_from_start_km: number;
            station_name?: string | null;
            station_city?: string | null;
            fuel_type?: string | null;
            price_per_liter?: number | null;
        } | null;
    };
    message?: string;
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

export default function OrderTemplateForm({
    options,
    initialData = {},
    submitLabel = 'Saglabāt',
    isEdit = false,
    id,
    onCancel,
}: Props) {
    const [title, setTitle] = useState(initialData.title ?? '');
    const [scenarioType, setScenarioType] = useState(
        initialData.scenario_type ?? 'land_transport'
    );
    const [scenarioFocus, setScenarioFocus] = useState(
        initialData.scenario_focus ?? getDefaultScenarioFocus(initialData.scenario_type ?? 'land_transport')
    );
    const [status, setStatus] = useState(initialData.status ?? 'draft');
    const [description, setDescription] = useState(initialData.description ?? '');
    const [studentBrief, setStudentBrief] = useState(initialData.student_brief ?? '');
    const [teacherNotes, setTeacherNotes] = useState(initialData.teacher_notes ?? '');

    const [cargoName, setCargoName] = useState(initialData.cargo_name ?? '');
    const [cargoType, setCargoType] = useState(initialData.cargo_type ?? '');
    const [cargoAmountContainers, setCargoAmountContainers] = useState(
        String(initialData.cargo_amount_containers ?? '')
    );
    const [cargoAmountTons, setCargoAmountTons] = useState(
        String(initialData.cargo_amount_tons ?? '')
    );
    const [cargoVolumeM3, setCargoVolumeM3] = useState(
        String(initialData.cargo_volume_m3 ?? '')
    );
    const [cargoValue, setCargoValue] = useState(String(initialData.cargo_value ?? ''));

    const [temperatureModeId, setTemperatureModeId] = useState(
        String(initialData.temperature_mode_id ?? '')
    );
    const [specialConditionId, setSpecialConditionId] = useState(
        String(initialData.special_condition_id ?? '')
    );

    const [startLocationId, setStartLocationId] = useState(
        String(initialData.start_location_id ?? '')
    );
    const [endLocationId, setEndLocationId] = useState(
        String(initialData.end_location_id ?? '')
    );
    const [startPortId, setStartPortId] = useState(
        String(initialData.start_port_id ?? '')
    );
    const [endPortId, setEndPortId] = useState(
        String(initialData.end_port_id ?? '')
    );

const [deadlineDate, setDeadlineDate] = useState(initialData.deadline_date ?? '');
const [scenarioStartAt, setScenarioStartAt] = useState(
    initialData.scenario_start_at
        ? String(initialData.scenario_start_at).slice(0, 16)
        : ''
);
const [deadlineAt, setDeadlineAt] = useState(
    initialData.deadline_at
        ? String(initialData.deadline_at).slice(0, 16)
        : ''
);
const [budgetLimit, setBudgetLimit] = useState(String(initialData.budget_limit ?? ''));
    const [requiresRefuelPlanning, setRequiresRefuelPlanning] = useState(
        Boolean(initialData.requires_refuel_planning ?? false)
    );
    const [maxTrips, setMaxTrips] = useState(String(initialData.max_trips ?? ''));
    const [priority, setPriority] = useState(initialData.priority ?? '');

    const [transportTemplateIds, setTransportTemplateIds] = useState<number[]>(
        (initialData.transportTemplates ?? initialData.transport_templates ?? []).map((item) => item.id)
    );
    const [shipIds, setShipIds] = useState<number[]>(
        initialData.ships?.map((item) => item.id) ?? []
    );
    const [portIds, setPortIds] = useState<number[]>(
        initialData.ports?.map((item) => item.id) ?? []
    );
    const [landRouteIds, setLandRouteIds] = useState<number[]>(
        (initialData.landRoutes ?? initialData.land_routes ?? []).map((item) => item.id)
    );

    const [isTryingScenario, setIsTryingScenario] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';

    const labelClass = 'text-[14px] font-medium text-[#182219]';

    const caps = useMemo(() => getScenarioCapabilities(scenarioType), [scenarioType]);

    useEffect(() => {
        setScenarioFocus((current) => {
            if (current && current !== '') {
                return current;
            }

            return getDefaultScenarioFocus(scenarioType);
        });
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

    const toggleMultiSelect = (
        current: number[],
        setFn: (value: number[]) => void,
        selectedId: number
    ) => {
        if (current.includes(selectedId)) {
            setFn(current.filter((item) => item !== selectedId));
            return;
        }

        setFn([...current, selectedId]);
    };

    const buildPayload = () => ({
        title,
        scenario_type: scenarioType,
        scenario_focus: scenarioFocus || getDefaultScenarioFocus(scenarioType),
        status,
        description: description || null,
        student_brief: studentBrief || null,
        teacher_notes: teacherNotes || null,
        cargo_name: cargoName || null,
        cargo_type: cargoType || null,
        cargo_amount_containers:
            cargoAmountContainers === '' ? null : Number(cargoAmountContainers),
        cargo_amount_tons: cargoAmountTons === '' ? null : Number(cargoAmountTons),
        cargo_volume_m3: cargoVolumeM3 === '' ? null : Number(cargoVolumeM3),
        cargo_value: cargoValue === '' ? null : Number(cargoValue),
        temperature_mode_id: temperatureModeId === '' ? null : Number(temperatureModeId),
        special_condition_id:
            specialConditionId === '' ? null : Number(specialConditionId),

        start_location_id:
            caps.startLocation && startLocationId !== '' ? Number(startLocationId) : null,
        end_location_id:
            caps.endLocation && endLocationId !== '' ? Number(endLocationId) : null,
        start_port_id:
            caps.startPort && startPortId !== '' ? Number(startPortId) : null,
        end_port_id:
            caps.endPort && endPortId !== '' ? Number(endPortId) : null,

        deadline_date: deadlineDate || null,
        scenario_start_at: scenarioStartAt || null,
        deadline_at: deadlineAt || null,
        budget_limit: budgetLimit === '' ? null : Number(budgetLimit),
        requires_refuel_planning: caps.fuel ? requiresRefuelPlanning : false,
        max_trips: maxTrips === '' ? null : Number(maxTrips),
        priority: priority || null,

        transport_template_ids: caps.transport ? transportTemplateIds : [],
        ship_ids: caps.ship ? shipIds : [],
        port_ids: caps.port ? portIds : [],
        land_route_ids: caps.route ? landRouteIds : [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = buildPayload();

        if (isEdit && id) {
            router.put(`/teacher/templates/order-templates/${id}`, payload);
        } else {
            router.post('/teacher/templates/order-templates', payload);
        }
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
                setPreviewError(data.message || 'Neizdevās aprēķināt scenāriju.');
                return;
            }

            setPreviewData(data);
        } catch {
            setPreviewError('Neizdevās sazināties ar serveri.');
        } finally {
            setIsTryingScenario(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <OrderTemplateFormSection
                title="Pamata informācija"
                description="Izvēlieties uzdevuma tipu un fokusu. No tipa būs atkarīgs, kuri lauki un resursi šim uzdevumam ir aktuāli."
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Uzdevuma nosaukums *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 500 konteineru nogāde uz Liepājas ostu"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Scenārija tips *</label>
                        <select
                            value={scenarioType}
                            onChange={(e) => setScenarioType(e.target.value)}
                            className={inputClass}
                            required
                        >
                            {options.scenarioTypes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Scenārija fokuss</label>
                        <select
                            value={scenarioFocus}
                            onChange={(e) => setScenarioFocus(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Izvēlieties</option>
                            {(options.scenarioFocuses ?? []).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Statuss *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={inputClass}
                            required
                        >
                            {options.statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Prioritāte</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Izvēlieties</option>
                            {options.priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Apraksts</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={inputClass}
                            placeholder="Īss skolotāja apraksts par uzdevuma būtību."
                        />
                    </div>
                </div>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Studentam redzamais uzdevums"
                description="Šeit ierakstiet to, ko students redzēs kā uzdevuma aprakstu, nepasakot priekšā pilnu risinājumu."
            >
                <div>
                    <label className={labelClass}>Studenta uzdevuma teksts</label>
                    <textarea
                        rows={6}
                        value={studentBrief}
                        onChange={(e) => setStudentBrief(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, jānogādā 500 konteineri no rūpnīcas uz ostu, izvēloties atbilstošāko loģistikas risinājumu."
                    />
                </div>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Pasniedzēja piezīmes"
                description="Šīs piezīmes paliek skolotāja pusē un nav jāparāda studentam."
            >
                <div>
                    <label className={labelClass}>Iekšējās piezīmes</label>
                    <textarea
                        rows={5}
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, students nedrīkst ignorēt uzpildes plānošanu."
                    />
                </div>
            </OrderTemplateFormSection>

            <OrderTemplateFormSection
                title="Kravas dati"
                description="Definējiet sākuma parametrus, kurus students saņem uzdevumā."
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Kravas nosaukums</label>
                        <input
                            type="text"
                            value={cargoName}
                            onChange={(e) => setCargoName(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, Konteinerizēta pārtika"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Kravas tips</label>
                        <input
                            type="text"
                            value={cargoType}
                            onChange={(e) => setCargoType(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, konteineri"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Konteineru skaits</label>
                        <input
                            type="number"
                            min="0"
                            value={cargoAmountContainers}
                            onChange={(e) => setCargoAmountContainers(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 500"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Krava tonnās</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoAmountTons}
                            onChange={(e) => setCargoAmountTons(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 10000"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Tilpums (m³)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoVolumeM3}
                            onChange={(e) => setCargoVolumeM3(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 120"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Kravas vērtība (€)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cargoValue}
                            onChange={(e) => setCargoValue(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 25000"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Temperatūras režīms</label>
                        <select
                            value={temperatureModeId}
                            onChange={(e) => setTemperatureModeId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Izvēlieties</option>
                            {options.temperatureModes.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Īpašie nosacījumi</label>
                        <select
                            value={specialConditionId}
                            onChange={(e) => setSpecialConditionId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Izvēlieties</option>
                            {options.specialConditions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </OrderTemplateFormSection>

            {(caps.startLocation || caps.endLocation || caps.startPort || caps.endPort) && (
                <OrderTemplateFormSection
                    title="Sākuma un gala punkti"
                    description="Šeit tiek rādīti tikai tie sākuma un gala punkti, kas ir aktuāli izvēlētajam scenārija tipam."
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {caps.startLocation && (
                            <div>
                                <label className={labelClass}>Sākuma lokācija</label>
                                <select
                                    value={startLocationId}
                                    onChange={(e) => setStartLocationId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlieties</option>
                                    {options.locations.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                            {option.city ? ` (${option.city})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {caps.endLocation && (
                            <div>
                                <label className={labelClass}>Gala lokācija</label>
                                <select
                                    value={endLocationId}
                                    onChange={(e) => setEndLocationId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlieties</option>
                                    {options.locations.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                            {option.city ? ` (${option.city})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {caps.startPort && (
                            <div>
                                <label className={labelClass}>Sākuma osta</label>
                                <select
                                    value={startPortId}
                                    onChange={(e) => setStartPortId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlieties</option>
                                    {options.ports.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                            {option.country ? ` (${option.country})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {caps.endPort && (
                            <div>
                                <label className={labelClass}>Gala osta</label>
                                <select
                                    value={endPortId}
                                    onChange={(e) => setEndPortId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Izvēlieties</option>
                                    {options.ports.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                            {option.country ? ` (${option.country})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </OrderTemplateFormSection>
            )}

            <OrderTemplateFormSection
                title="Ierobežojumi"
                description="Definējiet budžetu, termiņus un citus uzdevuma ierobežojumus."
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Termiņš</label>
                        <input
                            type="date"
                            value={deadlineDate}
                            onChange={(e) => setDeadlineDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                <label className={labelClass}>Scenārija sākuma datums/laiks</label>
                <input
                    type="datetime-local"
                    value={scenarioStartAt}
                    onChange={(e) => setScenarioStartAt(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div>
                <label className={labelClass}>Deadline datums/laiks</label>
                <input
                    type="datetime-local"
                    value={deadlineAt}
                    onChange={(e) => setDeadlineAt(e.target.value)}
                    className={inputClass}
                />
            </div>
                    <div>
                        <label className={labelClass}>Budžeta limits (€)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={budgetLimit}
                            onChange={(e) => setBudgetLimit(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 15000"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Maksimālais reisu skaits</label>
                        <input
                            type="number"
                            min="0"
                            value={maxTrips}
                            onChange={(e) => setMaxTrips(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 2"
                        />
                    </div>

                    {caps.fuel && (
                        <div className="flex items-end">
                            <label className="inline-flex items-center gap-3 text-[14px] font-medium text-[#182219]">
                                <input
                                    type="checkbox"
                                    checked={requiresRefuelPlanning}
                                    onChange={(e) =>
                                        setRequiresRefuelPlanning(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                />
                                Uzdevumā jāņem vērā uzpildes plānošana
                            </label>
                        </div>
                    )}
                </div>
            </OrderTemplateFormSection>

            {(caps.transport || caps.route || caps.port || caps.ship) && (
                <OrderTemplateFormSection
                    title="Resursu ierobežojumi (neobligāti)"
                    description="Tiek rādīti tikai tie resursi, kas ir aktuāli izvēlētajam scenārija tipam."
                >
                    <div className="space-y-6">
                        {caps.transport && (
                            <div>
                                <label className={labelClass}>Sauszemes transports</label>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {options.transportTemplates.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-white px-4 py-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={transportTemplateIds.includes(item.id)}
                                                onChange={() =>
                                                    toggleMultiSelect(
                                                        transportTemplateIds,
                                                        setTransportTemplateIds,
                                                        item.id
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                            />
                                            <span className="text-[14px] text-[#182219]">
                                                <span className="block font-semibold">{item.name}</span>
                                                <span className="text-[#5b6b61]">
                                                    {item.type || 'Tips nav norādīts'}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caps.ship && (
                            <div>
                                <label className={labelClass}>Kuģi</label>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {options.ships.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-white px-4 py-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={shipIds.includes(item.id)}
                                                onChange={() =>
                                                    toggleMultiSelect(shipIds, setShipIds, item.id)
                                                }
                                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                            />
                                            <span className="text-[14px] text-[#182219]">
                                                <span className="block font-semibold">{item.name}</span>
                                                <span className="text-[#5b6b61]">
                                                    {item.cargo_type || 'Kravas tips nav norādīts'}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caps.port && (
                            <div>
                                <label className={labelClass}>Ostas</label>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {options.ports.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-white px-4 py-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={portIds.includes(item.id)}
                                                onChange={() =>
                                                    toggleMultiSelect(portIds, setPortIds, item.id)
                                                }
                                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                            />
                                            <span className="text-[14px] text-[#182219]">
                                                <span className="block font-semibold">{item.name}</span>
                                                <span className="text-[#5b6b61]">
                                                    {item.country || 'Valsts nav norādīta'}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caps.route && (
                            <div>
                                <label className={labelClass}>Sauszemes maršruti</label>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {options.landRoutes.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-white px-4 py-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={landRouteIds.includes(item.id)}
                                                onChange={() =>
                                                    toggleMultiSelect(
                                                        landRouteIds,
                                                        setLandRouteIds,
                                                        item.id
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                            />
                                            <span className="text-[14px] text-[#182219]">
                                                <span className="block font-semibold">
                                                    {(item.fromLocation ?? item.from_location)?.name ?? '—'} →{' '}
                                                    {(item.toLocation ?? item.to_location)?.name ?? '—'}
                                                </span>
                                                <span className="text-[#5b6b61]">
                                                    {item.distance_km ?? '—'} km
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </OrderTemplateFormSection>
            )}

            {(previewError || previewData) && (
                <OrderTemplateFormSection
                    title="Scenārija preview"
                    description="Šis ir pasniedzēja priekšskatījums, lai saprastu, vai izvēlētie parametri veido loģisku uzdevumu."
                >
                    {previewError && (
                        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[15px] text-[#991b1b]">
                            {previewError}
                        </div>
                    )}

                    {previewData && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                                    label="Nepieciešamās vienības"
                                    value={previewData.result?.required_vehicles ?? '—'}
                                />
                                <PreviewCard
                                    label="Brauciena laiks"
                                    value={`${previewData.result?.trip_time_hours ?? '—'} h`}
                                />
                                <PreviewCard
                                    label="Pilna cikla laiks"
                                    value={`${previewData.result?.cycle_time_hours ?? '—'} h`}
                                />
                                <PreviewCard
                                    label="Izmaksas uz 1 transportu"
                                    value={`${previewData.result?.base_cost_per_vehicle ?? '—'} €`}
                                />
                                <PreviewCard
                                    label="Kopējās bāzes izmaksas"
                                    value={`${previewData.result?.total_base_cost ?? '—'} €`}
                                />
                                <PreviewCard
                                    label="Kopējās izmaksas"
                                    value={`${previewData.result?.total_cost ?? '—'} €`}
                                />
                                <PreviewCard
                                    label="Nepieciešama uzpilde"
                                    value={previewData.result?.needs_refuel ? 'Jā' : 'Nē'}
                                />
                                <PreviewCard
                                    label="Maršruts izpildāms"
                                    value={
                                        previewData.result?.can_complete_with_current_route_data
                                            ? 'Jā'
                                            : 'Nē'
                                    }
                                />
                                <PreviewCard
                                    label="Degviela uz 1 transportu"
                                    value={`${previewData.result?.fuel_used_liters_per_vehicle ?? '—'} l`}
                                />
                            </div>

                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                <h3 className="text-[15px] font-semibold text-[#182219]">
                                    Ieteicamā uzpildes vieta
                                </h3>
                                <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                    {previewData.fuel?.recommended_fuel_stop
                                        ? `${previewData.fuel.recommended_fuel_stop.station_name ?? '—'} (${previewData.fuel.recommended_fuel_stop.distance_from_start_km} km no starta)`
                                        : 'Pagaidām nav ieteicamas uzpildes vietas vai uzpilde nav nepieciešama.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#d9ded9] bg-white p-4">
                                <h3 className="text-[15px] font-semibold text-[#182219]">
                                    Pieejamās uzpildes pieturas maršrutā
                                </h3>

                                <div className="mt-3 space-y-3">
                                    {previewData.fuel?.available_fuel_stops?.length ? (
                                        previewData.fuel.available_fuel_stops.map((stop, index) => (
                                            <div
                                                key={`${stop.station_name}-${index}`}
                                                className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3 text-[14px] text-[#5b6b61]"
                                            >
                                                <div className="font-semibold text-[#182219]">
                                                    {stop.station_name ?? '—'}
                                                </div>
                                                <div className="mt-1">
                                                    {stop.distance_from_start_km} km no starta
                                                    {stop.station_city ? ` — ${stop.station_city}` : ''}
                                                </div>
                                                <div className="mt-1">
                                                    Degviela: {stop.fuel_type ?? '—'}
                                                    {stop.price_per_liter !== null &&
                                                    stop.price_per_liter !== undefined
                                                        ? ` — ${stop.price_per_liter} €/l`
                                                        : ''}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3 text-[14px] text-[#5b6b61]">
                                            Maršrutam nav piesaistītu uzpildes pieturu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </OrderTemplateFormSection>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-[#d9ded9] bg-white px-5 py-3 text-[16px] font-medium text-[#182219] hover:bg-[#f7f9f7]"
                >
                    Atcelt
                </button>

                <button
                    type="button"
                    onClick={handleTryScenario}
                    disabled={isTryingScenario}
                    className="rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[16px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:opacity-60"
                >
                    {isTryingScenario ? 'Notiek aprēķins...' : 'Izmēģināt'}
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-[#166a4d] px-5 py-3 text-[16px] font-medium text-white hover:bg-[#135740]"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
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
            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}