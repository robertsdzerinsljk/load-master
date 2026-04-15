import { ChevronRight, FileText, Trash2 } from 'lucide-react';

export default function CustomsDocumentCard({
    name,
    description,
    onClick,
    onDelete,
}: {
    name: string;
    description: string;
    onClick?: () => void;
    onDelete?: () => void;
}) {
    return (
        <div className="flex w-full items-center justify-between rounded-xl border border-[#d9ded9] bg-white px-4 py-4 text-left transition hover:shadow-sm">
            <button
                type="button"
                onClick={onClick}
                className="flex min-w-0 flex-1 items-start gap-4 text-left"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8efea]">
                    <FileText className="h-4 w-4 text-[#256c51]" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#162118]">{name}</h3>
                    <p className="mt-1 text-[14px] text-[#58685f]">{description}</p>
                </div>
            </button>

            <div className="ml-4 flex items-center gap-2">
                <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5caca] bg-white text-[#b42318] transition hover:bg-[#fff5f5]"
                    title="Dzēst"
                >
                    <Trash2 className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={onClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d9ded9] bg-white text-[#7a877f] transition hover:bg-[#f8faf8]"
                    title="Atvērt"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}