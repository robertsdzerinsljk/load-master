import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import RouteFuelStopPresetCard from '@/components/RouteFuelStopPresetCard';

type RouteFuelStop = {
    id: number;
    distance_from_start_km: string | number;
    notes?: string | null;
    landRoute?: {
        fromLocation?: {
            name: string;
        } | null;
        toLocation?: {
            name: string;
        } | null;
    } | null;
    fuelStation?: {
        location?: {
            name: string;
            city?: string | null;
        } | null;
    } | null;
};

type PageProps = {
    routeFuelStops: RouteFuelStop[];
};

export default function TeacherRouteFuelStopsIndex() {
    const page = usePage<PageProps>();
    const routeFuelStops = page.props.routeFuelStops;
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return routeFuelStops;
        }

        return routeFuelStops.filter((item) => {
            const routeLabel = `${item.landRoute?.fromLocation?.name ?? ''} ${item.landRoute?.toLocation?.name ?? ''}`.toLowerCase();
            const stationLabel = `${item.fuelStation?.location?.name ?? ''} ${item.fuelStation?.location?.city ?? ''}`.toLowerCase();

            return (
                routeLabel.includes(normalized) ||
                stationLabel.includes(normalized) ||
                String(item.distance_from_start_km ?? '').toLowerCase().includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized)
            );
        });
    }, [routeFuelStops, search]);

    const handleDelete = (id: number, label: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst maršruta uzpildes pieturu "${label}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/route-fuel-stops/${id}`);
    };

    return (
        <>
            <Head title="Maršruta uzpildes pieturas" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Maršruta uzpildes pieturas
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Piesaistiet uzpildes vietas konkrētiem sauszemes maršrutiem.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/route-fuel-stops/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauna pietura
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt uzpildes pieturas..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filtered.length > 0 ? (
                        filtered.map((item) => {
                            const routeLabel = `${item.landRoute?.fromLocation?.name ?? '—'} → ${item.landRoute?.toLocation?.name ?? '—'}`;
                            const stationLabel = item.fuelStation?.location?.name ?? '—';

                            return (
                                <RouteFuelStopPresetCard
                                    key={item.id}
                                    routeLabel={routeLabel}
                                    fuelStationLabel={stationLabel}
                                    distanceFromStartKm={item.distance_from_start_km}
                                    notes={item.notes}
                                    onClick={() =>
                                        router.visit(`/teacher/templates/route-fuel-stops/${item.id}/edit`)
                                    }
                                    onDelete={() => handleDelete(item.id, stationLabel)}
                                />
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasta neviena uzpildes pietura pēc meklēšanas.'
                                : 'Šobrīd nav pievienota neviena maršruta uzpildes pietura.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}