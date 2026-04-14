import { Head, router } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import TeacherLayout from '@/layouts/TeacherLayout';
import SpecialConditionPresetCard from '@/components/SpecialConditionCard';
import BackButton from '@/components/BackButton';

export default function TeacherSpecialConditionsTemplatesIndex() {
    return (
        <>
            <Head title="Īpašie nosacījumi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Īpašie nosacījumi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet īpašos loģistikas nosacījumus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/special-conditions/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns nosacījums
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            placeholder="Meklēt nosacījumus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    <SpecialConditionPresetCard
                        name="Trausla krava"
                        description="Nepieciešama rūpīga apstrāde un uzmanīga iekraušana."
                        onClick={() => router.visit('/teacher/templates/special-conditions/1/edit')}
                    />

                    <SpecialConditionPresetCard
                        name="Bīstamā krava"
                        description="Pārvadāšanai jāievēro ADR drošības prasības."
                        onClick={() => router.visit('/teacher/templates/special-conditions/2/edit')}
                    />

                    <SpecialConditionPresetCard
                        name="Papildu apdrošināšana"
                        description="Piegādei jāparedz palielināta apdrošināšanas aizsardzība."
                        onClick={() => router.visit('/teacher/templates/special-conditions/3/edit')}
                    />
                </div>
            </TeacherLayout>
        </>
    );
}