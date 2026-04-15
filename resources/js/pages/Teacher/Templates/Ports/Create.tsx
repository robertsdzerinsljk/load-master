import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import BackButton from '@/components/BackButton';
import PortPresetForm from '@/components/PortPresetForm';

export default function TeacherPortsCreate() {
    return (
        <>
            <Head title="Jauna osta" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/ports" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauna osta
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu ostas sagatavi simulatoram
                    </p>
                </div>

                <PortPresetForm submitLabel="Saglabāt ostu" />
            </TeacherLayout>
        </>
    );
}