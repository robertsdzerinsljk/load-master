import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
    label?: string;
    href?: string;
    fallbackHref?: string;
    className?: string;
};

export default function BackButton({
    label = 'Atpakal',
    href,
    fallbackHref = '/teacher',
    className = '',
}: BackButtonProps) {
    const handleBack = () => {
        if (href) {
            window.location.href = href;
            return;
        }

        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = fallbackHref;
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className={[
                'inline-flex items-center gap-2 rounded-xl px-1 py-1 text-[14px] font-medium text-[#5f6f65] transition hover:text-[#182219]',
                className,
            ].join(' ')}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </button>
    );
}
