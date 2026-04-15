import { Head, router, usePage } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { useState } from 'react';

type Template = {
    id: number;
    title: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    assignedOrderTemplates?: Template[];
};

type PageProps = {
    students: Student[];
    templates: Template[];
};

export default function TeacherStudentsIndex() {
    const page = usePage<PageProps>();
    const students = page.props.students ?? [];
    const templates = page.props.templates ?? [];

    const [selectedTemplates, setSelectedTemplates] = useState<Record<number, string>>({});
    const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);

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

    return (
        <>
            <Head title="Studentu saraksts" />

            <TeacherLayout active="students">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Studentu saraksts
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Pārskatiet studentus un piešķiriet viņiem simulatora uzdevumus.
                    </p>
                </div>

                <div className="mt-6 grid gap-4">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <div
                                key={student.id}
                                className="rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <h2 className="text-[18px] font-semibold text-[#182219]">
                                            {student.name}
                                        </h2>

                                        <p className="mt-1 text-[14px] text-[#5b6b61]">
                                            {student.email}
                                        </p>

                                        <div className="mt-4">
                                            <h3 className="text-[14px] font-semibold text-[#182219]">
                                                Piešķirtie uzdevumi
                                            </h3>

                                            <div className="mt-2 space-y-2">
                                                {student.assignedOrderTemplates?.length ? (
                                                    student.assignedOrderTemplates.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-2 text-[14px] text-[#182219]"
                                                        >
                                                            {task.title}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-[14px] text-[#5b6b61]">
                                                        Šim studentam vēl nav piešķirts neviens uzdevums.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-md rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                        <label className="text-[14px] font-medium text-[#182219]">
                                            Piešķirt uzdevumu
                                        </label>

                                        <select
                                            value={selectedTemplates[student.id] ?? ''}
                                            onChange={(e) =>
                                                setSelectedTemplates((prev) => ({
                                                    ...prev,
                                                    [student.id]: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none focus:border-[#166a4d]"
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
                                            onClick={() => handleAssign(student.id)}
                                            disabled={loadingStudentId === student.id}
                                            className="mt-3 rounded-xl bg-[#166a4d] px-4 py-3 text-[14px] font-medium text-white hover:bg-[#135740] disabled:opacity-60"
                                        >
                                            {loadingStudentId === student.id ? 'Piešķir...' : 'Piešķirt'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-10 text-center text-[16px] text-[#5b6b61] shadow-sm">
                            Nav pieejamu studentu.
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}