import { Anchor, CheckCircle2, MapPin, Waves } from 'lucide-react';
import { PortItem } from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    ports: PortItem[];
    selectedPortId: string;
    setSelectedPortId: (value: string) => void;
    loading: boolean;
};

function formatDepth(value?: string | number | null) {
    if (value === null || value === undefined || value === '') return '—';
    return `${value} m`;
}

export default function PortSelectionStep({
    stepNumber = 5,
    ports,
    selectedPortId,
    setSelectedPortId,
    loading,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Anchor className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Ostas izvēle
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies ostu, uz kuru plānots nogādāt kravu tālākai iekraušanai kuģī.
                </p>
            </div>

            <div className="mt-5 grid gap-3">
                {ports.length > 0 ? (
                    ports.map((port) => {
                        const active = selectedPortId === String(port.id);

                        return (
                            <label
                                key={port.id}
                                className={`cursor-pointer rounded-2xl border p-4 transition ${
                                    active
                                        ? 'border-[#166a4d] bg-[#edf6f0]'
                                        : 'border-[#d9ded9] bg-[#f8faf8] hover:border-[#bfd2c5] hover:bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="port"
                                        value={port.id}
                                        checked={selectedPortId === String(port.id)}
                                        onChange={(e) => setSelectedPortId(e.target.value)}
                                        disabled={loading}
                                        className="mt-1"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[17px] font-semibold text-[#182219]">
                                                {port.name}
                                            </div>

                                            {active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#166a4d] px-2.5 py-1 text-[12px] font-semibold text-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Izvēlēta
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-2.5 py-1 text-[12px] font-medium text-[#166a4d]">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {port.location_name || 'Atrašanās vieta nav norādīta'}
                                            </span>

                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e4] bg-white px-2.5 py-1 text-[12px] font-medium text-[#425247]">
                                                <Waves className="h-3.5 w-3.5" />
                                                Dziļums: {formatDepth((port as any).depth_value ?? port.depth_m)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <EmptyBlock text="Šim uzdevumam nav pieejamu ostu." />
                )}
            </div>
        </section>
    );
}
