import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import LocationPresetCard from '@/components/LocationPresetCard';

type Location = {
    id: number;
    name: string;
    type?: string | null;
    country?: string | null;
    city?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    locations: Location[];
};

export default function TeacherLocationsIndex() {
    const page = usePage<PageProps>();
    const locations = page.props.locations;
    const [search, setSearch] = useState('');

    const filteredLocations = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return locations;
        }

        return locations.filter((item) => {
            return (
                item.name?.toLowerCase().includes(normalized) ||
                item.type?.toLowerCase().includes(normalized) ||
                item.country?.toLowerCase().includes(normalized) ||
                item.city?.toLowerCase().includes(normalized) ||
                item.address?.toLowerCase().includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized)
            );
        });
    }, [locations, search]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst lokāciju "${name}"?`
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/locations/${id}`);
    };

    return (
        <>
            <Head title="Lokācijas" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Lokācijas
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet simulatora punktus — pilsētas, rūpnīcas, noliktavas,
                            uzpildes vietas un citus galamērķus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/locations/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauna lokācija
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Meklēt lokācijas..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredLocations.length > 0 ? (
                        filteredLocations.map((item) => (
                            <LocationPresetCard
                                key={item.id}
                                name={item.name}
                                type={item.type}
                                country={item.country}
                                city={item.city}
                                address={item.address}
                                latitude={item.latitude}
                                longitude={item.longitude}
                                notes={item.notes}
                                onClick={() =>
                                    router.visit(`/teacher/templates/locations/${item.id}/edit`)
                                }
                                onDelete={() => handleDelete(item.id, item.name)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasta neviena lokācija pēc meklēšanas.'
                                : 'Šobrīd nav pievienota neviena lokācija.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}