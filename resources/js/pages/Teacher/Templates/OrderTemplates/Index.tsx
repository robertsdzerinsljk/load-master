import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router } from '@inertiajs/react';
import { orderTemplateList } from './orderTemplateFakeData';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Melnraksts: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        Gatavs: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        Piešķirts: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {status}
        </span>
    );
}

export default function Index() {
    return (
        <TeacherLayout active="templates">
            <Head title="Pasūtījuma sagataves" />

            <div className="space-y-6">
                <BackButton href="/teacher/templates" />

                <div className="flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                            Pasūtījuma sagataves
                        </h1>
                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                            Šeit pasniedzējs var izveidot un pārvaldīt pilnus loģistikas scenārijus
                            studentiem. Sagataves vēlāk var izmantot kā simulatora uzdevumus.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/order-templates/create')}
                        className="inline-flex items-center justify-center rounded-xl bg-[#166a4d] px-5 py-3 text-[16px] font-medium text-white transition hover:bg-[#135740]"
                    >
                        Izveidot jaunu sagatavi
                    </button>
                </div>

                <div className="rounded-xl border border-[#d9ded9] bg-white shadow-sm">
                    <div className="border-b border-[#d9ded9] px-6 py-5">
                        <h2 className="text-[28px] font-semibold text-[#182219]">
                            Sagatavju saraksts
                        </h2>
                        <p className="mt-2 text-[16px] leading-7 text-[#5b6b61]">
                            Gatavie scenāriji, kurus vēlāk var izmantot studentu uzdevumiem.
                        </p>
                    </div>

                    <div className="divide-y divide-[#d9ded9]">
                        {orderTemplateList.map((template) => (
                            <div
                                key={template.id}
                                className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-[16px] font-semibold text-[#182219]">
                                            {template.title}
                                        </h3>

                                        <StatusBadge status={template.status} />
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 text-[15px] text-[#5b6b61] md:grid-cols-2 xl:grid-cols-4">
                                        <p>
                                            <span className="font-medium text-[#182219]">Klients:</span>{' '}
                                            {template.client}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Krava:</span>{' '}
                                            {template.cargo}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Prioritāte:</span>{' '}
                                            {template.priority}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Transports:</span>{' '}
                                            {template.transportType}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Temperatūra:</span>{' '}
                                            {template.temperatureMode}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Nosacījumi:</span>{' '}
                                            {template.specialCondition}
                                        </p>
                                        <p>
                                            <span className="font-medium text-[#182219]">Dokuments:</span>{' '}
                                            {template.customsDocument}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.visit(`/teacher/templates/order-templates/${template.id}`)
                                        }
                                        className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                    >
                                        Skatīt
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                `/teacher/templates/order-templates/${template.id}/edit`
                                            )
                                        }
                                        className="rounded-xl border border-[#d9ded9] bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                    >
                                        Rediģēt
                                    </button>
                                </div>
                            </div>
                        ))}

                        {orderTemplateList.length === 0 && (
                            <div className="px-6 py-10 text-center text-[16px] text-[#5b6b61]">
                                Šobrīd nav nevienas pasūtījuma sagataves.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}