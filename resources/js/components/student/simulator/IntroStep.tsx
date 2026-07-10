import type { ReactNode } from 'react';
import {
    ArrowRight,
    BadgeAlert,
    CalendarDays,
    CheckCircle2,
    Container,
    DollarSign,
    FileText,
    Flag,
    Gauge,
    MapPin,
    Package,
    Scale,
    Settings2,
    ShieldCheck,
    Snowflake,
    TimerReset,
    Truck,
    Waves,
} from 'lucide-react';
import { Template } from './types';

type Props = {
    template: Template;
    loading: boolean;
    onStart: () => void;
};

function formatCurrency(value?: string | number | null) {
    if (value === null || value === undefined || value === '') return '-';
    return `${value} EUR`;
}

function formatDate(value?: string | null) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function formatDateTime(value?: string | null) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function yesNo(value?: boolean | number | null) {
    return value ? 'Jā' : 'Nē';
}

function priorityLabel(value?: string | null) {
    if (!value) return 'Nav norādīta';

    const map: Record<string, string> = {
        low: 'Zema',
        medium: 'Vidēja',
        high: 'Augsta',
        urgent: 'Steidzama',
        critical: 'Kritiska',
    };

    return map[value.toLowerCase()] ?? value;
}

function cargoModeLabel(value?: string | null) {
    if (!value) return 'Nav norādīts';

    const map: Record<string, string> = {
        bulk: 'Beramkrava',
        containerized: 'Konteinerizēta',
        liquid: 'Šķidra krava',
        palletized: 'Paletizēta',
        break_bulk: 'Break bulk',
    };

    return map[value] ?? value;
}

function normalizeConfigSection(
    template: Template,
    key: 'timing' | 'availability' | 'costs' | 'scoring' | 'compatibility',
) {
    const config = template.scenario_config;

    if (!config || typeof config !== 'object') {
        return {};
    }

    const value = (config as Record<string, unknown>)[key];

    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

function formatStringList(
    values?: string[] | null,
    mapper?: (value: string) => string,
) {
    if (!values || values.length === 0) return '';

    return values.map((value) => (mapper ? mapper(value) : value)).join(', ');
}

function formatMethodCode(code: string) {
    return code.replaceAll('_', ' ');
}

function formatMinutes(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav norādīts'
        : `${String(value)} min`;
}

function formatHour(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav norādīts'
        : `${String(value)}:00`;
}

function formatPlain(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav norādīts'
        : String(value);
}

function formatCurrencyConfig(value: unknown, suffix = '') {
    return value === null || value === undefined || value === ''
        ? 'Nav norādīts'
        : `${String(value)} EUR${suffix}`;
}

function yesNoConfig(value: unknown) {
    return typeof value === 'boolean' ? yesNo(value) : 'Nav norādīts';
}

function ScenarioBadge({ value }: { value?: string | null }) {
    const labelMap: Record<string, string> = {
        land_transport: 'Sauszemes transports',
        land_to_port: 'Sauszeme -> osta',
        port_to_ship: 'Osta -> kuģis',
        full_chain: 'Pilna loģistikas ķēde',
    };

    const label = value
        ? (labelMap[value] ?? value.replaceAll('_', ' '))
        : 'Scenārijs nav norādīts';

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1.5 text-[13px] font-semibold text-[#166a4d]">
            <Flag className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}

function PriorityBadge({ value }: { value?: string | null }) {
    const normalized = value?.toLowerCase();

    const classes =
        normalized === 'urgent' || normalized === 'critical'
            ? 'border-red-200 bg-red-50 text-red-700'
            : normalized === 'high'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : normalized === 'medium'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-50 text-slate-700';

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${classes}`}
        >
            <BadgeAlert className="h-3.5 w-3.5" />
            Prioritāte: {priorityLabel(value)}
        </span>
    );
}

function QuickStat({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[18px] font-semibold text-[#182219]">
                {value}
            </div>
        </div>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                {value}
            </div>
        </div>
    );
}

function SectionCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[26px] border border-[#d9ded9] bg-white p-5 shadow-sm">
            <div>
                <h3 className="text-[22px] font-semibold tracking-tight text-[#182219]">
                    {title}
                </h3>
                <p className="mt-1 text-[14px] leading-6 text-[#5b6b61]">
                    {subtitle}
                </p>
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export default function IntroStep({ template, loading, onStart }: Props) {
    const suggestedFuelStops =
        template.fuelStations ?? template.fuel_stations ?? [];
    const startLocation =
        template.startLocation ?? template.start_location ?? null;
    const endLocation = template.endLocation ?? template.end_location ?? null;
    const timing = normalizeConfigSection(template, 'timing');
    const availability = normalizeConfigSection(template, 'availability');
    const costs = normalizeConfigSection(template, 'costs');
    const scoring = normalizeConfigSection(template, 'scoring');
    const compatibility = normalizeConfigSection(template, 'compatibility');
    const allowedShipModes = formatStringList(
        template.allowed_ship_cargo_modes,
        cargoModeLabel,
    );
    const forbiddenShipModes = formatStringList(
        template.forbidden_ship_cargo_modes,
        cargoModeLabel,
    );
    const requiredHandlingMethods = formatStringList(
        template.required_handling_method_codes,
        formatMethodCode,
    );
    const allowedHandlingMethods = formatStringList(
        template.allowed_handling_method_codes,
        formatMethodCode,
    );

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <ScenarioBadge value={template.scenario_type} />
                            <PriorityBadge value={template.priority} />
                        </div>

                        <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-[#182219]">
                            Uzdevuma pārskats
                        </h2>

                        <p className="mt-3 text-[15px] leading-7 text-[#5b6b61]">
                            {template.student_brief ||
                                template.description ||
                                'Šim uzdevumam vēl nav pievienots detalizēts apraksts.'}
                        </p>
                    </div>

                    <div className="shrink-0">
                        <button
                            type="button"
                            onClick={onStart}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:justify-start"
                        >
                            Sākt risinājumu
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <QuickStat
                        icon={<Container className="h-4 w-4" />}
                        label="Konteineri"
                        value={
                            template.cargo_amount_containers !== null &&
                            template.cargo_amount_containers !== undefined
                                ? String(template.cargo_amount_containers)
                                : '-'
                        }
                    />
                    <QuickStat
                        icon={<Package className="h-4 w-4" />}
                        label="Kravas profils"
                        value={cargoModeLabel(
                            template.cargo_mode ?? template.cargo_type,
                        )}
                    />
                    <QuickStat
                        icon={<MapPin className="h-4 w-4" />}
                        label="Maršruts"
                        value={`${startLocation?.name ?? '-'} -> ${endLocation?.name ?? '-'}`}
                    />
                    <QuickStat
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Termins"
                        value={formatDate(template.deadline_date)}
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Kravas informācija"
                    subtitle="Galvenie parametri, kas ietekmē izvēlēto transportu un piegādes risinājumu."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<Package className="h-4 w-4" />}
                            label="Nosaukums"
                            value={template.cargo_name || 'Nav norādīts'}
                        />
                        <DetailRow
                            icon={<FileText className="h-4 w-4" />}
                            label="Tips"
                            value={template.cargo_type || 'Nav norādīts'}
                        />
                        <DetailRow
                            icon={<Package className="h-4 w-4" />}
                            label="Kravas profils"
                            value={cargoModeLabel(
                                template.cargo_mode ?? template.cargo_type,
                            )}
                        />
                        <DetailRow
                            icon={<Container className="h-4 w-4" />}
                            label="Konteineru skaits"
                            value={
                                template.cargo_amount_containers != null
                                    ? String(template.cargo_amount_containers)
                                    : '-'
                            }
                        />
                        <DetailRow
                            icon={<Scale className="h-4 w-4" />}
                            label="Svars"
                            value={
                                template.cargo_amount_tons != null
                                    ? `${template.cargo_amount_tons} t`
                                    : '-'
                            }
                        />
                        <DetailRow
                            icon={<Waves className="h-4 w-4" />}
                            label="Tilpums"
                            value={
                                template.cargo_volume_m3 != null
                                    ? `${template.cargo_volume_m3} m3`
                                    : '-'
                            }
                        />
                        <DetailRow
                            icon={<DollarSign className="h-4 w-4" />}
                            label="Kravas vērtība"
                            value={formatCurrency(template.cargo_value)}
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Maršruta konteksts"
                    subtitle="Sākuma un gala punkti, kā arī piegādes laika ierobežojumi."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<MapPin className="h-4 w-4" />}
                            label="Sākuma lokācija"
                            value={startLocation?.name || 'Nav norādīta'}
                        />
                        <DetailRow
                            icon={<MapPin className="h-4 w-4" />}
                            label="Gala lokācija"
                            value={endLocation?.name || 'Nav norādīta'}
                        />
                        <DetailRow
                            icon={<CalendarDays className="h-4 w-4" />}
                            label="Termins"
                            value={formatDate(template.deadline_date)}
                        />
                        <DetailRow
                            icon={<Flag className="h-4 w-4" />}
                            label="Prioritāte"
                            value={priorityLabel(template.priority)}
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Operacionālie ierobežojumi"
                    subtitle="Praktiskie nosacījumi, kas jāņem vērā risinājuma izveidē."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<DollarSign className="h-4 w-4" />}
                            label="Budžeta limits"
                            value={formatCurrency(template.budget_limit)}
                        />
                        <DetailRow
                            icon={<TimerReset className="h-4 w-4" />}
                            label="Maksimālie braucieni"
                            value={
                                template.max_trips != null
                                    ? String(template.max_trips)
                                    : '-'
                            }
                        />
                        <DetailRow
                            icon={<Truck className="h-4 w-4" />}
                            label="Nepieciešama degvielas plānošana"
                            value={yesNo(template.requires_refuel_planning)}
                        />
                        <DetailRow
                            icon={<Gauge className="h-4 w-4" />}
                            label="Scenārija statuss"
                            value={template.status || 'Nav norādīts'}
                        />
                        <DetailRow
                            icon={<ShieldCheck className="h-4 w-4" />}
                            label="Slēgta telpa"
                            value={yesNo(template.requires_closed_space)}
                        />
                        <DetailRow
                            icon={<Waves className="h-4 w-4" />}
                            label="Ventilacija"
                            value={yesNo(template.requires_ventilation)}
                        />
                        <DetailRow
                            icon={<BadgeAlert className="h-4 w-4" />}
                            label="Bīstamo kravu atbalsts"
                            value={yesNo(template.requires_hazardous_support)}
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Scenārija noteikumi"
                    subtitle="Skolotāja uzstādītie noteikumi, kas risinājumam jāievēro."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            label="Atļautie kuģa kravas profili"
                            value={allowedShipModes || 'Nav ierobežots'}
                        />
                        <DetailRow
                            icon={<BadgeAlert className="h-4 w-4" />}
                            label="Aizliegtie kuģa kravas profili"
                            value={forbiddenShipModes || 'Nav aizliegumu'}
                        />
                        <DetailRow
                            icon={<Truck className="h-4 w-4" />}
                            label="Obligātā iekraušanas metode"
                            value={yesNo(
                                template.requires_loading_method_choice,
                            )}
                        />
                        <DetailRow
                            icon={<Truck className="h-4 w-4" />}
                            label="Obligātā izkraušanas metode"
                            value={yesNo(
                                template.requires_unloading_method_choice,
                            )}
                        />
                        <DetailRow
                            icon={<Settings2 className="h-4 w-4" />}
                            label="Prasītās apstrādes metodes"
                            value={requiredHandlingMethods || 'Nav norādītas'}
                        />
                        <DetailRow
                            icon={<Settings2 className="h-4 w-4" />}
                            label="Atļautās apstrādes metodes"
                            value={allowedHandlingMethods || 'Visas pieejamas'}
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Ieteiktās degvielas pieturas"
                    subtitle="Šīs uzpildes vietas skolotājs ir pievienojis kā pieejamas pieturas degvielas plānošanas solim."
                >
                    {suggestedFuelStops.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {suggestedFuelStops.map((station, index) => (
                                <DetailRow
                                    key={`${station.id}-${index}`}
                                    icon={<Truck className="h-4 w-4" />}
                                    label={`Pietura ${index + 1}`}
                                    value={
                                        station.display_name ||
                                        station.location_name ||
                                        station.name ||
                                        'Nav norādīts'
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-4 text-[15px] text-[#5b6b61]">
                            Konkrētas degvielas pieturas šim uzdevumam vēl
                            nav pievienotas.
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Papildu nosacījumi"
                    subtitle="Temperatūra un īpašie apstākļi, kas var ietekmēt gala risinājumu."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<Snowflake className="h-4 w-4" />}
                            label="Temperatūras režīms"
                            value={
                                template.temperatureMode?.name ||
                                template.temperature_mode?.name ||
                                'Nav norādīts'
                            }
                        />
                        <DetailRow
                            icon={<BadgeAlert className="h-4 w-4" />}
                            label="Īpašais nosacījums"
                            value={
                                template.specialCondition?.name ||
                                template.special_condition?.name ||
                                'Nav norādīts'
                            }
                        />
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Pilna uzdevuma konfigurācija"
                subtitle="Pilns iestatījumu kopsavilkums cilvēkam saprotamā formā, nevis tehniska JSON izdruka."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <DetailRow
                        icon={<TimerReset className="h-4 w-4" />}
                        label="Sākotnējā iekraušana"
                        value={formatMinutes(timing.loading_fixed_minutes)}
                    />
                    <DetailRow
                        icon={<Truck className="h-4 w-4" />}
                        label="Degvielas pietura"
                        value={formatMinutes(timing.fuel_stop_minutes)}
                    />
                    <DetailRow
                        icon={<Waves className="h-4 w-4" />}
                        label="Ostas apstrāde"
                        value={formatMinutes(timing.port_processing_minutes)}
                    />
                    <DetailRow
                        icon={<Container className="h-4 w-4" />}
                        label="Iekraušana kuģī"
                        value={formatMinutes(timing.ship_loading_minutes)}
                    />
                    <DetailRow
                        icon={<Waves className="h-4 w-4" />}
                        label="Jūras tranzīts"
                        value={formatMinutes(timing.sea_transit_minutes)}
                    />
                    <DetailRow
                        icon={<TimerReset className="h-4 w-4" />}
                        label="Braukšana līdz atpūtai"
                        value={formatMinutes(
                            timing.max_drive_minutes_before_rest,
                        )}
                    />
                    <DetailRow
                        icon={<TimerReset className="h-4 w-4" />}
                        label="Atpūtas pauze"
                        value={formatMinutes(timing.rest_minutes)}
                    />
                    <DetailRow
                        icon={<Gauge className="h-4 w-4" />}
                        label="Ostas rinda"
                        value={formatMinutes(availability.port_queue_minutes)}
                    />
                    <DetailRow
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Kuģis gatavs"
                        value={
                            typeof availability.ship_ready_at === 'string'
                                ? formatDateTime(availability.ship_ready_at)
                                : 'Nav norādīts'
                        }
                    />
                    <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Dienas darba likme"
                        value={formatCurrencyConfig(
                            costs.labor_cost_per_hour_day,
                            '/h',
                        )}
                    />
                    <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Dienas tehnikas likme"
                        value={formatCurrencyConfig(
                            costs.machine_cost_per_hour_day,
                            '/h',
                        )}
                    />
                    <DetailRow
                        icon={<BadgeAlert className="h-4 w-4" />}
                        label="Nakts koeficients"
                        value={formatPlain(costs.night_shift_multiplier)}
                    />
                    <DetailRow
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Dienas maiņas sākums"
                        value={formatHour(costs.day_shift_start_hour)}
                    />
                    <DetailRow
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Nakts maiņas sākums"
                        value={formatHour(costs.night_shift_start_hour)}
                    />
                    <DetailRow
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Ostas/kravas pārbaude"
                        value={yesNoConfig(
                            compatibility.enforce_port_cargo_support,
                        )}
                    />
                    <DetailRow
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Kuģa/kravas pārbaude"
                        value={yesNoConfig(
                            compatibility.enforce_ship_cargo_support,
                        )}
                    />
                    <DetailRow
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Ostas/kuģa iegrime"
                        value={yesNoConfig(
                            compatibility.enforce_port_ship_draft,
                        )}
                    />
                    <DetailRow
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Apstrādes saderība"
                        value={yesNoConfig(
                            compatibility.enforce_handling_compatibility,
                        )}
                    />
                    <DetailRow
                        icon={<Gauge className="h-4 w-4" />}
                        label="Laika vērtējuma svars"
                        value={formatPlain(scoring.time_weight)}
                    />
                    <DetailRow
                        icon={<Gauge className="h-4 w-4" />}
                        label="Izmaksu vērtējuma svars"
                        value={formatPlain(scoring.cost_weight)}
                    />
                    <DetailRow
                        icon={<Gauge className="h-4 w-4" />}
                        label="Saderības vērtējuma svars"
                        value={formatPlain(scoring.compatibility_weight)}
                    />
                    <DetailRow
                        icon={<Gauge className="h-4 w-4" />}
                        label="Reisu vērtējuma svars"
                        value={formatPlain(scoring.trips_weight)}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
