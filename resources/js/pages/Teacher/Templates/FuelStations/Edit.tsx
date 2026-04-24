import { Head, usePage } from '@inertiajs/react';
import BackButton from '@/components/BackButton';
import FuelStationPresetForm from '@/components/FuelStationPresetForm';
import TeacherLayout from '@/layouts/TeacherLayout';

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
    city_id?: number | null;
    country?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
};

type FuelStation = {
    id: number;
    location_id: number;
    fuel_type?: string | null;
    price_per_liter?: string | number | null;
    notes?: string | null;
    location?: LocationOption | null;
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
            <Head title="Rediget uzpildes vietu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/fuel-stations" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediget uzpildes vietu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Update the fuel profile and keep it linked to the correct shared
                        location.
                    </p>
                </div>

                <FuelStationPresetForm
                    locations={locations}
                    submitLabel="Saglabat izmainas"
                    isEdit
                    id={fuelStation.id}
                    initialData={{
                        location_id: fuelStation.location_id,
                        location_name: fuelStation.location?.name ?? '',
                        country: fuelStation.location?.country ?? '',
                        city_id: fuelStation.location?.city_id ?? null,
                        city: fuelStation.location?.city ?? '',
                        address: fuelStation.location?.address ?? '',
                        latitude: fuelStation.location?.latitude ?? '',
                        longitude: fuelStation.location?.longitude ?? '',
                        fuel_type: fuelStation.fuel_type ?? '',
                        price_per_liter: fuelStation.price_per_liter ?? '',
                        notes: fuelStation.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}
