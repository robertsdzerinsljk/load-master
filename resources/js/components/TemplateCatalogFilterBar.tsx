import { Search, SlidersHorizontal, X } from 'lucide-react';

type FilterOption = {
    key: string;
    label: string;
    value: string;
    options: string[];
    allLabel?: string;
    onChange: (value: string) => void;
};

type TemplateCatalogFilterBarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    filters?: FilterOption[];
    onClear: () => void;
    resultCount: number;
    totalCount: number;
};

export default function TemplateCatalogFilterBar({
    search,
    onSearchChange,
    searchPlaceholder,
    filters = [],
    onClear,
    resultCount,
    totalCount,
}: TemplateCatalogFilterBarProps) {
    const hasActiveFilters =
        search.trim() !== '' ||
        filters.some((filter) => filter.value !== 'all');

    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-white p-3 shadow-sm">
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-center">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-11 w-full rounded-xl border border-[#d9ded9] bg-white pr-4 pl-10 text-[14px] text-[#182219] transition outline-none placeholder:text-[#97a39b] focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {filters.map((filter) => (
                        <label
                            key={filter.key}
                            className="grid gap-1 text-xs font-semibold tracking-[0.08em] text-[#75827a] uppercase"
                        >
                            <span>{filter.label}</span>
                            <select
                                value={filter.value}
                                onChange={(event) =>
                                    filter.onChange(event.target.value)
                                }
                                className="h-11 min-w-[160px] rounded-xl border border-[#d9ded9] bg-white px-3 text-sm font-medium tracking-normal text-[#182219] normal-case transition outline-none focus:border-[#b6c7bb] focus:ring-4 focus:ring-[#edf6f0]"
                            >
                                <option value="all">
                                    {filter.allLabel ?? 'Visi'}
                                </option>
                                {filter.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}

                    <div className="ml-auto flex items-center gap-2 self-end">
                        <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f8fbf9] px-3 text-sm font-medium text-[#5f6d65]">
                            <SlidersHorizontal className="h-4 w-4 text-[#166a4d]" />
                            {resultCount}/{totalCount}
                        </span>

                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={onClear}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 text-sm font-semibold text-[#166a4d] transition hover:bg-[#f6faf7]"
                            >
                                <X className="h-4 w-4" />
                                Notīrīt
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
