import { useState } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        type?: string;
        country?: string;
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
    const [name, setName] = useState(initialData.name || '');
    const [type, setType] = useState(initialData.type || '');
    const [country, setCountry] = useState(initialData.country || '');
    const [city, setCity] = useState(initialData.city || '');
    const [address, setAddress] = useState(initialData.address || '');
    const [latitude, setLatitude] = useState(String(initialData.latitude ?? ''));
    const [longitude, setLongitude] = useState(String(initialData.longitude ?? ''));
    const [notes, setNotes] = useState(initialData.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            type: type || null,
            country: country || null,
            city: city || null,
            address: address || null,
            latitude: latitude === '' ? null : Number(latitude),
            longitude: longitude === '' ? null : Number(longitude),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/locations/${id}`, payload);
        } else {
            router.post('/teacher/templates/locations', payload);
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';

    const labelClass = 'text-[14px] font-medium text-[#182219]';

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
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Piemēram, Rīgas rūpnīca"
                    />
                </div>

                <div>
                    <label className={labelClass}>Lokācijas tips</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
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
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Valsts</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, Latvija"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Pilsēta</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, Rīga"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Adrese</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, Ostas iela 1"
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Latitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 56.9496487"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Longitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 24.1051864"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par šo lokāciju."
                    />
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