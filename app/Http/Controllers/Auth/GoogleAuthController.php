<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        $domains = config('services.google.allowed_domains', []);
        $parameters = [];

        if (count($domains) === 1) {
            $parameters['hd'] = $domains[0];
        }

        return $this->googleProvider()
            ->with($parameters)
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = $this->googleProvider()->user();
        } catch (Throwable $exception) {
            Log::warning('Google OAuth callback failed.', [
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
            ]);

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Google pieslegums neizdevas. Ludzu megini velreiz. Ja kluda atkartojas, parbaudi vai sesija un redirect URI sakrit.',
                ]);
        }

        $email = Str::lower((string) $googleUser->getEmail());

        if ($email === '' || ! $this->emailDomainIsAllowed($email)) {
            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Pieslegties drikst tikai ar LJK Google kontu.',
                ]);
        }

        if (! $this->emailIsVerified($googleUser)) {
            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Google konta e-pasts nav apstiprinats.',
                ]);
        }

        $user = $this->findOrCreateUser($googleUser, $email);

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard'));
    }

    private function googleProvider()
    {
        $provider = Socialite::driver('google');
        $verifyPath = (string) config('services.google.http_verify');

        if ($verifyPath !== '') {
            $resolvedVerifyPath = Str::startsWith($verifyPath, ['/', '\\']) || preg_match('/^[A-Za-z]:[\\\\\\/]/', $verifyPath)
                ? $verifyPath
                : base_path($verifyPath);

            if (is_file($resolvedVerifyPath)) {
                $provider->setHttpClient(new Client([
                    'verify' => $resolvedVerifyPath,
                ]));
            }
        }

        return $provider;
    }

    private function findOrCreateUser(SocialiteUser $googleUser, string $email): User
    {
        $googleId = (string) $googleUser->getId();
        $name = trim((string) ($googleUser->getName() ?: $email));
        $firstName = trim((string) data_get($googleUser->user, 'given_name'));
        $lastName = trim((string) data_get($googleUser->user, 'family_name'));

        if ($firstName === '' && $lastName === '') {
            [$firstName, $lastName] = $this->splitName($name);
        }

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (! $user) {
            $user = new User([
                'email' => $email,
                'role' => 'student',
                'password' => Hash::make(Str::random(48)),
            ]);
        }

        $user->forceFill([
            'name' => $name ?: trim($firstName.' '.$lastName) ?: $email,
            'first_name' => $firstName ?: $user->first_name,
            'last_name' => $lastName ?: $user->last_name,
            'google_id' => $googleId,
            'google_avatar' => $googleUser->getAvatar(),
            'google_linked_at' => now(),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        return $user;
    }

    private function emailDomainIsAllowed(string $email): bool
    {
        $domain = Str::afterLast($email, '@');
        $allowedDomains = config('services.google.allowed_domains', []);

        return $domain !== ''
            && in_array($domain, $allowedDomains, strict: true);
    }

    private function emailIsVerified(SocialiteUser $googleUser): bool
    {
        return (bool) data_get($googleUser->user, 'email_verified', true);
    }

    /**
     * @return array{0: string|null, 1: string|null}
     */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2) ?: [];

        return [
            $parts[0] ?? null,
            $parts[1] ?? null,
        ];
    }
}
