import { ReactNode } from 'react';
import { getStatusLabel } from './types';

export function StatusBadge({ status }: { status?: string | null }) {
    const current = status ?? 'in_progress';

    const styleMap: Record<string, string> = {
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        reviewed: 'border-violet-200 bg-violet-50 text-violet-700',
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        teacher_testing: 'border-sky-200 bg-sky-50 text-sky-700',
        teacher_test_submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-2 text-[13px] font-semibold ${
                styleMap[current] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {getStatusLabel(current)}
        </span>
    );
}

export function InfoCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4">
            <div className="flex items-center gap-2 text-[13px] uppercase tracking-wide text-[#7a877f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[17px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

export function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                {label}
            </div>
            <div className="mt-2 text-[15px] font-semibold text-[#182219]">{value}</div>
        </div>
    );
}

export function EmptyBlock({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d9ded9] bg-[#f8fbf9] p-5 text-[15px] leading-7 text-[#5b6b61]">
            {text}
        </div>
    );
}

export function PreviewBox({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number | null | undefined;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                <span className="text-[#166a4d]">{icon}</span>
                {label}
            </div>
            <div className="mt-2 text-[17px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}
