import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherOrderCard from '@/components/TeacherOrderCard';

type DashboardTab = 'received' | 'assigned';

function DashboardTabButton({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl px-4 py-2 text-[15px] font-semibold transition ${
                active
                    ? 'bg-[#166a4d] text-white'
                    : 'bg-white text-[#182219] border border-[#d9ded9] hover:bg-[#f7f9f7]'
            }`}
        >
            {label}
        </button>
    );
}

export default function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('received');

    const receivedOrders = [
        {
            id: 1,
            title: 'Testa pasūtījums',
            subtitle: 'Rīga — Hamburga',
            studentName: 'Ralfs Balceris',
            status: 'Jauns',
            date: '13.04.2026',
        },
        {
            id: 2,
            title: 'Kravas piegāde uz Somiju',
            subtitle: 'Liepāja — Helsinki',
            studentName: 'Anna Ozola',
            status: 'Pārskatāms',
            date: '12.04.2026',
        },
    ];

    const assignedTasks = [
    {
        id: 1,
        title: 'Pārtikas piegāde uz Vāciju',
        subtitle: 'Piešķirts studentam Jānis Bērziņš',
        studentName: 'Jānis Bērziņš',
        status: 'Procesā',
        date: 'Termiņš: 18.04.2026',
        progress: 55,
    },
    {
        id: 2,
        title: 'Farmācijas krava uz Zviedriju',
        subtitle: 'Piešķirts grupai LM-3',
        studentName: 'LM-3 grupa',
        status: 'Iesniegts',
        date: 'Termiņš: 15.04.2026',
        progress: 100,
    },
    {
        id: 3,
        title: 'Rūpniecības iekārtu imports',
        subtitle: 'Piešķirts studentam Elīna Kalniņa',
        studentName: 'Elīna Kalniņa',
        status: 'Nav sākts',
        date: 'Termiņš: 20.04.2026',
        progress: 0,
    },
    {
        id: 4,
        title: 'Bīstamās kravas piegāde',
        subtitle: 'Piešķirts studentam Mārtiņš Liepa',
        studentName: 'Mārtiņš Liepa',
        status: 'Nokavēts',
        date: 'Termiņš: 10.04.2026',
        progress: 35,
    },
];
    return (
        <>
            <Head title="Pasūtījumi un uzdevumi" />

            <TeacherLayout active="orders">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Pasūtījumi un uzdevumi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārskatiet saņemtos pasūtījumus un sekojiet līdzi piešķirtajiem
                            studentu uzdevumiem.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <DashboardTabButton
                            label="Saņemtie pasūtījumi"
                            active={activeTab === 'received'}
                            onClick={() => setActiveTab('received')}
                        />

                        <DashboardTabButton
                            label="Piešķirtie uzdevumi"
                            active={activeTab === 'assigned'}
                            onClick={() => setActiveTab('assigned')}
                        />
                    </div>
                </div>

                {activeTab === 'received' && (
                    <div className="mt-8 space-y-4">
                        {receivedOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.visit('/teacher/orders/1')}
                                className="cursor-pointer"
                            >
                                <TeacherOrderCard
                                    title={order.title}
                                    subtitle={order.subtitle}
                                    studentName={order.studentName}
                                    status={order.status}
                                    date={order.date}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'assigned' && (
                <div className="mt-8 space-y-4">
                {assignedTasks.map((task) => (
            <div
                key={task.id}
                onClick={() => router.visit(`/teacher/assigned-tasks/${task.id}`)}
                className="cursor-pointer"
            >
                <TeacherOrderCard
                    title={task.title}
                    subtitle={task.subtitle}
                    studentName={task.studentName}
                    status={task.status}
                    date={task.date}
                />
            </div>
        ))}
    </div>
)}
            </TeacherLayout>
        </>
    );
}