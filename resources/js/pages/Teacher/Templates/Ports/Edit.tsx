import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import PortPresetForm from '@/components/PortPresetForm';
import { Head, usePage } from '@inertiajs/react';

type Port = {
    id: number;
    name: string;
    country: string;
    max_draft_m?: string | number | null;
    city_distance_km?: string | number | null;
    loading_rate_containers_per_hour?: string | number | null;
    loading_rate_tons_per_hour?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    port: Port;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const port = page.props.port;

    return (
        <>
            <Head title="Rediģēt ostu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/ports" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt ostu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet ostas parametrus simulatoram
                    </p>
                </div>

                <PortPresetForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={port.id}
                    initialData={{
                        name: port.name ?? '',
                        country: port.country ?? '',
                        max_draft_m: port.max_draft_m ?? '',
                        city_distance_km: port.city_distance_km ?? '',
                        loading_rate_containers_per_hour:
                            port.loading_rate_containers_per_hour ?? '',
                        loading_rate_tons_per_hour: port.loading_rate_tons_per_hour ?? '',
                        notes: port.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}