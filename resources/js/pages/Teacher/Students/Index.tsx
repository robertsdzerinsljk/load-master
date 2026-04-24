import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Filter,
    FolderKanban,
    GraduationCap,
    Layers3,
    Mail,
    PackagePlus,
    Search,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Template = {
    id: number;
    title: string;
    readiness?: {
        status: 'ready' | 'warning' | 'blocked';
        headline: string;
        summary: string;
        has_critical_issues: boolean;
    };
};

type Student = {
    id: number;
    name: string;
    email: string;
    class_name?: string | null;
    course_name?: string | null;
    class?: {
        id?: number;
        name?: string | null;
    } | null;
    course?: {
        id?: number;
        name?: string | null;
    } | null;
    assignedOrderTemplates?: Template[];
};

type PageProps = {
    students: Student[];
    templates: Template[];
};

function getStudentGroupName(student: Student) {
    return (
        student.class_name ||
        student.course_name ||
        student.class?.name ||
        student.course?.name ||
        'Bez grupas'
    );
}

function StatChip({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ecf5ef] text-[#166a4d]">
                    {icon}
                </div>

                <div className="min-w-0">
                    <div className="whitespace-nowrap text-[12px] font-medium leading-4 text-[#6b776f]">
                        {label}
                    </div>
                    <div className="mt-0.5 text-2xl font-semibold leading-none text-[#182219]">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GroupBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-2.5 py-1 text-xs font-medium text-[#182219]">
            {label}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                <Users className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#182219]">Nav pieejamu studentu</h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5b6b61]">
                Kad sistēmā būs pievienoti studenti, tie parādīsies šeit.
            </p>
        </div>
    );
}

function StudentCard({
    student,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    loadingStudentId,
    onAssign,
}: {
    student: Student;
    templates: Template[];
    selectedTemplate: string;
    setSelectedTemplate: (value: string) => void;
    loadingStudentId: number | null;
    onAssign: () => void;
}) {
    const [assignOpen, setAssignOpen] = useState(false);

    const groupName = getStudentGroupName(student);
    const assignedTasks = student.assignedOrderTemplates ?? [];
    const selectedTemplateData =
        templates.find((template) => String(template.id) === selectedTemplate) ?? null;
    const readiness = selectedTemplateData?.readiness;

    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf6f0] text-[#166a4d]">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold tracking-tight text-[#182219]">
                                    {student.name}
                                </h2>
                                <GroupBadge label={groupName} />
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-sm text-[#5b6b61]">
                                <Mail className="h-4 w-4 text-[#7b887f]" />
                                <span className="truncate">{student.email}</span>
                            </div>

                            <div className="mt-3">
                                {assignedTasks.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {assignedTasks.map((task) => (
                                            <span
                                                key={task.id}
                                                className="inline-flex items-center rounded-full border border-[#d9ded9] bg-[#f8fbf9] px-3 py-1 text-xs font-medium text-[#182219]"
                                            >
                                                {task.title}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="inline-flex rounded-full bg-[#f8fbf9] px-3 py-1.5 text-xs font-medium text-[#6b776f]">
                                        Nav piešķirtu uzdevumu
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[340px]">
                    <button
                        type="button"
                        onClick={() => setAssignOpen((value) => !value)}
                        className="flex w-full items-center justify-between rounded-xl border border-[#d9ded9] bg-[#f8fbf9] px-4 py-3 text-sm font-semibold text-[#182219] transition hover:bg-white"
                    >
                        <span className="inline-flex items-center gap-2">
                            <PackagePlus className="h-4 w-4 text-[#166a4d]" />
                            Piešķirt uzdevumu
                        </span>
                        <ChevronDown className={`h-4 w-4 text-[#7b887f] transition ${assignOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {assignOpen ? (
                        <div className="mt-3 rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-3">
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                className="w-full rounded-xl border border-[#d5dbd6] bg-white px-3 py-2.5 text-sm text-[#162118] outline-none transition focus:border-[#166a4d] focus:ring-4 focus:ring-[#edf6f0]"
                            >
                                <option value="">Izvēlieties uzdevumu</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.title}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={onAssign}
                                disabled={loadingStudentId === student.id || readiness?.has_critical_issues}
                                className="mt-2 w-full rounded-xl bg-[#166a4d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loadingStudentId === student.id ? 'Piešķir...' : 'Piešķirt'}
                            </button>

                            {readiness ? (
                                <div
                                    className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-5 ${
                                        readiness.status === 'blocked'
                                            ? 'border-red-200 bg-red-50 text-red-800'
                                            : readiness.status === 'warning'
                                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    }`}
                                >
                                    <div className="font-semibold">{readiness.headline}</div>
                                    <div className="mt-0.5">{readiness.summary}</div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function TeacherStudentsIndex() {
    const page = usePage<PageProps>();
    const students = page.props.students ?? [];
    const templates = page.props.templates ?? [];

    const [selectedTemplates, setSelectedTemplates] = useState<Record<number, string>>({});
    const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');

    const handleAssign = (studentId: number) => {
        const orderTemplateId = selectedTemplates[studentId];

        if (!orderTemplateId) {
            alert('Izvēlieties uzdevumu.');
            return;
        }

        setLoadingStudentId(studentId);

        router.post(
            '/teacher/students/assign-task',
            {
                user_id: studentId,
                order_template_id: Number(orderTemplateId),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoadingStudentId(null);
                    alert('Uzdevums veiksmīgi piešķirts.');
                },
                onError: (errors) => {
                    setLoadingStudentId(null);
                    console.error(errors);
                    alert('Neizdevās piešķirt uzdevumu.');
                },
                onFinish: () => {
                    setLoadingStudentId(null);
                },
            }
        );
    };

    const groups = useMemo(() => {
        const unique = Array.from(new Set(students.map((student) => getStudentGroupName(student))));
        return unique.sort((a, b) => a.localeCompare(b, 'lv'));
    }, [students]);

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesGroup =
                selectedGroup === 'all' || getStudentGroupName(student) === selectedGroup;

            const haystack = [
                student.name,
                student.email,
                getStudentGroupName(student),
                ...(student.assignedOrderTemplates?.map((task) => task.title) ?? []),
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !q || haystack.includes(q);

            return matchesGroup && matchesSearch;
        });
    }, [students, search, selectedGroup]);

    const groupedStudents = useMemo(() => {
        return filteredStudents.reduce<Record<string, Student[]>>((acc, student) => {
            const key = getStudentGroupName(student);
            if (!acc[key]) acc[key] = [];
            acc[key].push(student);
            return acc;
        }, {});
    }, [filteredStudents]);

    const groupedEntries = useMemo(() => {
        return Object.entries(groupedStudents).sort(([a], [b]) => a.localeCompare(b, 'lv'));
    }, [groupedStudents]);

    const assignedCount = students.filter(
        (student) => (student.assignedOrderTemplates?.length ?? 0) > 0
    ).length;

    return (
        <>
            <Head title="Studentu saraksts" />

            <TeacherLayout active="students">
                <div className="space-y-5">
                    <BackButton fallbackHref="/teacher" />

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    Studentu pārvaldība
                                </div>

                                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[34px]">
                                    Studenti un uzdevumu piešķiršana
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6d65]">
                                    Pārskati studentus, filtrē pēc grupām un ātri piešķir simulatora uzdevumus.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[600px]">
                                <StatChip label="Studenti" value={students.length} icon={<Users className="h-5 w-5" />} />
                                <StatChip label="Grupas" value={groups.length} icon={<Layers3 className="h-5 w-5" />} />
                                <StatChip label="Piešķirti" value={assignedCount} icon={<CheckCircle2 className="h-5 w-5" />} />
                                <StatChip label="Sagataves" value={templates.length} icon={<FolderKanban className="h-5 w-5" />} />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white shadow-sm">
                        <div className="border-b border-[#eef1ee] p-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-[#182219]">
                                        Studentu saraksts
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-[#5f6d65]">
                                        Saraksts ir grupēts pēc klases/kursa. Piešķiršanas forma ir paslēpta katra studenta kartītē.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px] xl:w-[680px]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Meklēt pēc vārda, e-pasta vai uzdevuma..."
                                            className="w-full rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-sm text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className="w-full appearance-none rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-sm text-[#182219] outline-none transition focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                        >
                                            <option value="all">Visas klases / kursi</option>
                                            {groups.map((group) => (
                                                <option key={group} value={group}>
                                                    {group}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            {students.length === 0 ? (
                                <EmptyState />
                            ) : groupedEntries.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                                        <Search className="h-6 w-6" />
                                    </div>

                                    <h3 className="mt-4 text-xl font-semibold text-[#182219]">
                                        Nekas netika atrasts
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5b6b61]">
                                        Pamēģini citu meklēšanas frāzi vai izvēlies citu grupu.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {groupedEntries.map(([groupName, groupStudents]) => (
                                        <section key={groupName} className="space-y-3">
                                            <div className="flex items-center justify-between rounded-2xl bg-[#f8fbf9] px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6f0] text-[#166a4d]">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-semibold tracking-tight text-[#182219]">
                                                            {groupName}
                                                        </h3>
                                                        <p className="text-sm text-[#6b776f]">
                                                            {groupStudents.length} studenti šajā grupā
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {groupStudents.map((student) => (
                                                    <StudentCard
                                                        key={student.id}
                                                        student={student}
                                                        templates={templates}
                                                        selectedTemplate={
                                                            selectedTemplates[student.id] ?? ''
                                                        }
                                                        setSelectedTemplate={(value) =>
                                                            setSelectedTemplates((prev) => ({
                                                                ...prev,
                                                                [student.id]: value,
                                                            }))
                                                        }
                                                        loadingStudentId={loadingStudentId}
                                                        onAssign={() => handleAssign(student.id)}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </TeacherLayout>
        </>
    );
}
