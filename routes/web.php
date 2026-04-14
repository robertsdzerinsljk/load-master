<?php

use App\Http\Controllers\Common\RoleSwitchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [RoleSwitchController::class, 'index'])->name('role.select');

Route::post('/switch-role/teacher', [RoleSwitchController::class, 'setTeacher'])->name('role.teacher');
Route::post('/switch-role/student', [RoleSwitchController::class, 'setStudent'])->name('role.student');

Route::get('/teacher', function () {
    return Inertia::render('Teacher/Dashboard');
})->name('teacher.dashboard');

Route::get('/teacher/create-order', function () {
    return Inertia::render('Teacher/CreateOrder');
})->name('teacher.create-order');

Route::get('/student', function () {
    return Inertia::render('Student/Dashboard');
})->name('student.dashboard');

Route::get('/student/create-order', function () {
    return Inertia::render('Student/CreateOrder');
})->name('student.create-order');

Route::get('/teacher/students', function () {
    return Inertia::render('Teacher/Students/Index');
})->name('teacher.students');

Route::get('/teacher/templates', function () {
    return Inertia::render('Teacher/Templates/Index');
})->name('teacher.templates');

Route::get('/teacher/templates/transport', function () {
    return Inertia::render('Teacher/Templates/Transport/Index');
})->name('teacher.templates.transport');

Route::get('/teacher/templates/transport/create', function () {
    return Inertia::render('Teacher/Templates/Transport/Create');
})->name('teacher.templates.transport.create');

Route::get('/teacher/templates/transport/{id}/edit', function ($id) {
    return Inertia::render('Teacher/Templates/Transport/Edit', [
        'id' => (int) $id,
    ]);
})->name('teacher.templates.transport.edit');

Route::get('/teacher/orders/1', function () {
    return Inertia::render('Teacher/Orders/Show');
})->name('teacher.orders.show');

Route::get('/teacher/templates/temperature', function () {
    return Inertia::render('Teacher/Templates/Temperature/Index');
})->name('teacher.templates.temperature');

Route::get('/teacher/templates/temperature/create', function () {
    return Inertia::render('Teacher/Templates/Temperature/Create');
})->name('teacher.templates.temperature.create');

Route::get('/teacher/templates/temperature/{id}/edit', function ($id) {
    return Inertia::render('Teacher/Templates/Temperature/Edit', [
        'id' => (int) $id,
    ]);
})->name('teacher.templates.temperature.edit');

Route::get('/teacher/templates/special-conditions', function () {
    return Inertia::render('Teacher/Templates/SpecialConditions/Index');
})->name('teacher.templates.special-conditions');

Route::get('/teacher/templates/special-conditions/create', function () {
    return Inertia::render('Teacher/Templates/SpecialConditions/Create');
})->name('teacher.templates.special-conditions.create');

Route::get('/teacher/templates/special-conditions/{id}/edit', function ($id) {
    return Inertia::render('Teacher/Templates/SpecialConditions/Edit', [
        'id' => (int) $id,
    ]);
})->name('teacher.templates.special-conditions.edit');

Route::get('/teacher/templates/customs', function () {
    return Inertia::render('Teacher/Templates/Customs/Index');
})->name('teacher.templates.customs');

Route::get('/teacher/templates/customs/create', function () {
    return Inertia::render('Teacher/Templates/Customs/Create');
})->name('teacher.templates.customs.create');

Route::get('/teacher/templates/customs/{id}/edit', function ($id) {
    return Inertia::render('Teacher/Templates/Customs/Edit', [
        'id' => (int) $id,
    ]);
})->name('teacher.templates.customs.edit');

Route::prefix('teacher/templates/order-templates')->group(function () {
    Route::get('/', fn () => Inertia::render('Teacher/Templates/OrderTemplates/Index'))
        ->name('teacher.templates.order-templates');

    Route::get('/create', fn () => Inertia::render('Teacher/Templates/OrderTemplates/Create'))
        ->name('teacher.templates.order-templates.create');

    Route::get('/{id}', fn ($id) => Inertia::render('Teacher/Templates/OrderTemplates/Show', [
        'id' => (int) $id,
    ]))->name('teacher.templates.order-templates.show');    

    Route::get('/{id}/edit', fn ($id) => Inertia::render('Teacher/Templates/OrderTemplates/Edit', [
        'id' => (int) $id,
    ]))->name('teacher.templates.order-templates.edit');
});

Route::get('/teacher/assigned-tasks/{id}', function ($id) {
    return Inertia::render('Teacher/AssignedTasks/Show', [
        'id' => (int) $id,
    ]);
})->name('teacher.assigned-tasks.show');