import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    FileText,
    Package,
    Users,
} from 'lucide-react';

type DashboardProps = {
    stats: {
        students_count: number;
        templates_count: number;
        attempts_in_progress: number;
        attempts_submitted: number;
        attempts_reviewed: number;
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

function getStepLabel(step?: string | null) {
    if (!step) return '—';

    const map: Record<string, string> = {
        intro: 'Ievads',
        ship: 'Kuģis',
        port: 'Osta',
        fuel: 'Degviela',
        route: 'Maršruts',
        preview: 'Pārskats',
        simulation: 'Simulācija',
        planning: 'Plānošana',
        route_selection: 'Maršruta izvēle',
        transport_selection: 'Transporta izvēle',
        review: 'Pārskatīšana',
        submitted: 'Iesniegts',
    };

    return map[step] ?? step.replaceAll('_', ' ');
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<
        string,
        {
            label: string;
            className: string;
            icon: JSX.Element;
        }
    > = {
        draft: {
            label: 'Melnraksts',
            className: 'border-slate-200 bg-slate-100 text-slate-700',
            icon: <FileText className="h-3.5 w-3.5" />,
        },
        published: {
            label: 'Publicēts',
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
        ready: {
            label: 'Gatavs',
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
        teacher_testing: {
            label: 'Skolotāja tests',
            className: 'border-sky-200 bg-sky-50 text-sky-700',
            icon: <ClipboardList className="h-3.5 w-3.5" />,
        },
        in_progress: {
            label: 'Procesā',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
            icon: <Clock3 className="h-3.5 w-3.5" />,
        },
        submitted: {
            label: 'Iesniegts',
            className: 'border-green-200 bg-green-50 text-green-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
        reviewed: {
            label: 'Pārskatīts',
            className: 'border-blue-200 bg-blue-50 text-blue-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
    };

    const current = config[status] ?? {
        label: status.replaceAll('_', ' '),
        className: 'border-slate-200 bg-slate-100 text-slate-700',
        icon: <FileText className="h-3.5 w-3.5" />,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${current.className}`}>
            {current.icon}
            {current.label}
        </span>
    );
}

function StatPill({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: JSX.Element;
}) {
    return (
        <div className="min-w-[128px] rounded-2xl border border-[#e1e7e2] bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf5ef] text-[#166a4d]">
                    {icon}
                </div>

                <div className="mt-2 text-xs font-medium leading-tight text-[#6b776f]">
                    {label}
                </div>

                <div className="mt-1 text-2xl font-semibold leading-none text-[#182219]">
                    {value}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({
    title,
    description,
    buttonLabel,
    onClick,
}: {
    title: string;
    description: string;
    buttonLabel: string;
    onClick: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#eef1ee] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#182219]">{title}</h2>
                <p className="mt-1 text-sm text-[#66746c]">{description}</p>
            </div>

            <button
                type="button"
                onClick={onClick}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-sm font-medium text-[#166a4d] transition hover:border-[#b8c7bc] hover:bg-[#f6faf7]"
            >
                {buttonLabel}
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: JSX.Element;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8faf8] px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#182219]">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66746c]">{description}</p>
        </div>
    );
}

function InfoChip({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#f7faf8] px-3 py-2 text-sm text-[#5d6c63]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7d8a82]">{label}:</span>
            <span className="font-semibold text-[#182219]">{value}</span>
        </span>
    );
}

function TemplateRow({
    template,
}: {
    template: DashboardProps['templates'][number];
}) {
    return (
        <button
            type="button"
            onClick={() => router.visit(`/teacher/templates/order-templates/${template.id}`)}
            className="group w-full rounded-2xl border border-[#e4e9e4] bg-white p-4 text-left transition hover:border-[#c9d5cc] hover:bg-[#fbfdfb] hover:shadow-sm"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                            <Package className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-semibold text-[#182219]">
                                    {template.title || 'Bez nosaukuma'}
                                </h3>
                                <StatusBadge status={template.status} />
                            </div>

                            <p className="mt-1 text-sm text-[#66746c]">
                                {template.cargo_name || template.cargo_type || 'Kravas tips nav norādīts'}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <InfoChip label="Scenārijs" value={getScenarioLabel(template.scenario_type)} />
                                <InfoChip label="Termiņš" value={formatDate(template.deadline_date)} />
                                <InfoChip label="Piešķirti" value={`${template.assigned_students_count} studenti`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#166a4d]">
                    <Eye className="h-4 w-4" />
                    Skatīt
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
            </div>
        </button>
    );
}

function AssignmentRow({
    task,
}: {
    task: DashboardProps['assignedTasks'][number];
}) {
    return (
        <button
            type="button"
            onClick={() => router.visit(`/teacher/assigned-tasks/${task.id}`)}
            className="group w-full rounded-2xl border border-[#e4e9e4] bg-white p-4 text-left transition hover:border-[#c9d5cc] hover:bg-[#fbfdfb] hover:shadow-sm"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                            <ClipboardList className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-semibold text-[#182219]">
                                    {task.template_title || 'Bez nosaukuma'}
                                </h3>
                                <StatusBadge status={task.status} />
                            </div>

                            <p className="mt-1 text-sm text-[#66746c]">
                                {task.student_name || 'Students nav norādīts'}
                                {task.student_class ? ` • ${task.student_class}` : ''}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <InfoChip label="Solis" value={getStepLabel(task.current_step)} />
                                <InfoChip label="Termiņš" value={formatDate(task.deadline_date)} />
                                <InfoChip label="Atjaunots" value={formatDate(task.updated_at)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#166a4d]">
                    <Eye className="h-4 w-4" />
                    Skatīt mēģinājumu
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
            </div>
        </button>
    );
}

export default function TeacherDashboard() {
    const page = usePage<DashboardProps>();
    const { stats, templates, assignedTasks } = page.props;

    return (
        <>
            <Head title="Pasūtījumi un uzdevumi" />

            <TeacherLayout active="orders">
                <div className="space-y-5">
                    <section className="overflow-hidden rounded-[28px] border border-[#d9ded9] bg-white shadow-sm">
                        <div className="relative p-6 md:p-8">
                            <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />

                            <div className="relative grid gap-6 xl:grid-cols-[1fr_720px] xl:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Pasniedzēja panelis
                                    </div>

                                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                                        Pasūtījumi un uzdevumi
                                    </h1>

                                    <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                                        Ātrs pārskats par sagatavēm, studentu mēģinājumiem un iesniegtajiem darbiem.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:gap-4">
                                    <StatPill
                                        label="Studenti"
                                        value={stats.students_count}
                                        icon={<Users className="h-5 w-5" />}
                                    />
                                    <StatPill
                                        label="Sagataves"
                                        value={stats.templates_count}
                                        icon={<Package className="h-5 w-5" />}
                                    />
                                    <StatPill
                                        label="Procesā"
                                        value={stats.attempts_in_progress}
                                        icon={<Clock3 className="h-5 w-5" />}
                                    />
                                    <StatPill
                                        label="Iesniegti"
                                        value={stats.attempts_submitted}
                                        icon={<ClipboardList className="h-5 w-5" />}
                                    />
                                    <StatPill
                                        label="Pārskatīti"
                                        value={stats.attempts_reviewed}
                                        icon={<CheckCircle2 className="h-5 w-5" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.1fr_1.4fr]">
                        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                            <SectionHeader
                                title="Jaunākās sagataves"
                                description="Uzdevumu bāze, ko vari izmantot un piešķirt studentiem."
                                buttonLabel="Visas sagataves"
                                onClick={() => router.visit('/teacher/templates/order-templates')}
                            />

                            <div className="mt-5 space-y-3">
                                {templates.length > 0 ? (
                                    templates.map((template) => (
                                        <TemplateRow key={template.id} template={template} />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={<Package className="h-6 w-6" />}
                                        title="Sagataves vēl nav pievienotas"
                                        description="Kad izveidosi pirmās uzdevumu sagataves, tās parādīsies šeit."
                                    />
                                )}
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                            <SectionHeader
                                title="Aktīvie uzdevumi"
                                description="Studentiem piešķirtie darbi ar statusu, soli un pēdējo aktivitāti."
                                buttonLabel="Pārvaldīt studentus"
                                onClick={() => router.visit('/teacher/students')}
                            />

                            <div className="mt-5 space-y-3">
                                {assignedTasks.length > 0 ? (
                                    assignedTasks.map((task) => (
                                        <AssignmentRow key={task.id} task={task} />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={<ClipboardList className="h-6 w-6" />}
                                        title="Nav aktīvu uzdevumu"
                                        description="Kad studentiem tiks piešķirti uzdevumi, šeit redzēsi progresu un iesniegumus."
                                    />
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}
