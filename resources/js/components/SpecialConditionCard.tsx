import { AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';

type SpecialConditionPresetCardProps = {
    name: string;
    description: string;
    onClick?: () => void;
    onDelete?: () => void;
};

export default function SpecialConditionPresetCard({
    name,
    description,
    onClick,
    onDelete,
}: SpecialConditionPresetCardProps) {
    return (
        <div className="flex w-full items-center justify-between rounded-2xl border border-[#d9ded9] bg-white p-5 text-left transition hover:border-[#c7d1ca] hover:shadow-sm">
            <button
                type="button"
                onClick={onClick}
                className="flex min-w-0 flex-1 items-start gap-4 text-left"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ef]">
                    <AlertTriangle className="h-5 w-5 text-[#166a4d]" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#182219]">{name}</h3>
                    <p className="mt-1 text-[15px] text-[#5b6b61]">{description}</p>
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