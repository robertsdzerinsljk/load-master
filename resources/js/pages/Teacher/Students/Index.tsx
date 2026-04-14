import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import EmptyStudentsState from '@/components/EmptyStudentsState';

export default function TeacherStudentsIndex() {
    return (
        <>
            <Head title="Studentu saraksts" />

            <TeacherLayout active="students">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Studentu saraksts
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Pārskatiet pieejamās klases un studentus
                    </p>
                </div>

                <EmptyStudentsState text="Nav pieejamu klašu vai studentu" />
            </TeacherLayout>
        </>
    );
}