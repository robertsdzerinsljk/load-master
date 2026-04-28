import { Head, usePage } from '@inertiajs/react';
import BackButton from '@/components/BackButton';
import ShipPresetForm from '@/components/ShipPresetForm';
import TeacherLayout from '@/layouts/TeacherLayout';

type Ship = {
    id: number;
    name: string;
    cargo_type?: string | null;
    cargo_mode?: string | null;
    is_open_cargo?: boolean | null;
    is_closed_cargo?: boolean | null;
    supports_bulk?: boolean | null;
    supports_container?: boolean | null;
    supports_liquid?: boolean | null;
    supports_refrigerated?: boolean | null;
    supports_hazardous?: boolean | null;
    has_onboard_crane?: boolean | null;
    capacity_containers?: string | number | null;
    capacity_tons?: string | number | null;
    draft_m?: string | number | null;
    fuel_consumption_per_hour?: string | number | null;
    speed_kmh?: string | number | null;
    loading_capacity_containers_per_hour?: string | number | null;
    loading_capacity_tons_per_hour?: string | number | null;
    notes?: string | null;
    handlingMethods?: Array<{
        code: string;
        pivot?: {
            is_loading?: boolean | null;
            is_unloading?: boolean | null;
            throughput_override_containers_per_hour?: string | number | null;
            throughput_override_tons_per_hour?: string | number | null;
            notes?: string | null;
        };
    }>;
    handling_methods?: Array<{
        code: string;
        pivot?: {
            is_loading?: boolean | null;
            is_unloading?: boolean | null;
            throughput_override_containers_per_hour?: string | number | null;
            throughput_override_tons_per_hour?: string | number | null;
            notes?: string | null;
        };
    }>;
};

type PageProps = {
    ship: Ship;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const ship = page.props.ship;
    const handlingMethods = ship.handlingMethods ?? ship.handling_methods ?? [];

    return (
        <>
            <Head title="Rediģēt kuģi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/ships" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt kuģi
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet kuģa parametrus simulatoram
                    </p>
                </div>

                <ShipPresetForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={ship.id}
                    initialData={{
                        ...ship,
                        handling_methods: handlingMethods.map((method) => ({
                            code: method.code,
                            is_loading: method.pivot?.is_loading ?? true,
                            is_unloading: method.pivot?.is_unloading ?? true,
                            throughput_override_containers_per_hour:
                                method.pivot
                                    ?.throughput_override_containers_per_hour ??
                                null,
                            throughput_override_tons_per_hour:
                                method.pivot?.throughput_override_tons_per_hour ??
                                null,
                            notes: method.pivot?.notes ?? null,
                        })),
                    }}
                />
            </TeacherLayout>
        </>
    );
}
