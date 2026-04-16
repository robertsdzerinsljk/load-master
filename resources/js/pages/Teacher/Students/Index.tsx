import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ClipboardList,
    Filter,
    FolderKanban,
    GraduationCap,
    Layers3,
    Mail,
    PlusCircle,
    Search,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Template = {
    id: number;
    title: string;
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

function GroupBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1 text-[13px] font-medium text-[#182219]">
            {label}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[28px] border border-dashed border-[#d9ded9] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                <Users className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#182219]">Nav pieejamu studentu</h2>

            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[#5b6b61]">
                Kad sistēmā būs pievienoti studenti, tie parādīsies šeit, un pasniedzējs varēs
                viņus pārskatīt, grupēt pēc klasēm un piešķirt uzdevumus.
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
    const groupName = getStudentGroupName(student);
    const assignedTasks = student.assignedOrderTemplates ?? [];

    return (
        <div className="rounded-[26px] border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                            <UserRound className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-[20px] font-semibold tracking-tight text-[#182219]">
                                    {student.name}
                                </h2>
                                <GroupBadge label={groupName} />
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-[15px] text-[#5b6b61]">
                                <Mail className="h-4 w-4 text-[#7b887f]" />
                                <span className="truncate">{student.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                        <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                            <ClipboardList className="h-4 w-4 text-[#166a4d]" />
                            Piešķirtie uzdevumi
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {assignedTasks.length > 0 ? (
                                assignedTasks.map((task) => (
                                    <span
                                        key={task.id}
                                        className="inline-flex items-center rounded-full border border-[#d9ded9] bg-white px-3 py-1.5 text-[13px] font-medium text-[#182219]"
                                    >
                                        {task.title}
                                    </span>
                                ))
                            ) : (
                                <div className="text-[14px] text-[#5b6b61]">
                                    Šim studentam vēl nav piešķirts neviens uzdevums.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full xl:max-w-[360px]">
                    <div className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                        <div className="flex items-center gap-2 text-[14px] font-medium text-[#182219]">
                            <PlusCircle className="h-4 w-4 text-[#166a4d]" />
                            Piešķirt uzdevumu
                        </div>

                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="mt-3 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition focus:border-[#166a4d] focus:ring-4 focus:ring-[#edf6f0]"
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
                            disabled={loadingStudentId === student.id}
                            className="mt-3 w-full rounded-xl bg-[#166a4d] px-4 py-3 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loadingStudentId === student.id ? 'Piešķir...' : 'Piešķirt'}
                        </button>
                    </div>
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
                <div className="space-y-6">
                    <BackButton fallbackHref="/teacher" />

                    <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                        <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                        <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    Studentu pārvaldība
                                </div>

                                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                                    Studenti un uzdevumu piešķiršana
                                </h1>

                                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                                    Pārskati studentus, grupē tos pēc klasēm vai kursiem un ātri
                                    piešķir simulatora uzdevumus. Šis skats ir sagatavots arī
                                    lielākam studentu apjomam, ne tikai vienkāršam sarakstam.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Studenti"
                            value={students.length}
                            helper="Kopējais studentu skaits"
                            icon={<Users className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Klases / kursi"
                            value={groups.length}
                            helper="Atklātās grupas sistēmā"
                            icon={<Layers3 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Ar uzdevumiem"
                            value={assignedCount}
                            helper="Studenti ar vismaz vienu uzdevumu"
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Pieejamās sagataves"
                            value={templates.length}
                            helper="Uzdevumi piešķiršanai"
                            icon={<FolderKanban className="h-5 w-5" />}
                        />
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                                    Studentu saraksts
                                </h2>
                                <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">
                                    Grupēts un filtrējams skats, lai pasniedzējs varētu strādāt ar
                                    klasēm, kursiem un lielāku studentu skaitu.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px] xl:w-[720px]">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Meklēt pēc vārda, e-pasta, klases vai uzdevuma..."
                                        className="w-full rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                    <select
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-[#d9ded9] bg-white py-3 pl-10 pr-4 text-[15px] text-[#182219] outline-none transition focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
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

                        <div className="mt-6 space-y-8">
                            {students.length === 0 ? (
                                <EmptyState />
                            ) : groupedEntries.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] px-6 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166a4d] shadow-sm">
                                        <Search className="h-6 w-6" />
                                    </div>

                                    <h3 className="mt-4 text-[20px] font-semibold text-[#182219]">
                                        Nekas netika atrasts
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-[15px] leading-7 text-[#5b6b61]">
                                        Pamēģini citu meklēšanas frāzi vai izvēlies citu klasi /
                                        kursu filtrā.
                                    </p>
                                </div>
                            ) : (
                                groupedEntries.map(([groupName, groupStudents]) => (
                                    <section key={groupName} className="space-y-4">
                                        <div className="flex flex-col gap-2 border-b border-[#eef1ee] pb-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <h3 className="text-[22px] font-semibold tracking-tight text-[#182219]">
                                                        {groupName}
                                                    </h3>
                                                    <p className="text-[14px] text-[#5b6b61]">
                                                        {groupStudents.length} studenti šajā grupā
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
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
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </TeacherLayout>
        </>
    );
}