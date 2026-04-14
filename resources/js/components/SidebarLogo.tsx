type SidebarLogoProps = {
    compact?: boolean;
};

export default function SidebarLogo({ compact = false }: SidebarLogoProps) {
    return (
        <div className="border-b border-[#d8ddd8] px-4 py-6">
            <div className="flex items-center gap-3">
                <img
                    src="/images/ljk-logo.png"
                    alt="LJK logo"
                    className={compact ? 'h-10 w-auto' : 'h-12 w-auto'}
                />
            </div>

            <p className="mt-4 text-[13px] tracking-[0.08em] text-[#4b5d53] uppercase">
                Loģistikas simulators
            </p>
        </div>
    );
}