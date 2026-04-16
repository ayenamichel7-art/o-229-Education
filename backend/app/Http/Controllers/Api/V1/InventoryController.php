<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function __construct()
    {
        // Only admins can manage inventory
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasRole('admin')) {
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        });
    }

    public function index(): JsonResponse
    {
        $items = InventoryItem::orderBy('category')->orderBy('name')->get();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'sku'             => 'nullable|string|unique:inventory_items,sku',
            'category'        => 'required|string',
            'description'     => 'nullable|string',
            'unit_price'      => 'required|numeric',
            'stock_quantity'  => 'required|integer',
            'min_stock_level' => 'required|integer',
            'unit'            => 'required|string',
            'is_sellable'     => 'required|boolean',
        ]);

        $item = InventoryItem::create($validated);
        return response()->json($item, 201);
    }

    public function updateStock(Request $request, InventoryItem $item): JsonResponse
    {
        $validated = $request->validate([
            'type'     => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'notes'    => 'nullable|string',
        ]);

        DB::transaction(function () use ($item, $validated) {
            $quantity = $validated['quantity'];
            
            if ($validated['type'] === 'in') {
                $item->increment('stock_quantity', $quantity);
            } else {
                $item->decrement('stock_quantity', $quantity);
            }

            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'type'              => $validated['type'],
                'quantity'          => $quantity,
                'recorded_by'       => auth()->id(),
                'notes'             => $validated['notes'],
            ]);
        });

        return response()->json($item->fresh());
    }

    public function transactions(InventoryItem $item): JsonResponse
    {
        $transactions = $item->transactions()->with('recorder')->latest()->get();
        return response()->json($transactions);
    }
}
