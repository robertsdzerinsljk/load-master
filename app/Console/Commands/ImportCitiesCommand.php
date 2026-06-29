<?php

namespace App\Console\Commands;

use App\Models\Location;
use Illuminate\Console\Command;

class ImportCitiesCommand extends Command
{
    protected $signature = 'places:import-cities
        {--file= : CSV path, absolute or relative to the project root}
        {--country= : Optional country/country-code filter}
        {--min-population= : Optional minimum population filter}
        {--dry-run : Count importable rows without writing}';

    protected $description = 'Import city locations from CSV without duplicating existing points.';

    public function handle(): int
    {
        $file = (string) $this->option('file');

        if ($file === '') {
            $this->error('Please pass --file=storage/app/imports/cities.csv');

            return self::FAILURE;
        }

        $path = $this->resolvePath($file);

        if (! is_file($path)) {
            $this->error("CSV file not found: {$path}");

            return self::FAILURE;
        }

        $handle = fopen($path, 'r');

        if (! $handle) {
            $this->error("Could not open CSV file: {$path}");

            return self::FAILURE;
        }

        $headers = fgetcsv($handle);

        if (! is_array($headers)) {
            $this->error('CSV must contain a header row.');

            return self::FAILURE;
        }

        $headers = array_map(fn ($header) => strtolower(trim((string) $header)), $headers);
        $imported = 0;
        $skipped = 0;
        $dryRun = (bool) $this->option('dry-run');

        while (($row = fgetcsv($handle)) !== false) {
            $record = array_combine($headers, $row);

            if (! is_array($record)) {
                $skipped++;

                continue;
            }

            $city = $record['name'] ?? $record['city'] ?? null;
            $country = $record['country'] ?? $record['country_code'] ?? $record['countrycode'] ?? null;
            $latitude = $record['latitude'] ?? $record['lat'] ?? null;
            $longitude = $record['longitude'] ?? $record['lng'] ?? $record['lon'] ?? null;
            $population = isset($record['population']) ? (int) $record['population'] : null;

            if (! $this->isImportable($city, $country, $latitude, $longitude, $population)) {
                $skipped++;

                continue;
            }

            if ($this->existsNearby((string) $city, (float) $latitude, (float) $longitude)) {
                $skipped++;

                continue;
            }

            $imported++;

            if ($dryRun) {
                continue;
            }

            Location::query()->create([
                'name' => $city,
                'type' => 'city',
                'country' => $country,
                'city' => $city,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'source' => isset($record['geonameid']) ? 'geonames_csv' : 'csv',
                'external_id' => $record['geonameid'] ?? $record['id'] ?? null,
                'metadata' => [
                    'population' => $population,
                ],
            ]);
        }

        fclose($handle);

        $verb = $dryRun ? 'would import' : 'imported';
        $this->info("Cities {$verb}: {$imported}; skipped: {$skipped}");

        return self::SUCCESS;
    }

    private function resolvePath(string $file): string
    {
        if (str_contains($file, ':') || str_starts_with($file, DIRECTORY_SEPARATOR)) {
            return $file;
        }

        return base_path($file);
    }

    private function isImportable(mixed $city, mixed $country, mixed $latitude, mixed $longitude, ?int $population): bool
    {
        if (! $city || ! is_numeric($latitude) || ! is_numeric($longitude)) {
            return false;
        }

        $countryFilter = $this->option('country');

        if ($countryFilter && strcasecmp((string) $country, (string) $countryFilter) !== 0) {
            return false;
        }

        $minPopulation = $this->option('min-population');

        return ! ($minPopulation && ($population ?? 0) < (int) $minPopulation);
    }

    private function existsNearby(string $city, float $latitude, float $longitude): bool
    {
        return Location::query()
            ->where('name', $city)
            ->whereBetween('latitude', [$latitude - 0.0005, $latitude + 0.0005])
            ->whereBetween('longitude', [$longitude - 0.0005, $longitude + 0.0005])
            ->exists();
    }
}
