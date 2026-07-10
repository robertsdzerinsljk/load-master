# LoadMaster V2 Handoff Notes

## Current direction

The simulator is being simplified around one teacher-owned route:

- The teacher builds the delivery route on the map.
- The route is attached to the task as a route template.
- Students use that route visually and make planning decisions around transport, fuel, ports, ships, handling, time, and cost.
- Invalid or inefficient decisions should be shown as feedback/diagnostics, not as dead-end UI states unless the step truly cannot continue.

## Main workflow files

- `resources/js/pages/Teacher/Templates/OrderTemplates/OrderTemplateForm.tsx`
  Teacher task form. Route creation, route attachment, student choices, fuel options, advanced timing/cost/scoring, and scenario preview live here.
- `resources/js/components/routing/MapRouteBuilder.tsx`
  Reusable teacher/student route builder and map-based route preview component.
- `resources/js/components/student/simulator/RouteBuilderStep.tsx`
  Student route step. Uses the attached route template when present.
- `resources/js/components/student/simulator/FuelPlanningStep.tsx`
  Student fuel step. Keeps the route map visible and overlays fuel stops.
- `resources/js/components/student/simulator/PreviewStep.tsx`
  Simulation preview with route map, controls, timeline, diagnostics, and fuel markers.
- `resources/js/components/LogisticsMap.tsx`
  Shared map renderer for route lines, ports, origins/destinations, and fuel stop markers.

## Backend workflow files

- `app/Http/Controllers/Teacher/OrderTemplateController.php`
  Validates and previews teacher task setup. Route tasks should require either an attached map route or legacy land routes.
- `app/Http/Controllers/Student/SimulationAttemptController.php`
  Loads attempts and attached route templates for the student simulator.
- `app/Services/Simulator/SimulationPreviewService.php`
  Calculates preview metrics, diagnostics, warnings, score penalties, route distance, fuel, and compatibility feedback.
- `app/Services/Simulator/SimulationTimelineService.php`
  Builds the event timeline from selected/attached route data.
- `app/Services/Simulator/RouteFuelPlanService.php`
  Checks fuel stop feasibility and route/fuel ordering.

## Database changes

- `database/migrations/2026_06_30_000001_add_route_template_to_order_templates_table.php`
  Adds the route template connection to order templates.

Run migrations after deploy:

```bash
php artisan migrate --force
```

## Verification commands

Run before handoff or deploy:

```bash
php -l app/Services/Simulator/SimulationPreviewService.php
php -l app/Services/Simulator/SimulationTimelineService.php
php -l app/Services/Simulator/RouteFuelPlanService.php
npm.cmd run types:check
npm.cmd run build
```

## Manual QA checklist

1. Create/edit a task as a teacher.
2. Build a route on the map with at least two points.
3. Click `Ģenerēt līniju`, then attach it to the task.
4. Save the task and reopen it. Confirm the route is still attached.
5. Open the task as a student.
6. Confirm the route is visible without asking the student to rebuild it.
7. If fuel planning is enabled, confirm the route map remains visible and selected fuel stops appear on the map.
8. Run the simulation preview and confirm diagnostics explain bad choices without trapping the student.

## Known follow-up areas

- Continue reducing the teacher form density by moving rarely used configuration into advanced sections.
- Add a dedicated route/fuel combined teacher preview once the route builder API settles.
- Add feature tests for route template attachment and student preview loading.
- Review public build assets before committing, because Vite regenerates hashed files.
