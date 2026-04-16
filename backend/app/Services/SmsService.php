<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $sid;
    protected string $token;
    protected string $from;

    public function __construct()
    {
        $this->sid   = config('services.twilio.sid', '');
        $this->token = config('services.twilio.token', '');
        $this->from  = config('services.twilio.from', '');
    }

    /**
     * Send an SMS message via Twilio (Example).
     */
    public function send(string $to, string $message): bool
    {
        if (empty($this->sid) || empty($this->token)) {
            Log::warning("SmsService: Twilio credentials missing. Logging message: [To: $to] $message");
            return false;
        }

        try {
            $response = Http::withBasicAuth($this->sid, $this->token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", [
                    'To'   => $to,
                    'From' => $this->from,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::error("SmsService Error: " . $response->body());
            return false;
        } catch (Exception $e) {
            Log::error("SmsService Exception: " . $e->getMessage());
            return false;
        }
    }
}
