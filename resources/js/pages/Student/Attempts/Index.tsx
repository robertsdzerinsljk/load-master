import StudentLayout from '@/layouts/StudentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileSearch,
    FileText,
    Fuel,
    Search,
    Timer,
    Truck,
    AlertTriangle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type AttemptItem = {
    id: number;
    status?: string | null;
    current_step?: string | null;
    submitted_at?: string | null;
    updated_at?: string | null;

    score?: number | string | null;
    total_cost?: number | string | null;
    total_time_hours?: number | string | null;
    total_fuel_liters?: number | string | null;
    is_valid?: boolean | null;
    feedback_text?: string | null;

    orderTemplate?: {
        id: number;
        title: string;
        scenario_type?: string | null;
        cargo_name?: string | null;
        cargo_type?: string | null;
        deadline_date?: string | null;
    } | null;
};

type PageProps = {
    attempts?: AttemptItem[];
};

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

function getScenarioLabel(type?: string | null) {
    if (!type) return 'Scenārijs nav norādīts';

    const map: Record<string, string> = {
        fuel_planning: 'Uzpildes plānošana',
        container_delivery: 'Konteineru piegāde',
        route_planning: 'Maršruta plānošana',
        mixed_transport: 'Kombinētais transports',
        port_loading: 'Ostas iekraušana',
        simulation: 'Simulācija',
        general: 'Vispārējs scenārijs',
    };

    return map[type] ?? type.replaceAll('_', ' ');
}

function getStatusLabel(status?: string | null) {
    const map: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        reviewed: 'Pārskatīts',
        draft: 'Melnraksts',
    };

    if (!status) return 'Procesā';

    return map[status] ?? status;
}

function StatusBadge({ status }: { status?: string | null }) {
    const current = status ?? 'in_progress';

    const styleMap: Record<string, string> = {
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        reviewed: 'border-violet-200 bg-violet-50 text-violet-700',
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styleMap[current] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {getStatusLabel(current)}
        </span>
    );
}

function StatCard({
    label,
    value,
    helper,
    icon,
}: {
    label: string;
    value: number;
    helper: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-[#6b776f]">{label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-[#182219]">
                        {value}
                    </div>
                    <div className="mt-2 text-sm text-[#7d8a82]">{helper}</div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ecf5ef] text-[#166a4d]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MetricChip({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] px-3 py-3">
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-1 text-[14px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[28px] border border-dashed border-[#d9ded9] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                <ClipboardCheck className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#182219]">
                Tev vēl nav mēģinājumu
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                Kad sāksi vai iesniegsi simulatora uzdevumus, tavi mēģinājumi parādīsies šeit kopā ar
                statusu, rezultātiem un atsauksmēm.
            </p>
        </div>
    );
}

function AttemptRow({ attempt }: { attempt: AttemptItem }) {
    const template = attempt.orderTemplate ?? null;

    const title = template?.title || 'Uzdevums bez nosaukuma';
    const description =
        template?.cargo_name || template?.cargo_type || 'Kravas informācija nav norādīta';

    const scenario = getScenarioLabel(template?.scenario_type);
    const buttonLabel = attempt.status === 'in_progress' ? 'Turpināt' : 'Atvērt';

    const attemptHref = `/student/simulator/${attempt.id}`;
    const taskHref = template?.id ? `/student/simulator/task/${template.id}` : null;

    return (
        <div className="rounded-[26px] border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                            <ClipboardCheck className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-[20px] font-semibold tracking-tight text-[#182219]">
                                    {title}
                                </h2>
                                <StatusBadge status={attempt.status} />
                                <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[13px] font-medium text-[#182219]">
                                    {scenario}
                                </span>
                            </div>

                            <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <MetricChip
                            label="Punkti"
                            value={attempt.score != null ? String(attempt.score) : '—'}
                            icon={<CheckCircle2 className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Laiks"
                            value={
                                attempt.total_time_hours != null
                                    ? `${attempt.total_time_hours} h`
                                    : '—'
                            }
                            icon={<Timer className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Izmaksas"
                            value={attempt.total_cost != null ? `${attempt.total_cost} €` : '—'}
                            icon={<Truck className="h-4 w-4" />}
                        />
                        <MetricChip
                            label="Degviela"
                            value={
                                attempt.total_fuel_liters != null
                                    ? `${attempt.total_fuel_liters} L`
                                    : '—'
                            }
                            icon={<Fuel className="h-4 w-4" />}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[#66746c]">
                        <div className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-[#7b887f]" />
                            Iesniegts: {formatDate(attempt.submitted_at)}
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#7b887f]" />
                            Termiņš: {formatDate(template?.deadline_date)}
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-[#7b887f]" />
                            {attempt.is_valid === false ? 'Atrastas problēmas' : 'Rezultāts derīgs'}
                        </div>
                    </div>

                    {attempt.feedback_text ? (
                        <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                Pasniedzēja atsauksme
                            </div>
                            <p className="mt-2 text-[14px] leading-6 text-[#425247]">
                                {attempt.feedback_text}
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="flex shrink-0 flex-col gap-3 xl:min-w-[210px]">
                    <Link
                        href={attemptHref}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                    >
                        <FileSearch className="h-4 w-4" />
                        {buttonLabel}
                    </Link>

                    {taskHref ? (
                        <Link
                            href={taskHref}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            Skatīt uzdevumu
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] px-4 py-3 text-[15px] font-medium text-[#7b887f]">
                            Uzdevums nav pieejams
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StudentAttemptsIndex() {
    const page = usePage<PageProps>();
    const attempts = page.props.attempts ?? [];
    const [query, setQuery] = useState('');

    const filteredAttempts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return attempts;
        }

        return attempts.filter((attempt) => {
            const template = attempt.orderTemplate ?? null;

            const haystack = [
                template?.title,
                template?.cargo_name,
                template?.cargo_type,
                template?.scenario_type,
                attempt.status,
                attempt.current_step,
                attempt.feedback_text,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [attempts, query]);

    const inProgressCount = attempts.filter((item) => item.status === 'in_progress').length;
    const submittedCount = attempts.filter((item) => item.status === 'submitted').length;
    const reviewedCount = attempts.filter((item) => item.status === 'reviewed').length;

    return (
        <>
            <Head title="Mani mēģinājumi" />

            <StudentLayout active="attempts">
                <div className="space-y-6">
                    <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                        <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                        <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Studenta rezultāti
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                                Mani mēģinājumi
                            </h1>

                            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                                Šeit redzami visi tavi uzdevumu mēģinājumi — gan procesā esošie, gan
                                iesniegtie, gan jau pārskatītie rezultāti.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Kopā mēģinājumi"
                            value={attempts.length}
                            helper="Visi saglabātie mēģinājumi"
                            icon={<ClipboardCheck className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Procesā"
                            value={inProgressCount}
                            helper="Vēl var turpināt"
                            icon={<Clock3 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Iesniegti"
                            value={submittedCount}
                            helper="Nosūtīti pārbaudei"
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Pārskatīti"
                            value={reviewedCount}
                            helper="Ar gala statusu"
                            icon={<FileText className="h-5 w-5" />}
                        />
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                                    Mēģinājumu saraksts
                                </h2>
                                <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">
                                    Atver mēģinājumu, lai redzētu rezultātus, atsauksmes vai turpinātu
                                    izpildi.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Meklēt pēc nosaukuma, scenārija vai atsauksmes..."
                                    className="w-full rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                />
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            {attempts.length === 0 ? (
                                <EmptyState />
                            ) : filteredAttempts.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                                        <Search className="h-6 w-6" />
                                    </div>

                                    <h3 className="mt-4 text-[20px] font-semibold text-[#182219]">
                                        Nekas netika atrasts
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-[15px] leading-7 text-[#5b6b61]">
                                        Pamēģini citu meklēšanas frāzi vai notīri meklēšanas lauku,
                                        lai redzētu visus mēģinājumus.
                                    </p>
                                </div>
                            ) : (
                                filteredAttempts.map((attempt) => (
                                    <AttemptRow key={attempt.id} attempt={attempt} />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </StudentLayout>
        </>
    );
}