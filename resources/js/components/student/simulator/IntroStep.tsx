import {
    ArrowRight,
    BadgeAlert,
    CalendarDays,
    Container,
    DollarSign,
    FileText,
    Flag,
    Gauge,
    MapPin,
    Package,
    Scale,
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
    if (value === null || value === undefined || value === '') return '—';
    return `${value} €`;
}

function formatDate(value?: string | null) {
    if (!value) return '—';

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
    };

    return map[value.toLowerCase()] ?? value;
}

function ScenarioBadge({ value }: { value?: string | null }) {
    const labelMap: Record<string, string> = {
        land_transport: 'Sauszemes transports',
        sea_transport: 'Jūras transports',
        intermodal: 'Intermodāls scenārijs',
    };

    const label = value ? labelMap[value] ?? value.replaceAll('_', ' ') : 'Scenārijs nav norādīts';

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
        normalized === 'urgent'
            ? 'border-red-200 bg-red-50 text-red-700'
            : normalized === 'high'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : normalized === 'medium'
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-slate-50 text-slate-700';

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${classes}`}>
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
    icon: React.ReactNode;
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
    icon: React.ReactNode;
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
    children: React.ReactNode;
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
                            {template.student_brief || template.description || 'Šim uzdevumam vēl nav pievienots detalizēts apraksts.'}
                        </p>
                    </div>

                    <div className="shrink-0">
                        <button
                            type="button"
                            onClick={onStart}
                            disabled={loading}
                            className="w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Sākt risinājumu
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <QuickStat
                        icon={<Container className="h-4 w-4" />}
                        label="Konteineri"
                        value={
                            template.cargo_amount_containers !== null &&
                            template.cargo_amount_containers !== undefined
                                ? String(template.cargo_amount_containers)
                                : '—'
                        }
                    />
                    <QuickStat
                        icon={<MapPin className="h-4 w-4" />}
                        label="Maršruts"
                        value={`${template.startLocation?.name ?? '—'} → ${template.endLocation?.name ?? '—'}`}
                    />
                    <QuickStat
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Termiņš"
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
                            icon={<Container className="h-4 w-4" />}
                            label="Konteineru skaits"
                            value={
                                template.cargo_amount_containers !== null &&
                                template.cargo_amount_containers !== undefined
                                    ? String(template.cargo_amount_containers)
                                    : '—'
                            }
                        />
                        <DetailRow
                            icon={<Scale className="h-4 w-4" />}
                            label="Svars"
                            value={
                                template.cargo_amount_tons !== null &&
                                template.cargo_amount_tons !== undefined
                                    ? `${template.cargo_amount_tons} t`
                                    : '—'
                            }
                        />
                        <DetailRow
                            icon={<Waves className="h-4 w-4" />}
                            label="Tilpums"
                            value={
                                template.cargo_volume_m3 !== null &&
                                template.cargo_volume_m3 !== undefined
                                    ? `${template.cargo_volume_m3} m³`
                                    : '—'
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
                            value={template.startLocation?.name || 'Nav norādīta'}
                        />
                        <DetailRow
                            icon={<MapPin className="h-4 w-4" />}
                            label="Gala lokācija"
                            value={template.endLocation?.name || 'Nav norādīta'}
                        />
                        <DetailRow
                            icon={<CalendarDays className="h-4 w-4" />}
                            label="Termiņš"
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
                                template.max_trips !== null &&
                                template.max_trips !== undefined
                                    ? String(template.max_trips)
                                    : '—'
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
                    </div>
                </SectionCard>

                <SectionCard
                    title="Papildus nosacījumi"
                    subtitle="Temperatūra un īpašie apstākļi, kas var ietekmēt gala risinājumu."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow
                            icon={<Snowflake className="h-4 w-4" />}
                            label="Temperatūras režīms"
                            value={template.temperatureMode?.name || 'Nav norādīts'}
                        />
                        <DetailRow
                            icon={<BadgeAlert className="h-4 w-4" />}
                            label="Īpašais nosacījums"
                            value={template.specialCondition?.name || 'Nav norādīts'}
                        />
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}