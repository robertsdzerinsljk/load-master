import { ChevronRight, Clock3, Package } from 'lucide-react';

type TeacherOrderCardProps = {
    title: string;
    subtitle: string;
    studentName: string;
    status: string;
    date: string;
};

export default function TeacherOrderCard({
    title,
    subtitle,
    studentName,
    status,
    date,
}: TeacherOrderCardProps) {
    return (
        <div className="flex w-full max-w-3xl items-center justify-between rounded-xl border border-[#d9ded9] bg-white px-4 py-4 transition hover:shadow-sm">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8efea]">
                    <Package className="h-4 w-4 text-[#256c51]" />
                </div>

                <div>
                    <h3 className="text-[18px] font-semibold text-[#162118]">
                        {title}
                    </h3>

                    <p className="text-[14px] text-[#58685f]">{subtitle}</p>

                    <p className="text-[13px] text-[#6b7a71]">
                        Students: {studentName}
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                <span className="rounded-full bg-[#dce7ff] px-3 py-1 text-[12px] font-medium text-[#3d67d6]">
                    {status}
                </span>

                <div className="flex items-center gap-1 text-[13px] text-[#627168]">
                    <Clock3 className="h-4 w-4" />
                    <span>{date}</span>
                </div>

                <ChevronRight className="h-5 w-5 text-[#7a877f]" />
            </div>
        </div>
    );
}