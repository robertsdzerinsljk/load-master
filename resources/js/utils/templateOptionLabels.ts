export type LabelableLocation = {
    name?: string | null;
    city?: string | null;
    country?: string | null;
    type?: string | null;
};

export type LabelablePort = {
    name?: string | null;
    country?: string | null;
};

export type LabelableRoute = {
    distance_km?: string | number | null;
    fromLocation?: LabelableLocation | null;
    toLocation?: LabelableLocation | null;
    from_location?: LabelableLocation | null;
    to_location?: LabelableLocation | null;
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
    city: 'City',
    customer: 'Customer',
    factory: 'Factory',
    fuel_station: 'Fuel station',
    port_terminal: 'Port terminal',
    warehouse: 'Warehouse',
};

export function normalizeLabelValue(value?: string | null): string {
    return (value ?? '').trim();
}

export function formatLocationOptionLabel(
    location?: LabelableLocation | null,
): string {
    const name = normalizeLabelValue(location?.name);

    if (name === '') {
        return 'Unnamed location';
    }

    const meta: string[] = [];
    const typeLabel = LOCATION_TYPE_LABELS[normalizeLabelValue(location?.type)];
    const city = normalizeLabelValue(location?.city);
    const country = normalizeLabelValue(location?.country);

    if (typeLabel) {
        meta.push(typeLabel);
    }

    if (city !== '' && city !== name) {
        meta.push(city);
    }

    if (country !== '') {
        meta.push(country);
    }

    return meta.length > 0 ? `${name} [${meta.join(' - ')}]` : name;
}

export function formatLocationCompactLabel(
    location?: LabelableLocation | null,
): string {
    const name = normalizeLabelValue(location?.name);
    const city = normalizeLabelValue(location?.city);
    const country = normalizeLabelValue(location?.country);

    if (name === '') {
        return 'Unnamed location';
    }

    if (city !== '' && city !== name && country !== '') {
        return `${name} (${city}, ${country})`;
    }

    if (city !== '' && city !== name) {
        return `${name} (${city})`;
    }

    if (country !== '') {
        return `${name} (${country})`;
    }

    return name;
}

export function formatPortOptionLabel(port?: LabelablePort | null): string {
    const name = normalizeLabelValue(port?.name);
    const country = normalizeLabelValue(port?.country);

    if (name === '') {
        return 'Unnamed port';
    }

    return country !== '' ? `${name} (${country})` : name;
}

export function resolveRouteFrom(
    route?: LabelableRoute | null,
): LabelableLocation | null {
    return route?.fromLocation ?? route?.from_location ?? null;
}

export function resolveRouteTo(
    route?: LabelableRoute | null,
): LabelableLocation | null {
    return route?.toLocation ?? route?.to_location ?? null;
}

export function formatRouteOptionLabel(route?: LabelableRoute | null): string {
    return `${formatLocationCompactLabel(resolveRouteFrom(route))} -> ${formatLocationCompactLabel(resolveRouteTo(route))}`;
}

export function formatRouteOptionDescription(
    route?: LabelableRoute | null,
): string {
    const distance = route?.distance_km;

    if (distance === null || distance === undefined || distance === '') {
        return 'Distance not set';
    }

    return `${distance} km`;
}
