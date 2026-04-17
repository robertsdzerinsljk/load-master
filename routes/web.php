<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Common\RoleSwitchController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Teacher\TransportTemplateController;
use App\Http\Controllers\Teacher\TemperatureModeController;
use App\Http\Controllers\Teacher\PortController;
use App\Http\Controllers\Teacher\ShipController;
use App\Http\Controllers\Teacher\SpecialConditionController;
use App\Http\Controllers\Teacher\LocationController;
use App\Http\Controllers\Teacher\CustomsDocumentController;
use App\Http\Controllers\Teacher\LandRouteController;
use App\Http\Controllers\Teacher\RouteFuelStopController;
use App\Http\Controllers\Teacher\FuelStationController;
use App\Http\Controllers\Teacher\OrderTemplateController;
use App\Http\Controllers\Teacher\AssignedTaskController;
use App\Http\Controllers\Teacher\StudentController;
use App\Http\Controllers\Student\SimulationAttemptController;
use App\Http\Controllers\Student\AttemptController;

Route::get('/', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    // adjust this to however you store the user role
    return auth()->user()->role === 'teacher'
        ? redirect()->route('teacher.dashboard')
        : redirect()->route('student.dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/teacher', [TeacherDashboardController::class, 'index'])
        ->name('teacher.dashboard');

    Route::get('/teacher/templates', function () {
        return Inertia::render('Teacher/Templates/Index');
    })->name('teacher.templates');

    /*
    |--------------------------------------------------------------------------
    | Transport templates
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/transport', [TransportTemplateController::class, 'index'])
        ->name('teacher.templates.transport');
    Route::get('/teacher/templates/transport/create', [TransportTemplateController::class, 'create'])
        ->name('teacher.templates.transport.create');
    Route::post('/teacher/templates/transport', [TransportTemplateController::class, 'store'])
        ->name('teacher.templates.transport.store');
    Route::get('/teacher/templates/transport/{id}/edit', [TransportTemplateController::class, 'edit'])
        ->name('teacher.templates.transport.edit');
    Route::put('/teacher/templates/transport/{id}', [TransportTemplateController::class, 'update'])
        ->name('teacher.templates.transport.update');
    Route::delete('/teacher/templates/transport/{id}', [TransportTemplateController::class, 'destroy'])
        ->name('teacher.templates.transport.destroy');

    /*
    |--------------------------------------------------------------------------
    | Temperature modes
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/temperature', [TemperatureModeController::class, 'index'])
        ->name('teacher.templates.temperature');
    Route::get('/teacher/templates/temperature/create', [TemperatureModeController::class, 'create'])
        ->name('teacher.templates.temperature.create');
    Route::post('/teacher/templates/temperature', [TemperatureModeController::class, 'store'])
        ->name('teacher.templates.temperature.store');
    Route::get('/teacher/templates/temperature/{id}/edit', [TemperatureModeController::class, 'edit'])
        ->name('teacher.templates.temperature.edit');
    Route::put('/teacher/templates/temperature/{id}', [TemperatureModeController::class, 'update'])
        ->name('teacher.templates.temperature.update');
    Route::delete('/teacher/templates/temperature/{id}', [TemperatureModeController::class, 'destroy'])
        ->name('teacher.templates.temperature.destroy');

    /*
    |--------------------------------------------------------------------------
    | Special Conditions
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/special-conditions', [SpecialConditionController::class, 'index'])
        ->name('teacher.templates.special-conditions');
    Route::get('/teacher/templates/special-conditions/create', [SpecialConditionController::class, 'create'])
        ->name('teacher.templates.special-conditions.create');
    Route::post('/teacher/templates/special-conditions', [SpecialConditionController::class, 'store'])
        ->name('teacher.templates.special-conditions.store');
    Route::get('/teacher/templates/special-conditions/{id}/edit', [SpecialConditionController::class, 'edit'])
        ->name('teacher.templates.special-conditions.edit');
    Route::put('/teacher/templates/special-conditions/{id}', [SpecialConditionController::class, 'update'])
        ->name('teacher.templates.special-conditions.update');
    Route::delete('/teacher/templates/special-conditions/{id}', [SpecialConditionController::class, 'destroy'])
        ->name('teacher.templates.special-conditions.destroy');

    /*
    |--------------------------------------------------------------------------
    | Customs Documents
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/customs', [CustomsDocumentController::class, 'index'])
        ->name('teacher.templates.customs');
    Route::get('/teacher/templates/customs/create', [CustomsDocumentController::class, 'create'])
        ->name('teacher.templates.customs.create');
    Route::post('/teacher/templates/customs', [CustomsDocumentController::class, 'store'])
        ->name('teacher.templates.customs.store');
    Route::get('/teacher/templates/customs/{id}/edit', [CustomsDocumentController::class, 'edit'])
        ->name('teacher.templates.customs.edit');
    Route::put('/teacher/templates/customs/{id}', [CustomsDocumentController::class, 'update'])
        ->name('teacher.templates.customs.update');
    Route::delete('/teacher/templates/customs/{id}', [CustomsDocumentController::class, 'destroy'])
        ->name('teacher.templates.customs.destroy');

    /*
    |--------------------------------------------------------------------------
    | Order Templates
    |--------------------------------------------------------------------------
    */
    Route::prefix('teacher/templates/order-templates')->group(function () {
        Route::get('/', [OrderTemplateController::class, 'index'])
            ->name('teacher.templates.order-templates');
        Route::get('/create', [OrderTemplateController::class, 'create'])
            ->name('teacher.templates.order-templates.create');
        Route::post('/', [OrderTemplateController::class, 'store'])
            ->name('teacher.templates.order-templates.store');
        Route::post('/preview', [OrderTemplateController::class, 'preview'])
            ->name('teacher.templates.order-templates.preview');
        Route::post('/{id}/preview', [OrderTemplateController::class, 'previewSaved'])
            ->name('teacher.templates.order-templates.preview-saved');
        Route::get('/{id}', [OrderTemplateController::class, 'show'])
            ->name('teacher.templates.order-templates.show');
        Route::get('/{id}/edit', [OrderTemplateController::class, 'edit'])
            ->name('teacher.templates.order-templates.edit');
        Route::put('/{id}', [OrderTemplateController::class, 'update'])
            ->name('teacher.templates.order-templates.update');
    });

    /*
    |--------------------------------------------------------------------------
    | Ports
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/ports', [PortController::class, 'index'])
        ->name('teacher.templates.ports');
    Route::get('/teacher/templates/ports/create', [PortController::class, 'create'])
        ->name('teacher.templates.ports.create');
    Route::post('/teacher/templates/ports', [PortController::class, 'store'])
        ->name('teacher.templates.ports.store');
    Route::get('/teacher/templates/ports/{id}/edit', [PortController::class, 'edit'])
        ->name('teacher.templates.ports.edit');
    Route::put('/teacher/templates/ports/{id}', [PortController::class, 'update'])
        ->name('teacher.templates.ports.update');
    Route::delete('/teacher/templates/ports/{id}', [PortController::class, 'destroy'])
        ->name('teacher.templates.ports.destroy');

    /*
    |--------------------------------------------------------------------------
    | Ships
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/ships', [ShipController::class, 'index'])
        ->name('teacher.templates.ships');
    Route::get('/teacher/templates/ships/create', [ShipController::class, 'create'])
        ->name('teacher.templates.ships.create');
    Route::post('/teacher/templates/ships', [ShipController::class, 'store'])
        ->name('teacher.templates.ships.store');
    Route::get('/teacher/templates/ships/{id}/edit', [ShipController::class, 'edit'])
        ->name('teacher.templates.ships.edit');
    Route::put('/teacher/templates/ships/{id}', [ShipController::class, 'update'])
        ->name('teacher.templates.ships.update');
    Route::delete('/teacher/templates/ships/{id}', [ShipController::class, 'destroy'])
        ->name('teacher.templates.ships.destroy');

    /*
    |--------------------------------------------------------------------------
    | Locations
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/locations', [LocationController::class, 'index'])
        ->name('teacher.templates.locations');
    Route::get('/teacher/templates/locations/create', [LocationController::class, 'create'])
        ->name('teacher.templates.locations.create');
    Route::post('/teacher/templates/locations', [LocationController::class, 'store'])
        ->name('teacher.templates.locations.store');
    Route::get('/teacher/templates/locations/{id}/edit', [LocationController::class, 'edit'])
        ->name('teacher.templates.locations.edit');
    Route::put('/teacher/templates/locations/{id}', [LocationController::class, 'update'])
        ->name('teacher.templates.locations.update');
    Route::delete('/teacher/templates/locations/{id}', [LocationController::class, 'destroy'])
        ->name('teacher.templates.locations.destroy');

    /*
    |--------------------------------------------------------------------------
    | Land Routes
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/land-routes', [LandRouteController::class, 'index'])
        ->name('teacher.templates.land-routes');
    Route::get('/teacher/templates/land-routes/create', [LandRouteController::class, 'create'])
        ->name('teacher.templates.land-routes.create');
    Route::post('/teacher/templates/land-routes', [LandRouteController::class, 'store'])
        ->name('teacher.templates.land-routes.store');
    Route::get('/teacher/templates/land-routes/{id}/edit', [LandRouteController::class, 'edit'])
        ->name('teacher.templates.land-routes.edit');
    Route::put('/teacher/templates/land-routes/{id}', [LandRouteController::class, 'update'])
        ->name('teacher.templates.land-routes.update');
    Route::delete('/teacher/templates/land-routes/{id}', [LandRouteController::class, 'destroy'])
        ->name('teacher.templates.land-routes.destroy');

    /*
    |--------------------------------------------------------------------------
    | Fuel Stations
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/fuel-stations', [FuelStationController::class, 'index'])
        ->name('teacher.templates.fuel-stations');
    Route::get('/teacher/templates/fuel-stations/create', [FuelStationController::class, 'create'])
        ->name('teacher.templates.fuel-stations.create');
    Route::post('/teacher/templates/fuel-stations', [FuelStationController::class, 'store'])
        ->name('teacher.templates.fuel-stations.store');
    Route::get('/teacher/templates/fuel-stations/{id}/edit', [FuelStationController::class, 'edit'])
        ->name('teacher.templates.fuel-stations.edit');
    Route::put('/teacher/templates/fuel-stations/{id}', [FuelStationController::class, 'update'])
        ->name('teacher.templates.fuel-stations.update');
    Route::delete('/teacher/templates/fuel-stations/{id}', [FuelStationController::class, 'destroy'])
        ->name('teacher.templates.fuel-stations.destroy');

    /*
    |--------------------------------------------------------------------------
    | Route Fuel Stops
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/templates/route-fuel-stops', [RouteFuelStopController::class, 'index'])
        ->name('teacher.templates.route-fuel-stops');
    Route::get('/teacher/templates/route-fuel-stops/create', [RouteFuelStopController::class, 'create'])
        ->name('teacher.templates.route-fuel-stops.create');
    Route::post('/teacher/templates/route-fuel-stops', [RouteFuelStopController::class, 'store'])
        ->name('teacher.templates.route-fuel-stops.store');
    Route::get('/teacher/templates/route-fuel-stops/{id}/edit', [RouteFuelStopController::class, 'edit'])
        ->name('teacher.templates.route-fuel-stops.edit');
    Route::put('/teacher/templates/route-fuel-stops/{id}', [RouteFuelStopController::class, 'update'])
        ->name('teacher.templates.route-fuel-stops.update');
    Route::delete('/teacher/templates/route-fuel-stops/{id}', [RouteFuelStopController::class, 'destroy'])
        ->name('teacher.templates.route-fuel-stops.destroy');

    /*
    |--------------------------------------------------------------------------
    | Students
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/students', [StudentController::class, 'index'])
        ->name('teacher.students');
    Route::post('/teacher/students/assign-task', [StudentController::class, 'assignTask'])
        ->name('teacher.students.assign-task');

    /*
    |--------------------------------------------------------------------------
    | Assigned tasks
    |--------------------------------------------------------------------------
    */
    Route::get('/teacher/assigned-tasks/{id}', [AssignedTaskController::class, 'show'])
        ->name('teacher.assigned-tasks.show');

   /*
|--------------------------------------------------------------------------
| Student dashboard + simulator
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/', [SimulationAttemptController::class, 'indexTasks'])
            ->name('dashboard');

        Route::get('/attempts', [AttemptController::class, 'index'])
            ->name('attempts.index');

        Route::prefix('simulator')->name('simulator.')->group(function () {
            Route::get('/task/{orderTemplateId}', [SimulationAttemptController::class, 'showTask'])
                ->name('task');

            Route::get('/{id}', [SimulationAttemptController::class, 'start'])
                ->name('start');

            Route::post('/attempt/{attemptId}/step', [SimulationAttemptController::class, 'updateStep'])
                ->name('attempt.step');

            Route::post('/attempt/{attemptId}/submit', [SimulationAttemptController::class, 'submit'])
                ->name('attempt.submit');

            Route::post('/attempt/{attemptId}/route-segments', [SimulationAttemptController::class, 'addRouteSegment'])
                ->name('attempt.route-segments.store');

            Route::delete('/attempt/{attemptId}/route-segments/{segmentId}', [SimulationAttemptController::class, 'removeRouteSegment'])
                ->name('attempt.route-segments.destroy');

            Route::post('/attempt/{attemptId}/fuel-stations', [SimulationAttemptController::class, 'addFuelStation'])
                ->name('attempt.fuel-stations.store');

            Route::delete('/attempt/{attemptId}/fuel-stations/{stationId}', [SimulationAttemptController::class, 'removeFuelStation'])
                ->name('attempt.fuel-stations.destroy');
        });
    });
});