type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

type TeacherOrderTabsProps = {
    active: TeacherOrderTabKey;
    onChange: (tab: TeacherOrderTabKey) => void;
};

export default function TeacherOrderTabs({
    active,
    onChange,
}: TeacherOrderTabsProps) {
    const tabs: { key: TeacherOrderTabKey; label: string }[] = [
        { key: 'overview', label: 'Pārskatīt un rediģēt' },
        { key: 'feedback', label: 'Atsauksme' },
        { key: 'delivery', label: 'Piegāde' },
    ];

    return (
        <div className="mt-6 inline-flex rounded-xl bg-[#eef1ee] p-1">
            {tabs.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={[
                            'rounded-lg px-4 py-2 text-[14px] font-medium transition',
                            isActive
                                ? 'bg-white text-[#182219] shadow-sm'
                                : 'text-[#5e6e64] hover:text-[#182219]',
                        ].join(' ')}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}