import { useEffect, useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLogo from '@/components/app-logo';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
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
                                index === activeSlide ? 'opacity-100' : 'opacity-0'
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

                            <h2 className="min-h-[120px] text-4xl font-bold leading-tight xl:text-5xl">
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
                                Ievadiet e-pastu un paroli, lai turpinātu darbu simulatorā
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">E-pasts</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="teacher@test.com"
                                                className="h-12 rounded-2xl"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">Parole</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm"
                                                        tabIndex={5}
                                                    >
                                                        Aizmirsi paroli?
                                                    </TextLink>
                                                )}
                                            </div>

                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Ievadi paroli"
                                                className="h-12 rounded-2xl"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">
                                                Atcerēties mani
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 h-12 w-full rounded-2xl bg-[#1B6250] text-base hover:bg-[#1B6250]/90 focus-visible:outline-[#1B6250]/50 hover:cursor-pointer"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Pieslēgties
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="text-center text-sm text-muted-foreground">
                                            Vēl nav konta?{' '}
                                            <TextLink href={register()} tabIndex={5}>
                                                Reģistrēties
                                            </TextLink>
                                        </div>
                                    )}
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