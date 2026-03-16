<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->authorize('viewAny', ActivityLog::class);
    }

    /**
     * List activity logs for the current tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'action'      => ['nullable', 'string', 'max:50'],
            'entity_type' => ['nullable', 'string', 'max:100'],
            'user_id'     => ['nullable', 'integer'],
            'from'        => ['nullable', 'date'],
            'to'          => ['nullable', 'date', 'after_or_equal:from'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = ActivityLog::with('user:id,first_name,last_name')
            ->orderByDesc('performed_at');

        // Optional filters
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('from')) {
            $query->where('performed_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('performed_at', '<=', $request->to);
        }

        $logs = $query->paginate($request->get('per_page', 25));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    /**
     * Show a single activity log entry.
     */
    public function show(int $id): JsonResponse
    {
        $log = ActivityLog::with('user:id,first_name,last_name')->findOrFail($id);

        $this->authorize('view', $log);

        return response()->json(['data' => $log]);
    }

    /**
     * Get audit log statistics.
     */
    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();

        return response()->json([
            'data' => [
                'total_logs'   => ActivityLog::count(),
                'today'        => ActivityLog::where('performed_at', '>=', $today)->count(),
                'this_week'    => ActivityLog::where('performed_at', '>=', $thisWeek)->count(),
                'by_action'    => ActivityLog::selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->pluck('count', 'action'),
                'recent_users' => ActivityLog::with('user:id,first_name,last_name')
                    ->select('user_id')
                    ->distinct()
                    ->orderByDesc('performed_at')
                    ->limit(10)
                    ->get()
                    ->pluck('user'),
            ],
        ]);
    }
}
