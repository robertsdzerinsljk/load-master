import { Head, usePage } from '@inertiajs/react';
import BackButton from '@/components/BackButton';
import PortPresetForm from '@/components/PortPresetForm';
import TeacherLayout from '@/layouts/TeacherLayout';

type Port = {
    id: number;
    name: string;
    country: string;
    location_id?: number | null;
    max_draft_m?: string | number | null;
    city_distance_km?: string | number | null;
    loading_rate_containers_per_hour?: string | number | null;
    loading_rate_tons_per_hour?: string | number | null;
    supports_bulk?: boolean | null;
    supports_container?: boolean | null;
    supports_liquid?: boolean | null;
    supports_refrigerated?: boolean | null;
    supports_hazardous?: boolean | null;
    has_crane?: boolean | null;
    has_forklift?: boolean | null;
    has_pump?: boolean | null;
    has_conveyor?: boolean | null;
    notes?: string | null;
    handlingMethods?: Array<{
        code: string;
        pivot?: {
            is_loading?: boolean | null;
            is_unloading?: boolean | null;
            throughput_override_containers_per_hour?: string | number | null;
            throughput_override_tons_per_hour?: string | number | null;
            notes?: string | null;
        };
    }>;
    handling_methods?: Array<{
        code: string;
        pivot?: {
            is_loading?: boolean | null;
            is_unloading?: boolean | null;
            throughput_override_containers_per_hour?: string | number | null;
            throughput_override_tons_per_hour?: string | number | null;
            notes?: string | null;
        };
    }>;
};

type PageProps = {
    port: Port;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const port = page.props.port;
    const handlingMethods = port.handlingMethods ?? port.handling_methods ?? [];

    return (
        <>
            <Head title="Rediget port" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/ports" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediget port
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Update location, support flags, and handling overrides for this port.
                    </p>
                </div>

                <PortPresetForm
                    submitLabel="Save changes"
                    isEdit
                    id={port.id}
                    initialData={{
                        ...port,
                        handling_methods:
                            handlingMethods.map((method) => ({
                                code: method.code,
                                is_loading: method.pivot?.is_loading ?? true,
                                is_unloading: method.pivot?.is_unloading ?? true,
                                throughput_override_containers_per_hour:
                                    method.pivot?.throughput_override_containers_per_hour ??
                                    null,
                                throughput_override_tons_per_hour:
                                    method.pivot?.throughput_override_tons_per_hour ??
                                    null,
                                notes: method.pivot?.notes ?? null,
                            })) ?? [],
                    }}
                />
            </TeacherLayout>
        </>
    );
}
