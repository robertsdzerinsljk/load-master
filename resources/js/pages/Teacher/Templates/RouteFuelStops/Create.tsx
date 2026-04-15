import { Head, usePage } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import RouteFuelStopPresetForm from '@/components/RouteFuelStopPresetForm';

type RouteOption = {
    id: number;
    fromLocation?: {
        name: string;
    } | null;
    toLocation?: {
        name: string;
    } | null;
};

type FuelStationOption = {
    id: number;
    location?: {
        name: string;
        city?: string | null;
    } | null;
};

type PageProps = {
    routes: RouteOption[];
    fuelStations: FuelStationOption[];
};

export default function TeacherRouteFuelStopsCreate() {
    const page = usePage<PageProps>();
    const routes = page.props.routes;
    const fuelStations = page.props.fuelStations;

    return (
        <>
            <Head title="Jauna maršruta uzpildes pietura" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/route-fuel-stops" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauna maršruta uzpildes pietura
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Piesaistiet uzpildes vietu izvēlētam maršrutam
                    </p>
                </div>

                <RouteFuelStopPresetForm
                    routes={routes}
                    fuelStations={fuelStations}
                    submitLabel="Saglabāt pieturu"
                />
            </TeacherLayout>
        </>
    );
}