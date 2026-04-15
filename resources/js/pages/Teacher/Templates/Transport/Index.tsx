import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TransportPresetCard from '@/components/TransportPresetCard';
import BackButton from '@/components/BackButton';

type TransportTemplate = {
    id: number;
    name: string;
    type?: string | null;
    description?: string | null;
    capacity?: string | null;
    temperature_support?: string | null;
    capacity_containers?: string | number | null;
    capacity_tons?: string | number | null;
    avg_speed_kmh?: string | number | null;
    cost_per_km?: string | number | null;
    loading_time_minutes?: string | number | null;
    unloading_time_minutes?: string | number | null;
};

type PageProps = {
    templates: TransportTemplate[];
};

export default function TeacherTransportTemplatesIndex() {
    const page = usePage<PageProps>();
    const templates = page.props.templates;
    const [search, setSearch] = useState('');

    const filteredTemplates = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return templates;
        }

        return templates.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.type?.toLowerCase().includes(normalized) ||
                item.description?.toLowerCase().includes(normalized) ||
                item.capacity?.toLowerCase().includes(normalized) ||
                item.temperature_support?.toLowerCase().includes(normalized) ||
                String(item.capacity_containers ?? '').toLowerCase().includes(normalized) ||
                String(item.capacity_tons ?? '').toLowerCase().includes(normalized) ||
                String(item.avg_speed_kmh ?? '').toLowerCase().includes(normalized) ||
                String(item.cost_per_km ?? '').toLowerCase().includes(normalized)
            );
        });
    }, [templates, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst transportu "${name}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/transport/${id}`);
    };

    return (
        <>
            <Head title="Sauszemes transports" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Sauszemes transports
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet sauszemes transporta veidus un to aprēķinu parametrus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/transport/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns transports
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt transportu..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((item) => (
                            <TransportPresetCard
                                key={item.id}
                                name={item.name}
                                type={item.type ?? undefined}
                                description={item.description ?? 'Apraksts nav pievienots.'}
                                capacity={item.capacity ?? 'Nav norādīts'}
                                temperatureSupport={item.temperature_support ?? undefined}
                                capacityContainers={item.capacity_containers}
                                capacityTons={item.capacity_tons}
                                avgSpeedKmh={item.avg_speed_kmh}
                                costPerKm={item.cost_per_km}
                                loadingTimeMinutes={item.loading_time_minutes}
                                unloadingTimeMinutes={item.unloading_time_minutes}
                                onClick={() =>
                                    router.visit(`/teacher/templates/transport/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasts neviens transports pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens transports.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}