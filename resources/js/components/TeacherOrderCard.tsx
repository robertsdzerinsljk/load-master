import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    Package,
    User,
    MapPin,
} from 'lucide-react';

type Props = {
    title: string;
    subtitle?: string;
    studentName?: string;
    status: string;
    date?: string;
    progress?: number;
};

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Jauns: 'bg-[#dce7ff] text-[#3d67d6]',
        Pārskatāms: 'bg-[#fff7e6] text-[#b7791f]',
        Apstiprināts: 'bg-[#e7f7ee] text-[#1f8f5f]',
        Noraidīts: 'bg-[#fdecec] text-[#c94b4b]',
        'Nav sākts': 'bg-[#f3f4f6] text-[#4b5563]',
        Procesā: 'bg-[#fff7ed] text-[#c2410c]',
        Iesniegts: 'bg-[#ecfdf3] text-[#166534]',
        Nokavēts: 'bg-[#fef2f2] text-[#b91c1c]',
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                styles[status] ?? 'bg-gray-100 text-gray-700'
            }`}
        >
            {status}
        </span>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === 'Iesniegts' || status === 'Apstiprināts') {
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (status === 'Nokavēts') {
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }

    if (status === 'Procesā') {
        return <Clock className="h-5 w-5 text-orange-500" />;
    }

    return <Package className="h-5 w-5 text-gray-500" />;
}

function ProgressTone(progress: number) {
    if (progress >= 100) return 'bg-[#166534]';
    if (progress >= 50) return 'bg-[#166a4d]';
    if (progress > 0) return 'bg-[#d97706]';
    return 'bg-[#9ca3af]';
}

function DeadlineHint({ status }: { status: string }) {
    if (status === 'Nokavēts') {
        return (
            <span className="font-medium text-red-600">
                Nokavēts
            </span>
        );
    }

    if (status === 'Procesā') {
        return (
            <span className="font-medium text-orange-600">
                Tuvs termiņš
            </span>
        );
    }

    if (status === 'Iesniegts') {
        return (
            <span className="font-medium text-green-600">
                Iesniegts laikā
            </span>
        );
    }

    return null;
}

export default function TeacherOrderCard({
    title,
    subtitle,
    studentName,
    status,
    date,
    progress,
}: Props) {
    const safeProgress =
        typeof progress === 'number'
            ? Math.max(0, Math.min(progress, 100))
            : undefined;

    return (
        <div className="group cursor-pointer rounded-2xl border border-[#d9ded9] bg-white p-5 shadow-sm transition hover:border-[#c8d3cd] hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <StatusIcon status={status} />
                    </div>

                    <div>
                        <h3 className="text-[16px] font-semibold text-[#182219] transition group-hover:text-[#166a4d]">
                            {title}
                        </h3>

                        {subtitle && (
                            <div className="mt-1 flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                <MapPin className="h-4 w-4 text-[#7a877f]" />
                                <span>{subtitle}</span>
                            </div>
                        )}

                        {studentName && (
                            <div className="mt-2 flex items-center gap-2 text-[13px] text-[#7a877f]">
                                <User className="h-4 w-4" />
                                <span>{studentName}</span>
                            </div>
                        )}
                    </div>
                </div>

                <StatusBadge status={status} />
            </div>

            {typeof safeProgress === 'number' && (
                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-[13px] text-[#7a877f]">
                        <span>Izpildes progress</span>
                        <span className="font-medium text-[#182219]">{safeProgress}%</span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e8efea]">
                        <div
                            className={`h-full rounded-full transition-all ${ProgressTone(safeProgress)}`}
                            style={{ width: `${safeProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {date && (
                <div className="mt-4 flex items-center justify-between text-[13px] text-[#7a877f]">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{date}</span>
                    </div>

                    <DeadlineHint status={status} />
                </div>
            )}
        </div>
    );
}