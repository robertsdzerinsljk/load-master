import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import PortPresetCard from '@/components/PortPresetCard';

type Port = {
    id: number;
    name: string;
    country: string;
    max_draft_m?: string | number | null;
    city_distance_km?: string | number | null;
    loading_rate_containers_per_hour?: string | number | null;
    loading_rate_tons_per_hour?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    ports: Port[];
};

export default function TeacherPortsIndex() {
    const page = usePage<PageProps>();
    const ports = page.props.ports;
    const [search, setSearch] = useState('');

    const filteredPorts = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return ports;
        }

        return ports.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.country?.toLowerCase().includes(normalized) ||
                String(item.max_draft_m ?? '').toLowerCase().includes(normalized) ||
                String(item.city_distance_km ?? '').toLowerCase().includes(normalized) ||
                String(item.loading_rate_containers_per_hour ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                String(item.loading_rate_tons_per_hour ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized)
            );
        });
    }, [ports, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(`Vai tiešām vēlaties dzēst ostu "${name}"?`);

        if (!confirmed) return;

        router.delete(`/teacher/templates/ports/${id}`);
    };

    return (
        <>
            <Head title="Ostas" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Ostas
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet ostu parametrus simulatora scenārijiem.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/ports/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauna osta
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt ostas..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredPorts.length > 0 ? (
                        filteredPorts.map((item) => (
                            <PortPresetCard
                                key={item.id}
                                name={item.name}
                                country={item.country}
                                maxDraft={item.max_draft_m}
                                cityDistanceKm={item.city_distance_km}
                                loadingRateContainers={item.loading_rate_containers_per_hour}
                                loadingRateTons={item.loading_rate_tons_per_hour}
                                notes={item.notes}
                                onClick={() =>
                                    router.visit(`/teacher/templates/ports/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasta neviena osta pēc meklēšanas.'
                                : 'Šobrīd nav pievienota neviena osta.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}