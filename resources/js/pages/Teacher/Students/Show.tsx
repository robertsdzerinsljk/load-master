import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Eye,
    FileText,
    GraduationCap,
    Mail,
    Route,
    Star,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

type StudentProfileProps = {
    student: {
        id: number;
        name: string;
        first_name?: string | null;
        last_name?: string | null;
        display_name?: string | null;
        email: string;
        class_name?: string | null;
        created_at?: string | null;
    };
    stats: {
        assigned_count: number;
        attempts_count: number;
        in_progress_count: number;
        submitted_count: number;
        reviewed_count: number;
        average_grade?: number | null;
        average_score?: number | null;
    };
    assignments: Array<{
        id: number;
        title: string;
        scenario_type?: string | null;
        priority?: string | null;
        deadline_date?: string | null;
        assigned_at?: string | null;
        attempt_id?: number | null;
        attempt_status?: string | null;
        attempt_updated_at?: string | null;
    }>;
    attempts: Array<{
        id: number;
        status: string;
        current_step?: string | null;
        submitted_at?: string | null;
        updated_at?: string | null;
        score?: number | string | null;
        total_cost?: number | string | null;
        total_time_hours?: number | string | null;
        total_fuel_liters?: number | string | null;
        template?: {
            id: number;
            title: string;
            scenario_type?: string | null;
            deadline_date?: string | null;
            priority?: string | null;
        } | null;
        feedback?: {
            grade?: number | null;
            comment?: string | null;
        } | null;
    }>;
};

function formatDate(value?: string | null) {
    if (!value) return 'Nav norādīts';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: value.includes(':') ? '2-digit' : undefined,
        minute: value.includes(':') ? '2-digit' : undefined,
    }).format(date);
}

function getScenarioLabel(type?: string | null) {
    if (!type) return 'Nav norādīts';

    const map: Record<string, string> = {
        full_chain: 'Pilna ķēde',
        fuel_planning: 'Degvielas plānošana',
        container_delivery: 'Konteineru piegāde',
        port_loading: 'Ostas iekraušana',
        route_planning: 'Maršruta plānošana',
        mixed_transport: 'Kombinētais transports',
        simulation: 'Simulācija',
    };

    return map[type] ?? type.replaceAll('_', ' ');
}

function getStatusLabel(status?: string | null) {
    if (!status) return 'Nav sākts';

    const map: Record<string, string> = {
        draft: 'Melnraksts',
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        reviewed: 'Pārskatīts',
    };

    return map[status] ?? status.replaceAll('_', ' ');
}

function StatusBadge({ status }: { status?: string | null }) {
    const styles: Record<string, string> = {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        reviewed: 'border-blue-200 bg-blue-50 text-blue-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                styles[status ?? ''] ??
                'border-[#d9ded9] bg-[#f8fbf9] text-[#5f6d65]'
            }`}
        >
            {getStatusLabel(status)}
        </span>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf6f0] text-[#166a4d]">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-[0.14em] text-[#75827a] uppercase">
                        {label}
                    </div>
                    <div className="mt-1 text-2xl leading-none font-semibold text-[#182219]">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyPanel({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#166a4d] shadow-sm">
                <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#182219]">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5f6d65]">
                {description}
            </p>
        </div>
    );
}

export default function TeacherStudentShow() {
    const { student, stats, assignments, attempts } =
        usePage<StudentProfileProps>().props;
    const displayName =
        student.display_name ||
        [student.first_name, student.last_name].filter(Boolean).join(' ') ||
        student.name;

    return (
        <>
            <Head title={`${displayName} | Studenta profils`} />

            <TeacherLayout active="students">
                <div className="space-y-5">
                    <BackButton fallbackHref="/teacher/students" />

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                                    <UserRound className="h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        Studenta profils
                                    </div>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#182219]">
                                        {displayName}
                                    </h1>
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#5f6d65]">
                                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#f8fbf9] px-3 py-2">
                                            <Mail className="h-4 w-4 text-[#166a4d]" />
                                            {student.email}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#f8fbf9] px-3 py-2">
                                            <GraduationCap className="h-4 w-4 text-[#166a4d]" />
                                            {student.class_name || 'Bez klases'}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#f8fbf9] px-3 py-2">
                                            <CalendarDays className="h-4 w-4 text-[#166a4d]" />
                                            Profilā kopš{' '}
                                            {formatDate(student.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/teacher/students"
                                className="inline-flex items-center justify-center rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-sm font-semibold text-[#166a4d] transition hover:bg-[#f6faf7]"
                            >
                                Atpakaļ uz studentiem
                            </Link>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
                        <StatCard
                            label="Piešķirti"
                            value={stats.assigned_count}
                            icon={<ClipboardList className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Mēģinājumi"
                            value={stats.attempts_count}
                            icon={<Route className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Procesā"
                            value={stats.in_progress_count}
                            icon={<Clock3 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Iesniegti"
                            value={stats.submitted_count}
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Pārskatīti"
                            value={stats.reviewed_count}
                            icon={<Eye className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Vid. atzīme"
                            value={stats.average_grade ?? '—'}
                            icon={<Award className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Vid. score"
                            value={stats.average_score ?? '—'}
                            icon={<Star className="h-5 w-5" />}
                        />
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="border-b border-[#eef1ee] pb-4">
                            <h2 className="text-2xl font-semibold tracking-tight text-[#182219]">
                                Piešķirtie uzdevumi
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-[#5f6d65]">
                                Te redzami arī uzdevumi, kur students vēl nav
                                sācis mēģinājumu.
                            </p>
                        </div>

                        <div className="mt-5 space-y-3">
                            {assignments.length ? (
                                assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-semibold text-[#182219]">
                                                    {assignment.title ||
                                                        'Bez nosaukuma'}
                                                </h3>
                                                <StatusBadge
                                                    status={
                                                        assignment.attempt_status
                                                    }
                                                />
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#5f6d65]">
                                                <span>
                                                    {getScenarioLabel(
                                                        assignment.scenario_type,
                                                    )}
                                                </span>
                                                <span>
                                                    Piešķirts:{' '}
                                                    {formatDate(
                                                        assignment.assigned_at,
                                                    )}
                                                </span>
                                                <span>
                                                    Termiņš:{' '}
                                                    {formatDate(
                                                        assignment.deadline_date,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {assignment.attempt_id ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.visit(
                                                        `/teacher/assigned-tasks/${assignment.attempt_id}`,
                                                    )
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#135740]"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Skatīt mēģinājumu
                                            </button>
                                        ) : (
                                            <span className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b776f]">
                                                Vēl nav sākts
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <EmptyPanel
                                    title="Uzdevumi vēl nav piešķirti"
                                    description="Kad šim studentam piešķirsi simulatora uzdevumus, tie parādīsies šajā sarakstā."
                                />
                            )}
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="border-b border-[#eef1ee] pb-4">
                            <h2 className="text-2xl font-semibold tracking-tight text-[#182219]">
                                Mēģinājumu vēsture un vērtējumi
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-[#5f6d65]">
                                Iesniegumi, sistēmas score un skolotāja
                                saglabātās atzīmes vienā vietā.
                            </p>
                        </div>

                        <div className="mt-5 space-y-3">
                            {attempts.length ? (
                                attempts.map((attempt) => (
                                    <button
                                        key={attempt.id}
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                `/teacher/assigned-tasks/${attempt.id}`,
                                            )
                                        }
                                        className="group w-full rounded-2xl border border-[#e4e9e4] bg-white p-4 text-left transition hover:border-[#c9d5cc] hover:bg-[#fbfdfb] hover:shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-[#182219]">
                                                        {attempt.template
                                                            ?.title ||
                                                            'Bez nosaukuma'}
                                                    </h3>
                                                    <StatusBadge
                                                        status={attempt.status}
                                                    />
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#5f6d65]">
                                                    <span>
                                                        {getScenarioLabel(
                                                            attempt.template
                                                                ?.scenario_type,
                                                        )}
                                                    </span>
                                                    <span>
                                                        Solis:{' '}
                                                        {getStatusLabel(
                                                            attempt.current_step,
                                                        )}
                                                    </span>
                                                    <span>
                                                        Atjaunots:{' '}
                                                        {formatDate(
                                                            attempt.updated_at,
                                                        )}
                                                    </span>
                                                    <span>
                                                        Iesniegts:{' '}
                                                        {formatDate(
                                                            attempt.submitted_at,
                                                        )}
                                                    </span>
                                                </div>
                                                {attempt.feedback?.comment ? (
                                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#425247]">
                                                        {
                                                            attempt.feedback
                                                                .comment
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 xl:w-[520px]">
                                                <div className="rounded-xl bg-[#f8fbf9] px-3 py-2">
                                                    <div className="text-xs font-semibold tracking-wide text-[#7b887f] uppercase">
                                                        Atzīme
                                                    </div>
                                                    <div className="mt-1 font-semibold text-[#182219]">
                                                        {attempt.feedback
                                                            ?.grade ?? '—'}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl bg-[#f8fbf9] px-3 py-2">
                                                    <div className="text-xs font-semibold tracking-wide text-[#7b887f] uppercase">
                                                        Score
                                                    </div>
                                                    <div className="mt-1 font-semibold text-[#182219]">
                                                        {attempt.score ?? '—'}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl bg-[#f8fbf9] px-3 py-2">
                                                    <div className="text-xs font-semibold tracking-wide text-[#7b887f] uppercase">
                                                        Laiks
                                                    </div>
                                                    <div className="mt-1 font-semibold text-[#182219]">
                                                        {attempt.total_time_hours ??
                                                            '—'}{' '}
                                                        h
                                                    </div>
                                                </div>
                                                <div className="rounded-xl bg-[#f8fbf9] px-3 py-2">
                                                    <div className="text-xs font-semibold tracking-wide text-[#7b887f] uppercase">
                                                        Izmaksas
                                                    </div>
                                                    <div className="mt-1 font-semibold text-[#182219]">
                                                        {attempt.total_cost ??
                                                            '—'}{' '}
                                                        €
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <EmptyPanel
                                    title="Mēģinājumu vēl nav"
                                    description="Kad students sāks vai iesniegs uzdevumu, šeit parādīsies mēģinājumu vēsture."
                                />
                            )}
                        </div>
                    </section>
                </div>
            </TeacherLayout>
        </>
    );
}
