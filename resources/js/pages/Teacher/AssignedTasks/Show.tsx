import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileText, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherOrderTabs from '@/components/TeacherOrderTabs';

type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

type AttemptPageProps = {
    attempt: {
        id: number;
        status: string;
        current_step: string;
        submitted_at?: string | null;
        updated_at?: string | null;
        preview_result?: any;
        student?: {
            id?: number | null;
            name?: string | null;
            email?: string | null;
            class_name?: string | null;
        } | null;
        template?: {
            id?: number | null;
            title?: string | null;
            description?: string | null;
            student_brief?: string | null;
            cargo_name?: string | null;
            cargo_type?: string | null;
            cargo_amount_containers?: number | string | null;
            cargo_amount_tons?: number | string | null;
            deadline_date?: string | null;
            priority?: string | null;
            temperature_mode?: string | null;
            special_condition?: string | null;
            transport_names?: string[];
        } | null;
        derived?: {
            delivery_quantity_match?: 'Jā' | 'Nē' | 'Daļēji';
            delivery_type_match?: 'Jā' | 'Nē' | 'Daļēji';
            delivery_quality_match?: 'Jā' | 'Nē' | 'Daļēji';
        } | null;
    };
};

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        draft: 'Melnraksts',
        reviewed: 'Pārskatīts',
    };

    const styles: Record<string, string> = {
        in_progress: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',
        submitted: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        draft: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        reviewed: 'bg-[#dce7ff] text-[#3d67d6] border-[#bfd2ff]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {labelMap[status] ?? status}
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

export default function TeacherAssignedTaskShow() {
    const { attempt } = usePage<AttemptPageProps>().props;

    const [activeTab, setActiveTab] = useState<TeacherOrderTabKey>('overview');
    const [feedback, setFeedback] = useState('');
    const [feedbackSaved, setFeedbackSaved] = useState(false);

    const title = attempt.template?.title || 'Piešķirtais uzdevums';
    const studentLabel = useMemo(() => {
        const name = attempt.student?.name || 'Nezināms students';
        const className = attempt.student?.class_name ? ` — ${attempt.student.class_name}` : '';
        return `${name}${className}`;
    }, [attempt.student]);

    const summary = attempt.template?.description || attempt.template?.student_brief || 'Apraksts nav pievienots.';

    const transportRequirements = attempt.template?.transport_names?.length
        ? attempt.template.transport_names.join(', ')
        : 'Nav norādīts';

    const customsDocuments = attempt.template?.special_condition || 'Nav norādīts';

    const temperatureRequirements = attempt.template?.temperature_mode || 'Nav norādīts';

    const deliveryQuantityMatch = attempt.derived?.delivery_quantity_match || 'Daļēji';
    const deliveryTypeMatch = attempt.derived?.delivery_type_match || 'Daļēji';
    const deliveryQualityMatch = attempt.derived?.delivery_quality_match || 'Daļēji';

    const deliveryNotes = attempt.preview_result?.message
        || (attempt.status === 'submitted'
            ? 'Students ir iesniedzis risinājumu. Var veikt pārskatīšanu.'
            : 'Students vēl turpina darbu pie uzdevuma.');

    return (
        <>
            <Head title="Piešķirtā uzdevuma detaļas" />

            <TeacherLayout active="orders">
                <button
                    type="button"
                    onClick={() => router.visit('/teacher/templates/order-templates')}
                    className="inline-flex items-center gap-2 text-[14px] text-[#5f6f65] transition hover:text-[#182219]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ
                </button>

                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                                {title}
                            </h1>
                            <StatusBadge status={attempt.status} />
                        </div>

                        <p className="mt-2 text-[16px] text-[#5b6b61]">{studentLabel}</p>
                        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                            {summary}
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
                            onClick={() => setActiveTab('delivery')}
                            className="rounded-xl bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                        >
                            Pārbaudīt izpildi
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
                                        Uzdevuma informācija
                                    </h2>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard label="Students" value={attempt.student?.name || '—'} />
                                    <InfoCard label="E-pasts" value={attempt.student?.email || '—'} />
                                    <InfoCard label="Grupa / klase" value={attempt.student?.class_name || '—'} />
                                    <InfoCard label="Kravas nosaukums" value={attempt.template?.cargo_name || '—'} />
                                    <InfoCard label="Kravas veids" value={attempt.template?.cargo_type || '—'} />
                                    <InfoCard label="Daudzums (konteineri)" value={String(attempt.template?.cargo_amount_containers ?? '—')} />
                                    <InfoCard label="Daudzums (tonnas)" value={String(attempt.template?.cargo_amount_tons ?? '—')} />
                                    <InfoCard label="Temperatūras prasības" value={temperatureRequirements} />
                                    <InfoCard label="Termiņš" value={attempt.template?.deadline_date || '—'} />
                                    <InfoCard label="Prioritāte" value={attempt.template?.priority || '—'} />
                                    <InfoCard label="Speciālais transports" value={transportRequirements} />
                                    <InfoCard label="Īpašie nosacījumi" value={customsDocuments} />
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
                                        {studentLabel}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Krava:</span>{' '}
                                        {attempt.template?.cargo_type || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Prioritāte:</span>{' '}
                                        {attempt.template?.priority || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Termiņš:</span>{' '}
                                        {attempt.template?.deadline_date || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Statuss:</span>{' '}
                                        {attempt.status}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Pašreizējais solis:</span>{' '}
                                        {attempt.current_step}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-[#182219]">Iesniegts:</span>{' '}
                                        {attempt.submitted_at || 'Vēl nav'}
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
                                        onClick={() => router.visit(`/teacher/templates/order-templates/${attempt.template?.id}`)}
                                        className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-left text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                                    >
                                        Atvērt uzdevuma sagatavi
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
                                    Šeit vari ierakstīt komentārus par studenta risinājumu.
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
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#135740]"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Atzīmēt kā pārskatītu
                                    </button>
                                </div>

                                {feedbackSaved && (
                                    <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#ecfdf3] px-4 py-3 text-[14px] text-[#166534]">
                                        Atsauksme saglabāta lokāli. Nākamajā solī pieslēgsim DB saglabāšanu.
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
                                        <span className="font-semibold text-[#182219]">Students:</span>{' '}
                                        {studentLabel}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Krava:</span>{' '}
                                        {attempt.template?.cargo_type || '—'}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Statuss:</span>{' '}
                                        {attempt.status}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#182219]">Termiņš:</span>{' '}
                                        {attempt.template?.deadline_date || '—'}
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
                                    Šeit tiek parādīts vienkāršots validācijas pārskats no attempt datiem.
                                </p>

                                <div className="mt-5 space-y-3">
                                    <ValidationRow
                                        label="Daudzums atbilst"
                                        value={deliveryQuantityMatch}
                                    />
                                    <ValidationRow
                                        label="Veids atbilst"
                                        value={deliveryTypeMatch}
                                    />
                                    <ValidationRow
                                        label="Kvalitāte atbilstoša"
                                        value={deliveryQualityMatch}
                                    />
                                </div>

                                <div className="mt-5 rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                    <div className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                                        Piezīmes
                                    </div>
                                    <div className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                                        {deliveryNotes}
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
                                        Current step: <strong>{attempt.current_step}</strong>
                                    </p>
                                    <p>
                                        Last update: <strong>{attempt.updated_at || '—'}</strong>
                                    </p>
                                    <p>
                                        Preview result: <strong>{attempt.preview_result ? 'Ir aprēķināts' : 'Nav aprēķināts'}</strong>
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