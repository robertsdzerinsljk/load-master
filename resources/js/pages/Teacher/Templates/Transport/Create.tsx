import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TransportPresetForm from '@/components/TransportPresetForm';
import BackButton from '@/components/BackButton';

export default function TeacherTransportTemplatesCreate() {
    return (
        <>
            <Head title="Jauns sauszemes transports" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/transport" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns sauszemes transports
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu sauszemes transporta sagatavi simulatoram
                    </p>
                </div>

                <TransportPresetForm submitLabel="Saglabāt transportu" />
            </TeacherLayout>
        </>
    );
}