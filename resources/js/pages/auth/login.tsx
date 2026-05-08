import { useEffect, useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLogo from '@/components/app-logo';
import { Box } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

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

const inputClassName =
    'h-12 rounded-2xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 caret-slate-900 shadow-none focus-visible:border-[#1B6250] focus-visible:ring-[#1B6250]/20 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400';

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Pieslēgšanās" />

            <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
                <div className="relative hidden min-h-screen overflow-hidden lg:block">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.image}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                                index === activeSlide
                                    ? 'opacity-100'
                                    : 'opacity-0'
                            }`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        />
                    ))}

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-emerald-950/50" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <Box className="size-8 text-white" />
                            <span className="text-sm font-semibold tracking-wide">
                                Loadmaster Simulator
                            </span>
                        </div>

                        <div className="max-w-xl">
                            <div className="mb-8">
                                <div className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                                    Liepājas Jūrniecības koledža
                                </div>
                            </div>

                            <h2 className="min-h-[120px] text-4xl leading-tight font-bold xl:text-5xl">
                                {slides[activeSlide].title}
                            </h2>

                            <p className="mt-4 min-h-[64px] text-white/85">
                                {slides[activeSlide].text}
                            </p>

                            <div className="mt-8 flex gap-3">
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
                                        aria-label={`Slaids ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-300/30 sm:p-10">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex items-center justify-center">
                                <AppLogo className="h-14 w-auto fill-current text-emerald-600" />
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                Pieslēgšanās kontam
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Ievadiet e-pastu un paroli, lai turpinātu darbu
                                simulatorā
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {status}
                            </div>
                        )}

                        <a
                            href="/auth/google/redirect"
                            className="mb-5 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:border-[#1B6250] hover:text-[#1B6250] focus-visible:ring-2 focus-visible:ring-[#1B6250]/20 focus-visible:outline-none"
                        >
                            <svg
                                className="size-5"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
                                />
                            </svg>
                            Turpināt ar Google
                        </a>

                        <div className="mb-5 flex items-center gap-3 text-xs font-medium text-slate-400">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span>vai</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <Form
                            action="/login"
                            method="post"
                            resetOnSuccess={['password']}
                            onSuccess={() => {
                                window.location.assign('/dashboard');
                            }}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-slate-700"
                                            >
                                                E-pasts
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="E-pasta adrese"
                                                className={inputClassName}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-slate-700"
                                                >
                                                    Parole
                                                </Label>
                                                {canResetPassword && (
                                                    <a
                                                        href="https://mans.ljk.lv/forgot-password"
                                                        className="ml-auto text-sm text-slate-600 hover:text-[#1B6250] hover:cursor-pointer hover:underline"
                                                        tabIndex={5}
                                                    >
                                                        Aizmirsi paroli?
                                                    </a>
                                                )}
                                            </div>

                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Ievadi paroli"
                                                className={inputClassName}
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                className="hover:cursor-pointer"
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-slate-700 hover:cursor-pointer"
                                            >
                                                Atcerēties mani
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 h-12 w-full rounded-2xl bg-[#1B6250] text-base text-white hover:cursor-pointer hover:bg-[#1B6250]/90 focus-visible:outline-[#1B6250]/50"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Pieslēgties
                                        </Button>
                                    </div>

                                    
                                </>
                            )}
                        </Form>

                        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                            Loadmaster simulators skolotājiem un studentiem
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
