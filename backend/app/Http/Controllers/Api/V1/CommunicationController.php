<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Communication;
use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class CommunicationController extends Controller
{
    public function __construct()
    {
        // Only admins can send mass communications (SMS/Email to parents)
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasRole('admin')) {
                abort(403, 'Seuls les administrateurs peuvent envoyer des communications.');
            }
            return $next($request);
        });
    }

    /**
     * Display a listing of communications.
     */
    public function index(): Response
    {
        $order = request('order', 'desc');
        $comms = Communication::with('sender')
            ->orderBy('created_at', $order)
            ->paginate(15);
            
        return response($comms);
    }

    /**
     * Store a newly created communication and "send" it.
     */
    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'subject'        => 'required|string|max:255',
            'content'        => 'required|string',
            'type'           => 'required|in:announcement,emergency,academic,private',
            'channel'        => 'required|in:email,sms,push,all',
            'recipient_type' => 'required|in:all,class,student,individual',
            'recipient_id'   => 'nullable|integer',
        ]);

        $communication = Communication::create([
            'sender_id'      => auth()->id(),
            'subject'        => $validated['subject'],
            'content'        => $validated['content'],
            'type'           => $validated['type'],
            'channel'        => $validated['channel'],
            'recipient_type' => $validated['recipient_type'],
            'recipient_id'   => $validated['recipient_id'] ?? null,
            'sent_at'        => now(),
            'metadata'       => [
                'ip' => $request->ip(),
                'browser' => $request->userAgent()
            ]
        ]);

        // Logic to simulate sending
        $recipientCount = 0;
        
        switch ($validated['recipient_type']) {
            case 'all':
                $recipientCount = Student::where('status', 'active')->count();
                break;
            case 'class':
                $recipientCount = Student::where('class_id', $validated['recipient_id'])->where('status', 'active')->count();
                break;
            case 'student':
            case 'individual':
                $recipientCount = 1;
                break;
        }

        $communication->update(['metadata' => array_merge($communication->metadata, ['recipient_count' => $recipientCount])]);

        // ─── Actual Sending Logic ────────────────────────
        $notification = new \App\Notifications\SchoolNotification(
            $validated['subject'],
            $validated['content'],
            $validated['channel']
        );

        if ($validated['recipient_type'] === 'all') {
            // Send to all active students (via users/guardians)
            $students = Student::where('status', 'active')->with('user')->get();
            foreach ($students as $student) {
                $this->notifyRecipient($student, $notification, $validated['channel']);
            }
        } elseif ($validated['recipient_type'] === 'class') {
            $students = Student::where('class_id', $validated['recipient_id'])
                ->where('status', 'active')
                ->with('user')
                ->get();
            foreach ($students as $student) {
                $this->notifyRecipient($student, $notification, $validated['channel']);
            }
        } elseif ($validated['recipient_type'] === 'student' || $validated['recipient_type'] === 'individual') {
            $student = Student::with('user')->find($validated['recipient_id']);
            if ($student) {
                $this->notifyRecipient($student, $notification, $validated['channel']);
            }
        }

        return response([
            'message' => 'Communication mise en file d\'attente pour envoi.',
            'data' => $communication
        ], 201);
    }

    /**
     * Helper to dispatch notifications.
     */
    protected function notifyRecipient($student, $notification, $channel)
    {
        // Notify the student's user account (Email/Push)
        if ($student->user) {
            $student->user->notify($notification);
        }

        // Specifically handle SMS if requested
        if ($channel === 'sms' || $channel === 'all') {
            $phone = $student->guardian_phone ?? $student->user->phone ?? null;
            if ($phone) {
                app(\App\Services\SmsService::class)->send($phone, $notification->message);
            }
        }
    }

    /**
     * Display the specified communication.
     */
    public function show(Communication $communication): Response
    {
        return response($communication->load('sender'));
    }

    /**
     * Delete a communication record.
     */
    public function destroy(Communication $communication): Response
    {
        $communication->delete();
        return response(null, 204);
    }
}
