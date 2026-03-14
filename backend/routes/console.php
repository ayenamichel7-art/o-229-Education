<?php

use Illuminate\Support\Facades\Schedule;
// use App\Console\Commands\WatchdogCommand;

/*
|--------------------------------------------------------------------------
| Console Routes & Scheduler
|--------------------------------------------------------------------------
*/

// Run the watchdog command every day at midnight (to check for dependencies)
// And also every ten minutes for general health (DB, disc)
// Schedule::command(WatchdogCommand::class)->everyTenMinutes();

// Backup and Cleanup
// Schedule::command('backup:clean')->daily()->at('01:00');
// Schedule::command('backup:run')->daily()->at('02:00');
