import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TemperaturePresetCard from '@/components/TemperaturePresetCard';
import BackButton from '@/components/BackButton';

type TemperatureMode = {
    id: number;
    name: string;
    description?: string | null;
    range?: string | null;
};

type PageProps = {
    modes: TemperatureMode[];
};

export default function TeacherTemperatureTemplatesIndex() {
    const page = usePage<PageProps>();
    const modes = page.props.modes;
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return modes;
        }

        return modes.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.description?.toLowerCase().includes(normalized) ||
                item.range?.toLowerCase().includes(normalized)
            );
        });
    }, [modes, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst temperatūras režīmu "${name}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/temperature/${id}`);
    };

    return (
        <>
            <Head title="Temperatūras režīmi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Temperatūras režīmi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet iepriekš sagatavotus temperatūras režīmus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/temperature/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns temperatūras režīms
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt temperatūras režīmus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <TemperaturePresetCard
                                key={item.id}
                                name={item.name}
                                description={item.description ?? 'Apraksts nav pievienots.'}
                                range={item.range ?? 'Nav norādīts'}
                                onClick={() =>
                                    router.visit(`/teacher/templates/temperature/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasts neviens temperatūras režīms pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens temperatūras režīms.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}