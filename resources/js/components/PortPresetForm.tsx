import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type LocationOption = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
    type?: string | null;
};

type CityOption = {
    id: number;
    name: string;
    country?: string | null;
};

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
        country?: string;
        location_id?: string | number | null;
        max_draft_m?: string | number | null;
        city_distance_km?: string | number | null;
        loading_rate_containers_per_hour?: string | number | null;
        loading_rate_tons_per_hour?: string | number | null;
        supports_bulk?: boolean | null;
        supports_container?: boolean | null;
        supports_liquid?: boolean | null;
        supports_refrigerated?: boolean | null;
        supports_hazardous?: boolean | null;
        has_crane?: boolean | null;
        has_forklift?: boolean | null;
        has_pump?: boolean | null;
        has_conveyor?: boolean | null;
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

const LOCATION_TYPE_LABELS: Record<string, string> = {
    city: 'City',
    customer: 'Customer',
    factory: 'Factory',
    fuel_station: 'Fuel station',
    port_terminal: 'Port terminal',
    warehouse: 'Warehouse',
};

export default function PortPresetForm({
    submitLabel = 'Save port',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{
        locations?: LocationOption[];
        countries?: string[];
        cities?: CityOption[];
        handlingMethods?: HandlingMethodOption[];
        errors?: Record<string, string>;
    }>();
    const locations = page.props.locations ?? [];
    const pageCountries = page.props.countries ?? [];
    const cities = page.props.cities ?? [];
    const handlingMethodOptions = page.props.handlingMethods ?? [];
    const errors = page.props.errors ?? {};

    const countryCatalog = useMemo(
        () => collectCountryNames(pageCountries, cities, locations),
        [cities, locations, pageCountries],
    );

    const initialLocation =
        locations.find(
            (location) =>
                String(location.id) === String(initialData.location_id ?? ''),
        ) ?? null;
    const initialCountry = normalizeValue(
        initialData.country || initialLocation?.country || '',
    );
    const initialCity = resolveInitialCityName(
        initialLocation,
        initialCountry,
        cities,
        locations,
    );

    const [name, setName] = useState(initialData.name || '');
    const [country, setCountry] = useState(initialCountry);
    const [manualCountry, setManualCountry] = useState(
        Boolean(initialCountry && !countryCatalog.includes(initialCountry)),
    );
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [locationId, setLocationId] = useState(
        String(initialData.location_id ?? ''),
    );
    const [maxDraft, setMaxDraft] = useState(String(initialData.max_draft_m ?? ''));
    const [cityDistanceKm, setCityDistanceKm] = useState(
        String(initialData.city_distance_km ?? ''),
    );
    const [loadingRateContainers, setLoadingRateContainers] = useState(
        String(initialData.loading_rate_containers_per_hour ?? ''),
    );
    const [loadingRateTons, setLoadingRateTons] = useState(
        String(initialData.loading_rate_tons_per_hour ?? ''),
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
    const [hasCrane, setHasCrane] = useState(Boolean(initialData.has_crane ?? false));
    const [hasForklift, setHasForklift] = useState(
        Boolean(initialData.has_forklift ?? false),
    );
    const [hasPump, setHasPump] = useState(Boolean(initialData.has_pump ?? false));
    const [hasConveyor, setHasConveyor] = useState(
        Boolean(initialData.has_conveyor ?? false),
    );
    const [notes, setNotes] = useState(initialData.notes || '');

    const availableCountries = useMemo(() => {
        const values = new Set(countryCatalog);

        if (normalizeValue(country) !== '') {
            values.add(normalizeValue(country));
        }

        return Array.from(values).sort((left, right) =>
            left.localeCompare(right),
        );
    }, [country, countryCatalog]);

    const availableCities = useMemo(
        () => collectCityNames(country, cities, locations),
        [cities, country, locations],
    );

    const filteredLocations = useMemo(() => {
        const normalizedCountry = normalizeValue(country);

        if (normalizedCountry === '' || selectedCity === '') {
            return [];
        }

        return locations
            .filter((location) => {
                if (normalizeValue(location.country) !== normalizedCountry) {
                    return false;
                }

                const locationCity = resolveStructuredCityName(location);
                const isCurrentLegacySelection =
                    String(location.id) === locationId &&
                    locationCity === '' &&
                    normalizeValue(location.name) === selectedCity;

                return locationCity === selectedCity || isCurrentLegacySelection;
            })
            .sort((left, right) => {
                const typeRank = locationTypeRank(left.type) - locationTypeRank(right.type);

                if (typeRank !== 0) {
                    return typeRank;
                }

                return formatLocationLabel(left).localeCompare(
                    formatLocationLabel(right),
                );
            });
    }, [country, locationId, locations, selectedCity]);

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

    useEffect(() => {
        if (selectedCity !== '' && !availableCities.includes(selectedCity)) {
            setSelectedCity('');
            setLocationId('');
        }
    }, [availableCities, selectedCity]);

    useEffect(() => {
        if (
            locationId !== '' &&
            !filteredLocations.some(
                (location) => String(location.id) === locationId,
            )
        ) {
            setLocationId('');
        }
    }, [filteredLocations, locationId]);

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

    const handleCountryChange = (value: string) => {
        setCountry(value);
        setSelectedCity('');
        setLocationId('');
    };

    const handleToggleManualCountry = () => {
        if (manualCountry) {
            setManualCountry(false);

            if (!countryCatalog.includes(normalizeValue(country))) {
                setCountry('');
                setSelectedCity('');
                setLocationId('');
            }

            return;
        }

        setManualCountry(true);
        setSelectedCity('');
        setLocationId('');
    };

    const handleCityChange = (value: string) => {
        setSelectedCity(value);
        setLocationId('');
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            name,
            country: normalizeValue(country),
            location_id: locationId === '' ? null : Number(locationId),
            max_draft_m: maxDraft === '' ? null : Number(maxDraft),
            city_distance_km: cityDistanceKm === '' ? null : Number(cityDistanceKm),
            loading_rate_containers_per_hour:
                loadingRateContainers === '' ? null : Number(loadingRateContainers),
            loading_rate_tons_per_hour:
                loadingRateTons === '' ? null : Number(loadingRateTons),
            supports_bulk: supportsBulk,
            supports_container: supportsContainer,
            supports_liquid: supportsLiquid,
            supports_refrigerated: supportsRefrigerated,
            supports_hazardous: supportsHazardous,
            has_crane: hasCrane,
            has_forklift: hasForklift,
            has_pump: hasPump,
            has_conveyor: hasConveyor,
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
            router.put(`/teacher/templates/ports/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/ports', payload);
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';
    const helperClass = 'mt-2 text-[13px] leading-6 text-[#5b6b61]';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-[24px] border border-[#d9ded9] bg-white p-6 shadow-sm"
        >
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Port name" error={errors.name}>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        className={inputClass}
                        placeholder="Liepaja Port"
                    />
                </Field>

                <Field label="Country" error={errors.country}>
                    {manualCountry ? (
                        <input
                            type="text"
                            value={country}
                            onChange={(event) =>
                                handleCountryChange(event.target.value)
                            }
                            required
                            className={inputClass}
                            placeholder="Latvia"
                        />
                    ) : (
                        <select
                            value={country}
                            onChange={(event) =>
                                handleCountryChange(event.target.value)
                            }
                            required
                            className={inputClass}
                        >
                            <option value="">Choose country</option>
                            {availableCountries.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleToggleManualCountry}
                            className="inline-flex items-center rounded-lg border border-[#d9ded9] px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            {manualCountry
                                ? 'Use country list'
                                : 'Add a new country'}
                        </button>

                        {country ? (
                            <span className="text-[13px] text-[#5b6b61]">
                                Selected: {country}
                            </span>
                        ) : null}
                    </div>
                </Field>

                <Field label="City">
                    <select
                        value={selectedCity}
                        onChange={(event) => handleCityChange(event.target.value)}
                        className={inputClass}
                        disabled={normalizeValue(country) === ''}
                    >
                        <option value="">
                            {normalizeValue(country) === ''
                                ? 'Choose country first'
                                : 'Choose city'}
                        </option>
                        {availableCities.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <p className={helperClass}>
                        Only cities for the selected country are shown here.
                    </p>
                </Field>

                <Field label="Linked location" error={errors.location_id}>
                    <select
                        value={locationId}
                        onChange={(event) => setLocationId(event.target.value)}
                        className={inputClass}
                        disabled={
                            normalizeValue(country) === '' || selectedCity === ''
                        }
                    >
                        <option value="">
                            {normalizeValue(country) === ''
                                ? 'Choose country first'
                                : selectedCity === ''
                                  ? 'Choose city first'
                                  : filteredLocations.length === 0
                                    ? 'No matching locations'
                                    : 'None'}
                        </option>
                        {filteredLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {formatLocationLabel(location)}
                            </option>
                        ))}
                    </select>
                    <p className={helperClass}>
                        {selectedCity
                            ? `Showing locations in ${selectedCity}, ${country}.`
                            : 'Pick the nearby city first so the linked location list stays clean.'}
                    </p>
                </Field>

                <Field label="Max draft m" error={errors.max_draft_m}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxDraft}
                        onChange={(event) => setMaxDraft(event.target.value)}
                        className={inputClass}
                        placeholder="7.50"
                    />
                </Field>

                <Field label="Distance from city km" error={errors.city_distance_km}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cityDistanceKm}
                        onChange={(event) => setCityDistanceKm(event.target.value)}
                        className={inputClass}
                        placeholder="12"
                    />
                </Field>

                <Field
                    label="Container throughput / h"
                    error={errors.loading_rate_containers_per_hour}
                >
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={loadingRateContainers}
                        onChange={(event) => setLoadingRateContainers(event.target.value)}
                        className={inputClass}
                        placeholder="45"
                    />
                </Field>

                <Field label="Ton throughput / h" error={errors.loading_rate_tons_per_hour}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={loadingRateTons}
                        onChange={(event) => setLoadingRateTons(event.target.value)}
                        className={inputClass}
                        placeholder="800"
                    />
                </Field>
            </section>

            <ToggleSection
                title="Cargo support"
                items={[
                    { label: 'Bulk', checked: supportsBulk, onChange: setSupportsBulk },
                    {
                        label: 'Container',
                        checked: supportsContainer,
                        onChange: setSupportsContainer,
                    },
                    { label: 'Liquid', checked: supportsLiquid, onChange: setSupportsLiquid },
                    {
                        label: 'Refrigerated',
                        checked: supportsRefrigerated,
                        onChange: setSupportsRefrigerated,
                    },
                    {
                        label: 'Hazardous',
                        checked: supportsHazardous,
                        onChange: setSupportsHazardous,
                    },
                ]}
            />

            <ToggleSection
                title="Equipment"
                items={[
                    { label: 'Crane', checked: hasCrane, onChange: setHasCrane },
                    { label: 'Forklift', checked: hasForklift, onChange: setHasForklift },
                    { label: 'Pump', checked: hasPump, onChange: setHasPump },
                    { label: 'Conveyor', checked: hasConveyor, onChange: setHasConveyor },
                ]}
            />

            <section className="rounded-[20px] border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                <div className="text-[18px] font-semibold text-[#182219]">
                    Handling methods
                </div>
                <p className="mt-1 text-[14px] leading-6 text-[#5b6b61]">
                    Enable the methods this port can actually provide and optionally override throughput per method.
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
                    placeholder="Operational restrictions, queue behavior, or special equipment notes."
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

function collectCountryNames(
    countries: string[],
    cities: CityOption[],
    locations: LocationOption[],
): string[] {
    const values = new Set<string>();

    countries.forEach((country) => {
        const normalized = normalizeValue(country);

        if (normalized !== '') {
            values.add(normalized);
        }
    });

    cities.forEach((city) => {
        const normalized = normalizeValue(city.country);

        if (normalized !== '') {
            values.add(normalized);
        }
    });

    locations.forEach((location) => {
        const normalized = normalizeValue(location.country);

        if (normalized !== '') {
            values.add(normalized);
        }
    });

    return Array.from(values).sort((left, right) => left.localeCompare(right));
}

function collectCityNames(
    country: string,
    cities: CityOption[],
    locations: LocationOption[],
): string[] {
    const normalizedCountry = normalizeValue(country);

    if (normalizedCountry === '') {
        return [];
    }

    const values = new Set<string>();

    cities.forEach((city) => {
        if (normalizeValue(city.country) !== normalizedCountry) {
            return;
        }

        const normalizedName = normalizeValue(city.name);

        if (normalizedName !== '') {
            values.add(normalizedName);
        }
    });

    locations.forEach((location) => {
        if (normalizeValue(location.country) !== normalizedCountry) {
            return;
        }

        const normalizedName = resolveStructuredCityName(location);

        if (normalizedName !== '') {
            values.add(normalizedName);
        }
    });

    return Array.from(values).sort((left, right) => left.localeCompare(right));
}

function formatLocationLabel(location: LocationOption): string {
    const typeLabel = LOCATION_TYPE_LABELS[normalizeValue(location.type)] ?? 'Location';
    const cityName = resolveStructuredCityName(location);
    const locationName = normalizeValue(location.name);

    if (cityName !== '' && cityName !== locationName) {
        return `${locationName} [${typeLabel}] - ${cityName}`;
    }

    return `${locationName} [${typeLabel}]`;
}

function locationTypeRank(type?: string | null): number {
    return normalizeValue(type) === 'city' ? 0 : 1;
}

function normalizeValue(value?: string | null): string {
    return (value ?? '').trim();
}

function resolveInitialCityName(
    location: LocationOption | null,
    country: string,
    cities: CityOption[],
    locations: LocationOption[],
): string {
    const structuredCity = resolveStructuredCityName(location);

    if (structuredCity !== '') {
        return structuredCity;
    }

    const locationName = normalizeValue(location?.name);

    if (locationName === '') {
        return '';
    }

    const matchingCityNames = collectCityNames(country, cities, locations);

    return matchingCityNames.includes(locationName) ? locationName : '';
}

function resolveStructuredCityName(location?: LocationOption | null): string {
    const directCity = normalizeValue(location?.city);

    if (directCity !== '') {
        return directCity;
    }

    if (normalizeValue(location?.type) === 'city') {
        return normalizeValue(location?.name);
    }

    return '';
}
