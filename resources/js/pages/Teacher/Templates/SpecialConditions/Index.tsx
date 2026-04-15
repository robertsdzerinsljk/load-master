import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import SpecialConditionPresetCard from '@/components/SpecialConditionCard';
import BackButton from '@/components/BackButton';

type SpecialCondition = {
    id: number;
    name: string;
    description?: string | null;
};

type PageProps = {
    conditions: SpecialCondition[];
};

export default function TeacherSpecialConditionsTemplatesIndex() {
    const page = usePage<PageProps>();
    const conditions = page.props.conditions;
    const [search, setSearch] = useState('');

    const filteredConditions = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return conditions;
        }

        return conditions.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.description?.toLowerCase().includes(normalized)
            );
        });
    }, [conditions, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst īpašo nosacījumu "${name}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/special-conditions/${id}`);
    };

    return (
        <>
            <Head title="Īpašie nosacījumi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Īpašie nosacījumi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet īpašos loģistikas nosacījumus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/special-conditions/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns nosacījums
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt nosacījumus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredConditions.length > 0 ? (
                        filteredConditions.map((item) => (
                            <SpecialConditionPresetCard
                                key={item.id}
                                name={item.name}
                                description={item.description ?? 'Apraksts nav pievienots.'}
                                onClick={() =>
                                    router.visit(`/teacher/templates/special-conditions/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasts neviens nosacījums pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens īpašais nosacījums.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}