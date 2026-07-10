<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentGroupController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'student', 403);

        if ($user->class_id) {
            return redirect()->route('student.dashboard');
        }

        $classes = $this->availableClasses();

        return Inertia::render('Onboarding/StudentGroup', [
            'classes' => $classes,
            'academicYears' => $classes
                ->pluck('academic_year')
                ->filter()
                ->unique()
                ->values(),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'student', 403);

        $classes = SchoolClass::query()->pluck('id')->all();

        $data = $request->validate([
            'academic_year' => ['required', 'string', 'max:20'],
            'class_id' => ['required', Rule::in($classes)],
        ]);

        $class = SchoolClass::query()
            ->whereKey($data['class_id'])
            ->where('academic_year', $data['academic_year'])
            ->firstOrFail();

        $user->forceFill([
            'class_id' => $class->id,
        ])->save();

        return redirect()->route('student.dashboard');
    }

    private function availableClasses()
    {
        return SchoolClass::query()
            ->select(['id', 'name', 'code', 'academic_year'])
            ->orderByDesc('academic_year')
            ->orderByRaw('sort_order IS NULL')
            ->orderBy('sort_order')
            ->orderBy('code')
            ->orderBy('name')
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
