import { Head, router } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TemperaturePresetCard from '@/components/TemperaturePresetCard';
import BackButton from '@/components/BackButton';

export default function TeacherTemperatureTemplatesIndex() {
    return (
        <>
            <Head title="Temperatūras režīmi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Temperatūras režīmi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet iepriekš sagatavotus temperatūras režīmus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/temperature/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns temperatūras režīms
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            placeholder="Meklēt temperatūras režīmus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    <TemperaturePresetCard
                        name="Ambient"
                        description="Parasts temperatūras režīms bez papildu dzesēšanas."
                        range="+15°C līdz +25°C"
                        onClick={() => router.visit('/teacher/templates/temperature/1/edit')}
                    />

                    <TemperaturePresetCard
                        name="Chilled"
                        description="Atdzesēts režīms pārtikai un medicīnas kravām."
                        range="+2°C līdz +8°C"
                        onClick={() => router.visit('/teacher/templates/temperature/2/edit')}
                    />

                    <TemperaturePresetCard
                        name="Frozen"
                        description="Saldēts režīms dziļi sasaldētām kravām."
                        range="-18°C"
                        onClick={() => router.visit('/teacher/templates/temperature/3/edit')}
                    />
                </div>
            </TeacherLayout>
        </>
    );
}