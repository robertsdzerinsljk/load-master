import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import CustomsDocumentForm from '@/components/CustomsDocumentForm';
import BackButton from '@/components/BackButton';

export default function TeacherCustomsCreate() {
    return (
        <>
            <Head title="Jauns dokumentu komplekts" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/customs" />
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Jauns dokumentu komplekts
                    </h1>

                    <p className="mt-2 text-[16px] text-[#5b6b61]">
                        Izveidojiet jaunu muitas dokumentu sagatavi simulatoram
                    </p>
                </div>

                <CustomsDocumentForm submitLabel="Saglabāt dokumentu komplektu" />
            </TeacherLayout>
        </>
    );
}