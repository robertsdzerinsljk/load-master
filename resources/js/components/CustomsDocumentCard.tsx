import { ChevronRight, FileText } from 'lucide-react';

export default function CustomsDocumentCard({
    name,
    description,
    onClick,
}: {
    name: string;
    description: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick} // 👈 ŠIS IR GALVENAIS
            className="flex w-full items-center justify-between rounded-xl border border-[#d9ded9] bg-white px-4 py-4 text-left transition hover:shadow-sm"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8efea]">
                    <FileText className="h-4 w-4 text-[#256c51]" />
                </div>

                <div>
                    <h3 className="text-[16px] font-semibold text-[#162118]">{name}</h3>
                    <p className="mt-1 text-[14px] text-[#58685f]">{description}</p>
                </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[#7a877f]" />
        </button>
    );
}