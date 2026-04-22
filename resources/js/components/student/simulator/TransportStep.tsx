import { ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import { NamedItem } from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    transports: NamedItem[];
    selectedTransportId: string;
    setSelectedTransportId: (value: string) => void;
    vehicleCount: number;
    setVehicleCount: (value: number) => void;
    selectedTransport: NamedItem | null;
    loading: boolean;
    onSave: () => void;
};

export default function TransportStep({
    stepNumber = 1,
    transports,
    selectedTransportId,
    setSelectedTransportId,
    vehicleCount,
    setVehicleCount,
    selectedTransport,
    loading,
    onSave,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Truck className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>
                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Transporta izvēle
                </h2>
                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies transporta veidu un norādi, cik transporta vienības plāno izmantot.
                </p>
            </div>

            <div className="mt-5 grid gap-3">
                {transports.length > 0 ? (
                    transports.map((item) => {
                        const active = selectedTransportId === String(item.id);

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
                                        name="transport"
                                        value={item.id}
                                        checked={selectedTransportId === String(item.id)}
                                        onChange={(e) => setSelectedTransportId(e.target.value)}
                                        className="mt-1"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[17px] font-semibold text-[#182219]">
                                                {item.name}
                                            </div>

                                            {active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#166a4d] px-2.5 py-1 text-[12px] font-semibold text-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Izvēlēts
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                            {item.type || 'Transporta tips nav norādīts.'}
                                        </div>
                                    </div>
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <EmptyBlock text="Šim uzdevumam vēl nav pievienotu transporta variantu." />
                )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[240px_1fr]">
                <div>
                    <label className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                        Transportu skaits
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={10000}
                        value={vehicleCount}
                        onChange={(e) => setVehicleCount(Math.max(1, Number(e.target.value) || 1))}
                        className="mt-2 w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none transition focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                    />
                </div>

                <div className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4 text-[14px] leading-6 text-[#4d5d53]">
                    Norādi, cik transporta vienības plāno izmantot šī uzdevuma izpildei. Šis skaits tiks izmantots preview aprēķinos.
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={loading || !selectedTransportId || vehicleCount < 1}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Saglabāt transporta izvēli
                    <ArrowRight className="h-4 w-4" />
                </button>

                <span className="text-[14px] text-[#6f7b74]">
                    {selectedTransport
                        ? `Aktīvi izvēlēts: ${selectedTransport.name}`
                        : 'Transports vēl nav izvēlēts'}
                </span>
            </div>
        </section>
    );
}
