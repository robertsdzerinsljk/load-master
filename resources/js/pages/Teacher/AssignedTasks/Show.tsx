import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherOrderTabs from '@/components/TeacherOrderTabs';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileText,
    Package,
    ShieldCheck,
    Truck,
    UserRound,
    BookOpenText,
    Thermometer,
    TriangleAlert,
    Box,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type TeacherOrderTabKey = 'overview' | 'feedback' | 'delivery';

type AttemptPageProps = {
    attempt: {
        id: number;
        status: string;
        current_step: string;
        submitted_at?: string | null;
        updated_at?: string | null;
        preview_result?: {
            message?: string | null;
            [key: string]: any;
        } | null;
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

function formatDate(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatShortDate(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = '/teacher';
}

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        in_progress: 'Procesā',
        submitted: 'Iesniegts',
        draft: 'Melnraksts',
        reviewed: 'Pārskatīts',
    };

    const styles: Record<string, string> = {
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        reviewed: 'border-blue-200 bg-blue-50 text-blue-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {labelMap[status] ?? status}
        </span>
    );
}

function SectionCard({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4 border-b border-[#eef1ee] pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                    {icon}
                </div>

                <div>
                    <h2 className="text-[22px] font-semibold tracking-tight text-[#182219]">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">{description}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

function InfoCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold leading-6 text-[#182219]">{value}</div>
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
        Jā: 'border-green-200 bg-green-50 text-green-700',
        Nē: 'border-red-200 bg-red-50 text-red-700',
        Daļēji: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e4e9e4] bg-white px-4 py-4">
            <span className="text-[15px] font-medium text-[#182219]">{label}</span>
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                    styles[value]
                }`}
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
        const className = attempt.student?.class_name ? ` • ${attempt.student.class_name}` : '';
        return `${name}${className}`;
    }, [attempt.student]);

    const summary =
        attempt.template?.description ||
        attempt.template?.student_brief ||
        'Apraksts nav pievienots.';

    const transportRequirements = attempt.template?.transport_names?.length
        ? attempt.template.transport_names.join(', ')
        : 'Nav norādīts';

    const customsDocuments = attempt.template?.special_condition || 'Nav norādīts';
    const temperatureRequirements = attempt.template?.temperature_mode || 'Nav norādīts';

    const deliveryQuantityMatch = attempt.derived?.delivery_quantity_match || 'Daļēji';
    const deliveryTypeMatch = attempt.derived?.delivery_type_match || 'Daļēji';
    const deliveryQualityMatch = attempt.derived?.delivery_quality_match || 'Daļēji';

    const deliveryNotes =
        attempt.preview_result?.message ||
        (attempt.status === 'submitted'
            ? 'Students ir iesniedzis risinājumu. Var veikt pārskatīšanu.'
            : 'Students vēl turpina darbu pie uzdevuma.');

    const cargoName = attempt.template?.cargo_name || 'Nav norādīts';
    const cargoType = attempt.template?.cargo_type || 'Nav norādīts';

    const quantityLabel = [
        attempt.template?.cargo_amount_containers
            ? `${attempt.template.cargo_amount_containers} konteineri`
            : null,
        attempt.template?.cargo_amount_tons ? `${attempt.template.cargo_amount_tons} t` : null,
    ]
        .filter(Boolean)
        .join(' • ') || 'Nav norādīts';

    return (
        <>
            <Head title="Piešķirtā uzdevuma detaļas" />

            <TeacherLayout active="orders">
                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5f6f65] transition hover:text-[#182219]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ
                    </button>

                    <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
                        <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
                        <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#166a4d]">
                                        <ClipboardCheck className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#182219] md:text-[34px]">
                                                {title}
                                            </h1>
                                            <StatusBadge status={attempt.status} />
                                        </div>

                                        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#5b6b61]">
                                            {summary}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <InfoCard
                                        label="Students"
                                        value={studentLabel}
                                        icon={<UserRound className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Solis"
                                        value={attempt.current_step || 'Nav norādīts'}
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Iesniegts"
                                        value={formatDate(attempt.submitted_at)}
                                        icon={<CalendarDays className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Atjaunots"
                                        value={formatDate(attempt.updated_at)}
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                </div>
                            </div>

                            <div className="grid min-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[320px] xl:max-w-[360px] xl:grid-cols-1">
                                <div className="rounded-2xl border border-[#e3ebe5] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <Package className="h-4 w-4 text-[#166a4d]" />
                                        Krava
                                    </div>
                                    <div className="mt-2 text-[18px] font-semibold text-[#182219]">
                                        {cargoName}
                                    </div>
                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                        {cargoType} • {quantityLabel}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#e3ebe5] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <Truck className="h-4 w-4 text-[#166a4d]" />
                                        Pārvadājums
                                    </div>
                                    <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                        {transportRequirements}
                                    </div>
                                    <div className="mt-1 text-[14px] text-[#5b6b61]">
                                        Temperatūra: {temperatureRequirements}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="rounded-[24px] border border-[#d9ded9] bg-white p-2 shadow-sm">
                        <TeacherOrderTabs active={activeTab} onChange={setActiveTab} />
                    </div>

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <SectionCard
                                title="Uzdevuma pārskats"
                                description="Galvenā informācija par piešķirto uzdevumu un studenta izpildes kontekstu."
                                icon={<BookOpenText className="h-5 w-5" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoCard
                                        label="Kravas nosaukums"
                                        value={cargoName}
                                        icon={<Box className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Kravas veids"
                                        value={cargoType}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Daudzums"
                                        value={quantityLabel}
                                        icon={<Package className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Termiņš"
                                        value={formatShortDate(attempt.template?.deadline_date)}
                                        icon={<CalendarDays className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Temperatūras režīms"
                                        value={temperatureRequirements}
                                        icon={<Thermometer className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Speciālie nosacījumi"
                                        value={customsDocuments}
                                        icon={<ShieldCheck className="h-4 w-4" />}
                                    />
                                </div>

                                <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                        <FileText className="h-4 w-4 text-[#166a4d]" />
                                        Studenta uzdevuma apraksts
                                    </div>
                                    <p className="mt-3 text-[15px] leading-7 text-[#425247]">
                                        {summary}
                                    </p>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Izpildes statuss"
                                description="Ātrs pārskats par iesnieguma stāvokli un sistēmas ģenerēto paziņojumu."
                                icon={<CheckCircle2 className="h-5 w-5" />}
                            >
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                        <div className="text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                            Statuss
                                        </div>
                                        <div className="mt-3">
                                            <StatusBadge status={attempt.status} />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                        <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-[#7b887f]">
                                            <TriangleAlert className="h-4 w-4 text-[#166a4d]" />
                                            Sistēmas piezīme
                                        </div>
                                        <p className="mt-3 text-[15px] leading-7 text-[#425247]">
                                            {deliveryNotes}
                                        </p>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.7fr]">
                            <SectionCard
                                title="Pasniedzēja atsauksme"
                                description="Šeit vari pierakstīt komentārus par studenta risinājumu. Šī ir galvenā vieta atsauksmju ievadei."
                                icon={<FileText className="h-5 w-5" />}
                            >
                                <div>
                                    <label className="mb-2 block text-[14px] font-medium text-[#182219]">
                                        Atsauksmes teksts
                                    </label>

                                    <textarea
                                        rows={10}
                                        value={feedback}
                                        onChange={(e) => {
                                            setFeedback(e.target.value);
                                            if (feedbackSaved) {
                                                setFeedbackSaved(false);
                                            }
                                        }}
                                        placeholder="Ieraksti komentāru par studenta pieeju, kļūdām, stiprajām pusēm vai ieteikumiem uzlabojumiem..."
                                        className="w-full rounded-2xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none transition placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                                    />

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFeedbackSaved(true)}
                                            className="rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                                        >
                                            Saglabāt atsauksmi
                                        </button>

                                        {feedbackSaved ? (
                                            <span className="text-[14px] font-medium text-[#166a4d]">
                                                Atsauksme saglabāta lokāli šajā skatā.
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Atsauksmes konteksts"
                                description="Svarīgākā informācija, ko redzēt rakstot komentāru."
                                icon={<ClipboardCheck className="h-5 w-5" />}
                            >
                                <div className="space-y-4">
                                    <InfoCard
                                        label="Students"
                                        value={studentLabel}
                                        icon={<UserRound className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Uzdevums"
                                        value={title}
                                        icon={<ClipboardCheck className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Statuss"
                                        value={
                                            {
                                                in_progress: 'Procesā',
                                                submitted: 'Iesniegts',
                                                draft: 'Melnraksts',
                                                reviewed: 'Pārskatīts',
                                            }[attempt.status] ?? attempt.status
                                        }
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Pēdējais atjauninājums"
                                        value={formatDate(attempt.updated_at)}
                                        icon={<Clock3 className="h-4 w-4" />}
                                    />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
                            <SectionCard
                                title="Piegādes validācija"
                                description="Vienkāršots pārskats par to, vai iesniegtais risinājums atbilst galvenajiem uzdevuma kritērijiem."
                                icon={<Truck className="h-5 w-5" />}
                            >
                                <div className="space-y-3">
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
                            </SectionCard>

                            <SectionCard
                                title="Piegādes piezīme"
                                description="Sistēmas vai pasniedzēja īss skaidrojums par piegādes rezultātu."
                                icon={<ShieldCheck className="h-5 w-5" />}
                            >
                                <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                                    <p className="text-[15px] leading-7 text-[#425247]">
                                        {deliveryNotes}
                                    </p>
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </div>
            </TeacherLayout>
        </>
    );
}