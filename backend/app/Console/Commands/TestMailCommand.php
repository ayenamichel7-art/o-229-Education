<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    protected $signature = 'test:mail {email}';
    protected $description = 'Send a test email using the configured SMTP credentials';

    public function handle()
    {
        $email = $this->argument('email');
        $this->info("Sending test email to: {$email}...");

        try {
            Mail::raw('Ceci est un test de configuration SMTP pour o-229 Education.', function ($message) use ($email) {
                $message->to($email)->subject('Test o-229 SMTP');
            });
            $this->info('✅ Test email successfully sent!');
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email: ' . $e->getMessage());
        }
    }
}
