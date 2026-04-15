import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import OrderTemplateForm from './OrderTemplateForm';

type PageProps = {
    options: any;
};

export default function Create() {
    const page = usePage<PageProps>();
    const { options } = page.props;

    return (
        <TeacherLayout active="templates">
            <Head title="Jauna uzdevuma sagatave" />

            <div className="space-y-6">
                <BackButton href="/teacher/templates/order-templates" />

                <div className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauna uzdevuma sagatave
                    </h1>
                    <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                        Izveidojiet scenārija karkasu studentu simulatora uzdevumiem, nosakot
                        sākuma nosacījumus, resursus un ierobežojumus.
                    </p>
                </div>

                <OrderTemplateForm
                    options={options}
                    submitLabel="Saglabāt sagatavi"
                    onCancel={() => router.visit('/teacher/templates/order-templates')}
                />
            </div>
        </TeacherLayout>
    );
}