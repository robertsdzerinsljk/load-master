type DetailInfoCardProps = {
    label: string;
    value: string;
};

export default function DetailInfoCard({ label, value }: DetailInfoCardProps) {
    return (
        <div className="rounded-xl bg-[#f3f5f3] px-4 py-3">
            <p className="text-[13px] text-[#69786f]">{label}</p>
            <p className="mt-1 text-[15px] font-medium text-[#182219]">{value || '—'}</p>
        </div>
    );
}