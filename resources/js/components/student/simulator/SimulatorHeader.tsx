import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Package,
    ShipWheel,
    Truck,
} from 'lucide-react';
import { Attempt, Template, getStepTitle } from './types';
import { InfoCard, StatusBadge } from './ui';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
    template: Template;
    attempt: Attempt;
    saveState: SaveState;
    lastSavedAt: string | null;
    backHref: string;
    backLabel: string;
    simulatorMode?: 'student' | 'teacher';
};

function formatSavedAt(value: string | null) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat('lv-LV', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function SaveBadge({
    saveState,
    lastSavedAt,
}: {
    saveState: SaveState;
    lastSavedAt: string | null;
}) {
    const timeLabel = formatSavedAt(lastSavedAt);

    if (saveState === 'idle' && !timeLabel) {
        return null;
    }

    const label =
        saveState === 'saving'
            ? 'Saglabā...'
            : saveState === 'error'
              ? 'Saglabāšana neizdevās'
              : timeLabel
                ? `Saglabāts ${timeLabel}`
                : 'Saglabāts';

    const classes =
        saveState === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : saveState === 'saving'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-[#d7e5db] bg-[#f6faf7] text-[#166a4d]';

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold ${classes}`}
        >
            {saveState === 'saved' ? (
                <CheckCircle2 className="h-4 w-4" />
            ) : (
                <Clock3 className="h-4 w-4" />
            )}
            {label}
        </div>
    );
}

export default function SimulatorHeader({
    template,
    attempt,
    saveState,
    lastSavedAt,
    backHref,
    backLabel,
    simulatorMode = 'student',
}: Props) {
    const badgeLabel =
        simulatorMode === 'teacher' ? 'Skolotāja scenārija tests' : 'Loadmaster simulators';

    return (
        <section className="relative overflow-hidden rounded-[30px] border border-[#d9ded9] bg-white p-6 shadow-sm md:p-8">
            <div className="absolute right-0 top-0 hidden h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-[#eef6f0] blur-2xl lg:block" />
            <div className="absolute bottom-0 right-16 hidden h-24 w-24 rounded-full bg-[#f6faf7] blur-2xl lg:block" />

            <div className="relative">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                            <ShipWheel className="h-3.5 w-3.5" />
                            {badgeLabel}
                        </div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#182219] md:text-[36px]">
                            {template.title}
                        </h1>

                        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5f6d65]">
                            {template.student_brief || 'Šim uzdevumam apraksts vēl nav pievienots.'}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <SaveBadge saveState={saveState} lastSavedAt={lastSavedAt} />

                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {backLabel}
                        </Link>

                        <StatusBadge status={attempt.status} />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InfoCard
                        icon={<Package className="h-5 w-5" />}
                        label="Kravas tips"
                        value={template.cargo_name || template.cargo_type || 'Nav norādīts'}
                    />
                    <InfoCard
                        icon={<Truck className="h-5 w-5" />}
                        label="Konteineru skaits"
                        value={
                            template.cargo_amount_containers !== null &&
                            template.cargo_amount_containers !== undefined
                                ? String(template.cargo_amount_containers)
                                : '—'
                        }
                    />
                    <InfoCard
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        label="Pašreizējais solis"
                        value={getStepTitle(attempt.current_step)}
                    />
                </div>
            </div>
        </section>
    );
}
