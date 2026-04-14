import BackButton from '@/components/BackButton';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    fakeGroups,
    fakeStudents,
    orderTemplateList,
} from './orderTemplateFakeData';

type PageProps = {
    id: number;
};

type AssignMode = 'student' | 'group' | null;

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-[#d9ded9] bg-white p-4">
            <span className="text-[13px] font-medium uppercase tracking-wide text-[#7a877f]">
                {label}
            </span>
            <span className="text-[16px] font-semibold text-[#182219]">
                {value || '—'}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Melnraksts: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]',
        Gatavs: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
        Piešķirts: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${
                styles[status] ?? 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'
            }`}
        >
            {status}
        </span>
    );
}

export default function Show() {
    const { id } = usePage<{ props: PageProps }>().props;

    const [assignMode, setAssignMode] = useState<AssignMode>(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [assignNote, setAssignNote] = useState('');
    const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

    const template = useMemo(
        () => orderTemplateList.find((item) => item.id === Number(id)) ?? orderTemplateList[0],
        [id]
    );

    const previewData = {
        scenarioTitle: template.title,
        clientName: template.client,
        clientCompany: template.client,
        clientCountry: 'Latvija',
        cargoName: template.cargo,
        cargoWeight: '1200 kg',
        cargoVolume: '18 m³',
        cargoValue: '25 000 €',
        priority: template.priority,
        transportType: template.transportType,
        temperatureMode: template.temperatureMode,
        specialCondition: template.specialCondition,
        customsDocument: template.customsDocument,
        pickupLocation: 'Liepāja',
        deliveryLocation: 'Hamburg',
        deadline: '2026-05-15',
        notes:
            'Šī ir demo priekšskatījuma lapa. Vēlāk šeit varēs redzēt pilnu scenārija informāciju pirms piešķiršanas studentam vai grupai.',
        status: template.status,
    };

    const closeDrawer = () => {
        setAssignMode(null);
        setSelectedStudentId('');
        setSelectedGroupId('');
        setAssignNote('');
    };

    const handleAssign = () => {
        if (assignMode === 'student') {
            const foundStudent = fakeStudents.find(
                (student) => String(student.id) === selectedStudentId
            );

            if (!foundStudent) {
                alert('Izvēlieties studentu.');
                return;
            }

            setAssignmentSuccess(`Sagatave piešķirta studentam ${foundStudent.name}.`);
            closeDrawer();
            return;
        }

        if (assignMode === 'group') {
            const foundGroup = fakeGroups.find(
                (group) => String(group.id) === selectedGroupId
            );

            if (!foundGroup) {
                alert('Izvēlieties grupu.');
                return;
            }

            setAssignmentSuccess(
                `Sagatave piešķirta grupai ${foundGroup.name} (${foundGroup.studentCount} studenti).`
            );
            closeDrawer();
        }
    };

    return (
        <>
            <Head title="Pasūtījuma sagataves priekšskatījums" />

            <TeacherLayout active="templates">
                <BackButton href="/teacher/templates/order-templates" />

                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-tight text-[#182219]">
                                {previewData.scenarioTitle}
                            </h1>
                            <StatusBadge status={previewData.status} />
                        </div>

                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#5b6b61]">
                            Šeit pasniedzējs var pārskatīt pilnu scenāriju pirms tā rediģēšanas
                            vai piešķiršanas studentiem.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(`/teacher/templates/order-templates/${template.id}/edit`)
                            }
                            className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                        >
                            Rediģēt
                        </button>

                        <button
                            type="button"
                            onClick={() => setAssignMode('student')}
                            className="rounded-xl bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                        >
                            Piešķirt studentam
                        </button>

                        <button
                            type="button"
                            onClick={() => setAssignMode('group')}
                            className="rounded-xl border border-[#166a4d] bg-white px-4 py-2 text-[15px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6]"
                        >
                            Piešķirt grupai
                        </button>
                    </div>
                </div>

                {assignmentSuccess && (
                    <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#ecfdf3] px-4 py-3 text-[15px] text-[#166534]">
                        <span className="font-semibold">UI demo:</span> {assignmentSuccess}
                    </div>
                )}

                <div className="mt-6 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Pamata informācija
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Scenārija nosaukums" value={previewData.scenarioTitle} />
                                <InfoRow label="Prioritāte" value={previewData.priority} />
                                <InfoRow label="Statuss" value={previewData.status} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Klienta dati
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Kontaktpersona" value={previewData.clientName} />
                                <InfoRow label="Uzņēmums" value={previewData.clientCompany} />
                                <InfoRow label="Valsts" value={previewData.clientCountry} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Kravas dati
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Kravas nosaukums" value={previewData.cargoName} />
                                <InfoRow label="Svars" value={previewData.cargoWeight} />
                                <InfoRow label="Tilpums" value={previewData.cargoVolume} />
                                <InfoRow label="Kravas vērtība" value={previewData.cargoValue} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Loģistikas nosacījumi
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Transporta veids" value={previewData.transportType} />
                                <InfoRow label="Temperatūras režīms" value={previewData.temperatureMode} />
                                <InfoRow label="Īpašie nosacījumi" value={previewData.specialCondition} />
                                <InfoRow label="Muitas dokuments" value={previewData.customsDocument} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Maršruts un piegāde
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow label="Saņemšanas vieta" value={previewData.pickupLocation} />
                                <InfoRow label="Piegādes vieta" value={previewData.deliveryLocation} />
                                <InfoRow label="Piegādes termiņš" value={previewData.deadline} />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Ātrais kopsavilkums
                            </h2>

                            <div className="mt-5 space-y-4 text-[15px] text-[#5b6b61]">
                                <div>
                                    <span className="font-semibold text-[#182219]">Klients:</span>{' '}
                                    {previewData.clientCompany}
                                </div>

                                <div>
                                    <span className="font-semibold text-[#182219]">Krava:</span>{' '}
                                    {previewData.cargoName}
                                </div>

                                <div>
                                    <span className="font-semibold text-[#182219]">Maršruts:</span>{' '}
                                    {previewData.pickupLocation} → {previewData.deliveryLocation}
                                </div>

                                <div>
                                    <span className="font-semibold text-[#182219]">Prioritāte:</span>{' '}
                                    {previewData.priority}
                                </div>

                                <div>
                                    <span className="font-semibold text-[#182219]">Statuss:</span>{' '}
                                    {previewData.status}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d9ded9] bg-white p-6 shadow-sm">
                            <h2 className="text-[22px] font-semibold text-[#182219]">
                                Pasniedzēja piezīmes
                            </h2>

                            <p className="mt-4 text-[15px] leading-7 text-[#5b6b61]">
                                {previewData.notes}
                            </p>
                        </section>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-40 transition-all duration-300 ${
                        assignMode ? 'pointer-events-auto bg-black/30 opacity-100' : 'pointer-events-none bg-black/0 opacity-0'
                    }`}
                    onClick={closeDrawer}
                />

                <div
                    className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col border-l border-[#d9ded9] bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        assignMode ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="border-b border-[#d9ded9] px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[22px] font-semibold text-[#182219]">
                                    {assignMode === 'student'
                                        ? 'Piešķirt studentam'
                                        : assignMode === 'group'
                                        ? 'Piešķirt grupai'
                                        : 'Piešķiršana'}
                                </h2>

                                <p className="mt-2 text-[15px] text-[#5b6b61]">
                                    {assignMode === 'student'
                                        ? 'Izvēlieties studentu un pievienojiet īsu instrukciju.'
                                        : assignMode === 'group'
                                        ? 'Izvēlieties grupu un pievienojiet kopīgu piezīmi.'
                                        : 'Izvēlieties piešķiršanas veidu.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDrawer}
                                className="rounded-lg border border-[#d9ded9] px-3 py-1 text-[14px] text-[#182219] hover:bg-[#f7f9f7]"
                            >
                                X
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                        <div>
                            <label className="mb-2 block text-[15px] font-medium text-[#182219]">
                                Sagatave
                            </label>
                            <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] px-4 py-3 text-[15px] text-[#182219]">
                                {previewData.scenarioTitle}
                            </div>
                        </div>

                        {assignMode === 'student' && (
                            <div>
                                <label className="mb-2 block text-[15px] font-medium text-[#182219]">
                                    Students
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none focus:border-[#b9c8be]"
                                >
                                    <option value="">Izvēlieties studentu</option>
                                    {fakeStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} — {student.group}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {assignMode === 'group' && (
                            <div>
                                <label className="mb-2 block text-[15px] font-medium text-[#182219]">
                                    Grupa
                                </label>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none focus:border-[#b9c8be]"
                                >
                                    <option value="">Izvēlieties grupu</option>
                                    {fakeGroups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name} — {group.studentCount} studenti
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-[15px] font-medium text-[#182219]">
                                Piezīme
                            </label>
                            <textarea
                                rows={5}
                                value={assignNote}
                                onChange={(e) => setAssignNote(e.target.value)}
                                placeholder="Piemēram, pievērsiet uzmanību temperatūras režīmam un piegādes termiņam."
                                className="w-full rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] text-[#182219] outline-none focus:border-[#b9c8be]"
                            />
                        </div>

                        <div className="rounded-xl border border-[#d9ded9] bg-[#f8faf8] p-4">
                            <h3 className="text-[15px] font-semibold text-[#182219]">
                                Priekšskatījums
                            </h3>

                            <p className="mt-2 text-[14px] leading-6 text-[#5b6b61]">
                                Šajā demonstrācijas režīmā piešķiršana vēl netiek saglabāta
                                datubāzē, bet UI parāda, kā notiks scenārija nodošana
                                studentam vai grupai.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-[#d9ded9] px-6 py-5">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDrawer}
                                className="rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                            >
                                Atcelt
                            </button>

                            <button
                                type="button"
                                onClick={handleAssign}
                                className="rounded-xl bg-[#166a4d] px-4 py-2 text-[15px] font-medium text-white transition hover:bg-[#135740]"
                            >
                                Piešķirt
                            </button>
                        </div>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
}