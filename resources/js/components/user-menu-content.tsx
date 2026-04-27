import { Link, router } from '@inertiajs/react';
import { LogOut, Palette, Shield, User } from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { User as UserType } from '@/types';

type Props = {
    user: UserType;
};

export function UserMenuContent({ user }: Props) {
    return (
        <>
            <div className="px-2 py-1.5">
                <div className="text-sm font-semibold text-[#182219]">
                    {user.name}
                </div>
                <div className="text-xs text-[#5b6b61]">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/settings/security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/settings/appearance" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Appearance
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onSelect={(event) => {
                    event.preventDefault();
                    router.post('/logout');
                }}
                className="flex items-center gap-2"
            >
                <LogOut className="h-4 w-4" />
                Log out
            </DropdownMenuItem>
        </>
    );
}
