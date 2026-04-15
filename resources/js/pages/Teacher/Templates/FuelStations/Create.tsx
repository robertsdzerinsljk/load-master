import { Head, usePage } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import FuelStationPresetForm from '@/components/FuelStationPresetForm';

type LocationOption = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
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
                        Izveidojiet uzpildes vietas detaļas izvēlētai lokācijai
                    </p>
                </div>

                <FuelStationPresetForm
                    locations={locations}
                    submitLabel="Saglabāt uzpildes vietu"
                />
            </TeacherLayout>
        </>
    );
}