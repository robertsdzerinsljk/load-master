import { Head, router } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import TeacherLayout from '@/layouts/TeacherLayout';
import CustomsDocumentCard from '@/components/CustomsDocumentCard';
import BackButton from '@/components/BackButton';

export default function TeacherCustomsIndex() {
    return (
        <>
            <Head title="Muitas dokumenti" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Muitas dokumenti
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet biežāk izmantotos dokumentu komplektus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/customs/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns dokumentu komplekts
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            placeholder="Meklēt dokumentus..."
                            className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    <CustomsDocumentCard
                    name="CMR"
                    description="Starptautiskais autotransporta kravas pavadzīmes dokuments."
                    onClick={() => router.visit('/teacher/templates/customs/1/edit')}
                />

                <CustomsDocumentCard
                name="Commercial Invoice"
                description="Komercrēķins muitošanas un norēķinu procesam."
                onClick={() => router.visit('/teacher/templates/customs/2/edit')}
                 />

                <CustomsDocumentCard
                    name="Packing List"
                    description="Detalizēts kravas vienību un iepakojuma saraksts."
                    onClick={() => router.visit('/teacher/templates/customs/3/edit')}
                />
                </div>
            </TeacherLayout>
        </>
    );
}