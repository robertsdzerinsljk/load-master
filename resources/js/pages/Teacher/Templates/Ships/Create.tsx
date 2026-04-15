import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import ShipPresetForm from '@/components/ShipPresetForm';

export default function TeacherShipsCreate() {
    return (
        <>
            <Head title="Jauns kuģis" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/ships" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns kuģis
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu kuģa sagatavi simulatoram
                    </p>
                </div>

                <ShipPresetForm submitLabel="Saglabāt kuģi" />
            </TeacherLayout>
        </>
    );
}