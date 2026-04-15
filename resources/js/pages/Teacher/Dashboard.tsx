import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';

type DashboardProps = {
    stats: {
        students_count: number;
        templates_count: number;
        attempts_in_progress: number;
        attempts_submitted: number;
    };
    templates: Array<{
        id: number;
        title: string;
        scenario_type: string;
        status: string;
        cargo_name?: string | null;
        cargo_type?: string | null;
        deadline_date?: string | null;
        priority?: string | null;
        assigned_students_count: number;
    }>;
    assignedTasks: Array<{
        id: number;
        status: string;
        current_step: string;
        submitted_at?: string | null;
        updated_at?: string | null;
        student_name?: string | null;
        student_email?: string | null;
        student_class?: string | null;
        template_id?: number | null;
        template_title?: string | null;
        deadline_date?: string | null;
        priority?: string | null;
    }>;
};

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        draft: 'Melnraksts',
        ready: 'Gatavs',
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
    };

    const styles: Record<string, string> = {
        draft: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        ready: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        in_progress: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
        submitted: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {labelMap[status] ?? status}
        </span>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-white p-5 shadow-sm">
            <div className="text-[13px] uppercase tracking-wide text-[#7a877f]">{label}</div>
            <div className="mt-2 text-[30px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

export default function TeacherDashboard() {
    const page = usePage<DashboardProps>();
    const { stats, templates, assignedTasks } = page.props;

    return (
        <>
            <Head title="Teacher Dashboard" />

            <TeacherLayout active="orders">
                <div className="space-y-6">
                    <div className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-[30px] font-semibold text-[#182219]">
                                    Pasūtījumi un uzdevumi
                                </h1>
                                <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                                    Šeit redzamas jaunākās uzdevumu sagataves un studentiem piešķirtie uzdevumi no datubāzes.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.visit('/teacher/templates/order-templates/create')}
                                className="rounded-xl bg-[#166a4d] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                            >
                                Izveidot uzdevumu
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Studenti" value={stats.students_count} />
                        <StatCard label="Uzdevumu sagataves" value={stats.templates_count} />
                        <StatCard label="Procesā" value={stats.attempts_in_progress} />
                        <StatCard label="Iesniegti" value={stats.attempts_submitted} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Jaunākās uzdevumu sagataves
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => router.visit('/teacher/templates/order-templates')}
                                    className="text-sm font-medium text-[#166a4d] hover:underline"
                                >
                                    Skatīt visas
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {templates.length > 0 ? (
                                    templates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() =>
                                                router.visit(`/teacher/templates/order-templates/${template.id}`)
                                            }
                                            className="w-full rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4 text-left transition hover:bg-[#f1f6f2]"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[18px] font-semibold text-[#182219]">
                                                        {template.title}
                                                    </div>
                                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                                        {template.cargo_name || template.cargo_type || '—'}
                                                    </div>
                                                </div>

                                                <StatusBadge status={template.status} />
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 text-[14px] text-[#5b6b61]">
                                                <div>
                                                    <span className="font-medium text-[#182219]">Tips:</span>{' '}
                                                    {template.scenario_type}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-[#182219]">Termiņš:</span>{' '}
                                                    {template.deadline_date || '—'}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-[#182219]">Piešķirti:</span>{' '}
                                                    {template.assigned_students_count}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-4 text-[15px] text-[#5b6b61]">
                                        Datubāzē vēl nav nevienas uzdevuma sagataves.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Piešķirtie uzdevumi
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => router.visit('/teacher/students')}
                                    className="text-sm font-medium text-[#166a4d] hover:underline"
                                >
                                    Pārvaldīt studentus
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {assignedTasks.length > 0 ? (
                                    assignedTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            type="button"
                                            onClick={() =>
                                                router.visit(`/teacher/assigned-tasks/${task.id}`)
                                            }
                                            className="w-full rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4 text-left transition hover:bg-[#f1f6f2]"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[18px] font-semibold text-[#182219]">
                                                        {task.template_title || 'Bez nosaukuma'}
                                                    </div>
                                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                                        {task.student_name || '—'}
                                                        {task.student_class ? ` — ${task.student_class}` : ''}
                                                    </div>
                                                </div>

                                                <StatusBadge status={task.status} />
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 text-[14px] text-[#5b6b61]">
                                                <div>
                                                    <span className="font-medium text-[#182219]">Solis:</span>{' '}
                                                    {task.current_step}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-[#182219]">Termiņš:</span>{' '}
                                                    {task.deadline_date || '—'}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-[#182219]">Atjaunots:</span>{' '}
                                                    {task.updated_at || '—'}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-4 text-[15px] text-[#5b6b61]">
                                        Datubāzē vēl nav neviena piešķirta uzdevuma.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}