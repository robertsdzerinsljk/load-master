import { Head, usePage } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import LandRoutePresetForm from '@/components/LandRoutePresetForm';

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
};

type PageProps = {
    locations: LocationOption[];
};

export default function TeacherLandRoutesCreate() {
    const page = usePage<PageProps>();
    const locations = page.props.locations;

    return (
        <>
            <Head title="Jauns sauszemes maršruts" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/land-routes" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns sauszemes maršruts
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu maršrutu starp divām lokācijām
                    </p>
                </div>

                <LandRoutePresetForm
                    locations={locations}
                    submitLabel="Saglabāt maršrutu"
                />
            </TeacherLayout>
        </>
    );
}