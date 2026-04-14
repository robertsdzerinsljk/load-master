import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TemperaturePresetForm from '@/components/TemperaturePresetForm';
import BackButton from '@/components/BackButton';

export default function TeacherTemperatureTemplatesCreate() {
    return (
        <>
            <Head title="Jauns temperatūras režīms" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/temperature" />
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns temperatūras režīms
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu temperatūras sagatavi simulatoram
                    </p>
                </div>

                <TemperaturePresetForm submitLabel="Saglabāt temperatūras režīmu" />
            </TeacherLayout>
        </>
    );
}