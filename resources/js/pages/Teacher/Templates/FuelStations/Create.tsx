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

type PageProps = {
    locations: LocationOption[];
};

export default function TeacherFuelStationsCreate() {
    const page = usePage<PageProps>();
    const locations = page.props.locations;

    return (
        <>
            <Head title="Jauna uzpildes vieta" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/fuel-stations" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauna uzpildes vieta
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Create a new fuel-station location or link an existing one from
                        the shared location catalog.
                    </p>
                </div>

                <FuelStationPresetForm
                    locations={locations}
                    submitLabel="Saglabat uzpildes vietu"
                />
            </TeacherLayout>
        </>
    );
}
