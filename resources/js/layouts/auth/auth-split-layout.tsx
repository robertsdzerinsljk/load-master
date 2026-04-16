import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';

const slides = [
    {
        image: '/images/auth/slide-1.jpg',
        title: 'Gudrāka kravu plānošana',
        text: 'Simulē maršrutus, transportu un loģistikas lēmumus vienotā mācību vidē.',
    },
    {
        image: '/images/auth/slide-2.jpg',
        title: 'Praktiski scenāriji studentiem',
        text: 'No ostām un kuģiem līdz sauszemes piegādēm un izmaksu izvērtēšanai.',
    },
    {
        image: '/images/auth/slide-3.jpg',
        title: 'Mūsdienīgs Loadmaster risinājums',
        text: 'Skolotāji veido uzdevumus, studenti tos risina digitālā simulatorā.',
    },
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
            <div className="relative hidden min-h-screen overflow-hidden lg:block">
                {slides.map((slide, index) => (
                    <div
                        key={slide.image}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                            index === activeSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                ))}

                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-emerald-950/50" />

                <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm transition hover:bg-white/15"
                        >
                            <AppLogoIcon className="size-8 fill-current text-white" />
                            <span className="text-sm font-semibold tracking-wide">
                                {name}
                            </span>
                        </Link>
                    </div>

                    <div className="max-w-xl">
                        <div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                            Loadmaster Simulator
                        </div>

                        <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
                            {slides[activeSlide].title}
                        </h2>

                        <p className="mt-4 max-w-lg text-base leading-7 text-white/85 xl:text-lg">
                            {slides[activeSlide].text}
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveSlide(index)}
                                    className={`h-3 rounded-full transition-all ${
                                        index === activeSlide
                                            ? 'w-10 bg-white'
                                            : 'w-3 bg-white/40 hover:bg-white/60'
                                    }`}
                                    aria-label={`Slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-300/30 sm:p-10">
                    <div className="mb-8 text-center">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center justify-center"
                        >
                            <AppLogoIcon className="h-14 w-auto fill-current text-emerald-600" />
                        </Link>

                        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <div className="space-y-6">{children}</div>

                    <div className="mt-8 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                        Liepājas Jūrniecības koledžas Loadmaster simulators
                    </div>
                </div>
            </div>
        </div>
    );
}