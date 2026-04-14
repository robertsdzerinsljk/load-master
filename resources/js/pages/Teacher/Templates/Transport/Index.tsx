import { Head, router } from '@inertiajs/react';
import { CirclePlus, Search } from 'lucide-react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TransportPresetCard from '@/components/TransportPresetCard';
import BackButton from '@/components/BackButton';

export default function TeacherTransportTemplatesIndex() {
    return (
        <>
            <Head title="Transporta veidi" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates" />

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Transporta veidi
                        </h1>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">
                            Pārvaldiet iepriekš sagatavotus transporta variantus simulatoram
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/transport/create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Jauns transporta veids
                    </button>
                </div>

                <div className="mt-6 max-w-4xl">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3">
                        <Search className="h-4 w-4 text-[#7a877f]" />
                        <input
                            type="text"
                            placeholder="Meklēt transporta veidus..."
                            className="w-full bg-transparent text-[14px] text-[#162118] outline-none placeholder:text-[#93a097]"
                        />
                    </div>
                </div>

                <div className="mt-6 grid max-w-4xl gap-4">
                    <TransportPresetCard
                        name="Standarta kravas auto"
                        description="Universāls transporta variants standarta kravām bez īpašām temperatūras prasībām."
                        capacity="24 paletes / 18 t"
                        onClick={() => router.visit('/teacher/templates/transport/1/edit')}
                    />

                    <TransportPresetCard
                        name="Aukstuma kravas auto"
                        description="Paredzēts pārtikas un medikamentu kravām ar stabilu temperatūras kontroli."
                        capacity="20 paletes / 16 t"
                        temperatureSupport="+2°C līdz +8°C"
                        onClick={() => router.visit('/teacher/templates/transport/2/edit')}
                    />

                    <TransportPresetCard
                        name="Konteiners 40FT"
                        description="Liela tilpuma jūras transporta vienība starptautiskām kravām."
                        capacity="67 m³ / 26 t"
                        onClick={() => router.visit('/teacher/templates/transport/3/edit')}
                    />
                </div>
            </TeacherLayout>
        </>
    );
}