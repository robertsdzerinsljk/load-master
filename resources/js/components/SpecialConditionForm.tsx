import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

export default function SpecialConditionForm({
    submitLabel = 'Saglabāt',
}: {
    submitLabel?: string;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isShared, setIsShared] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log({ name, description, isShared });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-4xl">
            <div className="rounded-2xl border border-[#d9ded9] bg-white p-6">
                <div>
                    <h2 className="text-[16px] font-semibold text-[#162118]">Pamatinformācija</h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <div className="mt-5 grid gap-4">
                        <div>
                            <label className="mb-2 block text-[14px] font-medium text-[#162118]">
                                Nosaukums *
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 w-full rounded-xl border border-[#d5dbd6] bg-white px-3 text-[14px] outline-none focus:border-[#166a4d]"
                                placeholder="piem., Drošības apsardze"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[14px] font-medium text-[#162118]">
                                Apraksts
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-[#d5dbd6] bg-white px-3 py-3 text-[14px] outline-none focus:border-[#166a4d]"
                                placeholder="Papildu nosacījuma apraksts"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[16px] font-semibold text-[#162118]">Pieejamība</h2>
                    <div className="mt-3 h-px bg-[#e4e8e4]" />

                    <label className="mt-5 flex items-center gap-2 text-[14px] text-[#162118]">
                        <input
                            type="checkbox"
                            checked={isShared}
                            onChange={(e) => setIsShared(e.target.checked)}
                            className="h-4 w-4 rounded border-[#cfd7d1] text-[#166a4d] focus:ring-[#166a4d]"
                        />
                        <span>Padarīt šo nosacījumu pieejamu studentiem</span>
                    </label>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <button
                        type="submit"
                        className="rounded-xl bg-[#166a4d] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#135740]"
                    >
                        {submitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.visit('/teacher/templates/special-conditions')}
                        className="rounded-xl border border-[#d5dbd6] bg-white px-5 py-3 text-[14px] font-medium text-[#162118] hover:bg-[#f3f5f3]"
                    >
                        Atcelt
                    </button>
                </div>
            </div>
        </form>
    );
}