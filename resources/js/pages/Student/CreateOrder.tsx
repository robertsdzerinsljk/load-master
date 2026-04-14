import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import OrderForm from '@/components/OrderForm';

export default function StudentCreateOrder() {
    return (
        <>
            <Head title="Izveidot pasūtījumu" />

            <StudentLayout active="create">
                <div>
                    <h1 className="text-[47px] font-semibold leading-tight text-[#182219]">
                        Izveidot pasūtījumu
                    </h1>

                    <p className="mt-2 text-[28px] text-[#5b6b61]">
                        Aizpildiet pasūtījuma informāciju
                    </p>
                </div>

                <OrderForm submitLabel="Izveidot pasūtījumu" />
            </StudentLayout>
        </>
    );
}