<?php

namespace App\Services\Places\Contracts;

interface PlaceSearchProviderInterface
{
    public function search(string $query, array $options = []): array;
}
