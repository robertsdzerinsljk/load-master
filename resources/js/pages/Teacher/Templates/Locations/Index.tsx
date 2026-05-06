import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import LocationPresetCard from '@/components/LocationPresetCard';
import TemplateCatalogFilterBar from '@/components/TemplateCatalogFilterBar';

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
    const [country, setCountry] = useState('all');
    const [type, setType] = useState('all');

    const countries = useMemo(() => {
        return Array.from(
            new Set(locations.map((item) => item.country).filter(Boolean)),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [locations]);

    const types = useMemo(() => {
        return Array.from(
            new Set(locations.map((item) => item.type).filter(Boolean)),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [locations]);

    const filteredLocations = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        return locations.filter((item) => {
            const matchesSearch =
                !normalized ||
                item.name?.toLowerCase().includes(normalized) ||
                item.type?.toLowerCase().includes(normalized) ||
                item.country?.toLowerCase().includes(normalized) ||
                item.city?.toLowerCase().includes(normalized) ||
                item.address?.toLowerCase().includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized);

            return (
                matchesSearch &&
                (country === 'all' || item.country === country) &&
                (type === 'all' || item.type === type)
            );
        });
    }, [locations, search, country, type]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst lokāciju "${name}"?`,
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
                        <h1 className="text-[28px] leading-tight font-semibold text-[#182219]">
                            Lokācijas
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet simulatora punktus — pilsētas, rūpnīcas,
                            noliktavas, uzpildes vietas un citus galamērķus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.visit('/teacher/templates/locations/create')
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauna lokācija
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <TemplateCatalogFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Meklēt lokācijas pēc nosaukuma, valsts, pilsētas..."
                        resultCount={filteredLocations.length}
                        totalCount={locations.length}
                        onClear={() => {
                            setSearch('');
                            setCountry('all');
                            setType('all');
                        }}
                        filters={[
                            {
                                key: 'country',
                                label: 'Valsts',
                                value: country,
                                options: countries,
                                allLabel: 'Visas valstis',
                                onChange: setCountry,
                            },
                            {
                                key: 'type',
                                label: 'Tips',
                                value: type,
                                options: types,
                                allLabel: 'Visi tipi',
                                onChange: setType,
                            },
                        ]}
                    />
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
                                    router.visit(
                                        `/teacher/templates/locations/${item.id}/edit`,
                                    )
                                }
                                onDelete={() =>
                                    handleDelete(item.id, item.name)
                                }
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
