<?php

namespace App\Services\Routing\Contracts;

use App\Models\Port;

interface SeaRoutingProviderInterface
{
    public function calculate(Port $origin, Port $destination): array;
}
