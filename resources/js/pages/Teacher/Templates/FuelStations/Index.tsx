import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import FuelStationPresetCard from '@/components/FuelStationPresetCard';
import TemplateCatalogFilterBar from '@/components/TemplateCatalogFilterBar';

type LocationData = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
};

type FuelStation = {
    id: number;
    fuel_type?: string | null;
    price_per_liter?: string | number | null;
    notes?: string | null;
    location?: LocationData | null;
};

type PageProps = {
    fuelStations: FuelStation[];
};

export default function TeacherFuelStationsIndex() {
    const page = usePage<PageProps>();
    const fuelStations = page.props.fuelStations;
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('all');
    const [fuelType, setFuelType] = useState('all');

    const countries = useMemo(() => {
        return Array.from(
            new Set(
                fuelStations
                    .map((item) => item.location?.country)
                    .filter(Boolean),
            ),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [fuelStations]);

    const fuelTypes = useMemo(() => {
        return Array.from(
            new Set(fuelStations.map((item) => item.fuel_type).filter(Boolean)),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [fuelStations]);

    const filteredFuelStations = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        return fuelStations.filter((item) => {
            const matchesSearch =
                !normalized ||
                item.location?.name?.toLowerCase().includes(normalized) ||
                item.location?.city?.toLowerCase().includes(normalized) ||
                item.location?.country?.toLowerCase().includes(normalized) ||
                item.fuel_type?.toLowerCase().includes(normalized) ||
                String(item.price_per_liter ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                item.notes?.toLowerCase().includes(normalized);

            return (
                matchesSearch &&
                (country === 'all' || item.location?.country === country) &&
                (fuelType === 'all' || item.fuel_type === fuelType)
            );
        });
    }, [fuelStations, search, country, fuelType]);

    const handleDelete = (id: number, label: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst uzpildes vietas ierakstu "${label}"?`,
        );

        if (!confirmed) return;

        router.delete(`/teacher/templates/fuel-stations/${id}`);
    };

    return (
        <>
            <Head title="Uzpildes vietas" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] leading-tight font-semibold text-[#182219]">
                            Uzpildes vietas
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet degvielas tipu un cenu lokācijām, kas
                            kalpo kā uzpildes punkti.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.visit(
                                '/teacher/templates/fuel-stations/create',
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauna uzpildes vieta
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <TemplateCatalogFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Meklēt uzpildes vietas pēc lokācijas, cenas, tipa..."
                        resultCount={filteredFuelStations.length}
                        totalCount={fuelStations.length}
                        onClear={() => {
                            setSearch('');
                            setCountry('all');
                            setFuelType('all');
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
                                key: 'fuelType',
                                label: 'Degviela',
                                value: fuelType,
                                options: fuelTypes,
                                allLabel: 'Visi tipi',
                                onChange: setFuelType,
                            },
                        ]}
                    />
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredFuelStations.length > 0 ? (
                        filteredFuelStations.map((item) => (
                            <FuelStationPresetCard
                                key={item.id}
                                location={{
                                    name: item.location?.name ?? '—',
                                    city: item.location?.city ?? null,
                                    country: item.location?.country ?? null,
                                }}
                                fuelType={item.fuel_type}
                                pricePerLiter={item.price_per_liter}
                                notes={item.notes}
                                onClick={() =>
                                    router.visit(
                                        `/teacher/templates/fuel-stations/${item.id}/edit`,
                                    )
                                }
                                onDelete={() =>
                                    handleDelete(
                                        item.id,
                                        item.location?.name ?? '—',
                                    )
                                }
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-[#d9ded9] bg-white px-5 py-8 text-center text-[15px] text-[#5b6b61]">
                            {search.trim()
                                ? 'Nav atrasta neviena uzpildes vieta pēc meklēšanas.'
                                : 'Šobrīd nav pievienota neviena uzpildes vieta.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}
