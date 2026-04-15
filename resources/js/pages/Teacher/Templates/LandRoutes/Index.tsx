import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import LandRoutePresetCard from '@/components/LandRoutePresetCard';

type RouteLocation = {
    id: number;
    name: string;
    city?: string | null;
};

type LandRoute = {
    id: number;
    distance_km: string | number;
    estimated_time_hours?: string | number | null;
    toll_cost?: string | number | null;
    notes?: string | null;
    from_location?: RouteLocation | null;
    to_location?: RouteLocation | null;
    fromLocation?: RouteLocation | null;
    toLocation?: RouteLocation | null;
};

type PageProps = {
    routes: LandRoute[];
};

export default function TeacherLandRoutesIndex() {
    const page = usePage<PageProps>();
    const routes = page.props.routes;
    const [search, setSearch] = useState('');

    const filteredRoutes = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return routes;
        }

        return routes.filter((item) => {
            const from = item.fromLocation ?? item.from_location;
            const to = item.toLocation ?? item.to_location;

            return (
                from?.name?.toLowerCase().includes(normalized) ||
                to?.name?.toLowerCase().includes(normalized) ||
                from?.city?.toLowerCase().includes(normalized) ||
                to?.city?.toLowerCase().includes(normalized) ||
                String(item.distance_km ?? '').toLowerCase().includes(normalized) ||
                String(item.estimated_time_hours ?? '').toLowerCase().includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized)
            );
        });
    }, [routes, search]);

    const handleDelete = (id: number, label: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst maršrutu "${label}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/land-routes/${id}`);
    };

    return (
        <>
            <Head title="Sauszemes maršruti" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Sauszemes maršruti
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet attālumus un pārvadājumu ceļus starp lokācijām.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/land-routes/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns maršruts
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt maršrutus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredRoutes.length > 0 ? (
                        filteredRoutes.map((item) => {
                            const from = item.fromLocation ?? item.from_location;
                            const to = item.toLocation ?? item.to_location;
                            const label = `${from?.name ?? '—'} → ${to?.name ?? '—'}`;

                            return (
                                <LandRoutePresetCard
                                    key={item.id}
                                    fromLocation={{
                                        name: from?.name ?? '—',
                                        city: from?.city ?? null,
                                    }}
                                    toLocation={{
                                        name: to?.name ?? '—',
                                        city: to?.city ?? null,
                                    }}
                                    distanceKm={item.distance_km}
                                    estimatedTimeHours={item.estimated_time_hours}
                                    tollCost={item.toll_cost}
                                    notes={item.notes}
                                    onClick={() =>
                                        router.visit(`/teacher/templates/land-routes/${item.id}/edit`)
                                    }
                                    onDelete={() => handleDelete(item.id, label)}
                                />
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasts neviens maršruts pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens sauszemes maršruts.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}