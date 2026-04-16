import { Head, router } from '@inertiajs/react';
import {
    Anchor,
    FileText,
    FolderKanban,
    MapPin,
    Shield,
    Ship,
    Thermometer,
    Truck,
    Route,
    Fuel,
} from 'lucide-react';
import TeacherLayout from '@/layouts/TeacherLayout';

function TemplateCard({
    icon,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <button
            type="button"
            onClick={() => router.visit(href)}
            className="rounded-2xl border border-[#d9ded9] bg-white p-5 text-left transition hover:shadow-sm"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8efea] text-[#256c51]">
                {icon}
            </div>

            <h3 className="mt-4 text-[16px] font-semibold text-[#182219]">{title}</h3>
            <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">{description}</p>
        </button>
    );
}

export default function TeacherTemplatesIndex() {
    return (
        <>
            <Head title="Sagataves" />

            <TeacherLayout active="templates">
                <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                        Sagataves
                    </h1>

                    <p className="mt-2 max-w-3xl text-[16px] text-[#5b6b61]">
                        Pārvaldiet simulatora parametrus, iepriekš sagatavotos variantus un
                        gatavos scenārijus, kurus vēlāk var izmantot studentu uzdevumos.
                    </p>
                </div>

                <section className="mt-8">
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#182219]">
                            Bāzes sagataves
                        </h2>

                        <p className="mt-1 text-[14px] text-[#5b6b61]">
                            Parametri un konfigurācijas, no kuriem vēlāk tiek veidoti pilni
                            loģistikas scenāriji.
                        </p>
                    </div>

                    <div className="mt-4 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
                        <TemplateCard
                            icon={<Truck className="h-5 w-5" />}
                            title="Sauszemes transports"
                            description="Definējiet sauszemes transporta variantus, kurus vēlāk var izmantot piegādēs līdz ostai, starp pilsētām un citos loģistikas scenārijos."
                            href="/teacher/templates/transport"
                        />
                        <TemplateCard
                            icon={<Anchor className="h-5 w-5" />}
                            title="Ostas"
                            description="Definējiet ostas, to iegrimuma ierobežojumus, attālumus un iekraušanas ātrumus simulatora scenārijiem."
                            href="/teacher/templates/ports"
                        />
                        <TemplateCard
                            icon={<Ship className="h-5 w-5" />}
                            title="Kuģi"
                            description="Definējiet kuģu parametrus, kapacitāti, iegrimumu un iekraušanas iespējas simulatora scenārijiem."
                            href="/teacher/templates/ships"
                        />
                        <TemplateCard
                            icon={<MapPin className="h-5 w-5" />}
                            title="Lokācijas"
                            description="Definējiet pilsētas, rūpnīcas, noliktavas, uzpildes vietas un citus punktus, kurus izmantos sauszemes maršrutos."
                            href="/teacher/templates/locations"
                        />
                        <TemplateCard
                            icon={<Fuel className="h-5 w-5" />}
                            title="Uzpildes vietas"
                            description="Definējiet degvielas cenu un tipu lokācijām, kuras izmanto kā uzpildes punktus sauszemes maršrutos."
                            href="/teacher/templates/fuel-stations"
                        />
                        <TemplateCard
                            icon={<MapPin className="h-5 w-5" />}
                            title="Maršruta uzpildes pieturas"
                            description="Piesaistiet uzpildes vietas konkrētiem sauszemes maršrutiem un norādiet attālumu no maršruta sākuma."
                            href="/teacher/templates/route-fuel-stops"
                        />
                        <TemplateCard
                            icon={<Route className="h-5 w-5" />}
                            title="Sauszemes maršruti"
                            description="Definējiet attālumus, paredzamo ceļā pavadīto laiku un nodevas starp lokācijām."
                            href="/teacher/templates/land-routes"
                        />
                        <TemplateCard
                            icon={<Thermometer className="h-5 w-5" />}
                            title="Temperatūras režīmi"
                            description="Saglabājiet biežāk lietotos temperatūras nosacījumus dažādiem kravu tipiem."
                            href="/teacher/templates/temperature"
                        />

                        <TemplateCard
                            icon={<Shield className="h-5 w-5" />}
                            title="Īpašie nosacījumi"
                            description="Izveidojiet drošības, apdrošināšanas un citu papildu prasību sagataves."
                            href="/teacher/templates/special-conditions"
                        />

                        <TemplateCard
                            icon={<FileText className="h-5 w-5" />}
                            title="Muitas dokumenti"
                            description="Saglabājiet biežāk izmantotos dokumentu komplektus konkrētiem piegādes scenārijiem."
                            href="/teacher/templates/customs"
                        />

                    </div>
                </section>

                <section className="mt-10">
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#182219]">
                            Gatavie scenāriji
                        </h2>

                        <p className="mt-1 max-w-3xl text-[14px] text-[#5b6b61]">
                            Pilnībā sagatavoti uzdevumi, kuros tiek apvienoti klienta dati,
                            krava, transports, temperatūras režīms, īpašie nosacījumi un
                            dokumenti.
                        </p>
                    </div>

                    <div className="mt-4 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
                        <TemplateCard
                            icon={<FolderKanban className="h-5 w-5" />}
                            title="Pasūtījuma sagataves"
                            description="Veidojiet gatavus loģistikas scenārijus studentiem un izmantojiet tos kā simulatora uzdevumus."
                            href="/teacher/templates/order-templates"
                        />
                    </div>
                </section>
            </TeacherLayout>
        </>
    );
}