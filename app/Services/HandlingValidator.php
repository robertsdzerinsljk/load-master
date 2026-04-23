<?php

namespace App\Services;

use App\Models\SimulationAttempt;
use App\Services\Simulator\ScenarioCompatibilityService;

class HandlingValidator
{
    public function __construct(
        private readonly ScenarioCompatibilityService $compatibilityService
    ) {
    }

    public function validate(SimulationAttempt $attempt): array
    {
        $compatibility = $this->compatibilityService->inspectAttempt($attempt);
        $handling = $compatibility['handling'] ?? [];
        $loading = $handling['loading']['selected'] ?? [];
        $unloading = $handling['unloading']['selected'] ?? [];
        $validation = $handling['validation'] ?? [];

        return [
            'valid' => (bool) ($validation['valid'] ?? false),
            'errors' => $validation['errors'] ?? [],
            'warnings' => $validation['warnings'] ?? [],
            'loading' => $loading,
            'unloading' => $unloading,
            'shared_methods' => [
                'loading' => $handling['loading']['shared_method_codes'] ?? [],
                'unloading' => $handling['unloading']['shared_method_codes'] ?? [],
            ],
            'context' => $handling,
        ];
    }
}
