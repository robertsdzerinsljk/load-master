import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import EmptyOrdersState from '@/components/EmptyOrdersState';

export default function StudentDashboard() {
    return (
        <>
            <Head title="Iepriekšējie pasūtījumi" />

            <StudentLayout active="orders">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Iepriekšējie pasūtījumi
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Visi jūsu izveidotie pasūtījumi
                    </p>
                </div>

                <EmptyOrdersState text="Nav neviena pasūtījuma" />
            </StudentLayout>
        </>
    );
}