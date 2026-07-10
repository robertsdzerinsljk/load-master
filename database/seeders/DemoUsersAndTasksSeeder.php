<?php

namespace Database\Seeders;

use App\Models\FuelStation;
use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\SchoolClass;
use App\Models\Ship;
use App\Models\SimulationAttempt;
use App\Models\TeacherFeedback;
use App\Models\TemperatureMode;
use App\Models\TransportTemplate;
use App\Models\User;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DemoUsersAndTasksSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        if (! $this->hasRequiredLogisticsData()) {
            $this->call(LogisticsDemoSeeder::class);
        }

        $teacher = $this->seedTeacher();
        $classes = $this->seedClasses($teacher);
        $students = $this->seedStudents($classes);
        $templates = $this->seedOrderTemplates();

        $this->assignTasks($students, $templates);
        $this->seedAttempts($students, $templates);
    }

    private function hasRequiredLogisticsData(): bool
    {
        return Location::query()->where('name', 'Rīga')->where('type', 'city')->exists()
            && Location::query()->where('name', 'Liepāja')->where('type', 'city')->exists()
            && Location::query()->where('name', 'Ventspils')->where('type', 'city')->exists()
            && TransportTemplate::query()->exists()
            && Port::query()->exists()
            && Ship::query()->exists()
            && LandRoute::query()->exists();
    }

    private function seedTeacher(): User
    {
        return User::query()->updateOrCreate(
            ['email' => 'teacher@loadmaster.test'],
            [
                'name' => 'Marta Liepina',
                'first_name' => 'Marta',
                'last_name' => 'Liepina',
                'role' => 'teacher',
                'password' => Hash::make(self::PASSWORD),
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * @return array<string, SchoolClass>
     */
    private function seedClasses(User $teacher): array
    {
        $definitions = [
            'M-11' => [
                'name' => 'Loģistika LT-2A',
                'academic_year' => '2026/2027',
                'description' => 'Otrā kursa grupa transporta plānošanas praktiskajiem darbiem.',
            ],
            'S-11' => [
                'name' => 'Loģistika LT-3B',
                'academic_year' => '2026/2027',
                'description' => 'Trešā kursa grupa multimodālo pārvadājumu scenārijiem.',
            ],
        ];

        $classes = [];

        foreach ($definitions as $code => $definition) {
            $classes[$code] = SchoolClass::query()->updateOrCreate(
                ['code' => $code, 'academic_year' => $definition['academic_year']],
                [
                    'teacher_id' => $teacher->id,
                    'name' => $code,
                    'academic_year' => $definition['academic_year'],
                    'description' => $definition['description'],
                ],
            );
        }

        return $classes;
    }

    /**
     * @param  array<string, SchoolClass>  $classes
     * @return array<string, User>
     */
    private function seedStudents(array $classes): array
    {
        $definitions = [
            'anna' => ['Anna', 'Kalnina', 'anna.kalnina@loadmaster.test', 'M-11'],
            'roberts' => ['Roberts', 'Ozols', 'roberts.ozols@loadmaster.test', 'M-11'],
            'elina' => ['Elina', 'Berzina', 'elina.berzina@loadmaster.test', 'S-11'],
            'kristaps' => ['Kristaps', 'Vitols', 'kristaps.vitols@loadmaster.test', 'S-11'],
            'laura' => ['Laura', 'Jansone', 'laura.jansone@loadmaster.test', 'M-11'],
        ];

        $students = [];

        foreach ($definitions as $key => [$firstName, $lastName, $email, $classCode]) {
            $students[$key] = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => "{$firstName} {$lastName}",
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'role' => 'student',
                    'class_id' => $classes[$classCode]->id,
                    'password' => Hash::make(self::PASSWORD),
                    'email_verified_at' => now(),
                ],
            );
        }

        return $students;
    }

    /**
     * @return array<string, OrderTemplate>
     */
    private function seedOrderTemplates(): array
    {
        $riga = $this->location('riga', 'city');
        $liepaja = $this->location('liepaja', 'city');
        $ventspils = $this->location('ventspils', 'city');
        $daugavpils = $this->location('daugavpils', 'city');
        $helsinki = $this->location('helsinki', 'city');
        $klaipeda = $this->location('klaipeda', 'city');
        $stockholm = $this->location('stockholm', 'city');

        $containerTruck = $this->transport(['container', 'truck']);
        $bulkTruck = $this->transport(['bulk', 'truck']);
        $refrigeratedTruck = $this->transport(['refrigerated', 'reefer', 'cold']);

        $containerShip = $this->ship(['container']);
        $bulkShip = $this->ship(['bulk']);
        $rigaPort = $this->port('Latvia', ['container']);
        $ventspilsPort = $this->port('Latvia', ['bulk', 'container']);
        $helsinkiPort = $this->port('Finland', ['container']);
        $klaipedaPort = $this->port('Lithuania', ['container', 'bulk']);
        $stockholmPort = $this->port('Sweden', ['container']);

        $templates = [
            'liepaja_ventspils_containers' => [
                'attributes' => [
                    'title' => 'Liepāja → Ventspils konteineru piegāde',
                    'scenario_type' => 'land_transport',
                    'scenario_focus' => 'route_planning',
                    'evaluation_mode' => 'practice',
                    'status' => 'ready',
                    'description' => 'Studentam jāsaplāno īss, bet atkārtots sauszemes konteineru pārvadājums starp Liepāju un Ventspili.',
                    'student_brief' => 'Nogādā 8 konteinerus no Liepājas uz Ventspili. Izvēlies transportu, maršrutu, degvielas pieturas un reisu skaitu.',
                    'teacher_notes' => 'Sagaidāms, ka students pamanīs kapacitāti, degvielas diapazonu un lieku reisu izmaksas.',
                    'cargo_name' => 'Eksporta konteineri',
                    'cargo_type' => 'container',
                    'cargo_mode' => 'container',
                    'cargo_amount_containers' => 8,
                    'cargo_amount_tons' => 96,
                    'cargo_volume_m3' => 520,
                    'cargo_value' => 145000,
                    'start_location_id' => $liepaja->id,
                    'end_location_id' => $ventspils->id,
                    'deadline_date' => now()->addDays(10)->toDateString(),
                    'scenario_start_at' => Carbon::parse('2026-05-07 08:00'),
                    'deadline_at' => Carbon::parse('2026-05-09 18:00'),
                    'budget_limit' => 4200,
                    'requires_refuel_planning' => true,
                    'max_trips' => 8,
                    'priority' => 'medium',
                    'step_config' => $this->steps(['intro', 'transport', 'route', 'fuel', 'simulation', 'submit']),
                    'scenario_config' => $this->scenarioConfig(),
                ],
                'transports' => [$containerTruck],
                'routes' => $this->routesBetween($liepaja, $ventspils),
                'fuel_stations' => $this->fuelStationsNear(['liepaja', 'ventspils']),
            ],
            'riga_helsinki_cold_chain' => [
                'attributes' => [
                    'title' => 'Rīga → Helsinki atdzesētas kravas ķēde',
                    'scenario_type' => 'full_chain',
                    'scenario_focus' => 'cold_chain',
                    'evaluation_mode' => 'practice',
                    'status' => 'ready',
                    'description' => 'Multimodāls pārvadājums ar sauszemes posmu, ostas apstrādi un kuģi.',
                    'student_brief' => 'Saplāno atdzesētas pārtikas kravas piegādi uz Helsinki, izvēloties saderīgu transportu, ostu, kuģi un apstrādes metodi.',
                    'teacher_notes' => 'Labs scenārijs saderības un handling izvēļu pārbaudei.',
                    'cargo_name' => 'Atdzesēta pārtika',
                    'cargo_type' => 'refrigerated',
                    'cargo_mode' => 'container',
                    'cargo_amount_containers' => 4,
                    'cargo_amount_tons' => 52,
                    'cargo_volume_m3' => 210,
                    'cargo_value' => 86000,
                    'temperature_mode_id' => $this->temperatureMode('refrigerated')?->id,
                    'start_location_id' => $riga->id,
                    'end_location_id' => $helsinki->id,
                    'start_port_id' => $rigaPort->id,
                    'end_port_id' => $helsinkiPort->id,
                    'deadline_date' => now()->addDays(14)->toDateString(),
                    'scenario_start_at' => Carbon::parse('2026-05-08 07:30'),
                    'deadline_at' => Carbon::parse('2026-05-11 12:00'),
                    'budget_limit' => 9800,
                    'requires_refuel_planning' => true,
                    'max_trips' => 3,
                    'priority' => 'high',
                    'requires_loading_method_choice' => true,
                    'requires_unloading_method_choice' => true,
                    'allow_manual_handling' => true,
                    'allow_port_equipment' => true,
                    'allow_ship_equipment' => true,
                    'allowed_handling_method_codes' => ['conveyor', 'crane', 'forklift', 'gantry_crane', 'manual'],
                    'required_handling_method_codes' => ['gantry_crane'],
                    'requires_closed_space' => true,
                    'allowed_ship_cargo_modes' => ['container'],
                    'step_config' => $this->steps(['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit']),
                    'scenario_config' => $this->scenarioConfig([
                        'compatibility' => [
                            'enforce_port_cargo_support' => false,
                            'enforce_ship_cargo_support' => false,
                            'enforce_port_ship_draft' => true,
                            'enforce_handling_compatibility' => false,
                        ],
                    ]),
                ],
                'transports' => [$refrigeratedTruck, $containerTruck],
                'routes' => $this->routesBetween($riga, $rigaPort->location ?? $riga),
                'ports' => [$rigaPort, $helsinkiPort],
                'ships' => [$containerShip],
                'fuel_stations' => $this->fuelStationsNear(['riga']),
            ],
            'riga_daugavpils_bulk' => [
                'attributes' => [
                    'title' => 'Rīga → Daugavpils beramkravas pārvadājums',
                    'scenario_type' => 'land_transport',
                    'scenario_focus' => 'capacity_planning',
                    'evaluation_mode' => 'exam',
                    'status' => 'ready',
                    'description' => 'Sauszemes scenārijs ar kravas apjoma, transporta skaita un termiņa salāgošanu.',
                    'student_brief' => 'Piegādā 64 tonnas beramkravas uz Daugavpili. Degvielas plānošana nav obligāta, bet maršrutam un transporta skaitam jābūt pamatotam.',
                    'teacher_notes' => 'Eksāmena režīmam: sistēmas norādes studentam ir ierobežotas.',
                    'cargo_name' => 'Graudu beramkrava',
                    'cargo_type' => 'bulk',
                    'cargo_mode' => 'bulk',
                    'cargo_amount_tons' => 64,
                    'cargo_volume_m3' => 110,
                    'cargo_value' => 34000,
                    'start_location_id' => $riga->id,
                    'end_location_id' => $daugavpils->id,
                    'deadline_date' => now()->addDays(7)->toDateString(),
                    'scenario_start_at' => Carbon::parse('2026-05-09 06:00'),
                    'deadline_at' => Carbon::parse('2026-05-10 20:00'),
                    'budget_limit' => 3600,
                    'requires_refuel_planning' => false,
                    'max_trips' => 4,
                    'priority' => 'high',
                    'step_config' => $this->steps(['intro', 'transport', 'route', 'simulation', 'submit']),
                    'scenario_config' => $this->scenarioConfig(),
                ],
                'transports' => [$bulkTruck],
                'routes' => $this->routesBetween($riga, $daugavpils),
            ],
            'klaipeda_stockholm_port' => [
                'attributes' => [
                    'title' => 'Klaipeda → Stockholm ostas apstrāde',
                    'scenario_type' => 'port_to_ship',
                    'scenario_focus' => 'port_loading',
                    'evaluation_mode' => 'practice',
                    'status' => 'ready',
                    'description' => 'Kuģa, ostas un apstrādes metodes saderības treniņš.',
                    'student_brief' => 'Izvēlies piemērotu ostu un kuģi 6 konteineru nosūtīšanai uz Stockholm. Pievērs uzmanību iegrimei un apstrādes metodei.',
                    'teacher_notes' => 'Piemērots diskusijai par nepareizu, bet iesniedzamu izvēļu analīzi pēc simulācijas.',
                    'cargo_name' => 'Ražošanas iekārtu konteineri',
                    'cargo_type' => 'container',
                    'cargo_mode' => 'container',
                    'cargo_amount_containers' => 6,
                    'cargo_amount_tons' => 88,
                    'cargo_volume_m3' => 390,
                    'cargo_value' => 260000,
                    'start_location_id' => $klaipeda->id,
                    'end_location_id' => $stockholm->id,
                    'start_port_id' => $klaipedaPort->id,
                    'end_port_id' => $stockholmPort->id,
                    'deadline_date' => now()->addDays(18)->toDateString(),
                    'scenario_start_at' => Carbon::parse('2026-05-10 09:00'),
                    'deadline_at' => Carbon::parse('2026-05-13 17:00'),
                    'budget_limit' => 12200,
                    'requires_refuel_planning' => false,
                    'max_trips' => 2,
                    'priority' => 'medium',
                    'requires_loading_method_choice' => true,
                    'requires_unloading_method_choice' => true,
                    'allow_manual_handling' => true,
                    'allow_port_equipment' => true,
                    'allow_ship_equipment' => true,
                    'allowed_handling_method_codes' => ['crane', 'forklift', 'gantry_crane', 'manual'],
                    'required_handling_method_codes' => ['crane'],
                    'allowed_ship_cargo_modes' => ['container'],
                    'step_config' => $this->steps(['intro', 'port', 'ship', 'simulation', 'submit']),
                    'scenario_config' => $this->scenarioConfig([
                        'compatibility' => [
                            'enforce_port_cargo_support' => false,
                            'enforce_ship_cargo_support' => false,
                            'enforce_port_ship_draft' => true,
                            'enforce_handling_compatibility' => false,
                        ],
                    ]),
                ],
                'transports' => [$containerTruck],
                'ports' => [$klaipedaPort, $stockholmPort, $ventspilsPort],
                'ships' => [$containerShip, $bulkShip],
            ],
        ];

        $created = [];

        foreach ($templates as $key => $definition) {
            $template = OrderTemplate::query()->updateOrCreate(
                ['title' => $definition['attributes']['title']],
                $definition['attributes'],
            );

            $template->transportTemplates()->sync($this->ids($definition['transports'] ?? []));
            $template->landRoutes()->sync($this->ids($definition['routes'] ?? []));
            $template->ports()->sync($this->ids($definition['ports'] ?? []));
            $template->ships()->sync($this->ids($definition['ships'] ?? []));
            $template->fuelStations()->sync($this->ids($definition['fuel_stations'] ?? []));

            $created[$key] = $template->fresh([
                'transportTemplates',
                'landRoutes.fromLocation',
                'landRoutes.toLocation',
                'ports',
                'ships',
                'fuelStations.location',
            ]);
        }

        return $created;
    }

    /**
     * @param  array<string, User>  $students
     * @param  array<string, OrderTemplate>  $templates
     */
    private function assignTasks(array $students, array $templates): void
    {
        $assignments = [
            'anna' => ['liepaja_ventspils_containers', 'riga_helsinki_cold_chain'],
            'roberts' => ['liepaja_ventspils_containers', 'riga_daugavpils_bulk'],
            'elina' => ['riga_helsinki_cold_chain', 'klaipeda_stockholm_port'],
            'kristaps' => ['riga_daugavpils_bulk', 'klaipeda_stockholm_port'],
            'laura' => ['liepaja_ventspils_containers'],
        ];

        foreach ($assignments as $studentKey => $templateKeys) {
            foreach ($templateKeys as $index => $templateKey) {
                $students[$studentKey]->assignedOrderTemplates()->syncWithoutDetaching([
                    $templates[$templateKey]->id => [
                        'assigned_at' => now()->subDays(6 - $index),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        }
    }

    /**
     * @param  array<string, User>  $students
     * @param  array<string, OrderTemplate>  $templates
     */
    private function seedAttempts(array $students, array $templates): void
    {
        $previewService = app(SimulationPreviewService::class);

        $this->attempt(
            $previewService,
            $students['anna'],
            $templates['liepaja_ventspils_containers'],
            'reviewed',
            88,
            'Labs risinājums. Varēja samazināt vienu lieku reisu, bet maršruta izvēle bija pamatota.',
        );

        $this->attempt(
            $previewService,
            $students['roberts'],
            $templates['riga_daugavpils_bulk'],
            'submitted',
            null,
            null,
            selectedVehicleCount: 2,
        );

        $this->attempt(
            $previewService,
            $students['elina'],
            $templates['riga_helsinki_cold_chain'],
            'in_progress',
            null,
            null,
            currentStep: 'ship',
            submitted: false,
        );
    }

    private function attempt(
        SimulationPreviewService $previewService,
        User $student,
        OrderTemplate $template,
        string $status,
        ?int $grade,
        ?string $comment,
        ?int $selectedVehicleCount = null,
        string $currentStep = 'submit',
        bool $submitted = true,
    ): SimulationAttempt {
        $template->loadMissing([
            'transportTemplates',
            'landRoutes.fromLocation',
            'landRoutes.toLocation',
            'landRoutes.fuelStops.fuelStation',
            'ports',
            'ships',
            'fuelStations.location',
        ]);

        $transport = $template->transportTemplates
            ->sortByDesc(fn (TransportTemplate $transport) => (int) ($transport->capacity_containers ?? 0))
            ->first();
        $port = $template->ports->first();
        $ship = $template->ships->first();
        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $transportCapacity = max(1, (int) ($transport?->capacity_containers ?? 1));
        $vehicleCount = $selectedVehicleCount ?? max(1, (int) ceil($containerCount / $transportCapacity));

        $attempt = SimulationAttempt::query()->firstOrNew([
            'user_id' => $student->id,
            'order_template_id' => $template->id,
        ]);

        $attempt->forceFill([
            'status' => $status,
            'current_step' => $currentStep,
            'selected_transport_template_id' => $transport?->id,
            'selected_vehicle_count' => $vehicleCount,
            'selected_port_id' => $port?->id,
            'selected_ship_id' => $ship?->id,
            'selected_loading_method_code' => $port || $ship ? 'gantry_crane' : null,
            'selected_unloading_method_code' => $port || $ship ? 'gantry_crane' : null,
            'loading_method_source' => $port ? 'port' : null,
            'unloading_method_source' => $ship ? 'ship' : null,
            'submitted_at' => $submitted ? now()->subDay() : null,
        ]);
        $attempt->save();

        $attempt->routeSegments()->sync(
            $template->landRoutes
                ->take(3)
                ->values()
                ->mapWithKeys(fn (LandRoute $route, int $index) => [$route->id => ['position' => $index + 1]])
                ->all(),
        );

        $logicalFuelStops = $template->landRoutes
            ->flatMap(fn (LandRoute $route) => $route->fuelStops)
            ->pluck('fuelStation')
            ->filter()
            ->whereIn('id', $template->fuelStations->pluck('id'))
            ->unique('id')
            ->take(2)
            ->values();

        $attempt->fuelStations()->sync(
            $logicalFuelStops
                ->mapWithKeys(fn (FuelStation $station, int $index) => [$station->id => ['position' => $index + 1]])
                ->all(),
        );

        $preview = $previewService->build($attempt->fresh([
            'orderTemplate',
            'selectedTransportTemplate',
            'selectedPort',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ]));

        $attempt->forceFill([
            'preview_result' => $preview,
            'score' => data_get($preview, 'result.score'),
            'total_cost' => data_get($preview, 'result.total_cost'),
            'total_time_hours' => data_get($preview, 'timeline.summary.total_hours'),
            'total_fuel_liters' => data_get($preview, 'result.fuel_needed_liters'),
            'is_valid' => (bool) data_get($preview, 'result.is_valid', false),
            'feedback_text' => data_get($preview, 'message'),
        ])->save();

        if ($grade !== null || $comment !== null) {
            TeacherFeedback::query()->updateOrCreate(
                ['simulation_attempt_id' => $attempt->id],
                [
                    'assignment_id' => $attempt->assignment_id,
                    'grade' => $grade,
                    'comment' => $comment,
                ],
            );
        }

        return $attempt;
    }

    private function scenarioConfig(array $overrides = []): array
    {
        return array_replace_recursive([
            'timing' => [
                'loading_fixed_minutes' => 45,
                'fuel_stop_minutes' => 20,
                'port_processing_minutes' => 60,
                'ship_loading_minutes' => 90,
                'sea_transit_minutes' => 360,
                'max_drive_minutes_before_rest' => 270,
                'rest_minutes' => 45,
            ],
            'costs' => [
                'day_shift_start_hour' => 6,
                'night_shift_start_hour' => 20,
                'labor_cost_per_hour_day' => 18,
                'machine_cost_per_hour_day' => 30,
                'night_shift_multiplier' => 1.35,
            ],
            'availability' => [
                'port_queue_minutes' => 15,
                'ship_ready_at' => null,
            ],
            'scoring' => [
                'time_weight' => 35,
                'cost_weight' => 25,
                'compatibility_weight' => 25,
                'trips_weight' => 15,
            ],
            'compatibility' => [
                'enforce_port_cargo_support' => false,
                'enforce_ship_cargo_support' => false,
                'enforce_port_ship_draft' => true,
                'enforce_handling_compatibility' => false,
            ],
        ], $overrides);
    }

    /**
     * @param  array<int, string>  $enabled
     */
    private function steps(array $enabled): array
    {
        $steps = [
            'intro',
            'transport',
            'route',
            'fuel',
            'port',
            'ship',
            'simulation',
            'submit',
        ];

        return collect($steps)
            ->mapWithKeys(fn (string $step) => [$step => in_array($step, $enabled, true)])
            ->all();
    }

    private function location(string $city, string $type): Location
    {
        $cityName = [
            'riga' => 'Rīga',
            'liepaja' => 'Liepāja',
            'ventspils' => 'Ventspils',
            'daugavpils' => 'Daugavpils',
            'helsinki' => 'Helsinki',
            'klaipeda' => 'Klaipeda',
            'stockholm' => 'Stockholm',
        ][$city] ?? $city;

        return Location::query()
            ->where(function ($query) use ($cityName) {
                $query->where('city', $cityName)->orWhere('name', $cityName);
            })
            ->where('type', $type)
            ->first()
            ?? throw new RuntimeException("Missing seeded location: {$city}/{$type}");
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function transport(array $needles): TransportTemplate
    {
        return TransportTemplate::query()
            ->orderBy('name')
            ->get()
            ->sortByDesc(fn (TransportTemplate $transport) => $this->matchScore($transport->name.' '.$transport->type.' '.$transport->description, $needles))
            ->first(fn (TransportTemplate $transport) => $this->matches($transport->name.' '.$transport->type.' '.$transport->description, $needles))
            ?? TransportTemplate::query()->orderBy('name')->first()
            ?? throw new RuntimeException('No transport templates available.');
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function ship(array $needles): Ship
    {
        return Ship::query()
            ->orderBy('name')
            ->get()
            ->sortByDesc(fn (Ship $ship) => $this->matchScore($ship->name.' '.$ship->cargo_type.' '.$ship->cargo_mode, $needles))
            ->first(fn (Ship $ship) => $this->matches($ship->name.' '.$ship->cargo_type.' '.$ship->cargo_mode, $needles))
            ?? Ship::query()->orderBy('name')->first()
            ?? throw new RuntimeException('No ships available.');
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function port(string $country, array $needles): Port
    {
        return Port::query()
            ->where('country', $country)
            ->orderBy('name')
            ->get()
            ->sortByDesc(fn (Port $port) => $this->matchScore($port->name.' '.$port->notes, $needles))
            ->first(fn (Port $port) => $this->matches($port->name.' '.$port->notes, $needles))
            ?? Port::query()->where('country', $country)->orderBy('name')->first()
            ?? Port::query()->orderBy('name')->first()
            ?? throw new RuntimeException('No ports available.');
    }

    private function temperatureMode(string $needle): ?TemperatureMode
    {
        return TemperatureMode::query()
            ->orderBy('name')
            ->get()
            ->first(fn (TemperatureMode $mode) => str_contains(strtolower($mode->name.' '.$mode->description), $needle));
    }

    /**
     * @return array<int, LandRoute>
     */
    private function routesBetween(Location $from, Location $to): array
    {
        $routes = LandRoute::query()
            ->where('from_location_id', $from->id)
            ->where('to_location_id', $to->id)
            ->orWhere(function ($query) use ($from, $to) {
                $query
                    ->where('from_location_id', $to->id)
                    ->where('to_location_id', $from->id);
            })
            ->orderBy('distance_km')
            ->get();

        if ($routes->isNotEmpty()) {
            return $routes->all();
        }

        return [$this->createDemoRoute($from, $to)];
    }

    /**
     * @return array<int, LandRoute>
     */
    private function routesFrom(Location $from): array
    {
        return LandRoute::query()
            ->where('from_location_id', $from->id)
            ->orWhere('to_location_id', $from->id)
            ->orderBy('distance_km')
            ->take(3)
            ->get()
            ->all();
    }

    private function createDemoRoute(Location $from, Location $to): LandRoute
    {
        $distanceKm = $this->approximateDistanceKm($from, $to);

        return LandRoute::query()->updateOrCreate(
            [
                'from_location_id' => $from->id,
                'to_location_id' => $to->id,
            ],
            [
                'distance_km' => $distanceKm,
                'estimated_time_hours' => round($distanceKm / 55, 2),
                'toll_cost' => 0,
                'provider' => 'demo',
                'notes' => 'Automātiski izveidots demo maršruts uzdevuma loģiskai izpildei.',
            ]
        );
    }

    private function approximateDistanceKm(Location $from, Location $to): float
    {
        $fromLat = (float) ($from->latitude ?? 0);
        $fromLng = (float) ($from->longitude ?? 0);
        $toLat = (float) ($to->latitude ?? 0);
        $toLng = (float) ($to->longitude ?? 0);

        if ($fromLat === 0.0 || $fromLng === 0.0 || $toLat === 0.0 || $toLng === 0.0) {
            return 50.0;
        }

        $earthRadiusKm = 6371;
        $latDelta = deg2rad($toLat - $fromLat);
        $lngDelta = deg2rad($toLng - $fromLng);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($fromLat)) * cos(deg2rad($toLat)) * sin($lngDelta / 2) ** 2;
        $distance = 2 * $earthRadiusKm * atan2(sqrt($a), sqrt(1 - $a));

        return round(max($distance * 1.25, 1), 2);
    }

    /**
     * @param  array<int, string>  $cities
     * @return array<int, FuelStation>
     */
    private function fuelStationsNear(array $cities): array
    {
        $cityNames = collect($cities)
            ->map(fn (string $city) => [
                'riga' => 'Rīga',
                'liepaja' => 'Liepāja',
                'ventspils' => 'Ventspils',
            ][$city] ?? $city)
            ->all();

        return FuelStation::query()
            ->whereHas('location', fn ($query) => $query->whereIn('city', $cityNames))
            ->with('location')
            ->orderBy('fuel_type')
            ->take(3)
            ->get()
            ->all();
    }

    /**
     * @param  array<int, object>  $models
     * @return array<int, int>
     */
    private function ids(array $models): array
    {
        return collect($models)
            ->filter()
            ->pluck('id')
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function matches(string $haystack, array $needles): bool
    {
        return $this->matchScore($haystack, $needles) > 0;
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function matchScore(string $haystack, array $needles): int
    {
        $normalized = strtolower($haystack);
        $score = 0;

        foreach ($needles as $needle) {
            if (str_contains($normalized, strtolower($needle))) {
                $score++;
            }
        }

        return $score;
    }
}
