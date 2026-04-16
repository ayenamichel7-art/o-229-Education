<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayController extends Controller
{
    /**
     * Initiate a local mobile money payment (CinetPay/FedaPay style).
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'method'     => 'required|in:mobile_money,card,wallet',
        ]);

        $payment = Payment::with('student.user')->find($request->payment_id);

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Ce paiement est déjà réglé.'], 400);
        }

        // Simulating a Local Gateway API Call (e.g. CinetPay / FedaPay)
        // In a real scenario, you'd call their SDK or API here.
        $transactionId = 'TXN-' . strtoupper(Str::random(16)); // Longer random for unpredictability
        
        // This URL would normally be provided by the payment gateway redirecting to their mobile money portal
        $paymentUrl = "https://checkout.local-gateway.africa/pay/" . $transactionId;

        $payment->update([
            'external_id' => $transactionId,
            'payment_method' => $request->method,
            'payment_url' => $paymentUrl,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Lien de paiement local généré (Orange/MTN/Wave)',
            'payment_url' => $paymentUrl,
            'transaction_id' => $transactionId
        ]);
    }

    /**
     * Webhook called by the local payment provider after transaction completion.
     *
     * Security: Validates HMAC signature from the payment gateway before
     * processing any status update. Rejects unsigned or tampered requests.
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::info('Payment Webhook Received', [
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
        ]);

        // ─── Step 1: Verify Webhook Signature (HMAC) ────────────
        $signature = $request->header('X-Gateway-Signature')
            ?? $request->header('X-CinetPay-Signature')
            ?? $request->header('X-FedaPay-Signature');

        $webhookSecret = config('services.payment_gateway.webhook_secret');

        if (!$webhookSecret) {
            Log::error('Payment webhook secret not configured');
            return response()->json(['error' => 'Webhook not configured'], 500);
        }

        if (!$signature) {
            Log::warning('Payment webhook rejected: missing signature', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'Missing signature'], 403);
        }

        $payload = $request->getContent();
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Payment webhook rejected: invalid signature', [
                'ip' => $request->ip(),
                'received_signature' => substr($signature, 0, 16) . '...',
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        // ─── Step 2: Process Verified Webhook ───────────────────
        $externalId = $request->input('transaction_id');
        $status = $request->input('status');

        if (!$externalId || !$status) {
            return response()->json(['error' => 'Missing required fields'], 422);
        }

        $payment = Payment::where('external_id', $externalId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Transaction introuvable.'], 404);
        }

        // Prevent replay: skip if already paid
        if ($payment->status === 'paid') {
            Log::info('Payment webhook received for already-paid transaction', [
                'external_id' => $externalId,
            ]);
            return response()->json(['status' => 'already_processed']);
        }

        if ($status === 'SUCCESSFUL' || $status === 'ACCEPTED') {
            $payment->update([
                'status' => 'paid',
                'amount_paid' => $payment->amount,
                'paid_at' => now(),
                'gateway_response' => $request->all()
            ]);

            Log::info('Payment confirmed via webhook', [
                'payment_id' => $payment->id,
                'external_id' => $externalId,
                'amount' => $payment->amount,
            ]);

            // Here you could trigger a notification to the parent: "Paiement de scolarité reçu!"
        } elseif ($status === 'FAILED' || $status === 'CANCELLED') {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $request->all(),
            ]);

            Log::info('Payment failed via webhook', [
                'payment_id' => $payment->id,
                'external_id' => $externalId,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Page where the user is redirected after payment (Success).
     */
    public function callback(Request $request)
    {
        // Typically a frontend URL where the user landed back
        return redirect()->away(config('app.frontend_url') . '/app/finance?payment=success');
    }
}
