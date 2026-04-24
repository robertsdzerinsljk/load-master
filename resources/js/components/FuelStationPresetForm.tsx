import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    formatLocationOptionLabel,
    normalizeLabelValue,
} from '@/utils/templateOptionLabels';

type CityOption = {
    id: number;
    name: string;
    country?: string | null;
};

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
    city_id?: number | null;
    country?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
};

type Props = {
    locations: LocationOption[];
    submitLabel?: string;
    initialData?: {
        location_id?: number | string | null;
        location_name?: string;
        country?: string;
        city_id?: number | string | null;
        city?: string;
        address?: string;
        latitude?: number | string | null;
        longitude?: number | string | null;
        fuel_type?: string;
        price_per_liter?: number | string;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function FuelStationPresetForm({
    locations,
    submitLabel = 'Saglabat',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{
        props: {
            countries?: string[];
            cities?: CityOption[];
            errors?: Record<string, string>;
        };
    }>();
    const countries = page.props.countries ?? [];
    const cities = page.props.cities ?? [];
    const errors = page.props.errors ?? {};

    const linkedLocation =
        locations.find(
            (location) =>
                String(location.id) === String(initialData.location_id ?? ''),
        ) ?? null;

    const initialLocationMode = linkedLocation ? 'existing' : 'new';
    const initialCountry = normalizeLabelValue(
        initialData.country || linkedLocation?.country || '',
    );
    const initialCountryCatalog = Array.from(
        new Set(
            [...countries, ...locations.map((location) => location.country ?? '')]
                .map((value) => normalizeLabelValue(value))
                .filter(Boolean),
        ),
    ).sort((left, right) => left.localeCompare(right));

    const [locationMode, setLocationMode] = useState<'existing' | 'new'>(
        initialLocationMode,
    );
    const [selectedCountry, setSelectedCountry] = useState(
        normalizeLabelValue(linkedLocation?.country),
    );
    const [selectedCity, setSelectedCity] = useState(
        normalizeLabelValue(linkedLocation?.city),
    );
    const [locationId, setLocationId] = useState(
        String(linkedLocation?.id ?? initialData.location_id ?? ''),
    );

    const [locationName, setLocationName] = useState(
        initialData.location_name ?? linkedLocation?.name ?? '',
    );
    const [country, setCountry] = useState(initialCountry);
    const [manualCountry, setManualCountry] = useState(
        initialCountry === ''
            ? initialCountryCatalog.length === 0
            : !initialCountryCatalog.includes(initialCountry),
    );
    const [cityId, setCityId] = useState(
        String(initialData.city_id ?? linkedLocation?.city_id ?? ''),
    );
    const [creatingCity, setCreatingCity] = useState(
        Boolean(initialData.city && !initialData.city_id && !linkedLocation),
    );
    const [newCityName, setNewCityName] = useState(
        initialData.city && !initialData.city_id ? initialData.city : '',
    );
    const [address, setAddress] = useState(
        initialData.address ?? linkedLocation?.address ?? '',
    );
    const [latitude, setLatitude] = useState(
        String(initialData.latitude ?? linkedLocation?.latitude ?? ''),
    );
    const [longitude, setLongitude] = useState(
        String(initialData.longitude ?? linkedLocation?.longitude ?? ''),
    );

    const [fuelType, setFuelType] = useState(initialData.fuel_type ?? '');
    const [pricePerLiter, setPricePerLiter] = useState(
        String(initialData.price_per_liter ?? ''),
    );
    const [notes, setNotes] = useState(initialData.notes ?? '');
    const hasExistingLocations = locations.length > 0;

    const availableCountries = useMemo(() => {
        const values = new Set(countries.map((item) => item.trim()).filter(Boolean));

        locations.forEach((location) => {
            const value = normalizeLabelValue(location.country);

            if (value !== '') {
                values.add(value);
            }
        });

        if (country !== '') {
            values.add(country);
        }

        if (selectedCountry !== '') {
            values.add(selectedCountry);
        }

        return Array.from(values).sort((left, right) => left.localeCompare(right));
    }, [countries, country, locations, selectedCountry]);

    const filteredCities = useMemo(() => {
        if (country === '') {
            return [];
        }

        return cities.filter((city) => normalizeLabelValue(city.country) === country);
    }, [cities, country]);

    const existingCities = useMemo(() => {
        if (selectedCountry === '') {
            return [];
        }

        const values = new Set<string>();

        locations.forEach((location) => {
            if (normalizeLabelValue(location.country) !== selectedCountry) {
                return;
            }

            const city = normalizeLabelValue(location.city);

            if (city !== '') {
                values.add(city);
            }
        });

        return Array.from(values).sort((left, right) => left.localeCompare(right));
    }, [locations, selectedCountry]);

    const filteredExistingLocations = useMemo(() => {
        if (selectedCountry === '' || selectedCity === '') {
            return [];
        }

        return locations
            .filter(
                (location) =>
                    normalizeLabelValue(location.country) === selectedCountry &&
                    normalizeLabelValue(location.city) === selectedCity,
            )
            .sort((left, right) =>
                formatLocationOptionLabel(left).localeCompare(
                    formatLocationOptionLabel(right),
                ),
            );
    }, [locations, selectedCity, selectedCountry]);

    useEffect(() => {
        if (
            cityId !== '' &&
            !filteredCities.some((city) => String(city.id) === cityId)
        ) {
            setCityId('');
        }
    }, [cityId, filteredCities]);

    useEffect(() => {
        if (
            selectedCity !== '' &&
            !existingCities.includes(selectedCity)
        ) {
            setSelectedCity('');
            setLocationId('');
        }
    }, [existingCities, selectedCity]);

    useEffect(() => {
        if (
            locationId !== '' &&
            !filteredExistingLocations.some(
                (location) => String(location.id) === locationId,
            )
        ) {
            setLocationId('');
        }
    }, [filteredExistingLocations, locationId]);

    const handleCountryChange = (value: string) => {
        setCountry(value);
        setCreatingCity(false);
        setNewCityName('');
        setCityId('');
    };

    const handleToggleManualCountry = () => {
        if (manualCountry) {
            setManualCountry(false);

            if (!availableCountries.includes(country)) {
                setCountry('');
                setCityId('');
                setCreatingCity(false);
                setNewCityName('');
            }

            return;
        }

        setManualCountry(true);
        setCityId('');
        setCreatingCity(false);
        setNewCityName('');
    };

    const handleToggleCreatingCity = () => {
        if (!country) {
            return;
        }

        if (creatingCity) {
            setCreatingCity(false);
            setNewCityName('');
            return;
        }

        setCreatingCity(true);
        setCityId('');
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            location_mode: locationMode,
            location_id:
                locationMode === 'existing' && locationId !== ''
                    ? Number(locationId)
                    : null,
            location_name: locationMode === 'new' ? locationName : null,
            country: locationMode === 'new' ? country || null : null,
            city_id:
                locationMode === 'new' && !creatingCity && cityId !== ''
                    ? Number(cityId)
                    : null,
            new_city_name:
                locationMode === 'new' && creatingCity ? newCityName || null : null,
            address: locationMode === 'new' ? address || null : null,
            latitude:
                locationMode === 'new' && latitude !== '' ? Number(latitude) : null,
            longitude:
                locationMode === 'new' && longitude !== ''
                    ? Number(longitude)
                    : null,
            fuel_type: fuelType || null,
            price_per_liter: pricePerLiter === '' ? null : Number(pricePerLiter),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/fuel-stations/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/fuel-stations', payload);
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';
    const labelClass = 'text-[14px] font-medium text-[#182219]';
    const helperClass = 'mt-2 text-[13px] leading-6 text-[#5b6b61]';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-5xl rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm"
        >
            <div className="grid gap-6">
                <section className="rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-5">
                    <div className="text-[18px] font-semibold text-[#182219]">
                        Fuel station location
                    </div>
                    <p className={helperClass}>
                        All physical points use the same structure: country, city, and then
                        the specific location.
                    </p>
                    <p className={helperClass}>
                        The fuel station record stores fuel prices and notes, while the
                        shared location record stores the place itself.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setLocationMode('new')}
                            className={`rounded-xl border px-4 py-2 text-[14px] font-medium transition ${
                                locationMode === 'new'
                                    ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                    : 'border-[#d9ded9] bg-white text-[#182219] hover:bg-[#f7f9f7]'
                            }`}
                        >
                            Create new location
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocationMode('existing')}
                            disabled={!hasExistingLocations}
                            className={`rounded-xl border px-4 py-2 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                locationMode === 'existing'
                                    ? 'border-[#166a4d] bg-[#166a4d] text-white'
                                    : 'border-[#d9ded9] bg-white text-[#182219] hover:bg-[#f7f9f7]'
                            }`}
                        >
                            Use existing location
                        </button>
                    </div>

                    {!hasExistingLocations ? (
                        <div className="mt-4 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[13px] leading-6 text-[#5b6b61]">
                            No fuel-station locations exist yet, so this form starts in
                            create mode. After seeding or saving your first station, you can
                            also reuse existing locations here.
                        </div>
                    ) : null}

                    {locationMode === 'existing' ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                            <div>
                                <label className={labelClass}>Country *</label>
                                <select
                                    value={selectedCountry}
                                    onChange={(event) => {
                                        setSelectedCountry(event.target.value);
                                        setSelectedCity('');
                                        setLocationId('');
                                    }}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Choose country</option>
                                    {availableCountries.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <p className={helperClass}>
                                    Existing locations are grouped by country first so the
                                    list stays short.
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>City *</label>
                                <select
                                    value={selectedCity}
                                    onChange={(event) => {
                                        setSelectedCity(event.target.value);
                                        setLocationId('');
                                    }}
                                    className={inputClass}
                                    disabled={!selectedCountry}
                                    required
                                >
                                    <option value="">
                                        {selectedCountry
                                            ? 'Choose city'
                                            : 'Choose country first'}
                                    </option>
                                    {existingCities.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <p className={helperClass}>
                                    Only cities that already contain fuel-station locations are
                                    shown here.
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Location *</label>
                                <select
                                    value={locationId}
                                    onChange={(event) => setLocationId(event.target.value)}
                                    className={inputClass}
                                    disabled={!selectedCountry || !selectedCity}
                                    required
                                >
                                    <option value="">
                                        {selectedCountry && selectedCity
                                            ? 'Choose location'
                                            : 'Choose country and city first'}
                                    </option>
                                    {filteredExistingLocations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {formatLocationOptionLabel(location)}
                                        </option>
                                    ))}
                                </select>
                                <p className={helperClass}>
                                    Choose the exact station location after narrowing it by
                                    country and city.
                                </p>
                                {errors.location_id ? (
                                    <FieldError error={errors.location_id} />
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-5">
                            <div>
                                <label className={labelClass}>Station name *</label>
                                <input
                                    type="text"
                                    value={locationName}
                                    onChange={(event) =>
                                        setLocationName(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Circle K Riga South"
                                    required
                                />
                                {errors.location_name ? (
                                    <FieldError error={errors.location_name} />
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Country *</label>
                                    {manualCountry ? (
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(event) =>
                                                handleCountryChange(event.target.value)
                                            }
                                            className={inputClass}
                                            placeholder="Latvia"
                                            required
                                        />
                                    ) : (
                                        <select
                                            value={country}
                                            onChange={(event) =>
                                                handleCountryChange(event.target.value)
                                            }
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">Choose country</option>
                                            {availableCountries.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {availableCountries.length === 0 ? (
                                        <p className={helperClass}>
                                            No countries are seeded yet, so start by typing the
                                            first country manually.
                                        </p>
                                    ) : null}

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
                                    </div>
                                    {errors.country ? (
                                        <FieldError error={errors.country} />
                                    ) : null}
                                </div>

                                <div>
                                    <label className={labelClass}>City *</label>
                                    <select
                                        value={creatingCity ? '' : cityId}
                                        onChange={(event) => {
                                            setCityId(event.target.value);
                                            setCreatingCity(false);
                                            setNewCityName('');
                                        }}
                                        className={inputClass}
                                        disabled={!country}
                                    >
                                        <option value="">
                                            {country
                                                ? 'Choose city'
                                                : 'Choose country first'}
                                        </option>
                                        {filteredCities.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>

                                    {!creatingCity &&
                                    filteredCities.length === 0 &&
                                    country ? (
                                        <p className={helperClass}>
                                            No cities are available for this country yet. Use the
                                            button below to add the first one.
                                        </p>
                                    ) : null}

                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleToggleCreatingCity}
                                            disabled={!country}
                                            className="inline-flex items-center rounded-lg border border-[#d9ded9] px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {creatingCity
                                                ? 'Use city list'
                                                : 'Add a new city'}
                                        </button>
                                    </div>

                                    {creatingCity ? (
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                value={newCityName}
                                                onChange={(event) =>
                                                    setNewCityName(event.target.value)
                                                }
                                                className={inputClass}
                                                placeholder="Riga"
                                                disabled={!country}
                                            />
                                            {errors.new_city_name ? (
                                                <FieldError error={errors.new_city_name} />
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {errors.city_id ? (
                                        <FieldError error={errors.city_id} />
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(event) => setAddress(event.target.value)}
                                    className={inputClass}
                                    placeholder="Bauskas iela 88A, Riga"
                                />
                                {errors.address ? (
                                    <FieldError error={errors.address} />
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Latitude</label>
                                    <input
                                        type="number"
                                        step="0.0000001"
                                        value={latitude}
                                        onChange={(event) => setLatitude(event.target.value)}
                                        className={inputClass}
                                        placeholder="56.9132000"
                                    />
                                    {errors.latitude ? (
                                        <FieldError error={errors.latitude} />
                                    ) : null}
                                </div>

                                <div>
                                    <label className={labelClass}>Longitude</label>
                                    <input
                                        type="number"
                                        step="0.0000001"
                                        value={longitude}
                                        onChange={(event) => setLongitude(event.target.value)}
                                        className={inputClass}
                                        placeholder="24.1205000"
                                    />
                                    {errors.longitude ? (
                                        <FieldError error={errors.longitude} />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-[#e4e9e4] bg-white p-5">
                    <div className="text-[18px] font-semibold text-[#182219]">
                        Fuel details
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Fuel type</label>
                            <select
                                value={fuelType}
                                onChange={(event) => setFuelType(event.target.value)}
                                className={inputClass}
                            >
                                <option value="">Choose fuel type</option>
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                                <option value="lng">LNG</option>
                                <option value="electric">Electric</option>
                            </select>
                            {errors.fuel_type ? (
                                <FieldError error={errors.fuel_type} />
                            ) : null}
                        </div>

                        <div>
                            <label className={labelClass}>Price per liter</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={pricePerLiter}
                                onChange={(event) => setPricePerLiter(event.target.value)}
                                className={inputClass}
                                placeholder="1.67"
                            />
                            {errors.price_per_liter ? (
                                <FieldError error={errors.price_per_liter} />
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className={labelClass}>Notes</label>
                        <textarea
                            rows={5}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            className={inputClass}
                            placeholder="Opening hours, truck access, payment restrictions."
                        />
                        {errors.notes ? <FieldError error={errors.notes} /> : null}
                    </div>
                </section>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="inline-flex items-center rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}

function FieldError({ error }: { error: string }) {
    return <div className="mt-2 text-[12px] text-red-700">{error}</div>;
}
