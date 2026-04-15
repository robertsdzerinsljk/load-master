import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import SpecialConditionForm from '@/components/SpecialConditionForm';
import { Head, usePage } from '@inertiajs/react';

type Condition = {
    id: number;
    name: string;
    description?: string | null;
};

type PageProps = {
    condition: Condition;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const condition = page.props.condition;

    return (
        <>
            <Head title="Rediģēt nosacījumu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/special-conditions" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold text-[#182219]">
                        Rediģēt nosacījumu
                    </h1>
                </div>

                <SpecialConditionForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={condition.id}
                    initialData={condition}
                />
            </TeacherLayout>
        </>
    );
}