import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileText, Truck } from 'lucide-react';
import { useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherOrderTabs from '@/components/TeacherOrderTabs';

type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Jauns: 'bg-[#dce7ff] text-[#3d67d6] border-[#bfd2ff]',
        Pārskatāms: 'bg-[#fff7e6] text-[#b7791f] border-[#f6d28b]',
        Apstiprināts: 'bg-[#e7f7ee] text-[#1f8f5f] border-[#bde5cc]',
        Noraidīts: 'bg-[#fdecec] text-[#c94b4b] border-[#f5c2c2]',
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

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-white p-4">
            <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-1 text-[16px] font-semibold text-[#182219]">
                {value || '—'}
            </div>
        </div>
    );
}

function ValidationRow({
    label,
    value,
}: {
    label: string;
    value: 'Jā' | 'Nē' | 'Daļēji';
}) {
    const styles: Record<string, string> = {
        Jā: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        Nē: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
        Daļēji: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
    };

    return (
        <div className="flex items-center justify-between rounded-xl border border-[#d9ded9] bg-white px-4 py-4">
            <span className="text-[15px] font-medium text-[#182219]">{label}</span>
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${styles[value]}`}
            >
                {value}
            </span>
        </div>
    );
}

export default function TeacherOrderShow() {
    const [activeTab, setActiveTab] = useState<TeacherOrderTabKey>('overview');
    const [feedback, setFeedback] = useState('');
    const [feedbackSaved, setFeedbackSaved] = useState(false);
    const [approved, setApproved] = useState(false);

    const order = {
        title: 'Testa pasūtījums',
        student: 'Ralfs Balceris — ID: TEACHER',
        status: approved ? 'Apstiprināts' : 'Jauns',
        client_name: 'Test klienta uzņēmums',
        contact_person: 'T. Tests',
        address: 'Brīvības iela 25, Rīga',
        cargo_type: 'Pārtikas produkti',
        quantity: '25 vienības',
        weight_capacity: '555 kg',
        temperature_requirements: '+5°C',
        due_date: '2026-04-22',
        priority: 'Steidzams',
        transport_requirements: 'Nepieciešams aukstuma transports',
        customs_documents: 'CMR, Invoice',
        summary:
            'Pasūtījums paredz temperatūras jutīgas kravas piegādi ar paaugstinātu steidzamību.',
        delivery_quantity_match: 'Nē' as const,
        delivery_type_match: 'Nē' as const,
        delivery_quality_match: 'Nē' as const,
        delivery_notes: 'Piegādes validācija vēl nav pilnībā pabeigta.',
    };

    return (
        <>
            <Head title="Pasūtījuma detaļas" />

            <TeacherLayout active="orders">
                <button
                    type="button"
                    onClick={() => router.visit('/teacher')}
                    className="inline-flex items-center gap-2 text-[14px] text-[#5f6f65] transition hover:text-[#182219]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ
                </button>

                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                                {order.title}
                            </h1>
                            <StatusBadge status={order.status} />
                        </div>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">{order.student}</p>
                        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                            {order.summary}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('feedback')}
                            className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            Pievienot atsauksmi
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setApproved(true);
                                setActiveTab('feedback');
                            }}
                            className="rounded-xl bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                        >
                            Apstiprināt
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <TeacherOrderTabs active={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === 'overview' && (
                    <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-[#166a4d]" />
                                    <h2 className="text-[22px] font-semibold text-[#182219]">
                                        Pasūtījuma informācija
                                    </h2>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard label="Klients" value={order.client_name} />
                                    <InfoCard label="Kontaktpersona" value={order.contact_person} />
                                    <InfoCard label="Adrese" value={order.address} />
                                    <InfoCard label="Kravas veids" value={order.cargo_type} />
                                    <InfoCard label="Daudzums" value={order.quantity} />
                                    <InfoCard label="Kravnesība" value={order.weight_capacity} />
                                    <InfoCard label="Temperatūras prasības" value={order.temperature_requirements} />
                                    <InfoCard label="Termiņš" value={order.due_date} />
                                    <InfoCard label="Prioritāte" value={order.priority} />
                                    <InfoCard label="Speciālais transports" value={order.transport_requirements} />
                                    <InfoCard label="Muitas dokumenti" value={order.customs_documents} />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="h-5 w-5 text-[#166a4d]" />
                                    <h2 className="text-[22px] font-semibold text-[#182219]">
                                        Ātrais kopsavilkums
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-4 text-[15px] text-[#5b6b61]">
                                    <div>
                                        <span className="font-semibold text-[#182219]">Students:</span>{' '}
                                        {order.student}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Krava:</span>{' '}
                                        {order.cargo_type}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Prioritāte:</span>{' '}
                                        {order.priority}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Termiņš:</span>{' '}
                                        {order.due_date}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Statuss:</span>{' '}
                                        {order.status}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-5 w-5 text-[#166a4d]" />
                                    <h2 className="text-[22px] font-semibold text-[#182219]">
                                        Ātrās darbības
                                    </h2>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('feedback')}
                                        className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-left text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                    >
                                        Rakstīt atsauksmi
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('delivery')}
                                        className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-left text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                    >
                                        Pārbaudīt piegādi
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setApproved(true)}
                                        className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-left text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                    >
                                        Atzīmēt kā apstiprinātu
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Pasniedzēja atsauksme
                                </h2>

                                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                    Sniedz komentārus par pasūtījuma kvalitāti, precizitāti un piegādes
                                    prasību izpildi.
                                </p>

                                <div className="mt-5">
                                    <label className="mb-2 block text-[14px] font-medium text-[#182219]">
                                        Atsauksmes teksts
                                    </label>

                                    <textarea
                                        rows={8}
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Ievadiet savu atsauksmi..."
                                        className="w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]"
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFeedbackSaved(true);
                                            setTimeout(() => setFeedbackSaved(false), 2500);
                                        }}
                                        className="rounded-xl border border-[#d5dbd6] bg-white px-5 py-3 text-[14px] font-medium text-[#162118] transition hover:bg-[#f3f5f3]"
                                    >
                                        Saglabāt atsauksmi
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setApproved(true)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#135740]"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Apstiprināt pasūtījumu
                                    </button>
                                </div>

                                {feedbackSaved && (
                                    <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#ecfdf3] px-4 py-3 text-[14px] text-[#166534]">
                                        Atsauksme saglabāta demonstrācijas režīmā.
                                    </div>
                                )}
                            </section>
                        </div>

                        <div>
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Konteksts
                                </h2>

                                <div className="mt-4 space-y-3 text-[15px] text-[#5b6b61]">
                                    <p>
                                        <span className="font-semibold text-[#182219]">Klients:</span>{' '}
                                        {order.client_name}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Krava:</span>{' '}
                                        {order.cargo_type}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Statuss:</span>{' '}
                                        {order.status}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Termiņš:</span>{' '}
                                        {order.due_date}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'delivery' && (
                    <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Piegādes validācija
                                </h2>

                                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                    Šajā sadaļā tiek pārbaudīts, vai students ir korekti izpildījis
                                    piegādes nosacījumus.
                                </p>

                                <div className="mt-5 space-y-3">
                                    <ValidationRow
                                        label="Daudzums atbilst"
                                        value={order.delivery_quantity_match}
                                    />
                                    <ValidationRow
                                        label="Veids atbilst"
                                        value={order.delivery_type_match}
                                    />
                                    <ValidationRow
                                        label="Kvalitāte atbilstoša"
                                        value={order.delivery_quality_match}
                                    />
                                </div>

                                <div className="mt-5 rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                    <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                                        Piezīmes
                                    </div>
                                    <div className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                        {order.delivery_notes}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div>
                            <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Validācijas kopsavilkums
                                </h2>

                                <div className="mt-4 space-y-3 text-[15px] text-[#5b6b61]">
                                    <p>
                                        Piegādes pārbaude šobrīd norāda, ka pasūtījums vēl neatbilst visām
                                        prasībām.
                                    </p>
                                    <p>
                                        Pirms galīgā apstiprinājuma ieteicams pārskatīt daudzumu, kravas veidu
                                        un kvalitātes atbilstību.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </TeacherLayout>
        </>
    );
}