import { ClipboardList, FileText, Truck } from 'lucide-react';

export type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

type TeacherOrderTabsProps = {
    active: TeacherOrderTabKey;
    onChange: (tab: TeacherOrderTabKey) => void;
};

const tabs: Array<{
    key: TeacherOrderTabKey;
    label: string;
    description: string;
    icon: React.ReactNode;
}> = [
    {
        key: 'overview',
        label: 'Pārskats',
        description: 'Uzdevuma un studenta kopsavilkums',
        icon: <ClipboardList className="h-4 w-4" />,
    },
    {
        key: 'feedback',
        label: 'Atsauksme',
        description: 'Pasniedzēja komentārs un piezīmes',
        icon: <FileText className="h-4 w-4" />,
    },
    {
        key: 'delivery',
        label: 'Piegāde',
        description: 'Izpildes atbilstība un validācija',
        icon: <Truck className="h-4 w-4" />,
    },
];

export default function TeacherOrderTabs({
    active,
    onChange,
}: TeacherOrderTabsProps) {
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {tabs.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={[
                            'group rounded-2xl border px-4 py-4 text-left transition-all duration-200',
                            isActive
                                ? 'border-[#166a4d] bg-[#edf6f0] shadow-sm'
                                : 'border-transparent bg-white hover:border-[#d9ded9] hover:bg-[#f8fbf9]',
                        ].join(' ')}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={[
                                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
                                    isActive
                                        ? 'bg-white text-[#166a4d] shadow-sm'
                                        : 'bg-[#f3f7f4] text-[#6b776f] group-hover:bg-white group-hover:text-[#166a4d]',
                                ].join(' ')}
                            >
                                {tab.icon}
                            </div>

                            <div className="min-w-0">
                                <div
                                    className={[
                                        'text-[15px] font-semibold transition',
                                        isActive
                                            ? 'text-[#182219]'
                                            : 'text-[#33413a] group-hover:text-[#182219]',
                                    ].join(' ')}
                                >
                                    {tab.label}
                                </div>

                                <p
                                    className={[
                                        'mt-1 text-[13px] leading-5 transition',
                                        isActive
                                            ? 'text-[#4e5f56]'
                                            : 'text-[#7b887f] group-hover:text-[#5f6f65]',
                                    ].join(' ')}
                                >
                                    {tab.description}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}