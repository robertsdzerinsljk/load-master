import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type CityOption = {
    id: number;
    name: string;
    country?: string | null;
};

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        type?: string;
        country?: string;
        city_id?: string | number | null;
        city?: string;
        address?: string;
        latitude?: string | number;
        longitude?: string | number;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function LocationPresetForm({
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{
        countries?: string[];
        cities?: CityOption[];
        errors?: Record<string, string>;
    }>();

    const countries = page.props.countries ?? [];
    const cities = page.props.cities ?? [];
    const errors = page.props.errors ?? {};

    const [name, setName] = useState(initialData.name || '');
    const [type, setType] = useState(initialData.type || '');
    const [country, setCountry] = useState(initialData.country || '');
    const [manualCountry, setManualCountry] = useState(
        Boolean(
            initialData.country &&
                !countries.includes(initialData.country),
        ),
    );
    const [cityId, setCityId] = useState(String(initialData.city_id ?? ''));
    const [creatingCity, setCreatingCity] = useState(
        Boolean(initialData.city && !initialData.city_id),
    );
    const [newCityName, setNewCityName] = useState(
        initialData.city && !initialData.city_id ? initialData.city : '',
    );
    const [address, setAddress] = useState(initialData.address || '');
    const [latitude, setLatitude] = useState(String(initialData.latitude ?? ''));
    const [longitude, setLongitude] = useState(String(initialData.longitude ?? ''));
    const [notes, setNotes] = useState(initialData.notes || '');

    const availableCountries = useMemo(() => {
        const values = new Set(
            countries.map((item) => item.trim()).filter(Boolean),
        );

        if (country.trim() !== '') {
            values.add(country.trim());
        }

        return Array.from(values).sort((left, right) =>
            left.localeCompare(right),
        );
    }, [countries, country]);

    const filteredCities = useMemo(() => {
        if (!country) {
            return [];
        }

        return cities.filter((city) => (city.country ?? '') === country);
    }, [cities, country]);

    const selectedCity = useMemo(
        () => cities.find((option) => String(option.id) === cityId) ?? null,
        [cities, cityId],
    );

    useEffect(() => {
        if (
            cityId &&
            !filteredCities.some((city) => String(city.id) === cityId)
        ) {
            setCityId('');
        }
    }, [cityId, filteredCities]);

    const handleCountryChange = (value: string) => {
        setCountry(value);
        setCreatingCity(false);
        setNewCityName('');
    };

    const handleCityChange = (value: string) => {
        setCityId(value);
        setCreatingCity(false);
        setNewCityName('');

        const option = cities.find((city) => String(city.id) === value);

        if (option?.country) {
            setCountry(option.country);
        }
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
            name,
            type: type || null,
            country: country || selectedCity?.country || null,
            city_id: creatingCity || cityId === '' ? null : Number(cityId),
            new_city_name: creatingCity ? newCityName || null : null,
            address: address || null,
            latitude: latitude === '' ? null : Number(latitude),
            longitude: longitude === '' ? null : Number(longitude),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/locations/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/locations', payload);
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
            <div className="grid gap-5">
                <div>
                    <label className={labelClass}>Nosaukums *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        className={inputClass}
                        placeholder="Piemēram, Rīgas rūpnīca"
                    />
                    {errors.name ? <FieldError error={errors.name} /> : null}
                </div>

                <div>
                    <label className={labelClass}>Lokācijas tips</label>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className={inputClass}
                    >
                        <option value="">Izvēlieties</option>
                        <option value="city">Pilsēta</option>
                        <option value="factory">Rūpnīca</option>
                        <option value="warehouse">Noliktava</option>
                        <option value="port_terminal">Ostas terminālis</option>
                        <option value="fuel_station">Uzpildes vieta</option>
                        <option value="customer">Klients</option>
                    </select>
                    {errors.type ? <FieldError error={errors.type} /> : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Valsts</label>

                        {manualCountry ? (
                            <input
                                type="text"
                                value={country}
                                onChange={(event) =>
                                    handleCountryChange(event.target.value)
                                }
                                className={inputClass}
                                placeholder="Piemēram, Latvija"
                            />
                        ) : (
                            <select
                                value={country}
                                onChange={(event) =>
                                    handleCountryChange(event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Izvēlieties valsti</option>
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
                                    ? 'Izmantot valstu sarakstu'
                                    : 'Pievienot jaunu valsti'}
                            </button>

                            {country ? (
                                <span className="text-[13px] text-[#5b6b61]">
                                    Izvēlētā valsts: {country}
                                </span>
                            ) : null}
                        </div>

                        <p className={helperClass}>
                            Vispirms izvēlieties valsti, tad sistēma parādīs
                            tikai tai valstij pieejamās pilsētas.
                        </p>
                        {errors.country ? <FieldError error={errors.country} /> : null}
                    </div>

                    <div>
                        <label className={labelClass}>Pilsēta</label>
                        <select
                            value={creatingCity ? '' : cityId}
                            onChange={(event) =>
                                handleCityChange(event.target.value)
                            }
                            className={inputClass}
                            disabled={!country}
                        >
                            <option value="">
                                {country
                                    ? 'Bez saistītas pilsētas'
                                    : 'Vispirms izvēlieties valsti'}
                            </option>
                            {filteredCities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <p className={helperClass}>
                            Pilsētu saraksts tiek filtrēts pēc izvēlētās
                            valsts.
                        </p>
                        {errors.city_id ? <FieldError error={errors.city_id} /> : null}

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleToggleCreatingCity}
                                disabled={!country}
                                className="inline-flex items-center rounded-lg border border-[#d9ded9] px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {creatingCity
                                    ? 'Izmantot pilsētu sarakstu'
                                    : 'Pievienot jaunu pilsētu'}
                            </button>

                            {selectedCity ? (
                                <span className="text-[13px] text-[#5b6b61]">
                                    Saistīta ar: {selectedCity.name}
                                </span>
                            ) : null}
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
                                    placeholder="Piemēram, Rīga"
                                    disabled={!country}
                                />
                                <p className={helperClass}>
                                    Ja pilsētas nav sarakstā, saglabājiet jaunu
                                    pilsētu izvēlētajai valstij.
                                </p>
                                {errors.new_city_name ? (
                                    <FieldError error={errors.new_city_name} />
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Adrese</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, Ostas iela 1"
                    />
                    {errors.address ? <FieldError error={errors.address} /> : null}
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
                            placeholder="Piemēram, 56.9496487"
                        />
                        {errors.latitude ? <FieldError error={errors.latitude} /> : null}
                    </div>

                    <div>
                        <label className={labelClass}>Longitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={longitude}
                            onChange={(event) => setLongitude(event.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 24.1051864"
                        />
                        {errors.longitude ? <FieldError error={errors.longitude} /> : null}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par šo lokāciju."
                    />
                    {errors.notes ? <FieldError error={errors.notes} /> : null}
                </div>

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
