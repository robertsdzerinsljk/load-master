import { ArrowRight, CheckCircle2, MapPinned, Route as RouteIcon } from 'lucide-react';
import { RouteItem, routeName } from './types';
import { EmptyBlock } from './ui';

type Props = {
    routes: RouteItem[];
    selectedRouteId: string;
    setSelectedRouteId: (value: string) => void;
    selectedRoute: RouteItem | null;
    loading: boolean;
    canGoRoute: boolean;
    onSave: () => void;
};

export default function RouteStep({
    routes,
    selectedRouteId,
    setSelectedRouteId,
    selectedRoute,
    loading,
    canGoRoute,
    onSave,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <MapPinned className="h-3.5 w-3.5" />
                    2. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Maršruta izvēle
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies sauszemes maršrutu, pa kuru krava tiks nogādāta līdz nākamajam posmam.
                </p>
            </div>

            <div className="mt-5 grid gap-3">
                {routes.length > 0 ? (
                    routes.map((item) => {
                        const active = selectedRouteId === String(item.id);

                        return (
                            <label
                                key={item.id}
                                className={`cursor-pointer rounded-2xl border p-4 transition ${
                                    active
                                        ? 'border-[#166a4d] bg-[#edf6f0]'
                                        : 'border-[#d9ded9] bg-[#f8faf8] hover:border-[#bfd2c5] hover:bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="route"
                                        value={item.id}
                                        checked={selectedRouteId === String(item.id)}
                                        onChange={(e) => setSelectedRouteId(e.target.value)}
                                        className="mt-1"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[17px] font-semibold text-[#182219]">
                                                {routeName(item, 'from')} → {routeName(item, 'to')}
                                            </div>

                                            {active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#166a4d] px-2.5 py-1 text-[12px] font-semibold text-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Izvēlēts
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                            <RouteIcon className="h-4 w-4 text-[#166a4d]" />
                                            Attālums: {item.distance_km ?? '—'} km
                                        </div>
                                    </div>
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <EmptyBlock text="Šim uzdevumam vēl nav pievienotu maršruta variantu." />
                )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={loading || !canGoRoute || !selectedRouteId}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Saglabāt maršruta izvēli
                    <ArrowRight className="h-4 w-4" />
                </button>

                <span className="text-[14px] text-[#6f7b74]">
                    {selectedRoute
                        ? `Aktīvi izvēlēts: ${routeName(selectedRoute, 'from')} → ${routeName(selectedRoute, 'to')}`
                        : 'Maršruts vēl nav izvēlēts'}
                </span>
            </div>
        </section>
    );
}