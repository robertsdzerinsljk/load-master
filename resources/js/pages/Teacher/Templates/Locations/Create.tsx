import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import LocationPresetForm from '@/components/LocationPresetForm';

export default function TeacherLocationsCreate() {
    return (
        <>
            <Head title="Jauna lokācija" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/locations" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauna lokācija
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu simulatora lokāciju
                    </p>
                </div>

                <LocationPresetForm submitLabel="Saglabāt lokāciju" />
            </TeacherLayout>
        </>
    );
}