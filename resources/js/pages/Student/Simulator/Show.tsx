import StudentLayout from '@/layouts/StudentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type NamedItem = {
    id: number;
    name: string;
    type?: string | null;
};

type RouteItem = {
    id: number;
    distance_km?: string | number | null;
    fromLocation?: { name: string } | null;
    toLocation?: { name: string } | null;
    from_location?: { name: string } | null;
    to_location?: { name: string } | null;
};

type Template = {
    id: number;
    title: string;
    student_brief?: string | null;
    cargo_name?: string | null;
    cargo_type?: string | null;
    cargo_amount_containers?: string | number | null;
    transportTemplates?: NamedItem[];
    transport_templates?: NamedItem[];
    landRoutes?: RouteItem[];
    land_routes?: RouteItem[];
};

type Attempt = {
    id: number;
    status: string;
    current_step: string;
    selected_transport_template_id?: number | null;
    selected_land_route_id?: number | null;
    selected_vehicle_count?: number | null;
    preview_result?: any;
};

type PageProps = {
    template: Template;
    attempt: Attempt;
};

const steps = [
    { key: 'intro', label: 'Uzdevums' },
    { key: 'transport', label: 'Transports' },
    { key: 'route', label: 'Maršruts' },
    { key: 'simulation', label: 'Simulācija' },
    { key: 'submit', label: 'Iesniegšana' },
];

export default function StudentSimulatorShow() {
    const page = usePage<PageProps>();
    const template = page.props.template;
    const initialAttempt = page.props.attempt;

    const [attempt, setAttempt] = useState(initialAttempt);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [selectedTransportId, setSelectedTransportId] = useState<string>(
        String(initialAttempt.selected_transport_template_id ?? '')
    );
    const [selectedRouteId, setSelectedRouteId] = useState<string>(
        String(initialAttempt.selected_land_route_id ?? '')
    );

    const transports = template.transportTemplates ?? template.transport_templates ?? [];
    const routes = template.landRoutes ?? template.land_routes ?? [];

    const currentStepIndex = useMemo(() => {
        const idx = steps.findIndex((step) => step.key === attempt.current_step);
        return idx >= 0 ? idx : 0;
    }, [attempt.current_step]);

    const nextStep = async (step: string) => {
        setLoading(true);
        setMessage(null);

        const payload: any = {
            current_step: step,
        };

        if (selectedTransportId) {
            payload.selected_transport_template_id = Number(selectedTransportId);
        }

        if (selectedRouteId) {
            payload.selected_land_route_id = Number(selectedRouteId);
        }

        try {
            const response = await fetch(`/student/simulator/attempt/${attempt.id}/step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās atjaunināt attempt.');
                return;
            }

            setAttempt(data.attempt);
            setMessage('Solis saglabāts.');
        } catch {
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    const submitAttempt = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/student/simulator/attempt/${attempt.id}/submit`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Neizdevās iesniegt risinājumu.');
                return;
            }

            setAttempt(data.attempt);
            setMessage('Risinājums iesniegts.');
        } catch {
            setMessage('Servera kļūda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StudentLayout>
            <Head title="Studenta simulators" />

            <div className="min-h-screen bg-[#f6f8f6] px-6 py-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <h1 className="text-[30px] font-semibold text-[#182219]">
                            {template.title}
                        </h1>
                        <p className="mt-3 text-[16px] leading-7 text-[#5b6b61]">
                            {template.student_brief || 'Nav uzdevuma apraksta.'}
                        </p>
                        <div className="mt-4 flex gap-3">
                    <Link
                        href="/student"
                        className="rounded-xl border border-[#d9ded9] px-4 py-2 text-sm text-[#182219] hover:bg-[#f3f6f3]"
                    >
                        ← Atpakaļ
                    </Link>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                        Iziet
                    </Link>
                </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                <div className="text-[13px] uppercase tracking-wide text-[#7a877f]">
                                    Krava
                                </div>
                                <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                    {template.cargo_name || template.cargo_type || '—'}
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                <div className="text-[13px] uppercase tracking-wide text-[#7a877f]">
                                    Konteineri
                                </div>
                                <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                    {template.cargo_amount_containers ?? '—'}
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                                <div className="text-[13px] uppercase tracking-wide text-[#7a877f]">
                                    Statuss
                                </div>
                                <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                    {attempt.status}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            {steps.map((step, index) => {
                                const active = index <= currentStepIndex;

                                return (
                                    <div
                                        key={step.key}
                                        className={`rounded-full px-4 py-2 text-[14px] font-medium ${
                                            active
                                                ? 'bg-[#166a4d] text-white'
                                                : 'bg-[#eef3ef] text-[#5b6b61]'
                                        }`}
                                    >
                                        {step.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    1. Izvēlies transportu
                                </h2>

                                <div className="mt-4 grid gap-3">
                                    {transports.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3"
                                        >
                                            <input
                                                type="radio"
                                                name="transport"
                                                value={item.id}
                                                checked={selectedTransportId === String(item.id)}
                                                onChange={(e) =>
                                                    setSelectedTransportId(e.target.value)
                                                }
                                            />
                                            <div>
                                                <div className="font-semibold text-[#182219]">
                                                    {item.name}
                                                </div>
                                                <div className="text-[14px] text-[#5b6b61]">
                                                    {item.type || 'Tips nav norādīts'}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => nextStep('transport')}
                                        disabled={loading}
                                        className="rounded-xl bg-[#166a4d] px-5 py-3 text-white hover:bg-[#135740] disabled:opacity-60"
                                    >
                                        Saglabāt transportu
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    2. Izvēlies maršrutu
                                </h2>

                                <div className="mt-4 grid gap-3">
                                    {routes.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3"
                                        >
                                            <input
                                                type="radio"
                                                name="route"
                                                value={item.id}
                                                checked={selectedRouteId === String(item.id)}
                                                onChange={(e) =>
                                                    setSelectedRouteId(e.target.value)
                                                }
                                            />
                                            <div>
                                                <div className="font-semibold text-[#182219]">
                                                    {(item.fromLocation ?? item.from_location)?.name ?? '—'} →{' '}
                                                    {(item.toLocation ?? item.to_location)?.name ?? '—'}
                                                </div>
                                                <div className="text-[14px] text-[#5b6b61]">
                                                    {item.distance_km ?? '—'} km
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => nextStep('route')}
                                        disabled={loading}
                                        className="rounded-xl bg-[#166a4d] px-5 py-3 text-white hover:bg-[#135740] disabled:opacity-60"
                                    >
                                        Saglabāt maršrutu
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    3. Simulācijas preview
                                </h2>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => nextStep('simulation')}
                                        disabled={loading}
                                        className="rounded-xl border border-[#166a4d] bg-white px-5 py-3 text-[#166a4d] hover:bg-[#f3faf6] disabled:opacity-60"
                                    >
                                        Aprēķināt preview
                                    </button>
                                </div>

                                {attempt.preview_result && (
                                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <PreviewBox
                                            label="Maršruts"
                                            value={`${attempt.preview_result?.route?.from ?? '—'} → ${attempt.preview_result?.route?.to ?? '—'}`}
                                        />
                                        <PreviewBox
                                            label="Attālums"
                                            value={`${attempt.preview_result?.route?.distance_km ?? '—'} km`}
                                        />
                                        <PreviewBox
                                            label="Nepieciešamie transporti"
                                            value={attempt.preview_result?.result?.required_vehicles}
                                        />
                                        <PreviewBox
                                            label="Brauciena laiks"
                                            value={`${attempt.preview_result?.result?.trip_time_hours ?? '—'} h`}
                                        />
                                        <PreviewBox
                                            label="Kopējās izmaksas"
                                            value={`${attempt.preview_result?.result?.total_cost ?? '—'} €`}
                                        />
                                        <PreviewBox
                                            label="Uzpilde"
                                            value={
                                                attempt.preview_result?.result?.needs_refuel
                                                    ? 'Nepieciešama'
                                                    : 'Nav nepieciešama'
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Progres
                                </h2>

                                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#eef3ef]">
                                    <div
                                        className="h-full rounded-full bg-[#166a4d] transition-all duration-500"
                                        style={{
                                            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-3 text-[14px] text-[#5b6b61]">
                                    Pašlaik tu esi solī: <strong>{attempt.current_step}</strong>
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    Iesniegšana
                                </h2>

                                <p className="mt-3 text-[15px] leading-7 text-[#5b6b61]">
                                    Kad esi pārliecināts par savu risinājumu, iesniedz to pārbaudei.
                                </p>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={submitAttempt}
                                        disabled={loading || attempt.status === 'submitted'}
                                        className="rounded-xl bg-[#166a4d] px-5 py-3 text-white hover:bg-[#135740] disabled:opacity-60"
                                    >
                                        {attempt.status === 'submitted'
                                            ? 'Jau iesniegts'
                                            : 'Iesniegt risinājumu'}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className="rounded-2xl border border-[#d9ded9] bg-white p-4 text-[14px] text-[#182219] shadow-sm">
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

function PreviewBox({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
            <div className="text-[13px] uppercase tracking-wide text-[#7a877f]">
                {label}
            </div>
            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                {value !== null && value !== undefined && value !== '' ? value : '—'}
            </div>
        </div>
    );
}