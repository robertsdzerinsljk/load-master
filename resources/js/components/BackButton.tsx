import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
    href?: string;
    label?: string;
};

export default function BackButton({
    href,
    label = 'Atpakaļ',
}: BackButtonProps) {
    const handleClick = () => {
        if (href) {
            router.visit(href);
            return;
        }

        window.history.back();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 text-[14px] text-[#5f6f65] transition hover:text-[#182219]"
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </button>
    );
}