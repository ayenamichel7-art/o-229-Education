<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CanteenPlan;
use App\Models\CanteenSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CanteenController extends Controller
{
    public function __construct()
    {
        // Only admins can manage canteen plans and subscriptions
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasRole('admin')) {
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        });
    }

    public function index(): JsonResponse
    {
        $plans = CanteenPlan::withCount('subscriptions')->get();
        return response()->json($plans);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'cost_per_month' => 'required|numeric',
        ]);

        $plan = CanteenPlan::create($validated);
        return response()->json($plan, 201);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id'           => 'required|exists:students,id',
            'plan_id'              => 'required|exists:canteen_plans,id',
            'dietary_restrictions' => 'nullable|string',
            'start_date'           => 'required|date',
        ]);

        $subscription = CanteenSubscription::create($validated);
        return response()->json($subscription, 201);
    }

    public function subscriptions(): JsonResponse
    {
        $subs = CanteenSubscription::with(['student.user', 'plan'])->get();
        return response()->json($subs);
    }
}
