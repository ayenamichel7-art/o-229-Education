<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TransportRoute;
use App\Models\TransportSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransportController extends Controller
{
    public function __construct()
    {
        // Only admins can manage transport routes and subscriptions
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasRole('admin')) {
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        });
    }

    public function index(): JsonResponse
    {
        $routes = TransportRoute::withCount('subscriptions')->get();
        return response()->json($routes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'vehicle_reg'  => 'nullable|string',
            'driver_name'  => 'nullable|string',
            'driver_phone' => 'nullable|string',
            'capacity'     => 'required|integer',
            'monthly_cost' => 'required|numeric',
        ]);

        $route = TransportRoute::create($validated);
        return response()->json($route, 201);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id'   => 'required|exists:students,id',
            'route_id'     => 'required|exists:transport_routes,id',
            'pickup_point' => 'nullable|string',
            'start_date'   => 'required|date',
        ]);

        $subscription = TransportSubscription::create($validated);
        return response()->json($subscription, 201);
    }

    public function subscriptions(): JsonResponse
    {
        $subs = TransportSubscription::with(['student.user', 'route'])->get();
        return response()->json($subs);
    }
}
