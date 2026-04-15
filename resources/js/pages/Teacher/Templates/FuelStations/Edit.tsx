import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import FuelStationPresetForm from '@/components/FuelStationPresetForm';
import { Head, usePage } from '@inertiajs/react';

type LocationOption = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
};

type FuelStation = {
    id: number;
    location_id: number;
    fuel_type?: string | null;
    price_per_liter?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    fuelStation: FuelStation;
    locations: LocationOption[];
};

export default function Edit() {
    const page = usePage<PageProps>();
    const fuelStation = page.props.fuelStation;
    const locations = page.props.locations;

    return (
        <>
            <Head title="Rediģēt uzpildes vietu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/fuel-stations" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt uzpildes vietu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet uzpildes vietas parametrus simulatoram
                    </p>
                </div>

                <FuelStationPresetForm
                    locations={locations}
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={fuelStation.id}
                    initialData={{
                        location_id: fuelStation.location_id,
                        fuel_type: fuelStation.fuel_type ?? '',
                        price_per_liter: fuelStation.price_per_liter ?? '',
                        notes: fuelStation.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}