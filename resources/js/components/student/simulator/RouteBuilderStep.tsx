import { Plus, Route as RouteIcon, Trash2 } from 'lucide-react';
import { RouteItem, routeName } from './types';
import { EmptyBlock } from './ui';

type Props = {
    availableSegments: RouteItem[];
    selectedSegments: RouteItem[];
    loading: boolean;
    onAddSegment: (segmentId: number) => void;
    onRemoveSegment: (segmentId: number) => void;
};

export default function RouteBuilderStep({
    availableSegments,
    selectedSegments,
    loading,
    onAddSegment,
    onRemoveSegment,
}: Props) {
    const totalDistance = selectedSegments.reduce((sum, segment) => {
        return sum + Number(segment.distance_km ?? 0);
    }, 0);

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <RouteIcon className="h-3.5 w-3.5" />
                    3. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Maršruta veidošana
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies maršruta segmentus un saliec tos secībā, lai izveidotu pilnu piegādes ķēdi.
                </p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                    <h3 className="text-[18px] font-semibold text-[#182219]">
                        Pieejamie segmenti
                    </h3>

                    <div className="mt-4 space-y-3">
                        {availableSegments.length > 0 ? (
                            availableSegments.map((segment) => (
                                <div
                                    key={segment.id}
                                    className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[16px] font-semibold text-[#182219]">
                                                {routeName(segment, 'from')} → {routeName(segment, 'to')}
                                            </div>
                                            <div className="mt-2 text-[14px] text-[#5b6b61]">
                                                Attālums: {segment.distance_km ?? '—'} km
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onAddSegment(segment.id)}
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-3 py-2 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:opacity-60"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Pievienot
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text="Nav pieejamu maršruta segmentu." />
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-[18px] font-semibold text-[#182219]">
                        Izveidotais maršruts
                    </h3>

                    <div className="mt-4 space-y-3">
                        {selectedSegments.length > 0 ? (
                            selectedSegments.map((segment, index) => (
                                <div
                                    key={`${segment.id}-${index}`}
                                    className="rounded-2xl border border-[#d9ded9] bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                                Posms {index + 1}
                                            </div>
                                            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                                {routeName(segment, 'from')} → {routeName(segment, 'to')}
                                            </div>
                                            <div className="mt-2 text-[14px] text-[#5b6b61]">
                                                Attālums: {segment.distance_km ?? '—'} km
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveSegment(segment.id)}
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-60"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Dzēst
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text="Maršruts vēl nav izveidots." />
                        )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                            Kopsavilkums
                        </div>
                        <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                            Segmenti: {selectedSegments.length}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-[#182219]">
                            Kopējais attālums: {totalDistance} km
                        </div>
                    </div>

                    
                </div>
            </div>
        </section>
    );
}