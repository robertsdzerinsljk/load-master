import { ChevronRight, Snowflake, Truck } from 'lucide-react';

type TransportPresetCardProps = {
    name: string;
    description: string;
    capacity: string;
    temperatureSupport?: string;
    onClick?: () => void;
};

export default function TransportPresetCard({
    name,
    description,
    capacity,
    temperatureSupport,
    onClick,
}: TransportPresetCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-between rounded-2xl border border-[#d9ded9] bg-white p-5 text-left transition hover:border-[#c7d1ca] hover:shadow-sm"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ef]">
                    <Truck className="h-5 w-5 text-[#166a4d]" />
                </div>

                <div>
                    <h3 className="text-[16px] font-semibold text-[#182219]">{name}</h3>
                    <p className="mt-1 text-[15px] text-[#5b6b61]">{description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-[#6b7a71]">
                        <span>Ietilpība: {capacity}</span>

                        {temperatureSupport && (
                            <span className="inline-flex items-center gap-1">
                                <Snowflake className="h-3.5 w-3.5" />
                                {temperatureSupport}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[#7a877f]" />
        </button>
    );
}