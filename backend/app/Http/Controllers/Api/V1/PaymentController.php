<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
        $this->authorizeResource(Payment::class, 'payment');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $payments = Payment::with(['student.user'])
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->student_id, fn($q, $v) => $q->where('student_id', $v))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return PaymentResource::collection($payments);
    }

    public function show(Payment $payment): PaymentResource
    {
        return new PaymentResource($payment->load('student.user'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id'       => 'required|exists:students,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'amount'           => 'required|numeric|min:0',
            'amount_paid'      => 'nullable|numeric|min:0',
            'due_date'         => 'nullable|date',
            'payment_method'   => 'nullable|in:cash,bank_transfer,mobile_money,card',
            'type'             => 'nullable|in:tuition,registration,exam,transport,uniform,other',
            'notes'            => 'nullable|string',
        ]);

        $payment = $this->paymentService->recordPayment($validated);

        return (new PaymentResource($payment->load('student.user')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Process an installment for an existing payment.
     */
    public function installment(Request $request, Payment $payment): PaymentResource
    {
        $this->authorize('update', $payment);

        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0|max:' . $payment->balance,
            'payment_method' => 'required|in:cash,bank_transfer,mobile_money,card',
        ]);

        $payment = $this->paymentService->processInstallment(
            $payment,
            $validated['amount'],
            $validated['payment_method']
        );

        return new PaymentResource($payment->load('student.user'));
    }

    /**
     * Get financial summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $summary = $this->paymentService->getFinancialSummary(
            $request->query('academic_year_id')
        );

        return response()->json(['data' => $summary]);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        // For accounting integrity, we don't just delete; we mark as cancelled first
        $payment->update(['status' => 'cancelled']);
        $payment->delete(); // This is a SoftDelete now
        
        return response()->json([
            'message' => 'Paiement annulé et archivé avec succès.',
            'status'  => 'success'
        ]);
    }
}
