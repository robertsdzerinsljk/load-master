import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import TemperaturePresetForm from '@/components/TemperaturePresetForm';
import { Head, usePage } from '@inertiajs/react';

type TemperatureMode = {
    id: number;
    name: string;
    description?: string | null;
    range?: string | null;
};

type PageProps = {
    mode: TemperatureMode;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const mode = page.props.mode;

    return (
        <>
            <Head title="Rediģēt temperatūras režīmu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/temperature" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Rediģēt temperatūras režīmu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Atjaunojiet temperatūras režīma parametrus simulatoram
                    </p>
                </div>

                <TemperaturePresetForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={mode.id}
                    initialData={{
                        name: mode.name ?? '',
                        description: mode.description ?? '',
                        range: mode.range ?? '',
                    }}
                />
            </TeacherLayout>
        </>
    );
}