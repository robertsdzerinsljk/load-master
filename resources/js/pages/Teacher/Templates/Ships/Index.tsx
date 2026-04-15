import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import ShipPresetCard from '@/components/ShipPresetCard';

type Ship = {
    id: number;
    name: string;
    cargo_type?: string | null;
    capacity_containers?: string | number | null;
    capacity_tons?: string | number | null;
    draft_m?: string | number | null;
    fuel_consumption_per_hour?: string | number | null;
    speed_kmh?: string | number | null;
    loading_capacity_containers_per_hour?: string | number | null;
    loading_capacity_tons_per_hour?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    ships: Ship[];
};

export default function TeacherShipsIndex() {
    const page = usePage<PageProps>();
    const ships = page.props.ships;
    const [search, setSearch] = useState('');

    const filteredShips = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return ships;
        }

        return ships.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.cargo_type?.toLowerCase().includes(normalized) ||
                String(item.capacity_containers ?? '').toLowerCase().includes(normalized) ||
                String(item.capacity_tons ?? '').toLowerCase().includes(normalized) ||
                String(item.draft_m ?? '').toLowerCase().includes(normalized) ||
                String(item.speed_kmh ?? '').toLowerCase().includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized)
            );
        });
    }, [ships, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(`Vai tiešām vēlaties dzēst kuģi "${name}"?`);

        if (!confirmed) return;

        router.delete(`/teacher/templates/ships/${id}`);
    };

    return (
        <>
            <Head title="Kuģi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Kuģi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet kuģu parametrus simulatora scenārijiem.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/ships/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns kuģis
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt kuģus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredShips.length > 0 ? (
                        filteredShips.map((item) => (
                            <ShipPresetCard
                                key={item.id}
                                name={item.name}
                                cargoType={item.cargo_type}
                                capacityContainers={item.capacity_containers}
                                capacityTons={item.capacity_tons}
                                draft={item.draft_m}
                                speedKmh={item.speed_kmh}
                                loadingContainers={item.loading_capacity_containers_per_hour}
                                loadingTons={item.loading_capacity_tons_per_hour}
                                notes={item.notes}
                                onClick={() =>
                                    router.visit(`/teacher/templates/ships/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasts neviens kuģis pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens kuģis.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}