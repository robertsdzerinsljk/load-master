import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import LocationPresetForm from '@/components/LocationPresetForm';
import { Head, usePage } from '@inertiajs/react';

type Location = {
    id: number;
    name: string;
    type?: string | null;
    country?: string | null;
    city_id?: number | null;
    city?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    notes?: string | null;
};

type PageProps = {
    location: Location;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const location = page.props.location;

    return (
        <>
            <Head title="Rediģēt lokāciju" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/locations" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt lokāciju
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet lokācijas parametrus simulatoram
                    </p>
                </div>

                <LocationPresetForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={location.id}
                    initialData={{
                        name: location.name ?? '',
                        type: location.type ?? '',
                        country: location.country ?? '',
                        city_id: location.city_id ?? null,
                        city: location.city ?? '',
                        address: location.address ?? '',
                        latitude: location.latitude ?? '',
                        longitude: location.longitude ?? '',
                        notes: location.notes ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}
