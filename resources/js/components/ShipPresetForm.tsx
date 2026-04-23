import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type HandlingMethodOption = {
    id: number;
    name: string;
    code: string;
    category?: string | null;
};

type HandlingMethodState = {
    code: string;
    name: string;
    enabled: boolean;
    is_loading: boolean;
    is_unloading: boolean;
    throughput_override_containers_per_hour: string;
    throughput_override_tons_per_hour: string;
    notes: string;
};

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        cargo_type?: string | null;
        cargo_mode?: string | null;
        is_open_cargo?: boolean | null;
        is_closed_cargo?: boolean | null;
        supports_bulk?: boolean | null;
        supports_container?: boolean | null;
        supports_liquid?: boolean | null;
        supports_refrigerated?: boolean | null;
        supports_hazardous?: boolean | null;
        has_onboard_crane?: boolean | null;
        capacity_containers?: string | number | null;
        capacity_tons?: string | number | null;
        draft_m?: string | number | null;
        fuel_consumption_per_hour?: string | number | null;
        speed_kmh?: string | number | null;
        loading_capacity_containers_per_hour?: string | number | null;
        loading_capacity_tons_per_hour?: string | number | null;
        notes?: string | null;
        handling_methods?: Array<{
            code: string;
            is_loading?: boolean | null;
            is_unloading?: boolean | null;
            throughput_override_containers_per_hour?: string | number | null;
            throughput_override_tons_per_hour?: string | number | null;
            notes?: string | null;
        }>;
    };
    isEdit?: boolean;
    id?: number;
};

const cargoModeOptions = [
    { value: 'containerized', label: 'Containerized' },
    { value: 'bulk', label: 'Bulk' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'palletized', label: 'Palletized' },
    { value: 'break_bulk', label: 'Break bulk' },
];

export default function ShipPresetForm({
    submitLabel = 'Save ship',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{
        props: {
            handlingMethods?: HandlingMethodOption[];
            errors?: Record<string, string>;
        };
    }>();
    const handlingMethodOptions = page.props.handlingMethods ?? [];
    const errors = page.props.errors ?? {};

    const [name, setName] = useState(initialData.name || '');
    const [cargoType, setCargoType] = useState(initialData.cargo_type || '');
    const [cargoMode, setCargoMode] = useState(initialData.cargo_mode || '');
    const [isOpenCargo, setIsOpenCargo] = useState(
        Boolean(initialData.is_open_cargo ?? false),
    );
    const [isClosedCargo, setIsClosedCargo] = useState(
        Boolean(initialData.is_closed_cargo ?? false),
    );
    const [supportsBulk, setSupportsBulk] = useState(
        Boolean(initialData.supports_bulk ?? false),
    );
    const [supportsContainer, setSupportsContainer] = useState(
        Boolean(initialData.supports_container ?? false),
    );
    const [supportsLiquid, setSupportsLiquid] = useState(
        Boolean(initialData.supports_liquid ?? false),
    );
    const [supportsRefrigerated, setSupportsRefrigerated] = useState(
        Boolean(initialData.supports_refrigerated ?? false),
    );
    const [supportsHazardous, setSupportsHazardous] = useState(
        Boolean(initialData.supports_hazardous ?? false),
    );
    const [hasOnboardCrane, setHasOnboardCrane] = useState(
        Boolean(initialData.has_onboard_crane ?? false),
    );
    const [capacityContainers, setCapacityContainers] = useState(
        String(initialData.capacity_containers ?? ''),
    );
    const [capacityTons, setCapacityTons] = useState(
        String(initialData.capacity_tons ?? ''),
    );
    const [draft, setDraft] = useState(String(initialData.draft_m ?? ''));
    const [fuelConsumption, setFuelConsumption] = useState(
        String(initialData.fuel_consumption_per_hour ?? ''),
    );
    const [speedKmh, setSpeedKmh] = useState(
        String(initialData.speed_kmh ?? ''),
    );
    const [loadingContainers, setLoadingContainers] = useState(
        String(initialData.loading_capacity_containers_per_hour ?? ''),
    );
    const [loadingTons, setLoadingTons] = useState(
        String(initialData.loading_capacity_tons_per_hour ?? ''),
    );
    const [notes, setNotes] = useState(initialData.notes || '');

    const handlingMethods = useMemo<HandlingMethodState[]>(() => {
        const configured = new Map(
            (initialData.handling_methods ?? []).map((method) => [
                method.code,
                method,
            ]),
        );

        return handlingMethodOptions.map((method) => {
            const current = configured.get(method.code);

            return {
                code: method.code,
                name: method.name,
                enabled: !!current,
                is_loading: current?.is_loading ?? true,
                is_unloading: current?.is_unloading ?? true,
                throughput_override_containers_per_hour: String(
                    current?.throughput_override_containers_per_hour ?? '',
                ),
                throughput_override_tons_per_hour: String(
                    current?.throughput_override_tons_per_hour ?? '',
                ),
                notes: current?.notes ?? '',
            };
        });
    }, [handlingMethodOptions, initialData.handling_methods]);

    const [handlingStates, setHandlingStates] = useState(handlingMethods);

    const updateHandlingState = (
        code: string,
        updates: Partial<HandlingMethodState>,
    ) => {
        setHandlingStates((current) =>
            current.map((item) =>
                item.code === code ? { ...item, ...updates } : item,
            ),
        );
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            name,
            cargo_type: cargoType || null,
            cargo_mode: cargoMode || null,
            is_open_cargo: isOpenCargo,
            is_closed_cargo: isClosedCargo,
            supports_bulk: supportsBulk,
            supports_container: supportsContainer,
            supports_liquid: supportsLiquid,
            supports_refrigerated: supportsRefrigerated,
            supports_hazardous: supportsHazardous,
            has_onboard_crane: hasOnboardCrane,
            capacity_containers:
                capacityContainers === '' ? null : Number(capacityContainers),
            capacity_tons: capacityTons === '' ? null : Number(capacityTons),
            draft_m: draft === '' ? null : Number(draft),
            fuel_consumption_per_hour:
                fuelConsumption === '' ? null : Number(fuelConsumption),
            speed_kmh: speedKmh === '' ? null : Number(speedKmh),
            loading_capacity_containers_per_hour:
                loadingContainers === '' ? null : Number(loadingContainers),
            loading_capacity_tons_per_hour:
                loadingTons === '' ? null : Number(loadingTons),
            notes: notes || null,
            handling_methods: handlingStates.map((method) => ({
                code: method.code,
                enabled: method.enabled,
                is_loading: method.is_loading,
                is_unloading: method.is_unloading,
                throughput_override_containers_per_hour:
                    method.throughput_override_containers_per_hour === ''
                        ? null
                        : Number(method.throughput_override_containers_per_hour),
                throughput_override_tons_per_hour:
                    method.throughput_override_tons_per_hour === ''
                        ? null
                        : Number(method.throughput_override_tons_per_hour),
                notes: method.notes || null,
            })),
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/ships/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/ships', payload);
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-[24px] border border-[#d9ded9] bg-white p-6 shadow-sm"
        >
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Ship name" error={errors.name}>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        className={inputClass}
                        placeholder="Baltic Carrier"
                    />
                </Field>

                <Field label="Cargo type" error={errors.cargo_type}>
                    <input
                        type="text"
                        value={cargoType}
                        onChange={(event) => setCargoType(event.target.value)}
                        className={inputClass}
                        placeholder="Container cargo"
                    />
                </Field>

                <Field label="Cargo mode" error={errors.cargo_mode}>
                    <select
                        value={cargoMode}
                        onChange={(event) => setCargoMode(event.target.value)}
                        className={inputClass}
                    >
                        <option value="">None</option>
                        {cargoModeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Draft m" error={errors.draft_m}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        className={inputClass}
                        placeholder="7.20"
                    />
                </Field>

                <Field label="Container capacity" error={errors.capacity_containers}>
                    <input
                        type="number"
                        min="0"
                        value={capacityContainers}
                        onChange={(event) => setCapacityContainers(event.target.value)}
                        className={inputClass}
                        placeholder="500"
                    />
                </Field>

                <Field label="Ton capacity" error={errors.capacity_tons}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={capacityTons}
                        onChange={(event) => setCapacityTons(event.target.value)}
                        className={inputClass}
                        placeholder="10000"
                    />
                </Field>

                <Field label="Fuel / hour" error={errors.fuel_consumption_per_hour}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={fuelConsumption}
                        onChange={(event) => setFuelConsumption(event.target.value)}
                        className={inputClass}
                        placeholder="120"
                    />
                </Field>

                <Field label="Speed km/h" error={errors.speed_kmh}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={speedKmh}
                        onChange={(event) => setSpeedKmh(event.target.value)}
                        className={inputClass}
                        placeholder="35"
                    />
                </Field>

                <Field
                    label="Loading containers / h"
                    error={errors.loading_capacity_containers_per_hour}
                >
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={loadingContainers}
                        onChange={(event) => setLoadingContainers(event.target.value)}
                        className={inputClass}
                        placeholder="50"
                    />
                </Field>

                <Field
                    label="Loading tons / h"
                    error={errors.loading_capacity_tons_per_hour}
                >
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={loadingTons}
                        onChange={(event) => setLoadingTons(event.target.value)}
                        className={inputClass}
                        placeholder="900"
                    />
                </Field>
            </section>

            <ToggleSection
                title="Cargo profile"
                items={[
                    { label: 'Open cargo', checked: isOpenCargo, onChange: setIsOpenCargo },
                    {
                        label: 'Closed cargo',
                        checked: isClosedCargo,
                        onChange: setIsClosedCargo,
                    },
                    { label: 'Bulk support', checked: supportsBulk, onChange: setSupportsBulk },
                    {
                        label: 'Container support',
                        checked: supportsContainer,
                        onChange: setSupportsContainer,
                    },
                    { label: 'Liquid support', checked: supportsLiquid, onChange: setSupportsLiquid },
                    {
                        label: 'Refrigerated support',
                        checked: supportsRefrigerated,
                        onChange: setSupportsRefrigerated,
                    },
                    {
                        label: 'Hazardous support',
                        checked: supportsHazardous,
                        onChange: setSupportsHazardous,
                    },
                    {
                        label: 'Onboard crane',
                        checked: hasOnboardCrane,
                        onChange: setHasOnboardCrane,
                    },
                ]}
            />

            <section className="rounded-[20px] border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                <div className="text-[18px] font-semibold text-[#182219]">
                    Handling methods
                </div>
                <p className="mt-1 text-[14px] leading-6 text-[#5b6b61]">
                    Enable only the methods the ship can actually provide or support onboard.
                </p>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {handlingStates.map((method) => (
                        <div
                            key={method.code}
                            className={`rounded-2xl border px-4 py-4 ${
                                method.enabled
                                    ? 'border-[#166a4d] bg-white'
                                    : 'border-[#d9ded9] bg-white'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[15px] font-semibold text-[#182219]">
                                        {method.name}
                                    </div>
                                    <div className="mt-1 text-[12px] uppercase tracking-[0.16em] text-[#7a877f]">
                                        {method.code}
                                    </div>
                                </div>

                                <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#182219]">
                                    <input
                                        type="checkbox"
                                        checked={method.enabled}
                                        onChange={(event) =>
                                            updateHandlingState(method.code, {
                                                enabled: event.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                    />
                                    Enabled
                                </label>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <label className="rounded-xl border border-[#d9ded9] bg-[#f8fbf9] px-3 py-3 text-[13px] text-[#182219]">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={method.is_loading}
                                            onChange={(event) =>
                                                updateHandlingState(method.code, {
                                                    is_loading: event.target.checked,
                                                })
                                            }
                                            disabled={!method.enabled}
                                            className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                        />
                                        Loading allowed
                                    </div>
                                </label>

                                <label className="rounded-xl border border-[#d9ded9] bg-[#f8fbf9] px-3 py-3 text-[13px] text-[#182219]">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={method.is_unloading}
                                            onChange={(event) =>
                                                updateHandlingState(method.code, {
                                                    is_unloading: event.target.checked,
                                                })
                                            }
                                            disabled={!method.enabled}
                                            className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                                        />
                                        Unloading allowed
                                    </div>
                                </label>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <Field
                                    label="Override cont / h"
                                    error={errors[`handling_methods.${method.code}.throughput_override_containers_per_hour`]}
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={method.throughput_override_containers_per_hour}
                                        onChange={(event) =>
                                            updateHandlingState(method.code, {
                                                throughput_override_containers_per_hour:
                                                    event.target.value,
                                            })
                                        }
                                        disabled={!method.enabled}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label="Override ton / h"
                                    error={errors[`handling_methods.${method.code}.throughput_override_tons_per_hour`]}
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={method.throughput_override_tons_per_hour}
                                        onChange={(event) =>
                                            updateHandlingState(method.code, {
                                                throughput_override_tons_per_hour:
                                                    event.target.value,
                                            })
                                        }
                                        disabled={!method.enabled}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>

                            <Field label="Method notes">
                                <textarea
                                    rows={3}
                                    value={method.notes}
                                    onChange={(event) =>
                                        updateHandlingState(method.code, {
                                            notes: event.target.value,
                                        })
                                    }
                                    disabled={!method.enabled}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </section>

            <Field label="Notes" error={errors.notes}>
                <textarea
                    rows={5}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className={inputClass}
                    placeholder="Special operating notes, weather limits, or cargo restrictions."
                />
            </Field>

            <div className="pt-2">
                <button
                    type="submit"
                    className="inline-flex items-center rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7a877f]">
                {label}
            </label>
            {children}
            {error ? <div className="mt-2 text-[12px] text-red-700">{error}</div> : null}
        </div>
    );
}

function ToggleSection({
    title,
    items,
}: {
    title: string;
    items: Array<{
        label: string;
        checked: boolean;
        onChange: (value: boolean) => void;
    }>;
}) {
    return (
        <section className="rounded-[20px] border border-[#e4e9e4] bg-[#f8fbf9] p-5">
            <div className="text-[18px] font-semibold text-[#182219]">{title}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => (
                    <label
                        key={item.label}
                        className="rounded-2xl border border-[#d9ded9] bg-white px-4 py-3 text-[14px] font-medium text-[#182219]"
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(event) => item.onChange(event.target.checked)}
                                className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                            />
                            {item.label}
                        </div>
                    </label>
                ))}
            </div>
        </section>
    );
}
