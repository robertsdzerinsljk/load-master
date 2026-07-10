<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private const ROLES = ['admin', 'teacher', 'student'];

    public function index(): Response
    {
        $users = User::query()
            ->with('class:id,name,code,academic_year')
            ->orderByRaw("CASE role WHEN 'admin' THEN 0 WHEN 'teacher' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => $this->serializeUser($user));

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'classes' => $this->classes(),
            'roles' => self::ROLES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        User::query()->create([
            ...$this->userPayload($data),
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'Lietotājs izveidots.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $this->validated($request, $user);

        if (
            $request->user()?->is($user)
            && ($data['role'] ?? null) !== 'admin'
            && ! (bool) ($data['is_admin'] ?? false)
        ) {
            return back()->withErrors([
                'is_admin' => 'Tu nevari noņemt sev administratora piekļuvi.',
            ]);
        }

        $payload = $this->userPayload($data);

        if (($data['password'] ?? '') !== '') {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->forceFill($payload)->save();

        return back()->with('success', 'Lietotājs atjaunināts.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->is($user)) {
            return back()->withErrors([
                'user' => 'Tu nevari dzēst savu administratora kontu.',
            ]);
        }

        $user->delete();

        return back()->with('success', 'Lietotājs dzēsts.');
    }

    private function validated(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user),
            ],
            'role' => ['required', Rule::in(self::ROLES)],
            'is_admin' => ['nullable', 'boolean'],
            'class_id' => ['nullable', 'exists:school_classes,id'],
            'password' => [
                $user ? 'nullable' : 'required',
                'string',
                Password::defaults(),
            ],
        ]);
    }

    private function userPayload(array $data): array
    {
        $firstName = trim($data['first_name']);
        $lastName = trim($data['last_name']);
        $role = $data['role'];

        return [
            'name' => trim("{$firstName} {$lastName}"),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $data['email'],
            'role' => $role,
            'is_admin' => $role === 'admin' || (bool) ($data['is_admin'] ?? false),
            'class_id' => $role === 'student' ? ($data['class_id'] ?? null) : null,
        ];
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'is_admin' => (bool) $user->is_admin,
            'class_id' => $user->class_id,
            'created_at' => optional($user->created_at)?->format('Y-m-d'),
            'class' => $user->class ? [
                'id' => $user->class->id,
                'name' => $user->class->name,
                'code' => $user->class->code,
                'academic_year' => $user->class->academic_year,
            ] : null,
            'has_google' => filled($user->google_id),
        ];
    }

    private function classes()
    {
        return SchoolClass::query()
            ->select(['id', 'name', 'code', 'academic_year'])
            ->orderByDesc('academic_year')
            ->orderByRaw('sort_order IS NULL')
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get()
            ->map(fn (SchoolClass $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'code' => $class->code,
                'academic_year' => $class->academic_year,
            ])
            ->values();
    }
}
