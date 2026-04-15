import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import TransportPresetForm from '@/components/TransportPresetForm';
import { Head, usePage } from '@inertiajs/react';

type TransportTemplate = {
    id: number;
    name: string;
    type?: string | null;
    description?: string | null;
    capacity?: string | null;
    temperature_support?: string | null;
    capacity_containers?: string | number | null;
    capacity_tons?: string | number | null;
    avg_speed_kmh?: string | number | null;
    cost_per_km?: string | number | null;
    fuel_consumption_per_100km?: string | number | null;
    max_range_km?: string | number | null;
    loading_time_minutes?: string | number | null;
    unloading_time_minutes?: string | number | null;
};

type PageProps = {
    template: TransportTemplate;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const template = page.props.template;

    return (
        <>
            <Head title="Rediģēt sauszemes transportu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/transport" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt sauszemes transportu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet transporta parametrus simulatoram
                    </p>
                </div>

                <TransportPresetForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={template.id}
                    initialData={{
                        name: template.name ?? '',
                        type: template.type ?? '',
                        description: template.description ?? '',
                        capacity: template.capacity ?? '',
                        temperature_support: template.temperature_support ?? '',
                        capacity_containers: template.capacity_containers ?? '',
                        capacity_tons: template.capacity_tons ?? '',
                        avg_speed_kmh: template.avg_speed_kmh ?? '',
                        cost_per_km: template.cost_per_km ?? '',
                        fuel_consumption_per_100km:
                            template.fuel_consumption_per_100km ?? '',
                        max_range_km: template.max_range_km ?? '',
                        loading_time_minutes: template.loading_time_minutes ?? '',
                        unloading_time_minutes: template.unloading_time_minutes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}