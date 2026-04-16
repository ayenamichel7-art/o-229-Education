<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthCheckController extends Controller
{
    /**
     * System Health Check for Uptime Monitoring.
     */
    public function __invoke(): JsonResponse
    {
        $status = [
            'status' => 'up',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'redis' => $this->checkRedis(),
                'storage' => $this->checkStorage(),
            ],
        ];

        $hasError = collect($status['services'])->contains('down');

        return response()->json($status, $hasError ? 503 : 200);
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();

            return 'up';
        } catch (\Exception $e) {
            return 'down';
        }
    }

    private function checkCache(): string
    {
        try {
            Cache::put('health_check', true, 5);

            return Cache::get('health_check') ? 'up' : 'down';
        } catch (\Exception $e) {
            return 'down';
        }
    }

    private function checkRedis(): string
    {
        try {
            Redis::ping();

            return 'up';
        } catch (\Exception $e) {
            return 'down';
        }
    }

    private function checkStorage(): string
    {
        try {
            $path = storage_path('app/health_check.txt');
            file_put_contents($path, 'ok');
            if (file_get_contents($path) === 'ok') {
                unlink($path);

                return 'up';
            }

            return 'down';
        } catch (\Exception $e) {
            return 'down';
        }
    }
}
