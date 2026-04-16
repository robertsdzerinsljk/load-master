import { AlertCircle, ClipboardCheck } from 'lucide-react';

type Props = {
    loading: boolean;
    canSubmit: boolean;
    isSubmitted: boolean;
    onSubmit: () => void;
    message?: string | null;
};

export default function SubmitPanel({
    loading,
    canSubmit,
    isSubmitted,
    onSubmit,
    message,
}: Props) {
    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                    Iesniegšana
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Kad izvēles ir pārbaudītas un preview izskatās korekts, iesniedz risinājumu pārbaudei.
                </p>

                <div className="mt-5 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#166a4d]" />
                        <p className="text-[14px] leading-6 text-[#4d5d53]">
                            Pēc iesniegšanas mēģinājums iegūs gala statusu, un to varēs skatīt sadaļā “Mani mēģinājumi”.
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading || isSubmitted || !canSubmit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ClipboardCheck className="h-4 w-4" />
                        {isSubmitted ? 'Risinājums jau ir iesniegts' : 'Iesniegt risinājumu'}
                    </button>
                </div>
            </section>

            {message ? (
                <section className="rounded-[24px] border border-[#d9ded9] bg-white p-4 shadow-sm">
                    <div className="text-[14px] font-medium text-[#182219]">{message}</div>
                </section>
            ) : null}
        </div>
    );
}