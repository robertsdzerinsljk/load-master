import { simulatorSteps } from './types';

type Props = {
    currentStepIndex: number;
    loading?: boolean;
    onStepClick?: (stepKey: string, index: number) => void;
    onPrev?: () => void;
    onNext?: () => void;
    availableSteps: string[];
};

export default function SimulatorProgress({
    currentStepIndex,
    loading,
    onStepClick,
    onPrev,
    onNext,
    availableSteps,
}: Props) {
    // 🔥 filtrējam tikai aktīvos soļus
    const enabledSteps = simulatorSteps.filter((step) =>
        availableSteps.includes(step.key)
    );

    const totalSteps = enabledSteps.length;

    const progressPercent =
        totalSteps > 1
            ? Math.round((currentStepIndex / (totalSteps - 1)) * 100)
            : 0;

    return (
        <section className="rounded-[24px] border border-[#d9ded9] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#182219]">
                    Simulatora progress
                </h3>

                <div className="text-[13px] text-[#5b6b61]">
                    Progress: {progressPercent}%
                </div>
            </div>

            {/* progress bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-[#e6ebe7]">
                <div
                    className="h-2 rounded-full bg-[#166a4d] transition-all"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* step buttons */}
            <div className="mt-5 grid gap-3 md:grid-cols-4">
                {enabledSteps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <button
                            key={step.key}
                            type="button"
                            disabled={loading}
                            onClick={() => onStepClick?.(step.key, index)}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                                isActive
                                    ? 'border-[#166a4d] bg-[#e9f5ef]'
                                    : isCompleted
                                    ? 'border-[#cfe3d8] bg-[#f4faf7]'
                                    : 'border-[#d9ded9] bg-white'
                            }`}
                        >
                            <div className="text-[11px] uppercase tracking-wide text-[#7a877f]">
                                Solis {index + 1}
                            </div>

                            <div className="mt-1 text-[14px] font-medium text-[#182219]">
                                {step.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* navigation */}
            <div className="mt-5 flex justify-between">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={loading || currentStepIndex === 0}
                    className="rounded-xl border border-[#d9ded9] px-4 py-2 text-[14px] text-[#182219] hover:bg-[#f7f9f7] disabled:opacity-50"
                >
                    ← Iepriekšējais solis
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={loading || currentStepIndex === totalSteps - 1}
                    className="rounded-xl bg-[#166a4d] px-4 py-2 text-[14px] text-white hover:bg-[#135740] disabled:opacity-50"
                >
                    Nākamais solis →
                </button>
            </div>
        </section>
    );
}