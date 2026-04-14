import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

type PageProps = {
    id: number;
};

const assignedTasks = [
    {
        id: 1,
        title: 'Pārtikas piegāde uz Vāciju',
        scenario: 'Pārtikas piegāde uz Vāciju',
        assignedTo: 'Jānis Bērziņš',
        assignedType: 'students',
        group: 'LM-2',
        status: 'Procesā',
        assignedDate: '14.04.2026',
        deadline: '18.04.2026',
        submittedAt: '',
        progress: 55,
        summary:
            'Students ir uzsācis darbu pie piegādes scenārija, bet vēl nav iesniedzis gala risinājumu.',
        teacherNote:
            'Jāpievērš uzmanība temperatūras režīmam un maršruta izvēlei.',
        studentNote:
            'Izvēlēts sākotnējais transports, tiek pabeigta dokumentācijas daļa.',
    },
    {
        id: 2,
        title: 'Farmācijas krava uz Zviedriju',
        scenario: 'Farmācijas krava uz Zviedriju',
        assignedTo: 'LM-3 grupa',
        assignedType: 'group',
        group: 'LM-3',
        status: 'Iesniegts',
        assignedDate: '11.04.2026',
        deadline: '15.04.2026',
        submittedAt: '14.04.2026 13:20',
        progress: 100,
        summary:
            'Uzdevums ir iesniegts un gatavs pasniedzēja pārskatīšanai.',
        teacherNote:
            'Jānovērtē dokumentu korektums un izvēlētā piegādes ķēde.',
        studentNote:
            'Risinājums pabeigts un iesniegts pārbaudei.',
    },
    {
        id: 3,
        title: 'Rūpniecības iekārtu imports',
        scenario: 'Rūpniecības iekārtu imports',
        assignedTo: 'Elīna Kalniņa',
        assignedType: 'student',
        group: 'LM-4',
        status: 'Nav sākts',
        assignedDate: '14.04.2026',
        deadline: '20.04.2026',
        submittedAt: '',
        progress: 0,
        summary:
            'Students vēl nav sācis darbu pie piešķirtā scenārija.',
        teacherNote:
            'Jāpārbauda, vai students ir iepazinies ar muitas dokumentu prasībām.',
        studentNote: '',
    },
    {
        id: 4,
        title: 'Bīstamās kravas piegāde',
        scenario: 'Bīstamās kravas piegāde',
        assignedTo: 'Mārtiņš Liepa',
        assignedType: 'student',
        group: 'LM-3',
        status: 'Nokavēts',
        assignedDate: '05.04.2026',
        deadline: '10.04.2026',
        submittedAt: '',
        progress: 35,
        summary:
            'Uzdevuma termiņš ir beidzies, bet students vēl nav pabeidzis iesniegšanu.',
        teacherNote:
            'Jāizvērtē, vai piešķirt papildu termiņu vai fiksēt kavējumu.',
        studentNote:
            'Daļēji aizpildīts transports un īpašie nosacījumi.',
    },
];

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Nav sākts': 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        Procesā: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
        Iesniegts: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        Nokavēts: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {status}
        </span>
    );
}

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-white p-4">
            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-1 text-[16px] font-semibold text-[#182219]">
                {value || '—'}
            </div>
        </div>
    );
}

export default function TeacherAssignedTaskShow() {
    const { id } = usePage<{ props: PageProps }>().props;

    const task = useMemo(
        () => assignedTasks.find((item) => item.id === Number(id)) ?? assignedTasks[0],
        [id]
    );

    return (
        <>
            <Head title="Piešķirtais uzdevums" />

            <TeacherLayout active="orders">
                <BackButton href="/teacher" />

                <div className="flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                                {task.title}
                            </h1>
                            <StatusBadge status={task.status} />
                        </div>

                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                            Šeit pasniedzējs var sekot līdzi piešķirtā uzdevuma izpildei,
                            iesniegšanas statusam un studenta vai grupas progresam.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/teacher/templates/order-templates')}
                            className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            Atvērt sagataves
                        </button>

                        <button
                            type="button"
                            className="rounded-xl bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                        >
                            Atvērt iesniegumu
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Uzdevuma informācija
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoCard label="Scenārijs" value={task.scenario} />
                                <InfoCard label="Piešķirts" value={task.assignedTo} />
                                <InfoCard label="Grupa" value={task.group} />
                                <InfoCard label="Piešķiršanas datums" value={task.assignedDate} />
                                <InfoCard label="Termiņš" value={task.deadline} />
                                <InfoCard label="Iesniegts" value={task.submittedAt || 'Vēl nav'} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Progresa pārskats
                            </h2>

                            <div className="mt-5">
                                <div className="flex items-center justify-between text-[15px] font-medium text-[#182219]">
                                    <span>Izpildes progress</span>
                                    <span>{task.progress}%</span>
                                </div>

                                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#e8efea]">
                                    <div
                                        className="h-full rounded-full bg-[#166a4d] transition-all"
                                        style={{ width: `${task.progress}%` }}
                                    />
                                </div>

                                <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                    {task.summary}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Studenta / grupas komentārs
                            </h2>

                            <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                {task.studentNote || 'Komentārs vēl nav pievienots.'}
                            </p>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Pasniedzēja piezīmes
                            </h2>

                            <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                {task.teacherNote}
                            </p>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Ātrās darbības
                            </h2>

                            <div className="mt-4 space-y-3">
                                <button
                                    type="button"
                                    className="w-full rounded-xl border border-[#d9ded9] bg-[#166A4D] px-4 py-3 text-left text-[15px] font-medium text-white transition hover:opacity-90"
                                >
                                    Mainīt termiņu
                                </button>

                                <button
                                    type="button"
                                    className="w-full rounded-xl border border-[#d9ded9] bg-[#166A4D] px-4 py-3 text-left text-[15px] font-medium text-white transition hover:opacity-90"
                                >
                                    Pievienot atsauksmi
                                </button>

                                <button
                                    type="button"
                                    className="w-full rounded-xl border border-[#d9ded9] bg-[#166A4D] px-4 py-3 text-left text-[15px] font-medium text-white transition hover:opacity-90"
                                >
                                    Atzīmēt kā pārskatītu
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}