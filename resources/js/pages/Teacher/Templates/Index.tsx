import { Head, router } from '@inertiajs/react';
import {
    Anchor,
    ArrowRight,
    FileText,
    FolderKanban,
    Fuel,
    MapPin,
    Plus,
    Route,
    Shield,
    Ship,
    Thermometer,
    Truck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';

type CatalogItem = {
    icon: ReactNode;
    title: string;
    description: string;
    href: string;
};

const catalogItems: CatalogItem[] = [
    {
        icon: <Truck className="h-5 w-5" />,
        title: 'Sauszemes transports',
        description:
            'Kravas auto, furgoni, vilcieni, kapacitāte, ātrums un degvielas patēriņš.',
        href: '/teacher/templates/transport',
    },
    {
        icon: <Anchor className="h-5 w-5" />,
        title: 'Ostas',
        description:
            'Ostu iespējas, iegrime, kravu atbalsts un apstrādes jaudas.',
        href: '/teacher/templates/ports',
    },
    {
        icon: <Ship className="h-5 w-5" />,
        title: 'Kuģi',
        description: 'Kuģu profili, kapacitāte, ātrums un kravu saderība.',
        href: '/teacher/templates/ships',
    },
    {
        icon: <MapPin className="h-5 w-5" />,
        title: 'Lokācijas',
        description:
            'Noliktavas, klienti, termināļi un citi maršruta punkti kartē.',
        href: '/teacher/templates/locations',
    },
    {
        icon: <Fuel className="h-5 w-5" />,
        title: 'Uzpildes vietas',
        description: 'Degvielas punkti, degvielas tipi un cenas.',
        href: '/teacher/templates/fuel-stations',
    },
    {
        icon: <Route className="h-5 w-5" />,
        title: 'Sauszemes maršruti',
        description: 'Iepriekš saglabāti sauszemes posmi un attālumi.',
        href: '/teacher/templates/land-routes',
    },
    {
        icon: <MapPin className="h-5 w-5" />,
        title: 'Maršruta uzpildes pieturas',
        description:
            'Uzpildes punkti, kas piesaistīti konkrētiem sauszemes posmiem.',
        href: '/teacher/templates/route-fuel-stops',
    },
    {
        icon: <Thermometer className="h-5 w-5" />,
        title: 'Temperatūras režīmi',
        description: 'Biežāk lietotie temperatūras nosacījumi kravai.',
        href: '/teacher/templates/temperature',
    },
    {
        icon: <Shield className="h-5 w-5" />,
        title: 'Īpašie nosacījumi',
        description: 'Apsardze, apdrošināšana un citas papildu prasības.',
        href: '/teacher/templates/special-conditions',
    },
    {
        icon: <FileText className="h-5 w-5" />,
        title: 'Muitas dokumenti',
        description: 'Dokumentu komplekti un scenāriju prasības.',
        href: '/teacher/templates/customs',
    },
];

function PrimaryActionCard({
    icon,
    title,
    description,
    href,
    action,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    href: string;
    action: string;
}) {
    return (
        <button
            type="button"
            onClick={() => router.visit(href)}
            className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-[#cfe3d8] bg-[#f6faf7] p-6 text-left transition hover:border-[#166a4d] hover:shadow-sm"
        >
            <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#166a4d] shadow-sm">
                    {icon}
                </div>

                <h2 className="mt-5 text-[20px] font-semibold text-[#182219]">
                    {title}
                </h2>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#5b6b61]">
                    {description}
                </p>
            </div>

            <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#166a4d]">
                {action}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
        </button>
    );
}

function CatalogCard({ icon, title, description, href }: CatalogItem) {
    return (
        <button
            type="button"
            onClick={() => router.visit(href)}
            className="rounded-xl border border-[#d9ded9] bg-white p-4 text-left transition hover:border-[#b8c9bd] hover:shadow-sm"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8efea] text-[#256c51]">
                    {icon}
                </div>

                <div>
                    <h3 className="text-[15px] font-semibold text-[#182219]">
                        {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-5 text-[#5b6b61]">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

export default function TeacherTemplatesIndex() {
    return (
        <>
            <Head title="Uzdevumi un resursi" />

            <TeacherLayout active="templates">
                <div>
                    <p className="text-[12px] font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                        Darba sākums
                    </p>
                    <h1 className="mt-2 text-[30px] leading-tight font-semibold text-[#182219]">
                        Uzdevumi un resursi
                    </h1>

                    <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                        Sāciet ar studentu uzdevumu. Resursu katalogs ir zemāk
                        kā atbalsta bibliotēka transportam, ostām, kuģiem un
                        lokācijām.
                    </p>
                </div>

                <section className="mt-8 grid gap-4 xl:grid-cols-2">
                    <PrimaryActionCard
                        icon={<Plus className="h-6 w-6" />}
                        title="Izveidot jaunu uzdevumu"
                        description="Atveriet uzdevuma veidotāju, definējiet kravu un maršrutu kartē, pēc tam izvēlieties studentam pieejamās opcijas."
                        href="/teacher/templates/order-templates/create"
                        action="Sākt uzdevumu"
                    />

                    <PrimaryActionCard
                        icon={<FolderKanban className="h-6 w-6" />}
                        title="Pārvaldīt esošos uzdevumus"
                        description="Skatiet melnrakstus, gatavās sagataves, studentiem piešķirtos scenārijus un iepriekš sagatavotus piemērus."
                        href="/teacher/templates/order-templates"
                        action="Atvērt uzdevumus"
                    />
                </section>

                <section className="mt-10 rounded-2xl border border-[#d9ded9] bg-white p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                                Atbalsta katalogs
                            </p>
                            <h2 className="mt-2 text-[20px] font-semibold text-[#182219]">
                                Resursi, ko izmanto uzdevumos
                            </h2>
                        </div>

                        <p className="max-w-xl text-[14px] leading-6 text-[#5b6b61]">
                            Šeit labo bāzes datus. Ikdienas darbā pasniedzējam
                            vispirms jāveido uzdevums, nevis atsevišķi maršruta
                            segmenti.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {catalogItems.map((item) => (
                            <CatalogCard key={item.href} {...item} />
                        ))}
                    </div>
                </section>
            </TeacherLayout>
        </>
    );
}
