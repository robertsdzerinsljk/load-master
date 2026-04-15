import { ChevronRight, Snowflake, Trash2, Truck } from 'lucide-react';

type TransportPresetCardProps = {
    name: string;
    type?: string;
    description: string;
    capacity: string;
    temperatureSupport?: string;
    capacityContainers?: string | number | null;
    capacityTons?: string | number | null;
    avgSpeedKmh?: string | number | null;
    costPerKm?: string | number | null;
    loadingTimeMinutes?: string | number | null;
    unloadingTimeMinutes?: string | number | null;
    onClick?: () => void;
    onDelete?: () => void;
};

export default function TransportPresetCard({
    name,
    type,
    description,
    capacity,
    temperatureSupport,
    capacityContainers,
    capacityTons,
    avgSpeedKmh,
    costPerKm,
    loadingTimeMinutes,
    unloadingTimeMinutes,
    onClick,
    onDelete,
}: TransportPresetCardProps) {
    const typeLabelMap: Record<string, string> = {
        truck: 'Kravas auto',
        train: 'Vilciens',
        van: 'Furgons',
        tank_truck: 'Cisterna',
        reefer_truck: 'Refrižerators',
    };

    const typeLabel = type ? typeLabelMap[type] ?? type : 'Tips nav norādīts';

    return (
        <div className="flex w-full items-center justify-between rounded-2xl border border-[#d9ded9] bg-white p-5 text-left transition hover:border-[#c7d1ca] hover:shadow-sm">
            <button
                type="button"
                onClick={onClick}
                className="flex min-w-0 flex-1 items-start gap-4 text-left"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ef]">
                    <Truck className="h-5 w-5 text-[#166a4d]" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#182219]">{name}</h3>
                    <p className="mt-1 text-[15px] text-[#5b6b61]">{typeLabel}</p>
                    <p className="mt-2 text-[15px] text-[#5b6b61]">{description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-[#6b7a71]">
                        <span>Ietilpība: {capacity}</span>

                        {capacityContainers !== null && capacityContainers !== undefined && (
                            <span>Konteineri: {capacityContainers}</span>
                        )}

                        {capacityTons !== null && capacityTons !== undefined && (
                            <span>Tonnas: {capacityTons}</span>
                        )}

                        {avgSpeedKmh !== null && avgSpeedKmh !== undefined && (
                            <span>Ātrums: {avgSpeedKmh} km/h</span>
                        )}

                        {costPerKm !== null && costPerKm !== undefined && (
                            <span>Izmaksas/km: {costPerKm}</span>
                        )}

                        {loadingTimeMinutes !== null && loadingTimeMinutes !== undefined && (
                            <span>Iekraušana: {loadingTimeMinutes} min</span>
                        )}

                        {unloadingTimeMinutes !== null &&
                            unloadingTimeMinutes !== undefined && (
                                <span>Izkraušana: {unloadingTimeMinutes} min</span>
                            )}

                        {temperatureSupport && (
                            <span className="inline-flex items-center gap-1">
                                <Snowflake className="h-3.5 w-3.5" />
                                {temperatureSupport}
                            </span>
                        )}
                    </div>
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