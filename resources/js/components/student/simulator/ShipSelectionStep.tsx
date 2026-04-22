import { CheckCircle2, Container, Ship, Waves } from 'lucide-react';
import { ShipItem } from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    ships: ShipItem[];
    selectedShipId: string;
    setSelectedShipId: (value: string) => void;
    loading: boolean;
};

function formatDraft(value?: string | number | null) {
    if (value === null || value === undefined || value === '') return '—';
    return `${value} m`;
}

function formatContainers(value?: string | number | null) {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
}

export default function ShipSelectionStep({
    stepNumber = 6,
    ships,
    selectedShipId,
    setSelectedShipId,
    loading,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Ship className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Kuģa izvēle
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies kuģi un pārliecinies, ka tas ir saderīgs ar izvēlēto ostu un kravas apjomu.
                </p>
            </div>

            <div className="mt-5 grid gap-3">
                {ships.length > 0 ? (
                    ships.map((ship) => {
                        const active = selectedShipId === String(ship.id);

                        return (
                            <label
                                key={ship.id}
                                className={`cursor-pointer rounded-2xl border p-4 transition ${
                                    active
                                        ? 'border-[#166a4d] bg-[#edf6f0]'
                                        : 'border-[#d9ded9] bg-[#f8faf8] hover:border-[#bfd2c5] hover:bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="ship"
                                        value={ship.id}
                                        checked={selectedShipId === String(ship.id)}
                                        onChange={(e) => setSelectedShipId(e.target.value)}
                                        disabled={loading}
                                        className="mt-1"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[17px] font-semibold text-[#182219]">
                                                    {ship.name}
                                                </div>
                                                <div className="mt-1 text-[14px] text-[#5b6b61]">
                                                    {ship.ship_type || 'Kuģa tips nav norādīts'}
                                                </div>
                                            </div>

                                            {active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#166a4d] px-2.5 py-1 text-[12px] font-semibold text-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Izvēlēts
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e4] bg-white px-2.5 py-1 text-[12px] font-medium text-[#425247]">
                                                <Waves className="h-3.5 w-3.5" />
                                                Iegrimums: {formatDraft((ship as any).draft_value ?? ship.draft_m)}
                                            </span>

                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-2.5 py-1 text-[12px] font-medium text-[#166a4d]">
                                                <Container className="h-3.5 w-3.5" />
                                                Ietilpība: {formatContainers((ship as any).capacity_containers_value ?? ship.capacity_containers)} konteineri
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <EmptyBlock text="Šim uzdevumam nav pieejamu kuģu." />
                )}
            </div>
        </section>
    );
}
