import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TransportPresetCard from '@/components/TransportPresetCard';
import BackButton from '@/components/BackButton';
import TemplateCatalogFilterBar from '@/components/TemplateCatalogFilterBar';

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
    const [type, setType] = useState('all');
    const [temperatureSupport, setTemperatureSupport] = useState('all');

    const types = useMemo(() => {
        return Array.from(
            new Set(templates.map((item) => item.type).filter(Boolean)),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [templates]);

    const temperatureOptions = useMemo(() => {
        return Array.from(
            new Set(
                templates
                    .map((item) => item.temperature_support)
                    .filter(Boolean),
            ),
        ).sort((a, b) => String(a).localeCompare(String(b), 'lv')) as string[];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        return templates.filter((item) => {
            const matchesSearch =
                !normalized ||
                item.name?.toLowerCase().includes(normalized) ||
                item.type?.toLowerCase().includes(normalized) ||
                item.description?.toLowerCase().includes(normalized) ||
                item.capacity?.toLowerCase().includes(normalized) ||
                item.temperature_support?.toLowerCase().includes(normalized) ||
                String(item.capacity_containers ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                String(item.capacity_tons ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                String(item.avg_speed_kmh ?? '')
                    .toLowerCase()
                    .includes(normalized) ||
                String(item.cost_per_km ?? '')
                    .toLowerCase()
                    .includes(normalized);

            return (
                matchesSearch &&
                (type === 'all' || item.type === type) &&
                (temperatureSupport === 'all' ||
                    item.temperature_support === temperatureSupport)
            );
        });
    }, [templates, search, type, temperatureSupport]);

    const handleDelete = (id: number, name: string) => {
        const confirmed = window.confirm(
            `Vai tiešām vēlaties dzēst transportu "${name}"?`,
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
                        <h1 className="text-[28px] leading-tight font-semibold text-[#182219]">
                            Sauszemes transports
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet sauszemes transporta veidus un to
                            aprēķinu parametrus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.visit('/teacher/templates/transport/create')
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns transports
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <TemplateCatalogFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Meklēt transportu pēc nosaukuma, tipa, kapacitātes..."
                        resultCount={filteredTemplates.length}
                        totalCount={templates.length}
                        onClear={() => {
                            setSearch('');
                            setType('all');
                            setTemperatureSupport('all');
                        }}
                        filters={[
                            {
                                key: 'type',
                                label: 'Tips',
                                value: type,
                                options: types,
                                allLabel: 'Visi tipi',
                                onChange: setType,
                            },
                            {
                                key: 'temperature',
                                label: 'Temperatūra',
                                value: temperatureSupport,
                                options: temperatureOptions,
                                allLabel: 'Jebkura',
                                onChange: setTemperatureSupport,
                            },
                        ]}
                    />
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((item) => (
                            <TransportPresetCard
                                key={item.id}
                                name={item.name}
                                type={item.type ?? undefined}
                                description={
                                    item.description ??
                                    'Apraksts nav pievienots.'
                                }
                                capacity={item.capacity ?? 'Nav norādīts'}
                                temperatureSupport={
                                    item.temperature_support ?? undefined
                                }
                                capacityContainers={item.capacity_containers}
                                capacityTons={item.capacity_tons}
                                avgSpeedKmh={item.avg_speed_kmh}
                                costPerKm={item.cost_per_km}
                                loadingTimeMinutes={item.loading_time_minutes}
                                unloadingTimeMinutes={
                                    item.unloading_time_minutes
                                }
                                onClick={() =>
                                    router.visit(
                                        `/teacher/templates/transport/${item.id}/edit`,
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
                                ? 'Nav atrasts neviens transports pēc meklēšanas.'
                                : 'Šobrīd nav pievienots neviens transports.'}
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}
