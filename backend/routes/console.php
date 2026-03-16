<?php

use Illuminate\Support\Facades\Schedule;
// use App\Console\Commands\WatchdogCommand;

/*
|--------------------------------------------------------------------------
| Console Routes & Scheduler
|--------------------------------------------------------------------------
*/

// Run the watchdog command every hour for system health and vulnerability checks
// Schedule::command(WatchdogCommand::class)->hourly();

// Backup and Cleanup
Schedule::command('backup:clean')->daily()->at('01:00');
Schedule::command('backup:run')->daily()->at('02:00');
