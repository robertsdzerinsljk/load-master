import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import RouteFuelStopPresetForm from '@/components/RouteFuelStopPresetForm';
import { Head, usePage } from '@inertiajs/react';

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

type RouteFuelStop = {
    id: number;
    land_route_id: number;
    fuel_station_id: number;
    distance_from_start_km: string | number;
    notes?: string | null;
};

type PageProps = {
    routeFuelStop: RouteFuelStop;
    routes: RouteOption[];
    fuelStations: FuelStationOption[];
};

export default function Edit() {
    const page = usePage<PageProps>();
    const routeFuelStop = page.props.routeFuelStop;
    const routes = page.props.routes;
    const fuelStations = page.props.fuelStations;

    return (
        <>
            <Head title="Rediģēt maršruta uzpildes pieturu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/route-fuel-stops" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt maršruta uzpildes pieturu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet uzpildes pieturas parametrus simulatoram
                    </p>
                </div>

                <RouteFuelStopPresetForm
                    routes={routes}
                    fuelStations={fuelStations}
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={routeFuelStop.id}
                    initialData={{
                        land_route_id: routeFuelStop.land_route_id,
                        fuel_station_id: routeFuelStop.fuel_station_id,
                        distance_from_start_km: routeFuelStop.distance_from_start_km,
                        notes: routeFuelStop.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}