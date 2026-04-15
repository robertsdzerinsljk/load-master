import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import LandRoutePresetForm from '@/components/LandRoutePresetForm';
import { Head, usePage } from '@inertiajs/react';

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
};

type RouteItem = {
    id: number;
    from_location_id: number;
    to_location_id: number;
    distance_km?: string | number | null;
    estimated_time_hours?: string | number | null;
    toll_cost?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    routeItem: RouteItem;
    locations: LocationOption[];
};

export default function Edit() {
    const page = usePage<PageProps>();
    const routeItem = page.props.routeItem;
    const locations = page.props.locations;

    return (
        <>
            <Head title="Rediģēt sauszemes maršrutu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/land-routes" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt sauszemes maršrutu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet maršruta parametrus simulatoram
                    </p>
                </div>

                <LandRoutePresetForm
                    locations={locations}
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={routeItem.id}
                    initialData={{
                        from_location_id: routeItem.from_location_id,
                        to_location_id: routeItem.to_location_id,
                        distance_km: routeItem.distance_km ?? '',
                        estimated_time_hours: routeItem.estimated_time_hours ?? '',
                        toll_cost: routeItem.toll_cost ?? '',
                        notes: routeItem.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}