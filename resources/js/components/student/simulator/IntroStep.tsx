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
    return value ? 'Ja' : 'Ne';
}

function priorityLabel(value?: string | null) {
    if (!value) return 'Nav noradita';

    const map: Record<string, string> = {
        low: 'Zema',
        medium: 'Videja',
        high: 'Augsta',
        urgent: 'Steidzama',
        critical: 'Kritiska',
    };

    return map[value.toLowerCase()] ?? value;
}

function cargoModeLabel(value?: string | null) {
    if (!value) return 'Nav noradits';

    const map: Record<string, string> = {
        bulk: 'Beramkrava',
        containerized: 'Konteinerizeta',
        liquid: 'Skidra krava',
        palletized: 'Paletizeta',
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

function formatStringList(values?: string[] | null, mapper?: (value: string) => string) {
    if (!values || values.length === 0) return '';

    return values.map((value) => (mapper ? mapper(value) : value)).join(', ');
}

function formatMethodCode(code: string) {
    return code.replaceAll('_', ' ');
}

function formatMinutes(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav noradits'
        : `${String(value)} min`;
}

function formatHour(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav noradits'
        : `${String(value)}:00`;
}

function formatPlain(value: unknown) {
    return value === null || value === undefined || value === ''
        ? 'Nav noradits'
        : String(value);
}

function formatCurrencyConfig(value: unknown, suffix = '') {
    return value === null || value === undefined || value === ''
        ? 'Nav noradits'
        : `${String(value)} EUR${suffix}`;
}

function yesNoConfig(value: unknown) {
    return typeof value === 'boolean' ? yesNo(value) : 'Nav noradits';
}

function ScenarioBadge({ value }: { value?: string | null }) {
    const labelMap: Record<string, string> = {
        land_transport: 'Sauszemes transports',
        land_to_port: 'Sauszeme -> osta',
        port_to_ship: 'Osta -> kugis',
        full_chain: 'Pilna logistikas kede',
    };

    const label = value ? labelMap[value] ?? value.replaceAll('_', ' ') : 'Scenarijs nav noradits';

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
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${classes}`}>
            <BadgeAlert className="h-3.5 w-3.5" />
            Prioritate: {priorityLabel(value)}
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
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[18px] font-semibold text-[#182219]">{value}</div>
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
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[15px] font-semibold text-[#182219]">{value}</div>
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
                <h3 className="text-[22px] font-semibold tracking-tight text-[#182219]">{title}</h3>
                <p className="mt-1 text-[14px] leading-6 text-[#5b6b61]">{subtitle}</p>
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export default function IntroStep({ template, loading, onStart }: Props) {
    const suggestedFuelStops = template.fuelStations ?? template.fuel_stations ?? [];
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
                            Uzdevuma parskats
                        </h2>

                        <p className="mt-3 text-[15px] leading-7 text-[#5b6b61]">
                            {template.student_brief ||
                                template.description ||
                                'Sim uzdevumam vel nav pievienots detalizets apraksts.'}
                        </p>
                    </div>

                    <div className="shrink-0">
                        <button
                            type="button"
                            onClick={onStart}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:justify-start"
                        >
                            Sakt risinajumu
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
                        value={cargoModeLabel(template.cargo_mode ?? template.cargo_type)}
                    />
                    <QuickStat
                        icon={<MapPin className="h-4 w-4" />}
                        label="Marsruts"
                        value={`${template.startLocation?.name ?? '-'} -> ${template.endLocation?.name ?? '-'}`}
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
                    title="Kravas informacija"
                    subtitle="Galvenie parametri, kas ietekme izveleto transportu un piegades risinajumu."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow icon={<Package className="h-4 w-4" />} label="Nosaukums" value={template.cargo_name || 'Nav noradits'} />
                        <DetailRow icon={<FileText className="h-4 w-4" />} label="Tips" value={template.cargo_type || 'Nav noradits'} />
                        <DetailRow icon={<Package className="h-4 w-4" />} label="Kravas profils" value={cargoModeLabel(template.cargo_mode ?? template.cargo_type)} />
                        <DetailRow icon={<Container className="h-4 w-4" />} label="Konteineru skaits" value={template.cargo_amount_containers != null ? String(template.cargo_amount_containers) : '-'} />
                        <DetailRow icon={<Scale className="h-4 w-4" />} label="Svars" value={template.cargo_amount_tons != null ? `${template.cargo_amount_tons} t` : '-'} />
                        <DetailRow icon={<Waves className="h-4 w-4" />} label="Tilpums" value={template.cargo_volume_m3 != null ? `${template.cargo_volume_m3} m3` : '-'} />
                        <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Kravas vertiba" value={formatCurrency(template.cargo_value)} />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Marsruta konteksts"
                    subtitle="Sakuma un gala punkti, ka ari piegades laika ierobezojumi."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Sakuma lokacija" value={template.startLocation?.name || 'Nav noradita'} />
                        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Gala lokacija" value={template.endLocation?.name || 'Nav noradita'} />
                        <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Termins" value={formatDate(template.deadline_date)} />
                        <DetailRow icon={<Flag className="h-4 w-4" />} label="Prioritate" value={priorityLabel(template.priority)} />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Operacionlie ierobezojumi"
                    subtitle="Praktiskie nosacijumi, kas jaņem vera risinajuma izveide."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Budzeta limits" value={formatCurrency(template.budget_limit)} />
                        <DetailRow icon={<TimerReset className="h-4 w-4" />} label="Maksimalie braucieni" value={template.max_trips != null ? String(template.max_trips) : '-'} />
                        <DetailRow icon={<Truck className="h-4 w-4" />} label="Nepieciesama degvielas planosana" value={yesNo(template.requires_refuel_planning)} />
                        <DetailRow icon={<Gauge className="h-4 w-4" />} label="Scenarija statuss" value={template.status || 'Nav noradits'} />
                        <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Slegta telpa" value={yesNo(template.requires_closed_space)} />
                        <DetailRow icon={<Waves className="h-4 w-4" />} label="Ventilacija" value={yesNo(template.requires_ventilation)} />
                        <DetailRow icon={<BadgeAlert className="h-4 w-4" />} label="Bistamo kravu atbalsts" value={yesNo(template.requires_hazardous_support)} />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Scenarija noteikumi"
                    subtitle="Skolotaja uzstaditie noteikumi, kurus risinajumam ir jaievero."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow icon={<CheckCircle2 className="h-4 w-4" />} label="Atlautie kuga kravas profili" value={allowedShipModes || 'Nav ierobezots'} />
                        <DetailRow icon={<BadgeAlert className="h-4 w-4" />} label="Aizliegtie kuga kravas profili" value={forbiddenShipModes || 'Nav aizliegumu'} />
                        <DetailRow icon={<Truck className="h-4 w-4" />} label="Obligata iekrausanas metode" value={yesNo(template.requires_loading_method_choice)} />
                        <DetailRow icon={<Truck className="h-4 w-4" />} label="Obligata izkrausanas metode" value={yesNo(template.requires_unloading_method_choice)} />
                        <DetailRow icon={<Settings2 className="h-4 w-4" />} label="Prasitas handling metodes" value={requiredHandlingMethods || 'Nav noraditas'} />
                        <DetailRow icon={<Settings2 className="h-4 w-4" />} label="Atlautas handling metodes" value={allowedHandlingMethods || 'Visas pieejamas'} />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Ieteiktas degvielas pieturas"
                    subtitle="Sis uzpildes vietas skolotajs ir pievienojis ka pieejamas pieturas degvielas planosanas solim."
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
                                        'Nav noradits'
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-4 text-[15px] text-[#5b6b61]">
                            Konkre tas degvielas pieturas sim uzdevumam vel nav pievienotas.
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Papildus nosacijumi"
                    subtitle="Temperatura un ipasie apstakli, kas var ietekmet gala risinajumu."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<Snowflake className="h-4 w-4" />}
                            label="Temperaturas rezims"
                            value={template.temperatureMode?.name || template.temperature_mode?.name || 'Nav noradits'}
                        />
                        <DetailRow
                            icon={<BadgeAlert className="h-4 w-4" />}
                            label="Ipasais nosacijums"
                            value={template.specialCondition?.name || template.special_condition?.name || 'Nav noradits'}
                        />
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Pilna uzdevuma konfiguracija"
                subtitle="Pilns iestatijumu kopsavilkums cilveciga forma, nevis tehniska JSON izdruka."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <DetailRow icon={<TimerReset className="h-4 w-4" />} label="Sakotneja iekrausana" value={formatMinutes(timing.loading_fixed_minutes)} />
                    <DetailRow icon={<Truck className="h-4 w-4" />} label="Degvielas pietura" value={formatMinutes(timing.fuel_stop_minutes)} />
                    <DetailRow icon={<Waves className="h-4 w-4" />} label="Ostas apstrade" value={formatMinutes(timing.port_processing_minutes)} />
                    <DetailRow icon={<Container className="h-4 w-4" />} label="Iekrausana kugi" value={formatMinutes(timing.ship_loading_minutes)} />
                    <DetailRow icon={<Waves className="h-4 w-4" />} label="Juras tranzits" value={formatMinutes(timing.sea_transit_minutes)} />
                    <DetailRow icon={<TimerReset className="h-4 w-4" />} label="Brauksana lidz atputai" value={formatMinutes(timing.max_drive_minutes_before_rest)} />
                    <DetailRow icon={<TimerReset className="h-4 w-4" />} label="Atputas pauze" value={formatMinutes(timing.rest_minutes)} />
                    <DetailRow icon={<Gauge className="h-4 w-4" />} label="Ostas rinda" value={formatMinutes(availability.port_queue_minutes)} />
                    <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Kugis gatavs" value={typeof availability.ship_ready_at === 'string' ? formatDateTime(availability.ship_ready_at) : 'Nav noradits'} />
                    <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Dienas darba likme" value={formatCurrencyConfig(costs.labor_cost_per_hour_day, '/h')} />
                    <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Dienas tehnikas likme" value={formatCurrencyConfig(costs.machine_cost_per_hour_day, '/h')} />
                    <DetailRow icon={<BadgeAlert className="h-4 w-4" />} label="Nakts koeficients" value={formatPlain(costs.night_shift_multiplier)} />
                    <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Dienas mainas sakums" value={formatHour(costs.day_shift_start_hour)} />
                    <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Nakts mainas sakums" value={formatHour(costs.night_shift_start_hour)} />
                    <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Porta/cargo parbaude" value={yesNoConfig(compatibility.enforce_port_cargo_support)} />
                    <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Kuga/cargo parbaude" value={yesNoConfig(compatibility.enforce_ship_cargo_support)} />
                    <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Porta/kuga iegrime" value={yesNoConfig(compatibility.enforce_port_ship_draft)} />
                    <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Handling saderiba" value={yesNoConfig(compatibility.enforce_handling_compatibility)} />
                    <DetailRow icon={<Gauge className="h-4 w-4" />} label="Laika svars score" value={formatPlain(scoring.time_weight)} />
                    <DetailRow icon={<Gauge className="h-4 w-4" />} label="Izmaksu svars score" value={formatPlain(scoring.cost_weight)} />
                    <DetailRow icon={<Gauge className="h-4 w-4" />} label="Saderibas svars score" value={formatPlain(scoring.compatibility_weight)} />
                    <DetailRow icon={<Gauge className="h-4 w-4" />} label="Reisu svars score" value={formatPlain(scoring.trips_weight)} />
                </div>
            </SectionCard>
        </div>
    );
}
