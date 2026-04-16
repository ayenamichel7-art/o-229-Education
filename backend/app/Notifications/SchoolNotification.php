<?php

namespace App\Notifications;

use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SchoolNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $subject;
    protected string $message;
    protected string $channel;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $subject, string $message, string $channel = 'push')
    {
        $this->subject = $subject;
        $this->message = $message;
        $this->channel = $channel;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database']; // Always store in DB

        if ($this->channel === 'email' || $this->channel === 'all') {
            $channels[] = 'mail';
        }

        // Custom handling for SMS as Laravel doesn't have a default 'sms' type 
        // without extra drivers, but we handle it in the via method or toSms.
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->subject)
            ->line($this->message)
            ->action('Voir sur le portail', url('/'))
            ->line('Merci de votre confiance en o-229 Education.');
    }

    /**
     * Handle SMS sending manually if required, or use a custom channel.
     * For simplicity here, we can trigger it from the controller or a custom channel class.
     */
    public function toSms(object $notifiable): void
    {
        $phone = $notifiable->phone ?? $notifiable->guardian_phone ?? null;
        if ($phone) {
            app(SmsService::class)->send($phone, $this->message);
        }
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'subject' => $this->subject,
            'message' => $this->message,
            'type'    => 'school_communication',
        ];
    }
}
