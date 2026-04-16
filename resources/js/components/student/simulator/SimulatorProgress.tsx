import { ArrowLeft, ArrowRight } from 'lucide-react';
import { simulatorSteps } from './types';

type Props = {
    currentStepIndex: number;
    loading: boolean;
    onStepClick: (stepKey: string, index: number) => void;
    onPrev: () => void;
    onNext: () => void;
};

export default function SimulatorProgress({
    currentStepIndex,
    loading,
    onStepClick,
    onPrev,
    onNext,
}: Props) {
    const progressPercent = ((currentStepIndex + 1) / simulatorSteps.length) * 100;
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === simulatorSteps.length - 1;

    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-[24px] font-semibold tracking-tight text-[#182219]">
                        Simulatora progress
                    </h2>
                    <p className="mt-1 text-[15px] leading-7 text-[#5b6b61]">
                        Vari virzīties uz priekšu un atgriezties iepriekšējos soļos, nezaudējot jau saglabātās izvēles.
                    </p>
                </div>

                <div className="w-full lg:max-w-sm">
                    <div className="flex items-center justify-between text-[13px] font-medium text-[#6f7b74]">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#edf2ee]">
                        <div
                            className="h-full rounded-full bg-[#166a4d] transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {simulatorSteps.map((step, index) => {
                    const isPastOrCurrent = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <button
                            key={step.key}
                            type="button"
                            onClick={() => onStepClick(step.key, index)}
                            disabled={index > currentStepIndex || loading}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                                isCurrent
                                    ? 'border-[#166a4d] bg-[#edf6f0]'
                                    : isPastOrCurrent
                                    ? 'border-[#dce7df] bg-[#f8fbf9] hover:border-[#bfd2c5] hover:bg-white'
                                    : 'cursor-not-allowed border-[#e7ece7] bg-white opacity-50'
                            }`}
                        >
                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                Solis {index + 1}
                            </div>
                            <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                                {step.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[#e7ece7] pt-5 md:flex-row md:items-center md:justify-between">
                <div className="text-[14px] text-[#5b6b61]">
                    Pašreizējais solis:{' '}
                    <span className="font-semibold text-[#182219]">
                        {simulatorSteps[currentStepIndex]?.label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={loading || isFirstStep}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-3 text-[15px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Iepriekšējais solis
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={loading || isLastStep}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Nākamais solis
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}