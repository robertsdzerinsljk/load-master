import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

type SidebarNavItemProps = {
    label: string;
    href?: string;
    icon: LucideIcon;
    active?: boolean;
    onClick?: () => void;
};

export default function SidebarNavItem({
    label,
    href,
    icon: Icon,
    active = false,
    onClick,
}: SidebarNavItemProps) {
    const className = [
        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] transition',
        active
            ? 'bg-[#166a4d] text-white'
            : 'text-[#526258] hover:bg-[#edf2ee] hover:text-[#1b2b21]',
    ].join(' ');

    if (href) {
        return (
            <Link href={href} className={className}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{label}</span>
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={className}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="font-medium">{label}</span>
        </button>
    );
}