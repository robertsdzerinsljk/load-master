import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Uz augšu"
            className={`fixed bottom-6 right-2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-[#166A4D] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-700 hover:cursor-pointer ${
                isVisible
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-3 opacity-0'
            }`}
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}