<?php

use App\Models\OrderTemplate;
use App\Models\TransportTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('order template edit page includes selected land transport relation data', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $transport = TransportTemplate::query()->create([
        'name' => 'Truck Prime',
        'type' => 'truck',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Land transport edit hydration',
        'scenario_type' => 'land_transport',
        'evaluation_mode' => 'practice',
        'status' => 'draft',
    ]);

    $template->transportTemplates()->attach($transport->id);

    $this->actingAs($teacher)
        ->get("/teacher/templates/order-templates/{$template->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Templates/OrderTemplates/Edit')
            ->where('template.id', $template->id)
            ->where('template.transport_templates.0.id', $transport->id));
});
