import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import OrderForm from '@/components/OrderForm';

export default function TeacherCreateOrder() {
    return (
        <>
            <Head title="Izveidot pasūtījumu" />

            <TeacherLayout active="create">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Izveidot pasūtījumu
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu pasūtījumu simulācijai
                    </p>
                </div>

                <OrderForm submitLabel="Izveidot pasūtījumu" />
            </TeacherLayout>
        </>
    );
}