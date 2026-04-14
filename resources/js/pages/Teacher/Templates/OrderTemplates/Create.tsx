import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router } from '@inertiajs/react';
import OrderTemplateForm from './OrderTemplateForm';

export default function Create() {
    return (
        <TeacherLayout>
            <Head title="Jauna pasūtījuma sagatave" />

            <div className="space-y-6 p-6">
                <BackButton />

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-[28px] font-semibold leading-tight text-slate-900">
                        Jauna pasūtījuma sagatave
                    </h1>
                    <p className="mt-2 max-w-3xl text-[16px] leading-7 text-slate-600">
                        Izveido pilnu loģistikas scenāriju simulatora uzdevumiem.
                    </p>
                </div>

                <OrderTemplateForm
                    onCancel={() => router.visit('/teacher/templates/order-templates')}
                />
            </div>
        </TeacherLayout>
    );
}