import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import CustomsDocumentForm from '@/components/CustomsDocumentForm';
import { Head, usePage } from '@inertiajs/react';

type Document = {
    id: number;
    name: string;
    description?: string | null;
};

type PageProps = {
    document: Document;
};

export default function Edit() {
    const page = usePage<PageProps>();
    const document = page.props.document;

    return (
        <>
            <Head title="Rediģēt muitas dokumentu" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/customs" />

                <div className="mt-4">
                    <h1 className="text-[28px] font-semibold text-[#182219]">
                        Rediģēt muitas dokumentu
                    </h1>
                </div>

                <CustomsDocumentForm
                    submitLabel="Saglabāt izmaiņas"
                    isEdit
                    id={document.id}
                    initialData={document}
                />
            </TeacherLayout>
        </>
    );
}