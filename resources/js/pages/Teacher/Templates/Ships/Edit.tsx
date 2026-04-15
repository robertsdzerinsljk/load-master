import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import ShipPresetForm from '@/components/ShipPresetForm';
import { Head, usePage } from '@inertiajs/react';

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
    ship: Ship;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const ship = page.props.ship;

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
                        name: ship.name ?? '',
                        cargo_type: ship.cargo_type ?? '',
                        capacity_containers: ship.capacity_containers ?? '',
                        capacity_tons: ship.capacity_tons ?? '',
                        draft_m: ship.draft_m ?? '',
                        fuel_consumption_per_hour: ship.fuel_consumption_per_hour ?? '',
                        speed_kmh: ship.speed_kmh ?? '',
                        loading_capacity_containers_per_hour:
                            ship.loading_capacity_containers_per_hour ?? '',
                        loading_capacity_tons_per_hour:
                            ship.loading_capacity_tons_per_hour ?? '',
                        notes: ship.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}