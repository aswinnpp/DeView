import { useState, useEffect, useRef } from "react";

interface SearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    delay?: number;
}

const SearchInput = ({
    placeholder = "Search...",
    onSearch,
    delay = 400,
}: SearchInputProps) => {
    const [value, setValue] = useState("");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // debounce: wait `delay` ms after user stops typing, then call onSearch
    useEffect(() => {
        timerRef.current = setTimeout(() => {
            onSearch(value);
        }, delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [value, delay]);

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#e2e8f0] text-sm focus:outline-none focus:border-[#6366f1] placeholder:text-[#64748b]"
        />
    );
};

export default SearchInput;
