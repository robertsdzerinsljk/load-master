import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import SpecialConditionForm from '@/components/SpecialConditionForm';
import BackButton from '@/components/BackButton';

export default function TeacherSpecialConditionsCreate() {
    return (
        <>
            <Head title="Jauns īpašais nosacījums" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/special-conditions" />
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns īpašais nosacījums
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu īpašo nosacījumu simulatoram
                    </p>
                </div>

                <SpecialConditionForm submitLabel="Saglabāt nosacījumu" />
            </TeacherLayout>
        </>
    );
}