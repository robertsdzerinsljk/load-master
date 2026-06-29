<?php

namespace App\Services\Routing\Contracts;

use App\Models\Location;

interface LandRoutingProviderInterface
{
    public function calculate(Location $origin, Location $destination): array;
}
